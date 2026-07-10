<?php
/**
 * ZM - Admin JSON API
 * Handles authentication and CRUD actions for products and logs.
 */

session_start();

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// --- Helper Functions ---
function getAttemptsFile() {
    return __DIR__ . '/login_attempts.json';
}

function loadAttempts() {
    $file = getAttemptsFile();
    if (!file_exists($file)) return [];
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveAttempts($attempts) {
    file_put_contents(getAttemptsFile(), json_encode($attempts, JSON_PRETTY_PRINT));
}

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

function isLockedOut() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    if (!isset($attempts[$ip])) return false;
    $record = $attempts[$ip];
    if ($record['count'] >= 5) {
        $elapsed = time() - $record['last_attempt'];
        if ($elapsed >= 300) {
            unset($attempts[$ip]);
            saveAttempts($attempts);
            return false;
        }
        return true;
    }
    return false;
}

function getLockoutRemaining() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    if (!isset($attempts[$ip])) return 0;
    $elapsed = time() - $attempts[$ip]['last_attempt'];
    $remaining = 300 - $elapsed;
    return max(0, ceil($remaining / 60));
}

function clearAttempts() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $attempts = loadAttempts();
    if (isset($attempts[$ip])) {
        unset($attempts[$ip]);
        saveAttempts($attempts);
    }
}

function isAuthenticated() {
    return isset($_SESSION['zm_admin_logged_in']) && $_SESSION['zm_admin_logged_in'] === true;
}

function checkAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit();
    }
}

function loadProducts() {
    if (!file_exists(PRODUCTS_JSON_FILE)) return [];
    $raw = file_get_contents(PRODUCTS_JSON_FILE);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveProducts($products) {
    file_put_contents(
        PRODUCTS_JSON_FILE,
        json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
}

function getNextId($products) {
    $maxId = 0;
    foreach ($products as $p) {
        if (isset($p['id']) && $p['id'] > $maxId) {
            $maxId = $p['id'];
        }
    }
    return $maxId + 1;
}

function generateSKU($nombre, $nextId) {
    $clean = strtoupper(preg_replace('/[^a-zA-Z]/', '', $nombre));
    $prefix = substr($clean, 0, 3);
    if (strlen($prefix) < 3) $prefix = str_pad($prefix, 3, 'X');
    return "ZM-{$prefix}-" . str_pad($nextId, 2, '0', STR_PAD_LEFT);
}

function handleImageUpload($fieldName) {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $file = $_FILES[$fieldName];
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['error' => 'La imagen excede el tamaño máximo de 5 MB.'];
    }
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mimeType, $allowedTypes)) {
        return ['error' => 'Formato de imagen no permitido. Solo se aceptan JPG, PNG, WebP o GIF.'];
    }
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeName = 'zm_' . time() . '_' . rand(1000, 9999) . '.' . strtolower($extension);
    if (!is_dir(ASSETS_DIR)) {
        mkdir(ASSETS_DIR, 0755, true);
    }
    $destination = ASSETS_DIR . '/' . $safeName;
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return ['path' => 'assets/' . $safeName];
    }
    return ['error' => 'No se pudo guardar la imagen en el servidor.'];
}

function deleteProductImage($imagePath) {
    if (empty($imagePath)) return;
    $presets = [
        'assets/acoustic_guitar.png',
        'assets/saxophone.png',
        'assets/ukulele.png',
        'assets/music_stand.png',
        'assets/tuner.png',
        'assets/leather_strap.png',
        'assets/jazz_bass.png',
        'assets/telecaster_1974.png',
        'assets/fuzz_pedal.png',
        'assets/marshall_amplifier.png'
    ];
    if (in_array($imagePath, $presets)) return;
    $fullPath = __DIR__ . '/' . $imagePath;
    if (file_exists($fullPath) && is_file($fullPath)) {
        unlink($fullPath);
    }
}

// --- Action Router ---
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        exit();
    }
    if (isLockedOut()) {
        $minutes = getLockoutRemaining();
        echo json_encode(['error' => "Demasiados intentos fallidos. Intenta de nuevo en {$minutes} minuto(s)."]);
        exit();
    }
    $user = isset($_POST['username']) ? trim($_POST['username']) : '';
    $pass = isset($_POST['password']) ? $_POST['password'] : '';
    if ($user === ADMIN_USER && password_verify($pass, ADMIN_PASSWORD_HASH)) {
        $_SESSION['zm_admin_logged_in'] = true;
        $_SESSION['zm_admin_user'] = $user;
        clearAttempts();
        echo json_encode(['success' => true, 'username' => $user]);
    } else {
        registerFailedAttempt();
        echo json_encode(['error' => 'Usuario o contraseña incorrectos.']);
    }
    exit();
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'check_auth') {
    if (isAuthenticated()) {
        echo json_encode(['authenticated' => true, 'username' => $_SESSION['zm_admin_user']]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
    exit();
}

// All actions below require authentication
checkAuth();

if ($action === 'get_data') {
    $products = loadProducts();
    
    // Calculate stats
    $totalProducts = count($products);
    $totalInstruments = count(array_filter($products, function($p) { return $p['categoria'] === 'Instrumentos'; }));
    $totalAccessories = count(array_filter($products, function($p) { return $p['categoria'] === 'Accesorios'; }));
    $totalFeatured = count(array_filter($products, function($p) { return !empty($p['destacado']); }));
    $lowStock = count(array_filter($products, function($p) { return $p['stock'] <= 2; }));
    
    // Parse logs
    $logFile = __DIR__ . '/transactions.log';
    $logs = [];
    if (file_exists($logFile) && filesize($logFile) > 0) {
        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $lines = array_reverse($lines);
        foreach ($lines as $line) {
            if (preg_match('/^\[(.*?)\]\s+\[(.*?)\]\s+\[IP:\s+(.*?)\]\s+(.*)$/', $line, $matches)) {
                $logs[] = [
                    'timestamp' => $matches[1],
                    'level' => strtoupper($matches[2]),
                    'ip' => $matches[3],
                    'message' => $matches[4]
                ];
            } else {
                $logs[] = [
                    'timestamp' => '',
                    'level' => 'INFO',
                    'ip' => 'N/A',
                    'message' => $line
                ];
            }
        }
    }
    
    echo json_encode([
        'products' => $products,
        'stats' => [
            'total' => $totalProducts,
            'instruments' => $totalInstruments,
            'accessories' => $totalAccessories,
            'featured' => $totalFeatured,
            'lowStock' => $lowStock
        ],
        'logs' => $logs
    ]);
    exit();
}

if ($action === 'create') {
    $nombre = trim($_POST['nombre'] ?? '');
    $estado = trim($_POST['estado'] ?? 'Nuevo');
    $categoria = trim($_POST['categoria'] ?? 'Instrumentos');
    $precio = intval($_POST['precio'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $destacado = isset($_POST['destacado']) && ($_POST['destacado'] === 'true' || $_POST['destacado'] === '1' || $_POST['destacado'] === 'on');

    if (empty($nombre) || $precio <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'El nombre y un precio mayor a 0 son obligatorios.']);
        exit();
    }
    
    $products = loadProducts();
    $nextId = getNextId($products);
    $sku = generateSKU($nombre, $nextId);
    $foto = 'assets/acoustic_guitar.png'; // Default

    $uploadResult = handleImageUpload('foto');
    if ($uploadResult && isset($uploadResult['path'])) {
        $foto = $uploadResult['path'];
    } elseif ($uploadResult && isset($uploadResult['error'])) {
        http_response_code(400);
        echo json_encode(['error' => $uploadResult['error']]);
        exit();
    }

    $newProduct = [
        'id' => $nextId,
        'sku' => $sku,
        'nombre' => $nombre,
        'estado' => $estado,
        'categoria' => $categoria,
        'precio' => $precio,
        'stock' => $stock,
        'descripcion' => $descripcion,
        'foto' => $foto,
        'destacado' => $destacado
    ];

    $products[] = $newProduct;
    saveProducts($products);
    echo json_encode(['success' => true, 'product' => $newProduct]);
    exit();
}

if ($action === 'update') {
    $editSku = $_POST['edit_sku'] ?? '';
    $nombre = trim($_POST['nombre'] ?? '');
    $estado = trim($_POST['estado'] ?? 'Nuevo');
    $categoria = trim($_POST['categoria'] ?? 'Instrumentos');
    $precio = intval($_POST['precio'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $destacado = isset($_POST['destacado']) && ($_POST['destacado'] === 'true' || $_POST['destacado'] === '1' || $_POST['destacado'] === 'on');

    if (empty($nombre) || $precio <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'El nombre y un precio mayor a 0 son obligatorios.']);
        exit();
    }
    
    $products = loadProducts();
    $found = false;
    foreach ($products as &$prod) {
        if ($prod['sku'] === $editSku) {
            $prod['nombre'] = $nombre;
            $prod['estado'] = $estado;
            $prod['categoria'] = $categoria;
            $prod['precio'] = $precio;
            $prod['stock'] = $stock;
            $prod['descripcion'] = $descripcion;
            $prod['destacado'] = $destacado;

            $uploadResult = handleImageUpload('foto');
            if ($uploadResult && isset($uploadResult['path'])) {
                $oldFoto = $prod['foto'] ?? '';
                $prod['foto'] = $uploadResult['path'];
                if (!empty($oldFoto)) {
                    deleteProductImage($oldFoto);
                }
            } elseif ($uploadResult && isset($uploadResult['error'])) {
                http_response_code(400);
                echo json_encode(['error' => $uploadResult['error']]);
                exit();
            }
            $found = true;
            break;
        }
    }
    unset($prod);

    if ($found) {
        saveProducts($products);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No se encontró el producto con SKU especificado.']);
    }
    exit();
}

if ($action === 'delete') {
    $deleteSku = $_POST['delete_sku'] ?? '';
    $products = loadProducts();
    $originalCount = count($products);
    $deletedFoto = '';

    foreach ($products as $p) {
        if ($p['sku'] === $deleteSku) {
            $deletedFoto = $p['foto'] ?? '';
            break;
        }
    }

    $products = array_values(array_filter($products, function($p) use ($deleteSku) {
        return $p['sku'] !== $deleteSku;
    }));

    if (count($products) < $originalCount) {
        saveProducts($products);
        if (!empty($deletedFoto)) {
            deleteProductImage($deletedFoto);
        }
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No se encontró el producto a eliminar.']);
    }
    exit();
}

if ($action === 'clear_logs') {
    $logFile = __DIR__ . '/transactions.log';
    if (file_exists($logFile)) {
        if (file_put_contents($logFile, '') !== false) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo vaciar el archivo de registro.']);
        }
    } else {
        echo json_encode(['success' => true]);
    }
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Acción no válida']);
exit();
