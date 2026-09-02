# Modelo de Datos y Entidades (Airtable) - Sincronizado

## 1. Tabla: Categorias
| Campo | Tipo | Descripción |
|---|---|---|
| id | Autonumber | Identificador interno |
| nombre | Single line text | Nombre visible (ej. Alimento Seco) |
| slug | Single line text | URL slug (ej. alimento-seco) |
| especie | Single select | Perro, Gato, Ambos |
| icono | Single line text | Nombre de icono Lucide (bone, fish, pill) |

## 2. Tabla: Productos
| Campo | Tipo | Descripción |
|---|---|---|
| id | Formula / Autonumber | ID único |
| nombre | Single line text | Nombre comercial |
| slug | Single line text | URL amigable única |
| marca | Single line text | Marca fabricante |
| descripcion | Long text (Rich text) | Beneficios, ingredientes y modo de uso |
| categoria | Link to Categorias | Categoría relacionada |
| especie | Single select | Perro, Gato, Ambos |
| destacado | Checkbox | Mostrar en vitrina de portada |
| activo | Checkbox | Publicar en catálogo |

## 3. Tabla: Variantes (SKUs e Inventario Real)
| Campo | Tipo | Descripción |
|---|---|---|
| sku | Single line text | Código único de inventario (PK, ej. PP-MED-15K) |
| producto | Link to Productos | Relación al producto padre |
| formato | Single line text | Presentación (ej. Saco 15 Kg, Talla M) |
| precio | Currency ($ CLP) | Precio regular de venta |
| precio_oferta | Currency ($ CLP) | Precio rebajado opcional |
| stock | Number (Integer) | Inventario disponible en bodega |
| peso_kg | Number (Decimal) | Peso neto para cálculo de flete en servidor |
| fotos | Attachment | Imágenes del producto/variante |
| activo | Checkbox | Habilitar/pausar variante individual |

## 4. Tabla: Pedidos (Órdenes y Transacciones)
| Campo | Tipo | Descripción |
|---|---|---|
| id_orden | Single line text | Código de orden visible (ej. ORD-1045) |
| hash_seguridad | Single line text | UUID v4 para acceso seguro sin login |
| fecha | Created time | Timestamp de creación |
| cliente_nombre | Single line text | Nombre completo del comprador |
| cliente_rut | Single line text | RUT / Identificación fiscal para boleta |
| cliente_email | Email | Correo para confirmación y seguimiento |
| cliente_telefono| Phone number | Teléfono para coordinación de entrega |
| direccion_envio| Long text | Dirección completa y notas de despacho |
| comuna | Single line text | Comuna para tarificación de flete |
| peso_total_kg | Number (Decimal) | Suma de pesos calculada en servidor |
| costo_envio | Currency ($ CLP) | Tarifa de flete aplicada |
| detalle_items | Long text (JSON) | Array `{ sku, formato, cantidad, precio_unitario }` |
| total | Currency ($ CLP) | Monto final cobrado |
| metodo_pago | Single select | Pasarela Online (Webpay/MP), WhatsApp (Link/Transferencia) |
| estado_pago | Single select | Pendiente, Pagado, WhatsApp por Confirmar, Alerta: Sobreventa, Cancelado |
| transaccion_id | Single line text | ID devuelto por la pasarela para idempotencia |

## 5. Tabla: Configuracion_Envios
| Campo | Tipo | Descripción |
|---|---|---|
| comuna | Single line text | Nombre de la comuna |
| tarifa_base | Currency ($ CLP) | Costo de envío hasta 5 kg |
| recargo_kg_extra| Currency ($ CLP) | Recargo por kilo adicional (>5 kg) |
| envio_gratis_desde| Currency ($ CLP)| Monto mínimo de compra para flete cero |

## 6. Tabla: Cupones
| Campo | Tipo | Descripción |
|---|---|---|
| codigo | Single line text | Código del cupón (PK, ej. PELUDOS10) |
| tipo | Single select | Porcentaje, Monto Fijo |
| valor | Number | Valor del descuento |
| monto_minimo | Currency ($ CLP) | Compra mínima para aplicar |
| activo | Checkbox | Estado del cupón |
