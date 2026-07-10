<?php
/**
 * ZM - Archivo de Configuración Central
 * Seguridad, credenciales y parámetros del sistema.
 */

// Evitar acceso directo a este archivo por seguridad
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header("HTTP/1.1 403 Forbidden");
    exit("Acceso denegado.");
}

// --- REDIRECCIÓN HTTPS FORZADA (Respaldo de CDN/Hosting) ---
if (
    !isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off'
    && isset($_SERVER['HTTP_HOST'])
    && php_sapi_name() !== 'cli'
) {
    $redirectUrl = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirectUrl);
    exit();
}

// --- HEADERS DE SEGURIDAD HTTP ---
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

// --- FUNCIÓN DE SANITIZACIÓN REUTILIZABLE ---
function sanitizeString(string $input, int $maxLength = 255): string {
    $trimmed = trim($input);
    $stripped = strip_tags($trimmed);
    $safe = htmlspecialchars($stripped, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return mb_substr($safe, 0, $maxLength, 'UTF-8');
}

function validateSku(string $sku): bool {
    return (bool) preg_match('/^[A-Za-z0-9\-]+$/', $sku);
}

// --- CREDENCIALES DE MERCADO PAGO ---
// Reemplaza con tus llaves reales de Mercado Pago Developers
define('MP_ACCESS_TOKEN', 'APP_USR-TEST-YOUR-ACCESS-TOKEN-HERE'); 
define('MP_PUBLIC_KEY', 'APP_USR-TEST-YOUR-PUBLIC-KEY-HERE');

// --- PARÁMETROS DEL SISTEMA ---
define('PRODUCTS_JSON_FILE', __DIR__ . '/products.json');

// Calcular base URL dinámicamente
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$domainName = $_SERVER['HTTP_HOST'];
$scriptPath = dirname($_SERVER['PHP_SELF']);
// Remover cualquier diagonal inclinada al final
$base_url = rtrim($protocol . $domainName . $scriptPath, '/\\');

// --- PANEL DE ADMINISTRACIÓN ---
// Cambiar estas credenciales en producción
define('ADMIN_USER', 'admin');
// Contraseña por defecto: zm2026 (cambiar en producción)
define('ADMIN_PASSWORD_HASH', password_hash('zm2026', PASSWORD_DEFAULT));
define('ASSETS_DIR', __DIR__ . '/assets');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5 MB

// --- URLS DE RETORNO Y NOTIFICACIONES ---
define('URL_SUCCESS', $base_url . '/catalogo.html?status=success');
define('URL_FAILURE', $base_url . '/catalogo.html?status=failure');
define('URL_PENDING', $base_url . '/catalogo.html?status=pending');
define('URL_WEBHOOK', $base_url . '/webhook.php');
