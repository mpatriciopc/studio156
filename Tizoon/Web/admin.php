<?php
/**
 * ZM - Panel de Administración de Productos
 * 
 * CRUD completo sobre products.json con subida de imágenes.
 * Protegido por autenticación de sesión (admin_auth.php).
 */

require_once __DIR__ . '/admin_auth.php';
requireAuth();

// --- Helpers ---

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
    // Tomar primeras 3 letras significativas del nombre
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

    // Validar tamaño
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['error' => 'La imagen excede el tamaño máximo de 5 MB.'];
    }

    // Validar tipo
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        return ['error' => 'Formato de imagen no permitido. Solo se aceptan JPG, PNG, WebP o GIF.'];
    }

    // Generar nombre seguro
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeName = 'zm_' . time() . '_' . rand(1000, 9999) . '.' . strtolower($extension);
    $destination = ASSETS_DIR . '/' . $safeName;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return ['path' => 'assets/' . $safeName];
    }

    return ['error' => 'No se pudo guardar la imagen en el servidor.'];
}

function deleteProductImage($imagePath) {
    if (empty($imagePath)) return;
    
    // Lista de presets que no deben borrarse
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
    
    if (in_array($imagePath, $presets)) {
        return;
    }
    
    $fullPath = __DIR__ . '/' . $imagePath;
    if (file_exists($fullPath) && is_file($fullPath)) {
        unlink($fullPath);
    }
}

// --- Procesar Acciones ---
$products = loadProducts();
$alert = '';
$alertType = '';

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $nombre = trim($_POST['nombre'] ?? '');
    $estado = trim($_POST['estado'] ?? 'Nuevo');
    $categoria = trim($_POST['categoria'] ?? 'Instrumentos');
    $precio = intval($_POST['precio'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $destacado = isset($_POST['destacado']);

    if (empty($nombre) || $precio <= 0) {
        $alert = 'El nombre y un precio mayor a 0 son obligatorios.';
        $alertType = 'error';
    } else {
        $nextId = getNextId($products);
        $sku = generateSKU($nombre, $nextId);
        $foto = 'assets/acoustic_guitar.png'; // Default

        $uploadResult = handleImageUpload('foto');
        if ($uploadResult && isset($uploadResult['path'])) {
            $foto = $uploadResult['path'];
        } elseif ($uploadResult && isset($uploadResult['error'])) {
            $alert = $uploadResult['error'];
            $alertType = 'error';
        }

        if ($alertType !== 'error') {
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
            $alert = "Producto \"{$nombre}\" creado exitosamente con SKU {$sku}.";
            $alertType = 'success';
        }
    }
}

// UPDATE
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update') {
    $editSku = $_POST['edit_sku'] ?? '';
    $nombre = trim($_POST['nombre'] ?? '');
    $estado = trim($_POST['estado'] ?? 'Nuevo');
    $categoria = trim($_POST['categoria'] ?? 'Instrumentos');
    $precio = intval($_POST['precio'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $destacado = isset($_POST['destacado']);

    if (empty($nombre) || $precio <= 0) {
        $alert = 'El nombre y un precio mayor a 0 son obligatorios.';
        $alertType = 'error';
    } else {
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
                    $alert = $uploadResult['error'];
                    $alertType = 'error';
                }

                $found = true;
                break;
            }
        }
        unset($prod);

        if ($found && $alertType !== 'error') {
            saveProducts($products);
            $alert = "Producto \"{$nombre}\" actualizado exitosamente.";
            $alertType = 'success';
        } elseif (!$found) {
            $alert = "No se encontró el producto con SKU {$editSku}.";
            $alertType = 'error';
        }
    }
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $deleteSku = $_POST['delete_sku'] ?? '';
    $originalCount = count($products);
    $deletedName = '';
    $deletedFoto = '';

    foreach ($products as $p) {
        if ($p['sku'] === $deleteSku) {
            $deletedName = $p['nombre'];
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
        $alert = "Producto \"{$deletedName}\" eliminado exitosamente.";
        $alertType = 'success';
    } else {
        $alert = "No se encontró el producto a eliminar.";
        $alertType = 'error';
    }
}

// Recargar productos tras cualquier operación
$products = loadProducts();

// Stats
$totalProducts = count($products);
$totalInstruments = count(array_filter($products, function($p) { return $p['categoria'] === 'Instrumentos'; }));
$totalAccessories = count(array_filter($products, function($p) { return $p['categoria'] === 'Accesorios'; }));
$totalFeatured = count(array_filter($products, function($p) { return !empty($p['destacado']); }));
$lowStock = count(array_filter($products, function($p) { return $p['stock'] <= 2; }));
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZM Admin | Gestión de Productos</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body>
    <div class="admin-wrapper">
        <div class="container">
            <!-- Header -->
            <div class="admin-header">
                <div class="admin-header-left">
                    <a href="index.html" class="admin-logo" style="text-decoration: none;">
                        <img src="assets/img/logo.png" alt="ZM Logo" style="height: 38px; width: auto; border-radius: 4px;">
                    </a>
                    <span class="admin-badge">Admin</span>
                </div>
                <div class="admin-header-right">
                    <span class="admin-user"><?php echo htmlspecialchars($_SESSION['zm_admin_user']); ?></span>
                    <a href="index.html" target="_blank" class="btn-view-site">Ver Tienda</a>
                    <a href="admin_logs.php" class="btn-view-site" style="margin-right: 10px;">Ver Transacciones</a>
                    <a href="admin_auth.php?action=logout" class="btn-logout">Cerrar Sesión</a>
                </div>
            </div>

            <!-- Alertas -->
            <?php if ($alert): ?>
                <div class="admin-alert <?php echo $alertType; ?>">
                    <?php echo htmlspecialchars($alert); ?>
                </div>
            <?php endif; ?>

            <!-- Stats -->
            <div class="admin-stats">
                <div class="stat-card active" data-filter="all">
                    <span class="stat-value"><?php echo $totalProducts; ?></span>
                    <span class="stat-label">Productos</span>
                </div>
                <div class="stat-card" data-filter="Instrumentos">
                    <span class="stat-value"><?php echo $totalInstruments; ?></span>
                    <span class="stat-label">Instrumentos</span>
                </div>
                <div class="stat-card" data-filter="Accesorios">
                    <span class="stat-value"><?php echo $totalAccessories; ?></span>
                    <span class="stat-label">Accesorios</span>
                </div>
                <div class="stat-card" data-filter="destacado">
                    <span class="stat-value"><?php echo $totalFeatured; ?></span>
                    <span class="stat-label">Destacados</span>
                </div>
                <div class="stat-card" data-filter="stock-bajo">
                    <span class="stat-value <?php echo $lowStock > 0 ? 'stock-low' : ''; ?>"><?php echo $lowStock; ?></span>
                    <span class="stat-label">Stock Bajo</span>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="admin-toolbar">
                <h2>Catálogo de Productos</h2>
                <div class="admin-toolbar-actions">
                    <div class="admin-search-container">
                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="admin-search-input" placeholder="Buscar por nombre, SKU..." oninput="filterAdminProducts()">
                    </div>
                    <button class="btn-add" onclick="openCreateModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Producto
                    </button>
                </div>
            </div>

            <!-- Products Table -->
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>SKU</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Dest.</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($products)): ?>
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                    No hay productos en el catálogo. Haz click en "Nuevo Producto" para empezar.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($products as $product): ?>
                                <tr class="product-row" 
                                    data-categoria="<?php echo htmlspecialchars($product['categoria']); ?>" 
                                    data-destacado="<?php echo !empty($product['destacado']) ? 'true' : 'false'; ?>" 
                                    data-stock="<?php echo $product['stock']; ?>">
                                    <td><img class="product-thumb" src="<?php echo htmlspecialchars($product['foto']); ?>" alt="<?php echo htmlspecialchars($product['nombre']); ?>"></td>
                                    <td><?php echo htmlspecialchars($product['nombre']); ?></td>
                                    <td class="sku-cell"><?php echo htmlspecialchars($product['sku']); ?></td>
                                    <td><span class="category-tag"><?php echo htmlspecialchars($product['categoria']); ?></span></td>
                                    <td><?php echo htmlspecialchars($product['estado']); ?></td>
                                    <td class="price-cell">$<?php echo number_format($product['precio'], 0, ',', '.'); ?></td>
                                    <td class="stock-cell <?php echo $product['stock'] <= 2 ? 'stock-low' : 'stock-ok'; ?>"><?php echo $product['stock']; ?></td>
                                    <td><span class="featured-badge <?php echo empty($product['destacado']) ? 'inactive' : ''; ?>"></span></td>
                                    <td>
                                        <div class="action-btns">
                                            <button class="btn-action" onclick='openEditModal(<?php echo json_encode($product, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE); ?>)'>Editar</button>
                                            <button class="btn-action btn-delete" onclick='openDeleteModal("<?php echo htmlspecialchars($product['sku']); ?>", "<?php echo htmlspecialchars($product['nombre']); ?>")'>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- MODAL: Crear/Editar Producto -->
    <div id="product-modal" class="admin-modal-overlay">
        <div class="admin-modal">
            <div class="admin-modal-header">
                <h3 id="modal-title">Nuevo Producto</h3>
                <button class="btn-modal-close" onclick="closeModal('product-modal')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <form id="product-form" method="POST" enctype="multipart/form-data" class="admin-form">
                <input type="hidden" id="form-action" name="action" value="create">
                <input type="hidden" id="form-edit-sku" name="edit_sku" value="">

                <div class="form-group">
                    <label for="prod-nombre">Nombre del Producto</label>
                    <input type="text" id="prod-nombre" name="nombre" required placeholder="Ej. Guitarra Clásica de Concierto">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="prod-categoria">Categoría</label>
                        <select id="prod-categoria" name="categoria">
                            <option value="Instrumentos">Instrumentos</option>
                            <option value="Accesorios">Accesorios</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="prod-estado">Estado</label>
                        <select id="prod-estado" name="estado">
                            <option value="Nuevo">Nuevo</option>
                            <option value="Usado (Excelente)">Usado (Excelente)</option>
                            <option value="Usado (Bueno)">Usado (Bueno)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="prod-precio">Precio (CLP)</label>
                        <input type="number" id="prod-precio" name="precio" required min="1" placeholder="125000">
                    </div>
                    <div class="form-group">
                        <label for="prod-stock">Stock</label>
                        <input type="number" id="prod-stock" name="stock" required min="0" placeholder="5">
                    </div>
                </div>

                <div class="form-group">
                    <label for="prod-descripcion">Descripción</label>
                    <textarea id="prod-descripcion" name="descripcion" placeholder="Describe las características del producto..."></textarea>
                </div>

                <div class="form-group">
                    <label>Imagen del Producto</label>
                    <div class="image-upload-area">
                        <input type="file" id="prod-foto" name="foto" accept="image/jpeg,image/png,image/webp,image/gif">
                        <p class="upload-text">Click aquí o arrastra una imagen<br><strong>JPG, PNG, WebP o GIF (máx. 5MB)</strong></p>
                    </div>
                    <div id="image-preview" class="image-preview"></div>
                </div>

                <div class="checkbox-group">
                    <input type="checkbox" id="prod-destacado" name="destacado">
                    <label for="prod-destacado">Mostrar en Novedades (página de inicio)</label>
                </div>

                <button type="submit" class="btn btn-primary btn-submit" id="form-submit-btn">Crear Producto</button>
            </form>
        </div>
    </div>

    <!-- MODAL: Confirmar Eliminación -->
    <div id="delete-modal" class="admin-modal-overlay">
        <div class="admin-modal" style="max-width: 440px;">
            <div class="admin-modal-header">
                <h3>Confirmar Eliminación</h3>
                <button class="btn-modal-close" onclick="closeModal('delete-modal')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="confirm-modal">
                <p>¿Estás seguro de que deseas eliminar el producto <span id="delete-product-name" class="product-name"></span>? Esta acción no se puede deshacer.</p>
                <form method="POST" style="display: inline;">
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" id="delete-sku-input" name="delete_sku" value="">
                    <div class="confirm-actions">
                        <button type="button" class="btn-cancel" onclick="closeModal('delete-modal')">Cancelar</button>
                        <button type="submit" class="btn-confirm-delete">Eliminar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // --- Modal Controls ---
        function openModal(id) {
            document.getElementById(id).classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(id) {
            document.getElementById(id).classList.remove('active');
            document.body.style.overflow = '';
        }

        function openCreateModal() {
            document.getElementById('modal-title').innerText = 'Nuevo Producto';
            document.getElementById('form-action').value = 'create';
            document.getElementById('form-edit-sku').value = '';
            document.getElementById('form-submit-btn').innerText = 'Crear Producto';
            
            // Reset form
            document.getElementById('product-form').reset();
            document.getElementById('image-preview').innerHTML = '';
            
            openModal('product-modal');
        }

        function openEditModal(product) {
            document.getElementById('modal-title').innerText = 'Editar Producto';
            document.getElementById('form-action').value = 'update';
            document.getElementById('form-edit-sku').value = product.sku;
            document.getElementById('form-submit-btn').innerText = 'Guardar Cambios';
            
            // Llenar campos
            document.getElementById('prod-nombre').value = product.nombre;
            document.getElementById('prod-categoria').value = product.categoria;
            document.getElementById('prod-estado').value = product.estado;
            document.getElementById('prod-precio').value = product.precio;
            document.getElementById('prod-stock').value = product.stock;
            document.getElementById('prod-descripcion').value = product.descripcion || '';
            document.getElementById('prod-destacado').checked = !!product.destacado;
            
            // Mostrar imagen actual
            document.getElementById('image-preview').innerHTML = 
                '<img src="' + product.foto + '" alt="Imagen actual">';
            
            openModal('product-modal');
        }

        function openDeleteModal(sku, name) {
            document.getElementById('delete-sku-input').value = sku;
            document.getElementById('delete-product-name').innerText = '"' + name + '"';
            openModal('delete-modal');
        }

        // --- Image Preview ---
        document.getElementById('prod-foto').addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.innerHTML = '<img src="' + ev.target.result + '" alt="Preview">';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        // --- Close modals with ESC ---
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('product-modal');
                closeModal('delete-modal');
            }
        });

        // --- Close modals clicking overlay ---
        document.querySelectorAll('.admin-modal-overlay').forEach(function(overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // --- Combined Search and Category Filtering ---
        function filterAdminProducts() {
            const searchVal = document.getElementById('admin-search-input').value.toLowerCase().trim();
            const activeCard = document.querySelector('.stat-card.active');
            const activeFilter = activeCard ? activeCard.getAttribute('data-filter') : 'all';
            
            const rows = document.querySelectorAll('.product-row');
            rows.forEach(function(row) {
                const name = row.cells[1].textContent.toLowerCase();
                const sku = row.querySelector('.sku-cell').textContent.toLowerCase();
                
                const categoria = row.getAttribute('data-categoria');
                const destacado = row.getAttribute('data-destacado');
                const stock = parseInt(row.getAttribute('data-stock'), 10);
                
                let matchesFilter = false;
                if (activeFilter === 'all') {
                    matchesFilter = true;
                } else if (activeFilter === 'Instrumentos' || activeFilter === 'Accesorios') {
                    matchesFilter = (categoria === activeFilter);
                } else if (activeFilter === 'destacado') {
                    matchesFilter = (destacado === 'true');
                } else if (activeFilter === 'stock-bajo') {
                    matchesFilter = (stock <= 2);
                }
                
                const matchesSearch = (name.includes(searchVal) || sku.includes(searchVal));
                
                if (matchesFilter && matchesSearch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // --- Table Filtering via Stat Cards ---
        document.querySelectorAll('.stat-card').forEach(function(card) {
            card.addEventListener('click', function() {
                // Activar tarjeta seleccionada
                document.querySelectorAll('.stat-card').forEach(function(c) {
                    c.classList.remove('active');
                });
                card.classList.add('active');

                filterAdminProducts();
            });
        });
    </script>
</body>
</html>
