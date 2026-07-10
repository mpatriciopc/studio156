<?php
/**
 * ZM - Autenticación del Panel de Administración
 * 
 * Maneja login/logout con sesiones PHP.
 * Incluye protección básica contra fuerza bruta por IP.
 */

session_start();

require_once __DIR__ . '/config.php';

// --- Rate Limiting (Protección contra fuerza bruta) ---
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_DURATION', 300); // 5 minutos en segundos
define('ATTEMPTS_FILE', __DIR__ . '/login_attempts.json');

/**
 * Registra un intento de login fallido para la IP actual.
 */
function registerFailedAttempt() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    
    if (!isset($attempts[$ip])) {
        $attempts[$ip] = ['count' => 0, 'first_attempt' => time()];
    }
    
    $attempts[$ip]['count']++;
    $attempts[$ip]['last_attempt'] = time();
    
    saveAttempts($attempts);
}

/**
 * Verifica si la IP está bloqueada por exceso de intentos.
 */
function isLockedOut() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    
    if (!isset($attempts[$ip])) {
        return false;
    }
    
    $record = $attempts[$ip];
    
    // Si el bloqueo ya expiró, limpiar el registro
    if ($record['count'] >= MAX_LOGIN_ATTEMPTS) {
        $elapsed = time() - $record['last_attempt'];
        if ($elapsed >= LOCKOUT_DURATION) {
            unset($attempts[$ip]);
            saveAttempts($attempts);
            return false;
        }
        return true;
    }
    
    return false;
}

/**
 * Obtiene los minutos restantes de bloqueo.
 */
function getLockoutRemaining() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    
    if (!isset($attempts[$ip])) return 0;
    
    $elapsed = time() - $attempts[$ip]['last_attempt'];
    $remaining = LOCKOUT_DURATION - $elapsed;
    return max(0, ceil($remaining / 60));
}

/**
 * Limpia los intentos fallidos tras un login exitoso.
 */
function clearAttempts() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    unset($attempts[$ip]);
    saveAttempts($attempts);
}

function loadAttempts() {
    if (!file_exists(ATTEMPTS_FILE)) return [];
    $fp = fopen(ATTEMPTS_FILE, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveAttempts($attempts) {
    $fp = fopen(ATTEMPTS_FILE, 'w');
    if (!$fp) return;
    flock($fp, LOCK_EX);
    fwrite($fp, json_encode($attempts, JSON_PRETTY_PRINT));
    flock($fp, LOCK_UN);
    fclose($fp);
}

// --- Funciones de Sesión ---

/**
 * Verifica si el usuario está autenticado. Si no, redirige al login.
 */
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: admin_auth.php');
        exit();
    }
}

/**
 * Verifica si hay una sesión de admin activa.
 */
function isAuthenticated() {
    return isset($_SESSION['zm_admin_logged_in']) && $_SESSION['zm_admin_logged_in'] === true;
}

// --- Procesar Login / Logout ---

$loginError = '';
$isLocked = false;

// Solo ejecutar controlador y vista si se accede directamente a admin_auth.php
if (basename($_SERVER['PHP_SELF']) === 'admin_auth.php') {

// Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: admin_auth.php?logged_out=1');
    exit();
}

// Si ya está logueado, redirigir al panel
if (isAuthenticated()) {
    header('Location: admin.php');
    exit();
}

// Procesar formulario de login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isLockedOut()) {
        $minutes = getLockoutRemaining();
        $loginError = "Demasiados intentos fallidos. Intenta de nuevo en {$minutes} minuto(s).";
        $isLocked = true;
    } else {
        $user = isset($_POST['username']) ? trim($_POST['username']) : '';
        $pass = isset($_POST['password']) ? $_POST['password'] : '';
        
        if ($user === ADMIN_USER && password_verify($pass, ADMIN_PASSWORD_HASH)) {
            // Login exitoso
            $_SESSION['zm_admin_logged_in'] = true;
            $_SESSION['zm_admin_user'] = $user;
            clearAttempts();
            header('Location: admin.php');
            exit();
        } else {
            registerFailedAttempt();
            $loginError = 'Usuario o contraseña incorrectos.';
        }
    }
}

$loggedOut = isset($_GET['logged_out']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZM Admin | Iniciar Sesión</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="assets/css/styles.css">
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .login-container {
            max-width: 420px;
            width: 100%;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 48px 36px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .login-logo {
            font-family: var(--font-giant);
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 8px;
            color: var(--text-primary);
        }
        .login-logo span { color: var(--accent-color); font-style: italic; }
        .login-subtitle {
            text-align: center;
            font-family: var(--font-alt);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: var(--text-secondary);
            margin-bottom: 36px;
        }
        .login-form .form-group {
            margin-bottom: 20px;
        }
        .login-form label {
            display: block;
            font-family: var(--font-alt);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--text-secondary);
            margin-bottom: 8px;
        }
        .login-form input[type="text"],
        .login-form input[type="password"] {
            width: 100%;
            padding: 14px 16px;
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            color: var(--text-primary);
            font-family: var(--font-body);
            font-size: 14px;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }
        .login-form input:focus {
            outline: none;
            border-color: var(--accent-color);
        }
        .login-form button {
            width: 100%;
            margin-top: 8px;
        }
        .login-error {
            background-color: rgba(255, 59, 48, 0.1);
            border: 1px solid rgba(255, 59, 48, 0.3);
            color: #ff6b6b;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            margin-bottom: 20px;
            text-align: center;
        }
        .login-success {
            background-color: rgba(52, 199, 89, 0.1);
            border: 1px solid rgba(52, 199, 89, 0.3);
            color: #34c759;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-logo">ZM<span>.</span></div>
        <p class="login-subtitle">Panel de Administración</p>

        <?php if ($loggedOut): ?>
            <div class="login-success">Sesión cerrada exitosamente.</div>
        <?php endif; ?>

        <?php if ($loginError): ?>
            <div class="login-error"><?php echo htmlspecialchars($loginError); ?></div>
        <?php endif; ?>

        <form method="POST" class="login-form">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required autocomplete="username" <?php echo $isLocked ? 'disabled' : ''; ?>>
            </div>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required autocomplete="current-password" <?php echo $isLocked ? 'disabled' : ''; ?>>
            </div>
            <button type="submit" class="btn btn-primary" <?php echo $isLocked ? 'disabled' : ''; ?>>Ingresar al Panel</button>
        </form>
    </div>
</body>
</html>
<?php
}
?>
