"use client";

import React from "react";
import { useCartStore } from "@/lib/cart-store";
import { Product, ProductVariant } from "@/types/shop";

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(
    product.variants[0]
  );
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const currentPrice = selectedVariant.salePrice || selectedVariant.price;

  return (
    <div className="product-card">
      <div>
        <div className="product-card-img-wrapper">
          <img
            src={selectedVariant.imageUrl || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600"}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
          {selectedVariant.salePrice && (
            <span className="badge-tag" style={{ background: "#dc2626" }}>
              Oferta
            </span>
          )}
        </div>

        <span className="product-brand">{product.brand}</span>
        <h3 className="product-title">{product.name}</h3>

        {/* Variantes de formato */}
        {product.variants.length > 1 && (
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
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <div className="price-row">
          <span className="price-current">${currentPrice.toLocaleString("es-CL")}</span>
          {selectedVariant.salePrice && (
            <span className="price-sale">
              ${selectedVariant.price.toLocaleString("es-CL")}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-add-cart"
          onClick={handleAddToCart}
          style={{
            backgroundColor: added ? "#16a34a" : undefined,
          }}
        >
          {added ? "¡Añadido ✓!" : "Llevar a casa"}
        </button>
      </div>
    </div>
  );
};
