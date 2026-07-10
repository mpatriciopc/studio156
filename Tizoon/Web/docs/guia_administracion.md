# Guía de Administración — Panel ZM

Manual paso a paso para gestionar los productos de tu tienda Zona de Músicos.

---

## 1. Acceder al Panel

1. Abre tu navegador y visita: `https://tu-dominio.cl/admin.php`
2. Ingresa las credenciales:
   - **Usuario:** `admin`
   - **Contraseña:** `zm2026` *(cámbiala en producción)*
3. Haz click en **"Ingresar al Panel"**.

> **Nota de seguridad:** Después de 5 intentos fallidos, el sistema bloqueará el acceso por 5 minutos para proteger tu cuenta.

---

## 2. Panel Principal

Al ingresar verás:

- **Barra de estadísticas:** Muestra el total de productos, instrumentos, accesorios, destacados y productos con stock bajo (≤2 unidades).
- **Tabla de productos:** Lista completa del catálogo con foto miniatura, nombre, SKU, categoría, estado, precio, stock y si está destacado.
- **Botón "Nuevo Producto":** Para agregar artículos nuevos.

---

## 3. Agregar un Producto Nuevo

1. Haz click en el botón dorado **"+ Nuevo Producto"**.
2. Completa el formulario:
   - **Nombre:** Nombre completo del producto (ej: "Guitarra Clásica Yamaha C40").
   - **Categoría:** Selecciona "Instrumentos" o "Accesorios".
   - **Estado:** "Nuevo", "Usado (Excelente)" o "Usado (Bueno)".
   - **Precio:** Precio en pesos chilenos sin puntos ni comas (ej: `125000`).
   - **Stock:** Cantidad disponible.
   - **Descripción:** Texto descriptivo del producto.
   - **Imagen:** Haz click en el área de subida y selecciona una foto (JPG, PNG, WebP o GIF, máximo 5 MB).
   - **Mostrar en Novedades:** Marca esta casilla si quieres que el producto aparezca en la página de inicio.
3. Haz click en **"Crear Producto"**.
4. El sistema generará automáticamente un código SKU único para el producto.

---

## 4. Editar un Producto

1. En la tabla de productos, busca el producto que deseas modificar.
2. Haz click en el botón **"Editar"** a la derecha.
3. Modifica los campos que necesites (nombre, precio, stock, descripción, imagen, etc.).
4. Haz click en **"Guardar Cambios"**.

### Casos comunes:
- **Actualizar precio:** Edita el campo "Precio" y guarda.
- **Actualizar stock:** Edita el campo "Stock" con la nueva cantidad.
- **Cambiar foto:** Sube una nueva imagen; la anterior se mantendrá en el servidor pero ya no se mostrará.
- **Destacar/quitar de novedades:** Marca o desmarca la casilla "Mostrar en Novedades".

---

## 5. Eliminar un Producto

1. En la tabla de productos, haz click en **"Eliminar"** junto al producto.
2. Aparecerá una ventana de confirmación mostrando el nombre del producto.
3. Haz click en **"Eliminar"** para confirmar, o **"Cancelar"** para volver.

> **Atención:** Esta acción no se puede deshacer. El producto será removido del catálogo inmediatamente.

---

## 6. Cerrar Sesión

Haz click en **"Cerrar Sesión"** en la esquina superior derecha del panel.

---

## 7. Problemas Frecuentes

| Problema | Solución |
|----------|----------|
| "No puedo subir imágenes" | Verifica que la imagen sea JPG, PNG, WebP o GIF y no exceda 5 MB. |
| "El producto no aparece en la tienda" | Recarga la página de la tienda (Ctrl+F5). Los cambios se reflejan al recargar. |
| "Olvidé la contraseña" | Contacta al desarrollador para restablecer las credenciales en `config.php`. |
| "Acceso bloqueado" | Espera 5 minutos e intenta de nuevo con las credenciales correctas. |
