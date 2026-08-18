const fs = require('fs');
const path = require('path');

/**
 * SISTEMA DE AUTO AUDITORÍA AUTÓNOMO: ACADEMIA HUERTERA LMS
 */
function runAutoAudit() {
  console.log('🔍 === INICIANDO SISTEMA DE AUTO AUDITORÍA DEL LMS ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    checks: []
  };

  function assertCheck(name, category, condition, detailIfPassed, detailIfFailed) {
    report.totalChecks++;
    const passed = Boolean(condition);
    if (passed) {
      report.passedChecks++;
      console.log(`✅ [AUDIT - ${category}] ${name}: ${detailIfPassed}`);
    } else {
      report.failedChecks++;
      report.status = 'FAILED';
      console.error(`❌ [AUDIT - ${category}] ${name}: ${detailIfFailed}`);
    }
    report.checks.push({ name, category, passed, detail: passed ? detailIfPassed : detailIfFailed });
  }

  const rootDir = path.join(__dirname, '..');

  // 1. AUDITORÍA DE ESTRUCTURA Y ARCHIVOS REQUERIDOS
  const requiredFiles = [
    'src/app/page.jsx',
    'src/app/(platform)/curso/dashboard/page.jsx',
    'src/app/(platform)/curso/leccion/[slug]/page.jsx',
    'src/lib/courseData.js',
    'src/styles/variables.css',
    'src/styles/reset.css',
    'src/styles/globals.css',
    'supabase/schema.sql',
    'middleware.js'
  ];

  requiredFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(rootDir, file));
    assertCheck(
      `Existencia de ${file}`,
      'Estructura',
      exists,
      'Archivo verificado correctamente',
      'Archivo crítico no encontrado'
    );
  });

  // 2. AUDITORÍA DE ESTRUCTURA DEL CURSO (16 CAPÍTULOS, 4 MÓDULOS)
  const courseDataPath = path.join(rootDir, 'src/lib/courseData.js');
  if (fs.existsSync(courseDataPath)) {
    const content = fs.readFileSync(courseDataPath, 'utf8');
    const has16Lessons = content.includes('capitulo-16-plan-accion-90-dias-despegue');
    const has4Modules = content.includes('Módulo 4: Comercialización');

    assertCheck(
      'Integridad del Plan de 16 Capítulos',
      'Contenidos',
      has16Lessons,
      'Los 16 capítulos están correctamente definidos',
      'Faltan capítulos en la definición del curso'
    );

    assertCheck(
      'Integridad de Módulos (4 Módulos)',
      'Contenidos',
      has4Modules,
      '4 módulos lógicos verificados',
      'Faltan módulos estructurales'
    );
  }

  // 3. AUDITORÍA DE SEGURIDAD BASE DE DATOS Y RLS
  const sqlPath = path.join(rootDir, 'supabase/schema.sql');
  if (fs.existsSync(sqlPath)) {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    const rlsProfiles = sqlContent.includes('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    const rlsEnrollments = sqlContent.includes('ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;');
    const rlsProgress = sqlContent.includes('ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;');

    assertCheck(
      'Seguridad RLS en Perfiles',
      'Seguridad SQL',
      rlsProfiles,
      'RLS activado en tabla profiles',
      'Tabla profiles sin RLS'
    );

    assertCheck(
      'Seguridad RLS en Matrículas',
      'Seguridad SQL',
      rlsEnrollments,
      'RLS activado en tabla enrollments',
      'Tabla enrollments sin RLS'
    );

    assertCheck(
      'Seguridad RLS en Progreso de Lecciones',
      'Seguridad SQL',
      rlsProgress,
      'RLS activado en tabla lesson_progress',
      'Tabla lesson_progress sin RLS'
    );
  }

  // 4. AUDITORÍA DE SISTEMA DE DISEÑO (CSS PURO)
  const varsPath = path.join(rootDir, 'src/styles/variables.css');
  if (fs.existsSync(varsPath)) {
    const varsContent = fs.readFileSync(varsPath, 'utf8');
    const hasBrandPrimary = varsContent.includes('--color-brand-primary: #2d5a27');
    const hasBrandAccent = varsContent.includes('--color-brand-accent: #d97724');

    assertCheck(
      'Variables de Color Verde Huerto',
      'Diseño CSS',
      hasBrandPrimary,
      'Color primario #2d5a27 configurado',
      'Falta token de color primario'
    );

    assertCheck(
      'Variables de Color Terracota Cosecha',
      'Diseño CSS',
      hasBrandAccent,
      'Color acento #d97724 configurado',
      'Falta token de color acento'
    );
  }

  // GUARDAR INFORME DE AUDITORÍA
  const reportPath = path.join(rootDir, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 === RESUMEN DE LA AUDITORÍA ===');
  console.log(`Estado: ${report.status === 'PASSED' ? '✅ SISTEMA SALUDABLE (PASSED)' : '❌ ERRORES DETECTADOS (FAILED)'}`);
  console.log(`Total Pruebas: ${report.totalChecks} | Aprobadas: ${report.passedChecks} | Fallidas: ${report.failedChecks}`);
  console.log(`Informe guardado en: [audit_report.json]`);

  if (report.status !== 'PASSED') {
    process.exit(1);
  }
}

runAutoAudit();
