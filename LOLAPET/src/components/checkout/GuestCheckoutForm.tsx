"use client";

import React, { useState, useEffect, FC, FormEvent } from "react";
import { OrderCustomer } from "@/types/shop";

export interface CheckoutFormProps {
  onSubmitOrder: (customer: OrderCustomer, paymentMethod: string) => void;
}

export const GuestCheckoutForm: FC<CheckoutFormProps> = ({ onSubmitOrder }) => {
  const [formData, setFormData] = useState<OrderCustomer>({
    fullName: "",
    rut: "",
    phone: "",
    email: "",
    address: "",
    commune: "Providencia",
  });
  const [saveLocally, setSaveLocally] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Webpay");

  useEffect(() => {
    const saved = localStorage.getItem("lolapet_guest_customer");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (saveLocally) {
      localStorage.setItem("lolapet_guest_customer", JSON.stringify(formData));
    }
    onSubmitOrder(formData, paymentMethod);
  };


  return (
    <form onSubmit={handleSubmit} className="checkout-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Datos de Entrega y Facturación</h2>
        <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "99px", fontWeight: 700 }}>
          Sin necesidad de registro (Guest Checkout)
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="form-group">
          <label>Nombre y Apellidos *</label>
          <input
            type="text"
            required
            className="form-input"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Ej. Camila Silva"
          />
        </div>

        <div className="form-group">
          <label>RUT *</label>
          <input
            type="text"
            required
            className="form-input"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            placeholder="12.345.678-9"
          />
        </div>

        <div className="form-group">
          <label>Teléfono / WhatsApp *</label>
          <input
            type="tel"
            required
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico *</label>
          <input
            type="email"
            required
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="camila@ejemplo.com"
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "0.5rem" }}>
        <label>Dirección Completa de Despacho *</label>
        <input
          type="text"
          required
          className="form-input"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Av. Providencia 1234, Depto 402"
        />
      </div>

      <div className="form-group">
        <label>Comuna de Entrega *</label>
        <select
          className="form-input"
          value={formData.commune}
          onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
        >
          <option value="Providencia">Providencia ($2.990)</option>
          <option value="Las Condes">Las Condes ($2.990)</option>
          <option value="Santiago Centro">Santiago Centro ($2.990)</option>
          <option value="Ñuñoa">Ñuñoa ($2.990)</option>
          <option value="Vitacura">Vitacura ($3.490)</option>
          <option value="La Reina">La Reina ($3.490)</option>
          <option value="Otra Comuna (RM)">Otras Comunas RM (Tarifa Estándar $4.990)</option>
        </select>
      </div>


      {/* Opción de autocompletado en navegador sin crear cuenta y control de privacidad de PII */}
      <div style={{ background: "#f4f4f5", padding: "0.75rem", borderRadius: "10px", margin: "1.25rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            id="saveLocally"
            checked={saveLocally}
            onChange={(e) => setSaveLocally(e.target.checked)}
          />
          <label htmlFor="saveLocally" style={{ fontSize: "0.8125rem", margin: 0, cursor: "pointer" }}>
            <strong>Recordar mis datos de entrega en este equipo</strong> para compras futuras instantáneas sin contraseñas ⚡
          </label>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("lolapet_guest_customer");
            setFormData({ fullName: "", rut: "", phone: "", email: "", address: "", commune: "Providencia" });
          }}
          style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", marginTop: "4px", padding: 0, textDecoration: "underline" }}
        >
          🗑️ Olvidar y borrar mis datos de este equipo (Privacidad PII)
        </button>
      </div>


      <div style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.75rem" }}>Método de Pago</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {["Webpay", "MercadoPago", "WhatsApp"].map((method) => (
            <label
              key={method}
              style={{
                padding: "0.75rem",
                border: "2px solid",
                borderColor: paymentMethod === method ? "var(--color-primary)" : "var(--color-border)",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.875rem",
                background: paymentMethod === method ? "#ecfeff" : "#ffffff",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                style={{ display: "none" }}
              />
              {method === "Webpay" && "💳 Webpay Plus"}
              {method === "MercadoPago" && "🛍️ Mercado Pago"}
              {method === "WhatsApp" && "💬 Pedido WhatsApp"}
            </label>
          ))}
        </div>

        <button type="submit" className="btn-add-cart" style={{ padding: "0.875rem", fontSize: "1rem" }}>
          Ir a Pagar Pedido 🔒
        </button>
      </div>
    </form>
  );
};
