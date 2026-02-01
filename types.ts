
export type AppView = 
  | 'home' 
  | 'provinces' 
  | 'news' 
  | 'marketplace' 
  | 'traffic' 
  | 'utilities' 
  | 'events' 
  | 'food' 
  | 'mbanza' 
  | 'cart'
  | 'profile'
  | 'settings'
  | 'vendor-register'
  | 'post-product'
  | 'report-incident'
  | 'restaurant-register';

export type Language = 'RN' | 'FR' | 'EN' | 'SW';

export interface UserPreferences {
  language: Language;
  homeProvince: string;
  interests: string[];
  lowBandwidthMode: boolean;
}

export interface User {
  id: string;
  fullName: string;
  role: 'User' | 'Vendor' | 'Organizer' | 'Admin';
  verificationLevel: 'Basic' | 'Verified' | 'Gold';
  email: string;
  phone: string;
  walletBalance: number;
  preferences: UserPreferences;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  aiSummary?: string;
  source: string;
  sourceType: string;
  url: string;
  date: string;
  image: string;
  category: 'Politics' | 'Economy' | 'Culture' | 'Technology' | 'Sport';
  provinceTag?: string;
  isLive?: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  deliveryFee: number;
  province: string;
  isTrending?: boolean;
  vendorVerified?: boolean;
  location?: string;
  description?: string;
}

// export interface TrafficReport {
//   id: string;
//   road: string;
//   type: 'Jam' | 'Accident' | 'Flood' | 'Obstacle';
//   severity: 'Low' | 'Medium' | 'High';
//   description: string;
//   timestamp: string;
//   reporter: string;
//   locationName: string;
//   coordinates?: { lat: number; lng: number };
// }
export type TrafficSeverity = 'Low' | 'Medium' | 'High';

export interface TrafficReport {
  id: string;
  road: string;
  type: string;
  status: string;
  severity: TrafficSeverity;
  locationName: string;
  description: string;
  timestamp: string;
  reporter: string;
}

export interface Province {
  id: string;
  name: string;
  capital: string;
  formerProvinces: string[];
  communes: number;
  hills: number;
  population: string;
  economy: string[];
  history: string;
  image: string;
  governor: string;
}

export interface Shop {
  id: string;
  name: string;
  province: string;
  rating: number;
  isVerified: boolean;
  image: string;
  ownerName?: string;
  location?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  province: string;
  rating: number;
  isVerified: boolean;
  image: string;
  cuisine: string[];
  menu: MenuItem[];
  hasDelivery: boolean;
  deliveryTime: string;
  deliveryFee: number;
}

export interface BurundiEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  type: string;
  date: string;
  venue: string;
  province: string;
  image: string;
  tiers: { name: string; price: number; capacity: number }[];
}

