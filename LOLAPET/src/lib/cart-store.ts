import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductVariant } from "@/types/shop";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.selectedVariant.sku === variant.sku
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const newQty = Math.min(updatedItems[existingIndex].quantity + quantity, 20);
            updatedItems[existingIndex].quantity = newQty;
            return { items: updatedItems, isOpen: true };
          }

          return {
            items: [...state.items, { product, selectedVariant: variant, quantity: Math.min(quantity, 20) }],
            isOpen: true,
          };
        });
      },
      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.selectedVariant.sku !== sku),
        }));
      },
      updateQuantity: (sku, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.selectedVariant.sku !== sku),
            };
          }
          const cappedQty = Math.min(quantity, 20);
          return {
            items: state.items.map((item) =>
              item.selectedVariant.sku === sku ? { ...item, quantity: cappedQty } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant.salePrice || item.selectedVariant.price;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "lolapet-cart-storage",
    }
  )
);
