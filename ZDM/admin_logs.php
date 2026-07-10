<?php
/**
 * ZM - Visualizador de Logs de Transacciones
 * 
 * Muestra el archivo transactions.log en formato amigable y seguro.
 * Protegido por autenticación de sesión (admin_auth.php).
 */

require_once __DIR__ . '/admin_auth.php';
requireAuth();

$logFile = __DIR__ . '/transactions.log';
$alert = '';
$alertType = '';

// Procesar vaciado de log
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'clear') {
    if (file_exists($logFile)) {
        if (file_put_contents($logFile, '') !== false) {
            $alert = 'El registro de transacciones ha sido vaciado exitosamente.';
            $alertType = 'success';
        } else {
            $alert = 'No se pudo vaciar el archivo de registro. Verifica los permisos de escritura.';
            $alertType = 'error';
        }
    } else {
        $alert = 'No existe ningún registro de transacciones que vaciar.';
        $alertType = 'info';
    }
}

// Leer y parsear logs
$logs = [];
$hasLogs = false;

if (file_exists($logFile) && filesize($logFile) > 0) {
    $hasLogs = true;
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    // Mostrar los logs más recientes primero
    $lines = array_reverse($lines);

    foreach ($lines as $line) {
        // Formato esperado: [timestamp] [level] [IP: ip] message
        if (preg_match('/^\[(.*?)\]\s+\[(.*?)\]\s+\[IP:\s+(.*?)\]\s+(.*)$/', $line, $matches)) {
            $logs[] = [
                'timestamp' => $matches[1],
                'level' => strtoupper($matches[2]),
                'ip' => $matches[3],
                'message' => $matches[4]
            ];
        } else {
            // Línea con formato no convencional
            $logs[] = [
                'timestamp' => '',
                'level' => 'INFO',
                'ip' => 'N/A',
                'message' => $line
            ];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZM Admin | Registro de Transacciones</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/admin.css">
    <style>
        .badge {
            display: inline-block;
            padding: 4px 8px;
            font-family: var(--font-alt);
            font-size: 10px;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .badge-success {
            background-color: rgba(52, 199, 89, 0.15);
            color: #34c759;
            border: 1px solid rgba(52, 199, 89, 0.3);
        }
        .badge-error {
            background-color: rgba(255, 59, 48, 0.15);
            color: #ff6b6b;
            border: 1px solid rgba(255, 59, 48, 0.3);
        }
        .badge-warning {
            background-color: rgba(255, 149, 0, 0.15);
            color: #ff9500;
            border: 1px solid rgba(255, 149, 0, 0.3);
        }
        .badge-info {
            background-color: rgba(142, 142, 147, 0.15);
            color: #aeaea2;
            border: 1px solid rgba(142, 142, 147, 0.3);
        }
        .ip-cell {
            font-family: monospace;
            color: var(--text-secondary);
            font-size: 12px;
        }
        .msg-cell {
            line-height: 1.4;
            max-width: 480px;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <div class="container">
            <!-- Header -->
            <div class="admin-header">
                <div class="admin-header-left">
                    <a href="index.html" class="admin-logo" style="text-decoration: none;">
                        <img src="assets/img/logo.png" alt="ZM Logo" style="height: 32px; width: auto; border-radius: 4px;">
                        <span>ZM<span>.</span></span>
                    </a>
                    <span class="admin-badge">Transacciones</span>
                </div>
                <div class="admin-header-right">
                    <span class="admin-user"><?php echo htmlspecialchars($_SESSION['zm_admin_user']); ?></span>
                    <a href="admin.php" class="btn-view-site">Volver a Productos</a>
                    <a href="admin_auth.php?action=logout" class="btn-logout">Cerrar Sesión</a>
                </div>
            </div>

            <!-- Alertas -->
            <?php if ($alert): ?>
                <div class="admin-alert <?php echo $alertType; ?>">
                    <?php echo htmlspecialchars($alert); ?>
                </div>
            <?php endif; ?>

            <!-- Toolbar -->
            <div class="admin-toolbar">
                <h2>Historial de Actividad (Mercado Pago Webhook)</h2>
                <?php if ($hasLogs): ?>
                    <form method="POST" onsubmit="return confirm('¿Estás seguro de que deseas vaciar todo el registro de transacciones? Esta acción no se puede deshacer.');">
                        <input type="hidden" name="action" value="clear">
                        <button type="submit" class="btn-action btn-delete" style="padding: 10px 18px; font-weight: bold; border-radius: 4px; font-size: 13px;">
                            Vaciar Registro
                        </button>
                    </form>
                <?php endif; ?>
            </div>

            <!-- Table -->
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th style="width: 180px;">Fecha/Hora</th>
                            <th style="width: 100px;">Nivel</th>
                            <th style="width: 130px;">IP Cliente</th>
                            <th>Detalle del Suceso / Evento</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!$hasLogs): ?>
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">
                                    No hay registros de transacciones disponibles. El archivo se generará al recibir notificaciones en webhook.php.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($logs as $log): ?>
                                <tr>
                                    <td>
                                        <span style="font-size: 13px; color: var(--text-secondary);">
                                            <?php echo htmlspecialchars($log['timestamp'] ?: 'Fecha desconocida'); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php 
                                        $badgeClass = 'badge-info';
                                        if ($log['level'] === 'SUCCESS') $badgeClass = 'badge-success';
                                        elseif ($log['level'] === 'ERROR') $badgeClass = 'badge-error';
                                        elseif ($log['level'] === 'WARNING') $badgeClass = 'badge-warning';
                                        ?>
                                        <span class="badge <?php echo $badgeClass; ?>">
                                            <?php echo htmlspecialchars($log['level']); ?>
                                        </span>
                                    </td>
                                    <td class="ip-cell">
                                        <?php echo htmlspecialchars($log['ip']); ?>
                                    </td>
                                    <td class="msg-cell">
                                        <?php echo htmlspecialchars($log['message']); ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
