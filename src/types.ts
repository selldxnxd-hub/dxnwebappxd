/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemSettings {
  shopName: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  adminPin: string; // PIN code to unlock Admin panel

  // Bangladesh Localization Additions
  bkashNumber?: string;
  bkashType?: 'Personal' | 'Agent' | 'Merchant';
  bkashInstruction?: string;
  bkashEnabled?: boolean;
  bkashQrUrl?: string;

  nagadNumber?: string;
  nagadType?: 'Personal' | 'Agent' | 'Merchant';
  nagadInstruction?: string;
  nagadEnabled?: boolean;
  nagadQrUrl?: string;

  rocketNumber?: string;
  rocketType?: 'Personal' | 'Agent' | 'Merchant';
  rocketInstruction?: string;
  rocketEnabled?: boolean;
  rocketQrUrl?: string;

  codEnabled?: boolean;
  codInstruction?: string;

  // Shipping Configuration
  shippingInsideDistrict?: number;
  shippingOutsideDistrict?: number;
  freeShippingMinAmount?: number;
  codFee?: number;
  shippingDeliveryTime?: string;

  // Telegram Integration
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;

  // Social Links & Live Support
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  supportNumber?: string;
  supportWhatsapp?: string;
  defaultLanguage?: 'bn' | 'en';
}

export interface ThemeConfig {
  primaryColor: string; // e.g. '#2563eb' (tailwind format or hex)
  secondaryColor: string;
  accentColor: string;
  fontFamily: string; // e.g. 'Inter' or 'Space Grotesk'
  logoUrl: string;
  logoText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  darkMode: boolean;
  bannerSlides?: string[]; // comma-separated or list of slider URLs
  
  // Custom Feature / Philosophy cards configurations (3 cards)
  feature1TitleEn?: string;
  feature1TitleBn?: string;
  feature1DescEn?: string;
  feature1DescBn?: string;

  feature2TitleEn?: string;
  feature2TitleBn?: string;
  feature2DescEn?: string;
  feature2DescBn?: string;

  feature3TitleEn?: string;
  feature3TitleBn?: string;
  feature3DescEn?: string;
  feature3DescBn?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  inventory: number;
  sku: string;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  colors?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  couponCode?: string | null;
  createdAt: string;

  // Bangladesh Address Format
  district?: string | null;
  upazila?: string | null;
  area?: string | null;

  // Manual payment submission verification
  senderNumber?: string | null;
  transactionId?: string | null;
  amountPaid?: number | null;
  paymentScreenshotUrl?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  active: boolean;
  expiryDate: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  active: boolean;
  createdAt: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  active: boolean;
  createdAt: string;
}

export interface MenuItem {
  label: string;
  url: string;
  order: number;
}

export interface CustomMenu {
  id: string;
  title: string;
  items: MenuItem[];
  type: 'header' | 'footer' | 'sidebar';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'contact' | 'inventory' | 'review';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  visitorCount: number;
}

export interface SeoConfig {
  id: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage?: string;
  structuredData?: string; // JSON schema string
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  createdAt: string;
}

export interface DeliveryArea {
  id: string;
  district: string;
  upazila: string;
  area: string;
  deliveryCharge: number;
  codEnabled: boolean;
  enabled: boolean;
}
