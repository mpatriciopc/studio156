"use client";

import React from "react";
import { useCartStore } from "@/lib/cart-store";

export interface HeaderProps {
  currentSpecies?: "dog" | "cat" | "all";
  onSpeciesChange?: (species: "dog" | "cat" | "all") => void;
}

export const Header: React.FC<HeaderProps> = ({ currentSpecies = "all", onSpeciesChange }) => {
  const { getItemCount, setIsOpen } = useCartStore();
  const itemCount = getItemCount();

  return (
    <header className="navbar-lola">
      <div className="navbar-lola-container">
        {/* Brand Logo */}
        <a href="index.html" className="navbar-brand-lola">
          🐾 <span>LOLA PET</span>
        </a>

        {/* Species Switcher Toggle */}
        <div className="species-toggle">
          <button
            type="button"
            className={`species-btn ${currentSpecies === "dog" ? "active-dog" : ""}`}
            onClick={() => onSpeciesChange?.("dog")}
          >
            🐶 Perros
          </button>
          <button
            type="button"
            className={`species-btn ${currentSpecies === "cat" ? "active-cat" : ""}`}
            onClick={() => onSpeciesChange?.("cat")}
          >
            🐱 Gatos
          </button>
        </div>

        {/* Cart Trigger Button */}
        <button
          type="button"
          className="cart-btn-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Ver Carrito de Compras"
        >
          🛒 <span className="cart-badge">{itemCount}</span>
        </button>
      </div>
    </header>
  );
};
