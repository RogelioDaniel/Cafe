export type MenuCategory =
  | "cafe-de-olla"
  | "antojitos"
  | "pan-dulce"
  | "postres"
  | "bebidas";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string | null;
  tags: string[];
  origin: string | null;
  popular: boolean;
}

export interface MenuCategoryGroup {
  id: MenuCategory;
  name: string;
  items: MenuItem[];
}

export interface MenuResponse {
  categories: MenuCategoryGroup[];
  items: MenuItem[];
}

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  source: string;
  createdAt: string;
}

export interface Stats {
  cups_today: number;
  orders_today: number;
  reservations_today: number;
  happy_customers: number;
  viewers_now: number;
}

export interface TableInfo {
  id: number;
  zone: "sala" | "terraza" | "barra";
  seats: number;
  status: "available" | "occupied" | "reserved";
  occupiedUntil?: string;
}

export interface CafeState extends Stats {
  tables: TableInfo[];
  wait_time_minutes: number;
}
