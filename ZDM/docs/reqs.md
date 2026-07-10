Por favor, desarrolla la siguiente documentación técnica:

1. Requerimientos Funcionales:
Gestión de Catálogo: Especificar cómo el propietario administrará los productos (nuevos y usados) mediante la interfaz visual de Airtable, sincronizándolos con el frontend.

Flujo de Compra Híbrido: Detallar el comportamiento del checkout:

Botón WhatsApp: Generación de mensaje preconfigurado con el detalle del producto para cierre asistido.

Botón Pasarela de Pago: Integración de API de pagos para débito, asegurando que el proceso sea sencillo y transparente.

Landing Page de Experiencia: Definir los elementos necesarios para guiar al usuario desde la curiosidad creativa hasta la decisión de compra.

Carrito de Compras: Especificar la lógica de persistencia de datos (Local Storage o gestión por sesión) para una experiencia de usuario rápida y sin base de datos pesada.

2. Requerimientos No Funcionales:
Rendimiento: Priorizar la carga ultrarrápida (Core Web Vitals) para que el sitio sea fluido, eliminando el "bloatware" de los CMS tradicionales.

Usabilidad (UX/UI): Traducir la identidad visual (negro y amarillo) en una interfaz minimalista, centrada en la fotografía del instrumento y la experiencia sonora.

Autoadministrabilidad: Garantizar que el propietario pueda editar precios, stock y descripciones desde Airtable sin necesidad de soporte técnico constante.

Seguridad: Asegurar la integridad de las transacciones (especialmente en el flujo de débito vía API) y el cumplimiento de HTTPS.

Escalabilidad: Diseñar la arquitectura para que el catálogo pueda crecer sin degradar el rendimiento.

3. Entregables Esperados:
Esquema de la arquitectura de datos (cómo se conectan el Frontend, Airtable y las APIs).

Diagrama de flujo del usuario durante el checkout híbrido.

Guía de tecnologías recomendadas para la integración (ej. uso de Make/Zapier o funciones Serverless).

Recomendaciones de seguridad para la gestión de APIs de pago.

Tono del sitio: Poético, simple, cercano, profesional y sin jerga técnica innecesaria en la cara pública.

