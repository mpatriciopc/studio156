<?php
/**
 * ZM - Endpoint de Creación de Preferencia de Pago (Mercado Pago)
 */

header('Content-Type: application/json');

// CORS restringido al mismo origen (ajustar dominio en producción)
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Se requiere POST."]);
    exit();
}

// Requerir el archivo de configuración
require_once __DIR__ . '/config.php';

// Leer el JSON enviado en el cuerpo de la petición
$inputJSON = file_get_contents('php://input');
$cartData = json_decode($inputJSON, true);

if (!is_array($cartData) || empty($cartData)) {
    http_response_code(400);
    echo json_encode(["error" => "El carrito de compras está vacío o es inválido."]);
    exit();
}

// Cargar catálogo oficial desde products.json para validaciones de seguridad
if (!file_exists(PRODUCTS_JSON_FILE)) {
    http_response_code(500);
    echo json_encode(["error" => "Archivo de catálogo no encontrado en el servidor."]);
    exit();
}

$catalogRaw = file_get_contents(PRODUCTS_JSON_FILE);
$catalogProducts = json_decode($catalogRaw, true);

if (!is_array($catalogProducts)) {
    http_response_code(500);
    echo json_encode(["error" => "Error al procesar el catálogo en el servidor."]);
    exit();
}

// Convertir catálogo en un mapa indexado por SKU para búsquedas rápidas
$productsMap = [];
foreach ($catalogProducts as $prod) {
    if (isset($prod['sku'])) {
        $productsMap[$prod['sku']] = $prod;
    }
}

// Preparar los ítems para Mercado Pago y validar stock/precios
$mpItems = [];
$totalValido = 0;

foreach ($cartData as $cartItem) {
    $sku = isset($cartItem['sku']) ? trim($cartItem['sku']) : '';
    $cantidad = isset($cartItem['cantidad']) ? intval($cartItem['cantidad']) : 0;
    
    // Validar formato de SKU (alfanumérico con guiones)
    if (empty($sku) || !validateSku($sku) || $cantidad <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "El carrito contiene artículos con datos inválidos."]);
        exit();
    }
    
    // Verificar si el SKU existe en el catálogo oficial
    if (!isset($productsMap[$sku])) {
        $safeSku = sanitizeString($sku, 30);
        http_response_code(400);
        echo json_encode(["error" => "El producto con SKU {$safeSku} no existe en el catálogo."]);
        exit();
    }
    
    $officialProduct = $productsMap[$sku];
    
    // Validar stock disponible
    if ($officialProduct['stock'] < $cantidad) {
        $safeName = sanitizeString($officialProduct['nombre'], 100);
        $safeStock = intval($officialProduct['stock']);
        http_response_code(400);
        echo json_encode(["error" => "Stock insuficiente para el producto: {$safeName}. Stock actual: {$safeStock}"]);
        exit();
    }
    
    // Usar el precio oficial de nuestro servidor (NO confiar en el precio enviado por el cliente)
    $precioOficial = intval($officialProduct['precio']);
    $subtotal = $precioOficial * $cantidad;
    $totalValido += $subtotal;
    
    // Agregar a la estructura de Mercado Pago
    $mpItems[] = [
        "id" => $sku,
        "title" => $officialProduct['nombre'],
        "quantity" => $cantidad,
        "unit_price" => $precioOficial,
        "currency_id" => "CLP",
        "picture_url" => $base_url . '/' . $officialProduct['foto']
    ];
}

// Generar una referencia externa única para rastrear esta transacción en el webhook
$externalReference = "ZM-" . time() . "-" . rand(1000, 9999);

// Construir el cuerpo de la preferencia
$preferenceData = [
    "items" => $mpItems,
    "back_urls" => [
        "success" => URL_SUCCESS,
        "failure" => URL_FAILURE,
        "pending" => URL_PENDING
    ],
    "auto_return" => "approved",
    "notification_url" => URL_WEBHOOK,
    "external_reference" => $externalReference
];

// Llamada cURL a la API de Mercado Pago para generar la preferencia
$url = "https://api.mercadopago.com/v1/preferences";
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($preferenceData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . MP_ACCESS_TOKEN
]);

// Ejecutar petición
$responseRaw = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($responseRaw === false) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión con la pasarela de pagos."]);
    exit();
}

$response = json_decode($responseRaw, true);

if ($httpStatus >= 200 && $httpStatus < 300 && isset($response['init_point'])) {
    // Retornar la URL de pago oficial al frontend
    echo json_encode([
        "init_point" => $response['init_point'],
        "external_reference" => $externalReference
    ]);
} else {
    // Manejo de errores de Mercado Pago
    http_response_code(502);
    $errorMsg = isset($response['message']) ? $response['message'] : "Error desconocido al crear la preferencia de pago.";
    echo json_encode([
        "error" => "Error de Mercado Pago: {$errorMsg}",
        "status" => $httpStatus
    ]);
}
