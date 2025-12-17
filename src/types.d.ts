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

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Cart = CartItem[];

export interface ShippingAddress {
  alias: string;
  // main address line (kept for backward compatibility)
  address: string;
  // optional second address line
  address2?: string | null;
  name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  company?: string | null;
  city?: string | null;
  province?: string | null;
  province_code?: string | null;
  district?: string | null;
  district_code?: string | null;
  ward?: string | null;
  ward_code?: string | null;
  zip?: string | null;
  country?: string | null;
  country_code?: string | null;
  id?: number;
  default?: boolean;
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

export type OrderStatus = "pending" | "shipping" | "completed";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Order {
  id: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  receivedAt: Date;
  items: CartItem[];
  delivery: Delivery;
  total: number;
  note: string;
}

// Interfaces chức năng mới 
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

export type Product = ProductV2;


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

export interface OrderV2 {
  id: number;
  items: OrderItemV2[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  note: string;
  createdAt: Date;
}



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
  blog_id?: number | string;
  blog_handle?: string;
  publishedAt: string;
  published?: boolean;
  readTime: number;
  views: number;
  tags: string[];
}

export interface Blog {
  id: number;
  handle?: string;
  title: string;
  tags?: string;
  commentable?: string;
  template_suffix?: string | null;
  created_at?: string;
  updated_at?: string;
  article_count?: number;
  hasPublished?: boolean;
}