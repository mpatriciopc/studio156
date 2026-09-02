export interface ProductVariant {
  sku: string;
  format: string;
  price: number;
  salePrice?: number;
  stock: number;
  weightKg: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  species: "dog" | "cat" | "both";
  category: string;
  description: string;
  featured?: boolean;
  active?: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  rut: string;
  address: string;
  commune: string;
}

export interface Coupon {
  code: string;
  type: "Porcentaje" | "MontoFijo";
  value: number;
  minPurchase?: number;
  active: boolean;
}

export interface ShippingZone {
  commune: string;
  shippingCost: number;
  freeShippingThreshold: number;
  active: boolean;
}

export interface Order {
  orderId: string;
  date: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountCode?: string;
  discountAmount?: number;
  total: number;
  paymentMethod: "Webpay" | "MercadoPago" | "WhatsApp";
  paymentStatus: "Pendiente" | "Pagado" | "Cancelado";
  shippingStatus: "Pendiente" | "En Preparación" | "Enviado" | "Entregado";
  trackingNumber?: string;
  trackingToken: string;
}
