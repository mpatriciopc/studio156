# Prompt / Especificación Técnica para Agente Antigravity: LMS Academia Huertera

Este documento contiene las especificaciones técnicas completas, requerimientos, arquitectura de datos, diseño de base de datos SQL, estructura de estilos en CSS Puro y lógica de integración para construir el LMS de **Academia Huertera** (Javier Soler - Curso de Horticultura Comercial Rentable).

---

## 1. Contexto y Objetivo del Proyecto

* **Nombre del Proyecto:** LMS Academia Huertera
* **Instructor / Creador:** Javier Soler (@javierhuertero)
* **Propósito:** Plataforma web ligera y personalizada para comercializar y alojar un curso especializado de 16 capítulos enfocado en planificación productiva, finanzas del huerto y estrategias de comercialización hortícola.
* **Modelo de Negocio:** Pago único para acceso vitalicio al curso, procesado mediante **Mercado Pago**.

---

## 2. Stack Tecnológico

* **Framework Web:** Next.js (App Router, React 19 / Server Components + Server Actions).
* **Estilos:** **CSS Puro / Vanilla CSS con CSS Modules** (`*.module.css`) y Variables CSS Globales (`:root`). **Bajo ninguna circunstancia utilizar Tailwind CSS ni librerías de componentes prediseñadas (ej. MUI, Chakra).**
* **Base de Datos y Autenticación:** Supabase (PostgreSQL + Supabase Auth).
* **Alojamiento y Streaming de Video:** Bunny Stream o Cloudflare Stream (vía `<iframe>` con restricción de dominio o HLS).
* **Pasarela de Pagos:** SDK Oficial de Mercado Pago (Node.js) con Checkout Pro y Webhook de conciliación de pagos.
* **Despliegue:** Vercel o VPS ligero con Node.js.

---

## 3. Requerimientos del Sistema

### 3.1 Requerimientos Funcionales (RF)

* **RF-01 (Autenticación):** Registro e inicio de sesión con Email/Contraseña y Magic Links a través de Supabase Auth.
* **RF-02 (Recuperación de Cuenta):** Flujo de restablecimiento de contraseña mediante correo electrónico.
* **RF-03 (Pasarela de Pago):** Creación de preferencia de pago en Mercado Pago para el curso.
* **RF-04 (Webhook de Activación Automática):** Endpoint `/api/webhooks/mercadopago` para capturar notificaciones de pago `approved` y matricular al usuario automáticamente creando el registro en `enrollments`.
* **RF-05 (Protección de Rutas):** Middleware en Next.js para asegurar que las rutas `/curso/*` solo sean accesibles por usuarios autenticados con matrícula activa.
* **RF-06 (Estructura del Curso):** Navegación organizada en 4 módulos temáticos y 16 capítulos ordenados secuencialmente.
* **RF-07 (Reproductor y Progreso):**
  * Reproductor de video integrado.
  * Marcado automático o manual de lecciones completadas.
  * Persistencia del progreso en base de datos.
  * Barra de progreso general calculada en porcentaje.
* **RF-08 (Materiales Descargables):** Sección por lección para adjuntar enlaces o recursos descargables (archivos Excel de flujo de caja, calendarios de siembra, PDFs).
* **RF-09 (Panel de Usuario / Dashboard):** Vista inicial con el avance del curso, listado de módulos y acceso rápido a la última lección vista.

### 3.2 Requerimientos No Funcionales (RNF)

* **RNF-01 (Rendimiento):** Tiempo de carga inicial $< 1.5$ segundos. Aprovechamiento de Server Components para reducir el JavaScript del cliente.
* **RNF-02 (Diseño y Responsividad):** Interfaz 100% responsiva (Mobile First) adaptable a móviles, tablets y monitores de escritorio.
* **RNF-03 (Modularidad de Código):** Cada vista y componente debe tener su propio archivo CSS (`.module.css`) encapsulado.
* **RNF-04 (Seguridad):** Políticas de Row Level Security (RLS) habilitadas en Supabase para evitar accesos no autorizados a datos de otros estudiantes.

---

## 4. Estructura de Contenidos: Los 16 Capítulos del Curso

El curso se divide en 4 módulos lógicos de 4 lecciones cada uno:

### Módulo 1: Fundamentos y Modelo de Negocio Huertero
1. **Capítulo 01:** Diferencia entre huerto casero y huerto comercial rentable.
2. **Capítulo 02:** El modelo de $1.000\text{ m}^2$: Rentabilidad, métricas y viabilidad.
3. **Capítulo 03:** Diseño y optimización del espacio en camas permanentes.
4. **Capítulo 04:** Infraestructura mínima, herramientas clave e inversión inicial.

### Módulo 2: Planificación Productiva y de Cultivos
5. **Capítulo 05:** Selección del catálogo de cultivos de alta rotación y valor.
6. **Capítulo 06:** Calendario de siembra y cálculo de camas por semana.
7. **Capítulo 07:** Propagación, almácigos y trasplantes continuos.
8. **Capítulo 08:** Cosecha, post-cosecha y empaque para extender frescura.

### Módulo 3: Finanzas, Costos y Flujo de Caja
9. **Capítulo 09:** Estructura de costos: Fijos, variables e insumos.
10. **Capítulo 10:** Fijación del sueldo del agricultor y valor hora.
11. **Capítulo 11:** Flujo de caja anual y capital de trabajo para temporadas bajas.
12. **Capítulo 12:** Cómo interpretar un Estado de Resultados en un huerto.

### Módulo 4: Comercialización, Clientes y Escalamiento
13. **Capítulo 13:** Canales de venta: Venta directa vs. Intermediarios/Tiendas.
14. **Capítulo 14:** Estrategias para cerrar clientes semanales recurrentes.
15. **Capítulo 15:** Casos de estudio y lecciones aprendidas en proyectos reales.
16. **Capítulo 16:** Plan de acción a 90 días para el despegue comercial.

---

## 5. Esquema de Base de Datos (PostgreSQL / Supabase)

```sql
-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Cursos
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- En CLP (ej: 59000)
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Módulos
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Lecciones
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    video_id TEXT NOT NULL, -- ID en Bunny / Cloudflare / Vimeo
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    resources_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Matrículas / Pagos
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    payment_id TEXT UNIQUE,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    amount_paid INTEGER NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, course_id)
);

-- 6. Tabla de Progreso de Lecciones
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, lesson_id)
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios leen su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios ven sus matrículas activas" ON enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan su propio progreso" ON lesson_progress
    FOR ALL USING (auth.uid() = user_id);
```

---

## 6. Arquitectura de Estilos en CSS Puro

### 6.1 Variables Globales (`src/styles/variables.css`)

```css
:root {
  /* Identidad Academia Huertera */
  --color-brand-primary: #2d5a27;      /* Verde huerto / cultivo */
  --color-brand-primary-hover: #1e3f1a;
  --color-brand-accent: #d97724;       /* Terracota / cosecha */
  --color-brand-accent-hover: #b86018;

  /* Fondos y Superficies */
  --color-bg-app: #f6f8f5;             /* Fondo general */
  --color-bg-card: #ffffff;            /* Fondo de tarjetas */
  --color-bg-player: #0f140e;          /* Fondo del contenedor de video */
  --color-sidebar-bg: #1c2619;         /* Sidebar oscuro */

  /* Textos */
  --color-text-main: #1f2937;
  --color-text-muted: #6b7280;
  --color-text-inverse: #f9fafb;

  /* Bordes y Sombras */
  --color-border: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  /* Medidas y Radios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --sidebar-width: 320px;
  --header-height: 64px;

  /* Tipografía */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### 6.2 Reseteo Base (`src/styles/reset.css`)

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
}

body {
  font-family: var(--font-family-base);
  background-color: var(--color-bg-app);
  color: var(--color-text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}
```

---

## 7. Integración de Mercado Pago (Checkout Pro y Webhook)

### 7.1 Creación de Preferencia (`src/app/api/checkout/route.js`)

```javascript
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(req) {
  const { userEmail, userId, courseId } = await req.json();

  const preference = new Preference(client);
  const response = await preference.create({
    body: {
      items: [
        {
          id: courseId,
          title: 'Curso Completo de Horticultura Comercial - Academia Huertera',
          quantity: 1,
          unit_price: 59000,
          currency_id: 'CLP',
        }
      ],
      payer: {
        email: userEmail,
      },
      metadata: {
        user_id: userId,
        course_id: courseId,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/curso/dashboard?pago=exito`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?pago=fallo`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?pago=pendiente`,
      },
      auto_return: 'approved',
    }
  });

  return Response.json({ init_point: response.init_point });
}
```

### 7.2 Webhook de Activación de Matrícula (`src/app/api/webhooks/mercadopago/route.js`)

```javascript
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const url = new URL(req.url);
  const topic = url.searchParams.get('topic') || url.searchParams.get('type');
  const id = url.searchParams.get('id') || url.searchParams.get('data.id');

  if (topic === 'payment' && id) {
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id });

    if (paymentData.status === 'approved') {
      const { user_id, course_id } = paymentData.metadata;

      // Habilitar acceso en base de datos
      await supabaseAdmin.from('enrollments').upsert({
        user_id: user_id,
        course_id: course_id,
        payment_id: id.toString(),
        payment_status: 'approved',
        amount_paid: paymentData.transaction_amount,
        enrolled_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id' });
    }
  }

  return new Response('OK', { status: 200 });
}
```

---

## 8. Estructura de Archivos del Proyecto

```text
academia-huertera-lms/
├── public/
│   └── logo-academia-huertera.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   ├── page.jsx
│   │   │   │   └── login.module.css
│   │   │   └── register/
│   │   │       ├── page.jsx
│   │   │       └── register.module.css
│   │   ├── (platform)/
│   │   │   ├── curso/
│   │   │   │   ├── layout.jsx
│   │   │   │   ├── layout.module.css
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.jsx
│   │   │   │   │   └── dashboard.module.css
│   │   │   │   └── leccion/[slug]/
│   │   │   │       ├── page.jsx
│   │   │   │       └── leccion.module.css
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   └── route.js
│   │   │   └── webhooks/
│   │   │       └── mercadopago/
│   │   │           └── route.js
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── VideoPlayer/
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── VideoPlayer.module.css
│   │   ├── LessonSidebar/
│   │   │   ├── LessonSidebar.jsx
│   │   │   └── LessonSidebar.module.css
│   │   ├── ProgressBar/
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ProgressBar.module.css
│   │   └── ResourceList/
│   │       ├── ResourceList.jsx
│   │       └── ResourceList.module.css
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── supabaseServer.js
│   └── styles/
│       ├── reset.css
│       ├── variables.css
│       └── globals.css
├── middleware.js
├── package.json
└── README.md
```

---

## 9. Instrucciones de Implementación para el Agente Antigravity

1. **Inicialización:** Crear el proyecto Next.js limpio sin Tailwind CSS.
2. **Configuración de Estilos:** Importar `reset.css`, `variables.css` y `globals.css` en `layout.jsx`.
3. **Esquema Supabase:** Ejecutar el script SQL proporcionado en Supabase SQL Editor y cargar los registros iniciales para los 4 módulos y 16 capítulos.
4. **Middleware:** Configurar `middleware.js` para interceptar rutas bajo `/curso/*` y verificar la sesión activa y la existencia del registro en `enrollments`.
5. **Reproductor y Marcado:** Implementar el componente `VideoPlayer` que al finalizar o al hacer clic en "Completar Lección" ejecute una Server Action para actualizar `lesson_progress`.
6. **Integración MP:** Configurar las claves en `.env.local` (`MERCADOPAGO_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) y probar el flujo de checkout.
