<?php
/**
 * ZM - Diagnóstico de Autenticación
 */

require_once __DIR__ . '/config.php';

echo "<h1>Diagnóstico de Autenticación ZDM</h1>";
echo "<p><strong>Versión de PHP:</strong> " . phpversion() . "</p>";
echo "<p><strong>Usuario Configurado (ADMIN_USER):</strong> '" . ADMIN_USER . "'</p>";

$test_pass = 'zm2026';
$verify_result = password_verify($test_pass, ADMIN_PASSWORD_HASH);

echo "<p><strong>Hash Generado Actual:</strong> <code>" . ADMIN_PASSWORD_HASH . "</code></p>";
echo "<p><strong>Resultado de password_verify('{$test_pass}'):</strong> " . ($verify_result ? "<span style='color:green;font-weight:bold;'>TRUE (Funciona Correctamente)</span>" : "<span style='color:red;font-weight:bold;'>FALSE (Error de Validación)</span>") . "</p>";

echo "<h2>Sesiones PHP</h2>";
session_start();
$_SESSION['test_session'] = 'active';
echo "<p><strong>Estado de Sesión:</strong> " . (session_status() === PHP_SESSION_ACTIVE ? "Activa" : "Inactiva") . "</p>";
echo "<p><strong>ID de Sesión:</strong> " . session_id() . "</p>";
?>
