-- ==============================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE: LMS ACADEMIA HUERTERA
-- ==============================================================================

-- 0. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- En CLP (ej: 59000)
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Módulos
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Lecciones
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    video_id TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    resources_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Matrículas / Pagos
CREATE TABLE IF NOT EXISTS enrollments (
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
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, lesson_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública de cursos, módulos y lecciones
CREATE POLICY "Cursos son visibles públicamente" ON courses FOR SELECT USING (true);
CREATE POLICY "Módulos son visibles públicamente" ON modules FOR SELECT USING (true);
CREATE POLICY "Lecciones son visibles públicamente" ON lessons FOR SELECT USING (true);

-- Políticas de usuario
CREATE POLICY "Usuarios leen su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios actualizan su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios ven sus matrículas activas" ON enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan su propio progreso" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Trigger para automatizar la creación de perfil al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Estudiante Huertero'), new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- POBLACIÓN INICIAL DE DATOS (SEED DATA)
-- ==============================================================================

-- Inserción del Curso Principal
INSERT INTO courses (id, title, slug, description, price, is_published)
VALUES (
    'c801f6d3-2415-46a2-94f4-526487e411b9',
    'Curso de Horticultura Comercial Rentable',
    'horticultura-comercial-rentable',
    'Curso de 16 capítulos en 4 módulos para planificar, costear y escalar un huerto comercial en 1.000 m².',
    59000,
    true
) ON CONFLICT (id) DO NOTHING;

-- Inserción de Módulos
INSERT INTO modules (id, course_id, title, order_index) VALUES
('m01-0000-0000-0000-000000000001', 'c801f6d3-2415-46a2-94f4-526487e411b9', 'Módulo 1: Fundamentos y Modelo de Negocio Huertero', 1),
('m02-0000-0000-0000-000000000002', 'c801f6d3-2415-46a2-94f4-526487e411b9', 'Módulo 2: Planificación Productiva y de Cultivos', 2),
('m03-0000-0000-0000-000000000003', 'c801f6d3-2415-46a2-94f4-526487e411b9', 'Módulo 3: Finanzas, Costos y Flujo de Caja', 3),
('m04-0000-0000-0000-000000000004', 'c801f6d3-2415-46a2-94f4-526487e411b9', 'Módulo 4: Comercialización, Clientes y Escalamiento', 4)
ON CONFLICT (id) DO NOTHING;

-- Inserción de los 16 Capítulos
INSERT INTO lessons (module_id, title, slug, description, video_id, duration_seconds, order_index) VALUES
('m01-0000-0000-0000-000000000001', 'Capítulo 01: Diferencia entre huerto casero y huerto comercial rentable', 'capitulo-01-huerto-casero-vs-comercial', 'Enfoque mental, productividad por m², retorno de inversión y el cambio de paradigma.', 'demo-v01', 1440, 1),
('m01-0000-0000-0000-000000000001', 'Capítulo 02: El modelo de 1.000 m²: Rentabilidad, métricas y viabilidad', 'capitulo-02-modelo-1000m2-rentabilidad', 'Análisis numérico detallado del rendimiento económico alcanzable en 1.000 m².', 'demo-v02', 1920, 2),
('m01-0000-0000-0000-000000000001', 'Capítulo 03: Diseño y optimización del espacio en camas permanentes', 'capitulo-03-diseno-camas-permanentes', 'Distribución estandarizada de parcelas, pasillos y diseño eficiente.', 'demo-v03', 1680, 3),
('m01-0000-0000-0000-000000000001', 'Capítulo 04: Infraestructura mínima, herramientas clave e inversión inicial', 'capitulo-04-infraestructura-minima-herramientas', 'Herramientas esenciales, riego por goteo y optimización de presupuesto.', 'demo-v04', 2100, 4),

('m02-0000-0000-0000-000000000002', 'Capítulo 05: Selección del catálogo de cultivos de alta rotación y valor', 'capitulo-05-catalogo-cultivos-alta-rotacion', 'Priorización de hojas verdes, radales y cultivos de alto valor marginal.', 'demo-v05', 1740, 5),
('m02-0000-0000-0000-000000000002', 'Capítulo 06: Calendario de siembra y cálculo de camas por semana', 'capitulo-06-calendario-siembra-calculo-camas', 'Metodología matemática para planificar la producción semanal continua.', 'demo-v06', 2400, 6),
('m02-0000-0000-0000-000000000002', 'Capítulo 07: Propagación, almácigos y trasplantes continuos', 'capitulo-07-propagacion-almacigos-trasplantes', 'Vivero de plántulas, sustratos premium y densidad de siembra.', 'demo-v07', 1860, 7),
('m02-0000-0000-0000-000000000002', 'Capítulo 08: Cosecha, post-cosecha y empaque para extender frescura', 'capitulo-08-cosecha-postcosecha-empaque', 'Lavado, centrifugado y empaque comercial para extender vida útil.', 'demo-v08', 1620, 8),

('m03-0000-0000-0000-000000000003', 'Capítulo 09: Estructura de costos: Fijos, variables e insumos', 'capitulo-09-estructura-costos-fijos-variables', 'Identificación de costos de semillas, compost, agua y gastos fijos.', 'demo-v09', 1980, 9),
('m03-0000-0000-0000-000000000003', 'Capítulo 10: Fijación del sueldo del agricultor y valor hora', 'capitulo-10-sueldo-agricultor-valor-hora', 'Cómo calcular la mano de obra propia y establecer un salario justo.', 'demo-v10', 1500, 10),
('m03-0000-0000-0000-000000000003', 'Capítulo 11: Flujo de caja anual y capital de trabajo para temporadas bajas', 'capitulo-11-flujo-caja-anual-capital-trabajo', 'Proyección financiera mes a mes y reservas de caja para invierno.', 'demo-v11', 2280, 11),
('m03-0000-0000-0000-000000000003', 'Capítulo 12: Cómo interpretar un Estado de Resultados en un huerto', 'capitulo-12-estado-de-resultados-huerto', 'P&L (Profit & Loss) simplificado para agricultores comerciales.', 'demo-v12', 1800, 12),

('m04-0000-0000-0000-000000000004', 'Capítulo 13: Canales de venta: Venta directa vs. Intermediarios/Tiendas', 'capitulo-13-canales-venta-directa-vs-tiendas', 'Modelo Canasta/CSA, restaurantes gourmet y emporios locales.', 'demo-v13', 2040, 13),
('m04-0000-0000-0000-000000000004', 'Capítulo 14: Estrategias para cerrar clientes semanales recurrentes', 'capitulo-14-estrategias-clientes-recurrentes', 'Suscripciones de hortalizas y convenios de suministro semanal con chefs.', 'demo-v14', 1740, 14),
('m04-0000-0000-0000-000000000004', 'Capítulo 15: Casos de estudio y lecciones aprendidas en proyectos reales', 'capitulo-15-casos-de-estudio-lecciones-aprendidas', 'Análisis de errores comunes y soluciones operativas en huertos reales.', 'demo-v15', 2160, 15),
('m04-0000-0000-0000-000000000004', 'Capítulo 16: Plan de acción a 90 días para el despegue comercial', 'capitulo-16-plan-accion-90-dias-despegue', 'Hoja de ruta semana a semana desde el terreno a la primera venta.', 'demo-v16', 2700, 16)
ON CONFLICT (slug) DO NOTHING;
