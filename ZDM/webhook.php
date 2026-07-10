<?php
/**
 * ZM - Webhook de Notificaciones de Pago (Mercado Pago IPN / Webhooks)
 */

header('Content-Type: application/json');

require_once __DIR__ . '/config.php';

// --- LOGGING HELPER ---
function logTransaction(string $message, string $level = 'INFO') {
    $logFile = __DIR__ . '/transactions.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    $logMessage = "[{$timestamp}] [{$level}] [IP: {$ip}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// Obtener el ID del pago
$paymentId = null;

// 1. Intentar obtenerlo desde los parámetros GET (IPN)
if (isset($_GET['topic']) && $_GET['topic'] === 'payment' && isset($_GET['id'])) {
    $paymentId = $_GET['id'];
}

// 2. Intentar obtenerlo desde el cuerpo JSON (Webhooks)
if (empty($paymentId)) {
    $inputJSON = file_get_contents('php://input');
    $payload = json_decode($inputJSON, true);
    
    if (isset($payload['type']) && $payload['type'] === 'payment' && isset($payload['data']['id'])) {
        $paymentId = $payload['data']['id'];
    }
}

// Si no hay ID de pago, retornar error silencioso o 200 para no bloquear a Mercado Pago
if (empty($paymentId)) {
    logTransaction("Notificación recibida sin ID de pago válido.", "WARNING");
    http_response_code(200);
    echo json_encode(["status" => "ignored", "message" => "No se detectó ID de pago válido."]);
    exit();
}

// Sanitizar paymentId para prevenir inyección en la URL de la API
$paymentId = filter_var($paymentId, FILTER_SANITIZE_NUMBER_INT);
if (empty($paymentId)) {
    http_response_code(200);
    echo json_encode(["status" => "ignored", "message" => "ID de pago con formato inválido."]);
    exit();
}

// Consultar el estado del pago directamente en la API de Mercado Pago
$url = "https://api.mercadopago.com/v1/payments/{$paymentId}";
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . MP_ACCESS_TOKEN
]);

$responseRaw = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($responseRaw === false || $httpStatus !== 200) {
    logTransaction("No se pudo consultar el pago con ID {$paymentId} a Mercado Pago. HTTP status: {$httpStatus}.", "ERROR");
    // Si la llamada falla, respondemos con código 500 para que Mercado Pago intente re-enviar la notificación luego
    http_response_code(500);
    echo json_encode(["error" => "No se pudo consultar el pago con ID {$paymentId}."]);
    exit();
}

$payment = json_decode($responseRaw, true);

if (!isset($payment['status'])) {
    http_response_code(500);
    echo json_encode(["error" => "Respuesta de pago inválida de Mercado Pago."]);
    exit();
}

// Si el pago no está aprobado, ignorar (podría estar pendiente o rechazado)
if ($payment['status'] !== 'approved') {
    $safeStatus = sanitizeString($payment['status'], 30);
    logTransaction("Pago {$paymentId} ignorado por estado no aprobado: {$safeStatus}.", "INFO");
    http_response_code(200);
    echo json_encode(["status" => "pending_or_failed", "message" => "El pago no está aprobado. Estado: {$safeStatus}"]);
    exit();
}

// Evitar procesar el mismo pago dos veces (Deduplicación)
$processedFile = __DIR__ . '/processed_payments.json';
$processedPayments = [];

if (file_exists($processedFile)) {
    $rawProcessed = file_get_contents($processedFile);
    $processedPayments = json_decode($rawProcessed, true);
    if (!is_array($processedPayments)) {
        $processedPayments = [];
    }
}

if (in_array($paymentId, $processedPayments)) {
    // Ya procesamos este pago
    logTransaction("Pago {$paymentId} ignorado porque ya fue procesado previamente (deduplicación).", "INFO");
    http_response_code(200);
    echo json_encode(["status" => "already_processed", "message" => "El pago ya fue procesado previamente."]);
    exit();
}

// Procesar el descuento de stock
if (!file_exists(PRODUCTS_JSON_FILE)) {
    logTransaction("Fallo en webhook: Archivo de catálogo de productos no encontrado para descontar stock.", "ERROR");
    http_response_code(500);
    echo json_encode(["error" => "No se encontró el archivo de productos para actualizar stock."]);
    exit();
}

// Bloqueo y lectura segura de products.json para evitar condiciones de carrera (Race Conditions)
$fp = fopen(PRODUCTS_JSON_FILE, 'r+');
if (!$fp) {
    logTransaction("Fallo en webhook: No se pudo abrir el archivo de productos para bloqueo exclusivo.", "ERROR");
    http_response_code(500);
    echo json_encode(["error" => "No se pudo abrir el archivo de productos."]);
    exit();
}

// Adquirir bloqueo exclusivo
if (flock($fp, LOCK_EX)) {
    // Leer contenido actual
    $filesize = filesize(PRODUCTS_JSON_FILE);
    $catalogRaw = ($filesize > 0) ? fread($fp, $filesize) : '[]';
    $catalogProducts = json_decode($catalogRaw, true);
    
    if (is_array($catalogProducts)) {
        // Mapear ítems comprados
        // Mercado Pago guarda los ítems en $payment['additional_info']['items']
        $purchasedItems = isset($payment['additional_info']['items']) ? $payment['additional_info']['items'] : [];
        
        $stockUpdated = false;
        foreach ($purchasedItems as $item) {
            $sku = isset($item['id']) ? $item['id'] : ''; // El id de preferencia seteado en checkout.php es el SKU
            $qty = isset($item['quantity']) ? intval($item['quantity']) : 0;
            
            if (empty($sku) || $qty <= 0) {
                continue;
            }
            
            // Buscar y descontar en el catálogo
            foreach ($catalogProducts as &$prod) {
                if (isset($prod['sku']) && $prod['sku'] === $sku) {
                    $prod['stock'] = max(0, $prod['stock'] - $qty);
                    $stockUpdated = true;
                    break;
                }
            }
        }
        
        if ($stockUpdated) {
            // Escribir de vuelta el JSON de productos actualizado
            ftruncate($fp, 0); // Limpiar archivo
            rewind($fp);
            fwrite($fp, json_encode($catalogProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }
    
    // Liberar el bloqueo del archivo
    flock($fp, LOCK_UN);
}
fclose($fp);

// Guardar el ID del pago en el registro de procesados para evitar re-procesamientos futuros
$processedPayments[] = $paymentId;
file_put_contents($processedFile, json_encode($processedPayments));

logTransaction("Stock actualizado exitosamente para el pago aprobado {$paymentId}.", "SUCCESS");

// Responder exitosamente
http_response_code(200);
echo json_encode(["status" => "success", "message" => "Stock actualizado correctamente para el pago {$paymentId}."]);
