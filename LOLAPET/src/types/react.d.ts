// Ambient declarations for standalone TypeScript resolution without node_modules
declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

interface RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

declare namespace React {
  export interface ChangeEvent<T = Element> {
    target: T & { name: string; value: string; type: string; checked: boolean };
  }
  export interface FormEvent<T = Element> {
    preventDefault(): void;
  }
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export type FC<P = {}> = (props: P) => any;
}

declare module "react" {
  export = React;
}

declare module "@/types/shop" {
  export interface OrderCustomer {
    fullName: string;
    rut: string;
    phone: string;
    email: string;
    address: string;
    commune: string;
  }
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
    items: any[];
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
}

