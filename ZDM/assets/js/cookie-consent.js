/**
 * ZM Cookie Consent Manager
 * Cumplimiento Ley N° 21.719 de Protección de Datos (Chile)
 * Bloqueo preventivo de scripts de tracking hasta obtener consentimiento activo.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'zm_cookie_consent';
  const CONSENT_VERSION = '1.0';

  // Categorías de cookies
  const CATEGORIES = {
    essential: { label: 'Esenciales', description: 'Necesarias para el funcionamiento del sitio. No se pueden desactivar.', locked: true, default: true },
    analytics: { label: 'Analíticas', description: 'Nos ayudan a entender cómo usas el sitio para mejorarlo (ej. Google Analytics).', locked: false, default: false },
    marketing: { label: 'Marketing', description: 'Permiten mostrarte publicidad relevante en otras plataformas (ej. Meta Pixel).', locked: false, default: false }
  };

  // Estado del consentimiento
  let consent = loadConsent();

  function loadConsent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) return parsed;
      }
    } catch (e) { /* ignore parse errors */ }
    return null;
  }

  function saveConsent(categories) {
    const data = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: categories
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    consent = data;
  }

  // Activar scripts de tracking que tengan data-cookie-category
  function activateScripts(category) {
    const scripts = document.querySelectorAll(`script[type="text/plain"][data-cookie-category="${category}"]`);
    scripts.forEach(function (script) {
      const newScript = document.createElement('script');
      if (script.src) newScript.src = script.src;
      else newScript.textContent = script.textContent;
      newScript.type = 'text/javascript';
      script.parentNode.replaceChild(newScript, script);
    });
  }

  function applyConsent(categories) {
    Object.keys(categories).forEach(function (cat) {
      if (categories[cat]) activateScripts(cat);
    });
  }

  // --- UI: Banner ---
  function createBanner() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cookie-consent-overlay';
    overlay.className = 'cc-overlay';

    // Banner container
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Configuración de cookies');

    banner.innerHTML = `
      <div class="cc-banner-content">
        <div class="cc-banner-text">
          <h3 class="cc-title">🍪 Tu Privacidad Importa</h3>
          <p class="cc-description">Usamos cookies para mejorar tu experiencia. Puedes aceptar todas, rechazar las no esenciales, o configurar tus preferencias. Más info en nuestra <a href="privacidad.html" class="cc-link">Política de Privacidad</a>.</p>
        </div>
        <div class="cc-banner-actions">
          <button id="cc-accept-all" class="cc-btn cc-btn-accept">Aceptar todas</button>
          <button id="cc-reject-all" class="cc-btn cc-btn-reject">Rechazar todas</button>
          <button id="cc-configure" class="cc-btn cc-btn-configure">Configurar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(banner);

    // Event listeners
    document.getElementById('cc-accept-all').addEventListener('click', function () {
      const cats = { essential: true, analytics: true, marketing: true };
      saveConsent(cats);
      applyConsent(cats);
      closeBanner();
    });

    document.getElementById('cc-reject-all').addEventListener('click', function () {
      const cats = { essential: true, analytics: false, marketing: false };
      saveConsent(cats);
      closeBanner();
    });

    document.getElementById('cc-configure').addEventListener('click', function () {
      closeBanner();
      openConfigPanel();
    });

    // Animación de entrada
    requestAnimationFrame(function () {
      banner.classList.add('cc-visible');
      overlay.classList.add('cc-visible');
    });
  }

  function closeBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    const overlay = document.getElementById('cookie-consent-overlay');
    if (banner) {
      banner.classList.remove('cc-visible');
      banner.addEventListener('transitionend', function () { banner.remove(); }, { once: true });
    }
    if (overlay) {
      overlay.classList.remove('cc-visible');
      overlay.addEventListener('transitionend', function () { overlay.remove(); }, { once: true });
    }
  }

  // --- UI: Config Panel ---
  function openConfigPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'cookie-config-overlay';
    overlay.className = 'cc-overlay';

    const panel = document.createElement('div');
    panel.id = 'cookie-config-panel';
    panel.className = 'cc-config-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Configuración detallada de cookies');

    let togglesHTML = '';
    Object.keys(CATEGORIES).forEach(function (key) {
      const cat = CATEGORIES[key];
      const isChecked = consent ? consent.categories[key] : cat.default;
      togglesHTML += `
        <div class="cc-config-row">
          <div class="cc-config-info">
            <span class="cc-config-label">${cat.label}</span>
            <span class="cc-config-desc">${cat.description}</span>
          </div>
          <label class="cc-toggle">
            <input type="checkbox" data-category="${key}" ${isChecked ? 'checked' : ''} ${cat.locked ? 'disabled checked' : ''}>
            <span class="cc-toggle-slider"></span>
          </label>
        </div>
      `;
    });

    panel.innerHTML = `
      <div class="cc-config-content">
        <h3 class="cc-title">Configuración de Cookies</h3>
        <p class="cc-description">Selecciona qué tipo de cookies deseas permitir. Las cookies esenciales son necesarias y no se pueden desactivar.</p>
        <div class="cc-config-toggles">
          ${togglesHTML}
        </div>
        <div class="cc-config-actions">
          <button id="cc-save-config" class="cc-btn cc-btn-accept">Guardar Preferencias</button>
          <button id="cc-cancel-config" class="cc-btn cc-btn-reject">Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    requestAnimationFrame(function () {
      panel.classList.add('cc-visible');
      overlay.classList.add('cc-visible');
    });

    document.getElementById('cc-save-config').addEventListener('click', function () {
      const cats = {};
      panel.querySelectorAll('input[data-category]').forEach(function (input) {
        cats[input.dataset.category] = input.checked;
      });
      cats.essential = true; // Forzar esenciales
      saveConsent(cats);
      applyConsent(cats);
      closeConfigPanel();
    });

    document.getElementById('cc-cancel-config').addEventListener('click', function () {
      closeConfigPanel();
      // Re-mostrar banner si no hay consentimiento guardado
      if (!consent) createBanner();
    });

    overlay.addEventListener('click', function () {
      closeConfigPanel();
      if (!consent) createBanner();
    });
  }

  function closeConfigPanel() {
    const panel = document.getElementById('cookie-config-panel');
    const overlay = document.getElementById('cookie-config-overlay');
    if (panel) {
      panel.classList.remove('cc-visible');
      panel.addEventListener('transitionend', function () { panel.remove(); }, { once: true });
    }
    if (overlay) {
      overlay.classList.remove('cc-visible');
      overlay.addEventListener('transitionend', function () { overlay.remove(); }, { once: true });
    }
  }

  // --- API Pública ---
  window.ZM_Consent = {
    getCategories: function () {
      const c = loadConsent();
      return c ? c.categories : null;
    },
    isAccepted: function (category) {
      const c = loadConsent();
      return c ? !!c.categories[category] : false;
    },
    showConfig: openConfigPanel
  };

  // --- Inicialización ---
  function init() {
    if (consent) {
      // Ya hay consentimiento guardado: aplicar preferencias
      applyConsent(consent.categories);
    } else {
      // Primera visita: mostrar banner
      createBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
