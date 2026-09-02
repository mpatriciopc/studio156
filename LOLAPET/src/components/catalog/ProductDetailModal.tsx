"use client";

import React from "react";
import { Product } from "@/types/shop";
import { useCartStore } from "@/lib/cart-store";

export interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addItem } = useCartStore();

  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = React.useState(product.variants[0]);
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const currentPrice = selectedVariant.salePrice || selectedVariant.price;
  const safeName = encodeURIComponent(product.name);
  const safeSku = encodeURIComponent(selectedVariant.sku);
  const whatsappConsultUrl = `https://wa.me/56912345678?text=Hola%20Lola%20Pet,%20tengo%20una%20consulta%20sobre%20el%20producto%20"${safeName}"%20(SKU:%20${safeSku})`;


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          maxWidth: "720px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.75rem",
          position: "relative",
          boxShadow: "var(--shadow-md)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "none",
            background: "#f4f4f5",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div>
            <img
              src={selectedVariant.imageUrl}
              alt={product.name}
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "12px", background: "#f4f4f5" }}
            />
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              {product.brand}
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "2px", marginBottom: "0.5rem" }}>
              {product.name}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              {product.description}
            </p>

            {/* Beneficios Nutricionales/Técnicos */}
            <div style={{ background: "#fafafa", padding: "0.875rem", borderRadius: "10px", border: "1px solid var(--color-border)", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "4px" }}>
                BENEFICIOS DESTACADOS
              </div>
              <ul style={{ fontSize: "0.8125rem", paddingLeft: "1.25rem", color: "#3f3f46" }}>
                <li>Fórmula 100% balanceada con ingredientes seleccionados.</li>
                <li>Excelente digestibilidad y máxima palatabilidad para tu mascota.</li>
                <li>Despacho rápido asegurado directamente desde bodega.</li>
              </ul>
            </div>

            {/* Selector de variante */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, display: "block", marginBottom: "0.35rem" }}>
                  Selecciona Formato / Formato SKU:
                </span>
                <div className="variant-selector-pills">
                  {product.variants.map((v) => (
                    <button
                      key={v.sku}
                      type="button"
                      className={`variant-pill ${v.sku === selectedVariant.sku ? "selected" : ""}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "1.625rem", fontWeight: 800 }}>
                ${currentPrice.toLocaleString("es-CL")}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: 700 }}>
                ✓ Stock disponible ({selectedVariant.stock} un.)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-add-cart"
                onClick={handleAddToCart}
                style={{ padding: "0.75rem", backgroundColor: added ? "#16a34a" : undefined }}
              >
                {added ? "¡Añadido al Carrito ✓!" : "Llevar a casa 🛒"}
              </button>

              {/* Botón de Asesoría Veterinaria Directa vía WhatsApp */}
              <a
                href={whatsappConsultUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.6rem",
                  borderRadius: "99px",
                  border: "1px solid #25d366",
                  color: "#16a34a",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  background: "#f0fdf4",
                }}
              >
                💬 Consultar dosis o dudas por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
