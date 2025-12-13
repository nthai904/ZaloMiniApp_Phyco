export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ShippingAddress {
  alias: string;
  address: string;
  name: string;
  phone: string;
}

export interface Station {
  id: number;
  name: string;
  image: string;
  address: string;
  location: Location;
}

export type Delivery =
  | ({
      type: "shipping";
    } & ShippingAddress)
  | {
      type: "pickup";
      stationId: number;
    };


export interface ArticleAuthor {
  name: string;
  avatar: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: ArticleAuthor;
  category: string;
  publishedAt: string;
  readTime: number;
  views: number;
  tags: string[];
}



export interface Variant {
  barcode: string | null;
  compare_at_price: number;
  created_at: string;
  fulfillment_service: string | null;
  grams: number;
  id: number;
  inventory_management: string | null;
  inventory_policy: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
  inventory_quantity_adjustment: number | null;
  position: number;
  price: number;
  product_id: number;
  requires_shipping: boolean;
  sku: string | null;
  taxable: boolean;
  title: string;
  updated_at: string;
  image_id: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  inventory_advance: string | null;
}

export interface Option {
  name: string;
  id: number;
  position: number;
  product_id: number;
}

export interface ProductV2 {
  body_html: string;
  body_plain: string | null;
  created_at: string;
  handle: string;
  id: number;
  images: { src: string }[];
  product_type: string;
  published_at: string;
  published_scope: string;
  tags: string;
  template_suffix: string;
  title: string;
  updated_at: string;
  variants: Variant[];
  vendor: string;
  options: Option[];
  only_hide_from_list: boolean;
  not_allow_promotion: boolean;
}


export interface CartItemV2 {
  product: ProductV2;
  quantity: number;
}

export type CartV2 = CartItemV2[];


export interface OrderItemV2 {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "shipping" | "completed";
export type PaymentStatus = "pending" | "success" | "failed";

export interface OrderV2 {
  id: number;
  items: OrderItemV2[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  note: string;
  createdAt: Date;
}
