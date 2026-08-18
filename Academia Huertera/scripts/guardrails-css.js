const fs = require('fs');
const path = require('path');

/**
 * GUARDRAIL DE ENFORCEMENT DE ESTILOS CSS PURO
 * Escanea el código fuente comprobando que no se utilicen clases o dependencias de Tailwind CSS.
 */
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        scanDir(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function auditStyles() {
  console.log('🛡️  === GUARDRAIL AUDIT: REGLAS DE ESTILO CSS PURO ===');
  const srcDir = path.join(__dirname, '..', 'src');
  const files = scanDir(srcDir);
  const tailwindKeywords = ['@tailwind', 'tailwind', 'tw-', 'bg-blue-', 'flex-row-reverse', 'justify-between-item'];

  let violations = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    tailwindKeywords.forEach((kw) => {
      if (content.includes(kw)) {
        console.error(`❌ VIOLACIÓN GUARDRAIL: Detectada palabra clave de Tailwind '${kw}' en [${path.relative(process.cwd(), file)}]`);
        violations++;
      }
    });
  });

  if (violations === 0) {
    console.log('✅ GUARDRAIL APROBADO: Cumplimiento 100% de CSS Puro / Vanilla CSS Modules.');
    return true;
  } else {
    console.error(`❌ GUARDRAIL RECHAZADO: ${violations} violaciones detectadas.`);
    process.exit(1);
  }
}

auditStyles();
