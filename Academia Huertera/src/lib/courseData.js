export const COURSE_INFO = {
  id: "c801f6d3-2415-46a2-94f4-526487e411b9",
  title: "Curso de Horticultura Comercial Rentable",
  instructor: "Javier Soler",
  handle: "@javierhuertero",
  subtitle: "Planificación productiva, finanzas del huerto y estrategias de comercialización hortícola en $1.000\\text{ m}^2$",
  description: "Aprende el método paso a paso para transformar un huerto en una empresa agrícola altamente rentable, maximizando el rendimiento por metro cuadrado y asegurando ventas semanales recurrentes.",
  priceCLP: 59000,
  totalLessons: 16,
  totalModules: 4,
  durationEstimate: "8 Horas de Video HD + Plantillas Descargables",
};

export const MODULES_DATA = [
  {
    id: "m01-fundamentos",
    title: "Módulo 1: Fundamentos y Modelo de Negocio Huertero",
    order: 1,
    description: "Bases conceptuales, números reales e infraestructura estratégica para iniciar un huerto comercial rentable.",
    lessons: [
      {
        id: "l01",
        slug: "capitulo-01-huerto-casero-vs-comercial",
        title: "Capítulo 01: Diferencia entre huerto casero y huerto comercial rentable",
        description: "Enfoque mental, productividad por $m^2$, retorno de inversión y el cambio de paradigma de pasatiempo a negocio.",
        duration: "24 min",
        durationSeconds: 1440,
        videoId: "demo-v01",
        resources: [
          { title: "Guía PDF: Comparativa de Modelos Huerteros.pdf", url: "#" }
        ]
      },
      {
        id: "l02",
        slug: "capitulo-02-modelo-1000m2-rentabilidad",
        title: "Capítulo 02: El modelo de 1.000 m²: Rentabilidad, métricas y viabilidad",
        description: "Análisis numérico detallado del rendimiento económico alcanzable en una superficie intensiva de 1.000 metros cuadrados.",
        duration: "32 min",
        durationSeconds: 1920,
        videoId: "demo-v02",
        resources: [
          { title: "Plantilla Excel: Calculadora de Viabilidad 1000m2.xlsx", url: "#" }
        ]
      },
      {
        id: "l03",
        slug: "capitulo-03-diseno-camas-permanentes",
        title: "Capítulo 03: Diseño y optimización del espacio en camas permanentes",
        description: "Distribución estandarizada de parcelas, pasillos, orientación solar y diseño eficiente para reducir tiempos de trabajo.",
        duration: "28 min",
        durationSeconds: 1680,
        videoId: "demo-v03",
        resources: [
          { title: "Plano Blueprint: Diseño Estándar de Camas de 30m.pdf", url: "#" }
        ]
      },
      {
        id: "l04",
        slug: "capitulo-04-infraestructura-minima-herramientas",
        title: "Capítulo 04: Infraestructura mínima, herramientas clave e inversión inicial",
        description: "Qué comprar y qué evitar: Pytt, Jineta, Tilther, Riego por goteo, Malla anti-helada y presupuesto optimizado.",
        duration: "35 min",
        durationSeconds: 2100,
        videoId: "demo-v04",
        resources: [
          { title: "Checklist: Lista de Herramientas e Inversión Inicial.pdf", url: "#" }
        ]
      }
    ]
  },
  {
    id: "m02-planificacion",
    title: "Módulo 2: Planificación Productiva y de Cultivos",
    order: 2,
    description: "Sistemas de rotación acelerada, calendarios de siembra semanales y cosecha continua.",
    lessons: [
      {
        id: "l05",
        slug: "capitulo-05-catalogo-cultivos-alta-rotacion",
        title: "Capítulo 05: Selección del catálogo de cultivos de alta rotación y valor",
        description: "Priorización de hojas verdes, radales, microgreens y cultivos de alto valor marginal ($/kg y $/m²).",
        duration: "29 min",
        durationSeconds: 1740,
        videoId: "demo-v05",
        resources: [
          { title: "Matriz Excel: Comparativa de Margen por Cultivo.xlsx", url: "#" }
        ]
      },
      {
        id: "l06",
        slug: "capitulo-06-calendario-siembra-calculo-camas",
        title: "Capítulo 06: Calendario de siembra y cálculo de camas por semana",
        description: "Metodología matemática para planificar la producción semanal y asegurar entregas constantes a clientes.",
        duration: "40 min",
        durationSeconds: 2400,
        videoId: "demo-v06",
        resources: [
          { title: "Master Sheet: Calendario Anual de Siembra y Cosecha.xlsx", url: "#" }
        ]
      },
      {
        id: "l07",
        slug: "capitulo-07-propagacion-almacigos-trasplantes",
        title: "Capítulo 07: Propagación, almácigos y trasplantes continuos",
        description: "Construcción de vivero de plántulas, sustratos premium, fertilización inicial y densidad de siembra perfecta.",
        duration: "31 min",
        durationSeconds: 1860,
        videoId: "demo-v07",
        resources: [
          { title: "Ficha Técnica: Receta de Sustrato y Densidades.pdf", url: "#" }
        ]
      },
      {
        id: "l08",
        slug: "capitulo-08-cosecha-postcosecha-empaque",
        title: "Capítulo 08: Cosecha, post-cosecha y empaque para extender frescura",
        description: "Lavado, centrifugado, cadena de frío artesanal y empaque comercial para duplicar la vida útil en góndola.",
        duration: "27 min",
        durationSeconds: 1620,
        videoId: "demo-v08",
        resources: [
          { title: "Manual de Protocolos de Postcosecha y Lavado.pdf", url: "#" }
        ]
      }
    ]
  },
  {
    id: "m03-finanzas",
    title: "Módulo 3: Finanzas, Costos y Flujo de Caja",
    order: 3,
    description: "Control de costos fijos y variables, remuneración del agricultor y gestión financiera profesional.",
    lessons: [
      {
        id: "l09",
        slug: "capitulo-09-estructura-costos-fijos-variables",
        title: "Capítulo 09: Estructura de costos: Fijos, variables e insumos",
        description: "Identificación de costos de semillas, compost, agua, electricidad, empaques y gastos operativos fijos.",
        duration: "33 min",
        durationSeconds: 1980,
        videoId: "demo-v09",
        resources: [
          { title: "Plantilla Excel: Modelo de Costos Hortícolas.xlsx", url: "#" }
        ]
      },
      {
        id: "l10",
        slug: "capitulo-10-sueldo-agricultor-valor-hora",
        title: "Capítulo 10: Fijación del sueldo del agricultor y valor hora",
        description: "Cómo calcular la mano de obra propia, establecer un salario justo y costear las horas hombre por labor.",
        duration: "25 min",
        durationSeconds: 1500,
        videoId: "demo-v10",
        resources: [
          { title: "Calculadora Excel: Valor Hora y Sueldo del Agricultor.xlsx", url: "#" }
        ]
      },
      {
        id: "l11",
        slug: "capitulo-11-flujo-caja-anual-capital-trabajo",
        title: "Capítulo 11: Flujo de caja anual y capital de trabajo para temporadas bajas",
        description: "Proyección financiera mes a mes, reservas de caja para invierno y planificación de imprevistos.",
        duration: "38 min",
        durationSeconds: 2280,
        videoId: "demo-v11",
        resources: [
          { title: "Plantilla Excel: Flujo de Caja Anual Proyectado.xlsx", url: "#" }
        ]
      },
      {
        id: "l12",
        slug: "capitulo-12-estado-de-resultados-huerto",
        title: "Capítulo 12: Cómo interpretar un Estado de Resultados en un huerto",
        description: "P&L (Profit & Loss) simplificado para agricultores: Ingresos brutos, margen bruto y utilidad neta real.",
        duration: "30 min",
        durationSeconds: 1800,
        videoId: "demo-v12",
        resources: [
          { title: "Plantilla Excel: Estado de Resultados P&L Huertero.xlsx", url: "#" }
        ]
      }
    ]
  },
  {
    id: "m04-comercializacion",
    title: "Módulo 4: Comercialización, Clientes y Escalamiento",
    order: 4,
    description: "Estrategias de venta directa, captación de restaurantes y plan de despegue comercial a 90 días.",
    lessons: [
      {
        id: "l13",
        slug: "capitulo-13-canales-venta-directa-vs-tiendas",
        title: "Capítulo 13: Canales de venta: Venta directa vs. Intermediarios/Tiendas",
        description: "Modelo Canasta/CSA, venta a restaurantes gourmet, emporios locales y comparación de márgenes de venta.",
        duration: "34 min",
        durationSeconds: 2040,
        videoId: "demo-v13",
        resources: [
          { title: "Guía PDF: Pitch y Estrategia de Venta a Restaurantes.pdf", url: "#" }
        ]
      },
      {
        id: "l14",
        slug: "capitulo-14-estrategias-clientes-recurrentes",
        title: "Capítulo 14: Estrategias para cerrar clientes semanales recurrentes",
        description: "Suscripciones de hortalizas, contratos de suministro semanal con chefs y fidelización a largo plazo.",
        duration: "29 min",
        durationSeconds: 1740,
        videoId: "demo-v14",
        resources: [
          { title: "Modelo de Contrato: Convenio de Suministro Hortícola.docx", url: "#" }
        ]
      },
      {
        id: "l15",
        slug: "capitulo-15-casos-de-estudio-lecciones-aprendidas",
        title: "Capítulo 15: Casos de estudio y lecciones aprendidas en proyectos reales",
        description: "Análisis de errores comunes en huertos reales, soluciones aplicadas y pivotes operativos exitosos.",
        duration: "36 min",
        durationSeconds: 2160,
        videoId: "demo-v15",
        resources: [
          { title: "Resumen de Casos de Estudio y Análisis de Errores.pdf", url: "#" }
        ]
      },
      {
        id: "l16",
        slug: "capitulo-16-plan-accion-90-dias-despegue",
        title: "Capítulo 16: Plan de acción a 90 días para el despegue comercial",
        description: "Hoja de ruta semana a semana desde la preparación del terreno hasta la primera factura emitida.",
        duration: "45 min",
        durationSeconds: 2700,
        videoId: "demo-v16",
        resources: [
          { title: "Roadmap Excel & PDF: Plan de Acción de 90 Días.xlsx", url: "#" }
        ]
      }
    ]
  }
];

export function getAllLessons() {
  const list = [];
  MODULES_DATA.forEach(mod => {
    mod.lessons.forEach(l => {
      list.push({ ...l, moduleTitle: mod.title, moduleId: mod.id });
    });
  });
  return list;
}

export function getLessonBySlug(slug) {
  const all = getAllLessons();
  return all.find(l => l.slug === slug) || all[0];
}
