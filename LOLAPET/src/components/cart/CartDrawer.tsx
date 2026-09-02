"use client";

import React from "react";
import { useCartStore } from "@/lib/cart-store";

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } = useCartStore();

  const total = getTotal();
  const freeShippingThreshold = 35000;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - total);

  if (!isOpen) return null;

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(false)} />

      <aside className={`cart-drawer ${isOpen ? "active" : ""}`}>
        <div className="cart-drawer-header">
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Tu Carrito Peludo 🐾</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ border: "none", background: "none", fontSize: "1.25rem", cursor: "pointer", padding: "0.25rem" }}
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {/* Barra de Envío Gratis */}
          {missingForFreeShipping > 0 ? (
            <div className="free-shipping-bar">
              Estás a solo <strong>${missingForFreeShipping.toLocaleString("es-CL")}</strong> del Envío Gratis 🚀
            </div>
          ) : (
            <div className="free-shipping-bar" style={{ background: "#dcfce7", color: "#15803d" }}>
              ¡Felicitaciones! Tienes <strong>Envío Gratis</strong> activado 🎉
            </div>
          )}

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🐶</p>
              <p style={{ fontWeight: 600 }}>Tu carrito está esperando consentir a un peludo</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((item) => {
                const itemPrice = item.selectedVariant.salePrice || item.selectedVariant.price;
                return (
                  <div
                    key={item.selectedVariant.sku}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <img
                      src={item.selectedVariant.imageUrl}
                      alt={item.product.name}
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.2 }}>{item.product.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Formato: {item.selectedVariant.format}
                      </p>
                      <p style={{ fontSize: "0.875rem", fontWeight: 800, marginTop: "4px" }}>
                        ${itemPrice.toLocaleString("es-CL")}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.selectedVariant.sku, item.quantity - 1)}
                          style={{ padding: "1px 8px", border: "1px solid #ccc", borderRadius: "4px" }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.selectedVariant.sku, item.quantity + 1)}
                          style={{ padding: "1px 8px", border: "1px solid #ccc", borderRadius: "4px" }}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.selectedVariant.sku)}
                          style={{ marginLeft: "auto", border: "none", background: "none", color: "#dc2626", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontWeight: 800, fontSize: "1.125rem" }}>
              <span>Total:</span>
              <span>${total.toLocaleString("es-CL")}</span>
            </div>

            <a
              href="checkout.html"
              className="btn-add-cart"
              style={{ display: "block", textAlign: "center", textDecoration: "none" }}
            >
              Ir a Pagar 🛒
            </a>
          </div>
        )}
      </aside>
    </>
  );
};
