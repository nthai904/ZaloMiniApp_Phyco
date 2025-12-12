export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: Category;
  detail?: string;
  sizes?: Size[];
  colors?: Color[];
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Cart = CartItem[];

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