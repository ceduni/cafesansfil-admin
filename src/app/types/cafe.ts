export interface OpeningHoursBlock {
  start: string;
  end: string;
}

export interface OpeningHours {
  day: string;
  blocks: OpeningHoursBlock[];
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Location {
  pavillon: string;
  local: string;
  floor: string;
  geometry: Geometry;
}

export interface Contact {
  email: string;
  phone_number: string;
  website: string;
}

export interface SocialMedia {
  facebook: string | null;
  instagram: string | null;
  x: string | null;
}

export interface PaymentDetails {
  method: string;
  minimum: string;
}

export interface Owner {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  diet_profile: any;
}

export interface StaffMember {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  diet_profile: any;
}

export interface Staff {
  admins: StaffMember[];
  volunteers: StaffMember[];
}

export interface Affiliation {
  university: string;
  faculty: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  cafe_id: string;
  category_ids: string[];
  name: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
  price: number;
  in_stock: boolean;
  is_highlighted?: boolean;
  likes: string[];
  barecode: string | null;
  nutritional_informations: NutritionalInformations | null;
  health_score: number;
  options: MenuItemOption[];
}

export interface MenuItemOption {
  type: string;
  value: string;
  fee: number;
}

export interface NutritionalInformations {
  calories?: number;
  lipids?: number;
  proteins?: number;
  carbohydrates?: number;
  sugar?: number;
  sodium?: number;
  fiber?: number;
  saturated_fat?: number;
  zinc?: number;
  iron?: number;
  calcium?: number;
  magnesium?: number;
  potassium?: number;
  vitamina?: number;
  vitaminc?: number;
  vitamind?: number;
  vitamine?: number;
  vitamink?: number;
  vitaminb6?: number;
  vitaminb12?: number;
}

export interface MenuNutriInfo {
  calories: number;
  lipids: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturated_fat: number;
  zinc: number;
  iron: number;
  calcium: number;
  magnesium: number;
  potassium: number;
  vitamina: number;
  vitaminc: number;
  vitamind: number;
  vitaminb6: number;
  vitaminb12: number;
}

export interface MenuItemsResponse {
  items: MenuItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
  links: {
    first: string;
    last: string;
    self: string;
    next: string | null;
    prev: string | null;
  };
}

export interface Menu {
  layout: string;
  categories: MenuCategory[];
}

export interface Cafe {
  id: string;
  name: string;
  slug: string;
  previous_slugs: string[];
  features: string[];
  description: string;
  logo_url: string | null;
  banner_url: string;
  photo_urls: string[];
  affiliation: Affiliation;
  is_open: boolean;
  status_message: string;
  opening_hours: OpeningHours[];
  location: Location;
  contact: Contact;
  social_media: SocialMedia;
  payment_details: PaymentDetails[];
  owner: Owner;
  staff: Staff;
  menu: Menu;
}
