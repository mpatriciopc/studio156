# Plan de Implementación: Optimización Técnica - ZM (Zona de Músicos)

Este plan detalla las mejoras estratégicas de Seguridad, Accesibilidad y SEO para el sitio web de ZM (Zona de Músicos), con el fin de alinearse con los estándares de excelencia técnica de Studio156.

## 1. Seguridad (Integridad del Dato)
*   **Validación de Backend:** Consolidar la validación de precios y stock en `checkout.php` y `webhook.php`. El servidor actúa como la "fuente de verdad" única para evitar manipulación fraudulenta de valores desde el cliente.
*   **Sanitización de Datos:** Implementar rutinas de limpieza de strings (`sanitizeString` en PHP y `sanitizeInput` en JS) en todas las entradas de usuario (checkout, registro de logs, suscripciones a newsletter y formulario ARCO+P) para mitigar ataques XSS.
*   **Redirección HTTPS y Cabeceras**: Forzar redirección HTTPS permanente (`301`) a nivel de servidor PHP en `config.php` e inyectar cabeceras HSTS y de protección de frames.

## 2. Accesibilidad (A11y - WCAG 2.1)
*   **Modales y Drawer (Focus Trap):**
    *   Implementar la función Javascript `lockFocus(modal)` para restringir el foco del teclado dentro del modal activo (carrito, pasarela o cookies).
    *   Asegurar el correcto uso de atributos `role="dialog"` y `aria-modal="true"`, y la restauración de foco al cerrar.
*   **Contraste de Color:**
    *   Ajustar el color `--text-muted` a `#8a8a8a` para garantizar una relación de contraste superior a 4.5:1 sobre los fondos oscuros (`#121212`) de las tarjetas de producto.
*   **Navegación por Teclado**:
    *   Definir estilos `:focus-visible` dorados en `styles.css` para proveer un indicador visual claro durante la navegación con tecla `Tab`.

## 3. SEO (Visibilidad y Estructura)
*   **Datos Estructurados (JSON-LD):** 
    *   Insertar esquemas JSON-LD en el `<head>` de `index.html` (tipo `MusicStore` con reviews agregadas) y en `catalogo.html` (tipo `OfferCatalog`).
*   **Indexación de Contenido y Semántica:** 
    *   Asegurar que los motores de búsqueda indexen la estructura semántica correcta mediante el uso de etiquetas HTML5 (`<main>`, `<nav aria-label="...">` y secciones etiquetadas por `aria-labelledby`).
*   **Optimización de Imágenes:**
    *   Mantener atributos `alt` descriptivos y habilitar carga diferida (`loading="lazy"`) en las fotos del catálogo.

## 4. Hoja de Ruta de Ejecución (Sprints)
1.  **Sprint 1 (Seguridad):** Refactorización del manejo de datos hacia el backend, cabeceras HTTP y HTTPS.
2.  **Sprint 2 (Accesibilidad):** Implementación de Focus Trap en modales y corrección de contraste de color.
3.  **Sprint 3 (SEO):** Implementación de esquemas JSON-LD y estructuración HTML5 semántica.
4.  **Sprint 4 (Protección de Datos):** Banner de cookies Ley N° 21.719, política de privacidad y ejercicio de derechos ARCO+P.
