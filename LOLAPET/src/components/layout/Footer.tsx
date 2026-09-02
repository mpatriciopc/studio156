import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: "#18181b", color: "#a1a1aa", padding: "3.5rem 1rem 2rem 1rem", marginTop: "4rem", fontSize: "0.875rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem" }}>
        {/* Columna 1: Marca & Propuesta */}
        <div>
          <h4 style={{ color: "#ffffff", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
            🐾 LOLA PET
          </h4>
          <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
            Tu mascota feliz, tu tranquilidad en casa. Alimentos seleccionados, antiparasitarios y accesorios en Chile.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Instagram">
              📸
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Facebook">
              📘
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="TikTok">
              🎵
            </a>
          </div>
        </div>

        {/* Columna 2: Sitemap & Navegación */}
        <div>
          <h5 style={{ color: "#ffffff", fontWeight: 700, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>Mapa del Sitio</h5>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><a href="index.html" className="footer-link">Inicio</a></li>
            <li><a href="index.html?species=dog" className="footer-link">Catálogo Perros 🐶</a></li>
            <li><a href="index.html?species=cat" className="footer-link">Catálogo Gatos 🐱</a></li>
            <li><a href="contacto-mayorista.html" className="footer-link">Convenios Mayoristas B2B</a></li>
          </ul>
        </div>

        {/* Columna 3: Links de Interés */}
        <div>
          <h5 style={{ color: "#ffffff", fontWeight: 700, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>Links de Interés</h5>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><a href="#politicas" className="footer-link">Políticas de Envío y Devoluciones</a></li>
            <li><a href="#terminos" className="footer-link">Términos del Servicio</a></li>
            <li><a href="#preguntas" className="footer-link">Preguntas Frecuentes (FAQ)</a></li>
            <li><a href="#asesoria" className="footer-link">Asesoría Veterinaria Gratuita</a></li>
          </ul>
        </div>

        {/* Columna 4: Cobertura & Pagos */}
        <div>
          <h5 style={{ color: "#ffffff", fontWeight: 700, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>Despacho & Pago Seguro</h5>
          <p style={{ marginBottom: "0.5rem" }}>⚡ Entregas en 24h a 48h hábiles en RM.</p>
          <p style={{ marginBottom: "0.75rem" }}>📍 Envíos a todo Chile vía Starken/Chilexpress.</p>
          <div style={{ fontSize: "1.25rem", display: "flex", gap: "8px" }}>
            <span title="Webpay Plus">💳</span>
            <span title="Mercado Pago">🛍️</span>
            <span title="Transferencia Directa">🏦</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "2.5rem auto 0 auto", paddingTop: "1.5rem", borderTop: "1px solid #27272a", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem" }}>
        <span>© 2026 Lola Pet SpA. Todos los derechos reservados.</span>
        <span>Hecho con ❤️ para perros y gatos en Chile</span>
      </div>
    </footer>
  );
};
