
import { Province, Shop, Product, Restaurant, NewsArticle, BurundiEvent } from './types.ts';

export const NEW_PROVINCES: Province[] = [
  {
    id: 'p-buj',
    name: 'Bujumbura',
    capital: 'Bujumbura',
    formerProvinces: ['Bujumbura Mairie', 'Bujumbura Rural', 'Bubanza', 'Cibitoke'],
    communes: 9,
    hills: 680,
    population: '2.1 Million',
    economy: ['Trade', 'Industry', 'Fishing', 'Ports'],
    history: 'The economic hub and former capital.',
    image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800',
    governor: 'Col. Jimmy Hatungimana'
  },
  {
    id: 'p-git',
    name: 'Gitega',
    capital: 'Gitega',
    formerProvinces: ['Gitega', 'Muramvya', 'Mwaro', 'Karusi'],
    communes: 8,
    hills: 610,
    population: '1.8 Million',
    economy: ['Administration', 'Culture'],
    history: 'The political capital of Burundi.',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c17?auto=format&fit=crop&q=80&w=800',
    governor: 'Venant Manirambona'
  }
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Digital Hub Connects 5 Reformed Provinces',
    summary: 'A new unified platform launches to streamline commerce across Burundi.',
    source: 'RTNB',
    sourceType: 'Official',
    url: '#',
    date: '10 mins ago',
    image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800',
    category: 'Politics',
    provinceTag: 'p-buj',
    isLive: true
  },
  {
    id: 'n2',
    title: 'Gitega Cultural Center Restoration',
    summary: 'Restoration works begin on the National Museum to preserve heritage.',
    source: 'Iwacu',
    sourceType: 'Private',
    url: '#',
    date: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&q=80&w=800',
    category: 'Culture',
    provinceTag: 'p-git'
  }
];

export const PRODUCTS: Product[] = [
  { id: 'pr1', shopId: 's1', name: 'Ngozi Roast (500g)', price: 18000, category: 'Food', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400', stock: 100, deliveryFee: 3000, province: 'Butanyerera', vendorVerified: true, isTrending: true },
  { id: 'pr2', shopId: 's2', name: 'Solar Node Charger', price: 75000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400', stock: 15, deliveryFee: 5000, province: 'Bujumbura', vendorVerified: true }
];

export const RESTAURANTS: Restaurant[] = [
  { 
    id: 'r1', name: 'Tanganyika Grill', province: 'Bujumbura', rating: 4.8, isVerified: true, image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600',
    cuisine: ['Local', 'Grilled Fish'],
    hasDelivery: true,
    deliveryTime: '25-35 min',
    deliveryFee: 2500,
    menu: [
      { id: 'm1', name: 'Grilled Mukeke', price: 28000, description: 'Freshly caught Mukeke' }
    ]
  }
];

export const MOCK_EVENTS: BurundiEvent[] = [
  {
    id: 'e1',
    title: 'Gishora Drum Festival',
    description: 'National celebration of sacred drums.',
    organizer: 'Ministry of Culture',
    type: 'Cultural',
    date: '2025-08-15',
    venue: 'Gishora Sanctuary',
    province: 'Gitega',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d0?auto=format&fit=crop&q=80&w=800',
    tiers: [
      { name: 'Standard', price: 5000, capacity: 2000 }
    ]
  }
];
