/**
 * GUARDRAIL DE SANITIZACIÓN Y VALIDACIÓN DE DATOS
 */

export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(uuid.trim());
}

export function validateCheckoutInput(body) {
  const errors = [];
  if (!body) return { isValid: false, errors: ['Body vacío'] };

  if (!validateEmail(body.userEmail)) {
    errors.push('Formato de correo electrónico inválido.');
  }

  if (body.courseId && typeof body.courseId !== 'string') {
    errors.push('Identificador de curso inválido.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      userEmail: sanitizeString(body.userEmail),
      userId: sanitizeString(body.userId || ''),
      courseId: sanitizeString(body.courseId || '')
    }
  };
}
