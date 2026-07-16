/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Product,
  Category,
  Subcategory,
  Brand,
  SystemSettings,
  ThemeConfig,
  Order,
  Coupon,
  Review,
  StaticPage,
  CustomMenu,
  SystemNotification,
  AnalyticsSummary
} from '../types';

// Generic Collections names
const COLL_SETTINGS = 'settings';
const COLL_THEME = 'theme';
const COLL_PRODUCTS = 'products';
const COLL_CATEGORIES = 'categories';
const COLL_SUBCATEGORIES = 'subcategories';
const COLL_BRANDS = 'brands';
const COLL_ORDERS = 'orders';
const COLL_COUPONS = 'coupons';
const COLL_REVIEWS = 'reviews';
const COLL_PAGES = 'pages';
const COLL_MENUS = 'menus';
const COLL_NOTIFICATIONS = 'notifications';

// --- DATABASE AUTO-SEEDER ---
export async function seedDatabaseIfEmpty() {
  try {
    const settingsDocRef = doc(db, COLL_SETTINGS, 'config');
    const settingsSnap = await getDoc(settingsDocRef);
    if (settingsSnap.exists()) {
      return; // DB already seeded
    }

    console.log('Database empty. Starting auto-seeding with professional curated items...');

    // 1. Seed System Settings
    const defaultSettings: SystemSettings = {
      shopName: 'অ্যাথার ইলেকট্রনিক্স',
      currency: '৳',
      contactEmail: 'contact@aetherstore.com.bd',
      contactPhone: '+880 1712-345678',
      address: '১২/এ, রোড ৪, ব্লক সি, বনানী, ঢাকা ১২১৩, বাংলাদেশ',
      adminPin: '45600',
      bkashNumber: '01712345678',
      bkashType: 'Personal',
      bkashInstruction: 'বিকাশ অ্যাপ বা *২৪৭# ডায়াল করে "Send Money" করুন। খরচ সহ সঠিক পরিমাণ টাকা পাঠান।',
      bkashEnabled: true,
      nagadNumber: '01812345678',
      nagadType: 'Personal',
      nagadInstruction: 'নগদ অ্যাপ বা *১৬৭# ডায়াল করে "Send Money" করুন।',
      nagadEnabled: true,
      rocketNumber: '01912345678',
      rocketType: 'Personal',
      rocketInstruction: 'রকেট অ্যাপ বা *৩২২# ডায়াল করে "Send Money" করুন।',
      rocketEnabled: false,
      codEnabled: true,
      codInstruction: 'পণ্যটি আপনার হাতে পৌঁছানোর পর ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।',
      shippingInsideDistrict: 80,
      shippingOutsideDistrict: 150,
      freeShippingMinAmount: 3000,
      codFee: 0,
      shippingDeliveryTime: 'ঢাকা সিটির ভেতরে ১-২ দিন, বাইরে ৩-৫ দিন।'
    };
    await setDoc(settingsDocRef, defaultSettings);

    // 2. Seed Theme Config
    const defaultTheme: ThemeConfig = {
      primaryColor: '#059669', // Emerald 600 - reflecting BD touch or clean modern look
      secondaryColor: '#064e3b', // Emerald 900
      accentColor: '#10b981', // Emerald 500
      fontFamily: 'Inter',
      logoUrl: '',
      logoText: 'AETHER BD',
      heroTitle: 'প্রিমিয়াম গ্যাজেট ও ইলেকট্রনিক্স গিয়ার',
      heroSubtitle: 'আপনার দৈনন্দিন জীবনকে গতিশীল ও নান্দনিক করতে সেরা কোয়ালিটির গ্যাজেট ও কম্পিউটার অ্যাকসেসরিজ কালেকশন।',
      heroBannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      darkMode: false
    };
    await setDoc(doc(db, COLL_THEME, 'config'), defaultTheme);

    // 3. Seed Categories
    const categories: Category[] = [
      { id: 'cat-audio', name: 'প্রিমিয়াম অডিও (Premium Audio)', slug: 'premium-audio', description: 'হাই-ফাই হেডফোন এবং ওয়্যারলেস নয়েজ ক্যানসেলিং ইয়ারফোন।' },
      { id: 'cat-desk', name: 'অফিস ও ডেস্ক গিয়ার (Desk Accessories)', slug: 'home-office-desk', description: 'মেকানিক্যাল কিবোর্ড এবং প্রফেশনাল লেদার ডেস্ক ম্যাট।' },
      { id: 'cat-wearables', name: 'স্মার্ট ওয়াচ ও ট্র্যাকার (Wearables)', slug: 'smart-wearables', description: 'জিপিএস ট্র্যাকিং ও ফিটনেস ফিডব্যাকসহ প্রফেশনাল স্মার্ট ঘড়ি।' },
      { id: 'cat-acc', name: 'লাইফস্টাইল অ্যাকসেসরিজ (Lifestyle)', slug: 'lifestyle-accessories', description: 'প্রিমিয়াম কোয়ালিটি চামড়ার ওয়ালেট ও প্রিসিশন মেটাল গিয়ার।' }
    ];
    for (const cat of categories) {
      await setDoc(doc(db, COLL_CATEGORIES, cat.id), cat);
    }

    // 4. Seed Subcategories
    const subcategories: Subcategory[] = [
      { id: 'sub-headphones', name: 'হেডফোন', slug: 'headphones', categoryId: 'cat-audio' },
      { id: 'sub-earbuds', name: 'ইয়ারবাডস', slug: 'earbuds', categoryId: 'cat-audio' },
      { id: 'sub-keyboards', name: 'মেকানিক্যাল কিবোর্ড', slug: 'keyboards', categoryId: 'cat-desk' },
      { id: 'sub-pointers', name: 'মাউস ও পয়েন্টার', slug: 'mice-pointers', categoryId: 'cat-desk' },
      { id: 'sub-watches', name: 'স্মার্টওয়াচ', slug: 'smartwatches', categoryId: 'cat-wearables' }
    ];
    for (const sub of subcategories) {
      await setDoc(doc(db, COLL_SUBCATEGORIES, sub.id), sub);
    }

    // 5. Seed Brands
    const brands: Brand[] = [
      { id: 'brand-ascent', name: 'Ascent Audio', slug: 'ascent-audio', description: 'প্রিমিয়াম মেটেরিয়ালে তৈরি স্টুডিও সাউন্ড গ্যাজেট।' },
      { id: 'brand-orbit', name: 'Orbit Labs', slug: 'orbit-labs', description: 'ফিটনেস ট্র্যাকিং সেন্সর এবং উন্নত স্পোর্টস অ্যাকসেসরিজ।' },
      { id: 'brand-nexus', name: 'Nexus Input', slug: 'nexus-input', description: 'হাই-প্রিসিশন মেকানিক্যাল ইনপুট টুলস।' }
    ];
    for (const brand of brands) {
      await setDoc(doc(db, COLL_BRANDS, brand.id), brand);
    }

    // 6. Seed Products
    const products: Product[] = [
      {
        id: 'prod-ascent-pro',
        title: 'Ascent Studio Pro ANC হেডফোন',
        slug: 'ascent-studio-pro-headphones',
        description: 'এতে রয়েছে অসাধারণ অ্যাক্টিভ নয়েজ ক্যানসেলেশন (ANC), ৪০ মিমি বায়োলজিক্যাল ফাইবার ডায়নামিক ডায়াফ্রাম, এবং একটানা ৪৫ ঘণ্টা ওয়্যারলেস মিউজিক প্লেব্যাক ব্যাকআপ। মেমোরি-ফোম কানের প্যাডিং আপনাকে দিবে চরম আরামদায়ক অনুভূতি।',
        price: 8500,
        compareAtPrice: 12500,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800'
        ],
        categoryId: 'cat-audio',
        subcategoryId: 'sub-headphones',
        brandId: 'brand-ascent',
        inventory: 18,
        sku: 'ASC-HP-PRO-BLK',
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 38,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-orbit-watch',
        title: 'Orbit Active GPS জিপিএস স্মার্টওয়াচ',
        slug: 'orbit-active-gps-smartwatch',
        description: 'উন্নত ফিটনেস ও স্পোর্টস ট্র্যাকিংয়ের জন্য ডিজাইন করা হয়েছে। অ্যামোলেড চমৎকার ডিসপ্লে, বিল্ট-ইন জিপিএস ট্র্যাকিং, ৫০ মিটার ওয়াটার রেজিস্ট্যান্স এবং টানা ১৪ দিনের শক্তিশালী ব্যাটারি ব্যাকআপ।',
        price: 5200,
        compareAtPrice: 6500,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800'
        ],
        categoryId: 'cat-wearables',
        subcategoryId: 'sub-watches',
        brandId: 'brand-orbit',
        inventory: 15,
        sku: 'ORB-WT-ACT-SLV',
        isFeatured: true,
        rating: 4.7,
        reviewsCount: 22,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-nexus-keyboard',
        title: 'Nexus মেকানিক্যাল কিবোর্ড V2',
        slug: 'nexus-mechanical-keyboard-v2',
        description: 'অ্যালুমিনিয়াম ফ্রেম এবং লো-প্রোফাইল চমৎকার ব্রাউন মেকানিক্যাল সুইচে তৈরি। ডাবল ব্লুটুথ ৫.১ ও ইউএসবি টাইপ-সি সাপোর্টেড। টাইপিং করার জন্য অত্যন্ত প্রিমিয়াম ফিলিংস পাবেন।',
        price: 4500,
        compareAtPrice: 5500,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800'
        ],
        categoryId: 'cat-desk',
        subcategoryId: 'sub-keyboards',
        brandId: 'brand-nexus',
        inventory: 12,
        sku: 'NEX-KB-V2-BRN',
        isFeatured: true,
        rating: 4.8,
        reviewsCount: 19,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-leather-pad',
        title: 'মিনিমালিস্ট ভেজিটেবল-ট্যানড ডেস্ক প্যাড',
        slug: 'minimalist-leather-desk-pad',
        description: 'আসল ভেজিটেবল ট্যানড লেদার এবং নন-স্লিপ কর্ক ব্যাক দিয়ে তৈরি। এটি আপনার টেবিলকে স্ক্র্যাচ থেকে বাঁচাবে এবং মাউস চালানোর জন্য দারুণ মসৃণ সারফেস প্রদান করবে। সম্পূর্ণ ওয়াটার-প্রুফ।',
        price: 1800,
        compareAtPrice: 2200,
        images: [
          'https://images.unsplash.com/photo-1632292224971-0d45778b3002?auto=format&fit=crop&q=80&w=800'
        ],
        categoryId: 'cat-desk',
        brandId: 'brand-ascent',
        inventory: 35,
        sku: 'ASC-DP-LTH-BRN',
        isFeatured: false,
        rating: 4.6,
        reviewsCount: 11,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-orbit-buds',
        title: 'Orbit ANC ওয়্যারলেস ইয়ারবাডস',
        slug: 'orbit-anc-wireless-earbuds',
        description: 'প্রিমিয়াম লেভেলের এইচডি সাউন্ড এবং ৩০ ডেসিবেল হাইব্রিড অ্যাক্টিভ নয়েজ রিডাকশন সমৃদ্ধ। জিম বা দৌড়ানোর সময়ে ব্যবহারের জন্য এটি ওয়াটারপ্রুফ এবং অত্যন্ত যুতসই।',
        price: 3200,
        compareAtPrice: 4000,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
        ],
        categoryId: 'cat-audio',
        subcategoryId: 'sub-earbuds',
        brandId: 'brand-orbit',
        inventory: 28,
        sku: 'ORB-EB-ANC-WHT',
        isFeatured: false,
        rating: 4.5,
        reviewsCount: 15,
        createdAt: new Date().toISOString()
      }
    ];
    for (const prod of products) {
      await setDoc(doc(db, COLL_PRODUCTS, prod.id), prod);
    }

    // 7. Seed Coupons
    const coupons: Coupon[] = [
      { id: 'cp-welcome', code: 'PROMO10', discountType: 'percentage', discountValue: 10, active: true, expiryDate: '2028-12-31' },
      { id: 'cp-freeship', code: 'FREE3000', discountType: 'fixed', discountValue: 150, minOrderValue: 3000, active: true, expiryDate: '2028-12-31' }
    ];
    for (const cp of coupons) {
      await setDoc(doc(db, COLL_COUPONS, cp.id), cp);
    }

    // 8. Seed Pages
    const pages: StaticPage[] = [
      { id: 'page-about', title: 'আমাদের সম্পর্কে (About Us)', slug: 'about', content: 'আমরা বাংলাদেশে সেরা কোয়ালিটির আসল গ্যাজেট এবং প্রিমিয়াম ইলেকট্রনিক্স গিয়ার সরবরাহ করে থাকি। আমাদের প্রতিটি প্রোডাক্ট কঠোরভাবে কোয়ালিটি যাচাই করে কাস্টমারের কাছে পাঠানো হয়।', active: true, createdAt: new Date().toISOString() },
      { id: 'page-shipping', title: 'ডেলিভারি ও রিটার্ন পলিসি', slug: 'shipping', content: 'আমরা সমগ্র বাংলাদেশে ডেলিভারি দিয়ে থাকি। ঢাকা সিটির ভেতরে ক্যাশ অন ডেলিভারি চার্জ ৮০ টাকা এবং সিটির বাইরে ১৫০ টাকা। কাস্টমার সন্তুষ্টি আমাদের প্রধান লক্ষ্য। কোনো প্রোডাক্টে ত্রুটি থাকলে আমরা ৭ দিনের রিটার্ন পলিসি প্রদান করি।', active: true, createdAt: new Date().toISOString() }
    ];
    for (const page of pages) {
      await setDoc(doc(db, COLL_PAGES, page.id), page);
    }

    // 9. Seed Menus
    const headerMenu: CustomMenu = {
      id: 'menu-header',
      title: 'Main Header Navigation',
      type: 'header',
      items: [
        { label: 'সকল প্রোডাক্ট', url: '/shop', order: 1 },
        { label: 'প্রিমিয়াম অডিও', url: '/shop/cat-audio', order: 2 },
        { label: 'অফিস ও ডেস্ক গিয়ার', url: '/shop/cat-desk', order: 3 },
        { label: 'স্মার্ট ওয়াচ', url: '/shop/cat-wearables', order: 4 }
      ]
    };
    await setDoc(doc(db, COLL_MENUS, headerMenu.id), headerMenu);

    // 10. Seed Notifications
    const seedNotification: SystemNotification = {
      id: 'notif-welcome',
      title: 'CMS সফলভাবে সেটআপ হয়েছে',
      message: 'আপনার বাংলাদেশী গ্যাজেট শপের সিএমএস রেডি। সেটিংস ওপেন করে পিনকোড ও পেমেন্ট নম্বর পরিবর্তন করুন।',
      type: 'inventory',
      read: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, COLL_NOTIFICATIONS, seedNotification.id), seedNotification);

    console.log('Seeding successfully completed!');
  } catch (error) {
    console.error('Seeding database failed:', error);
  }
}

// --- DB READS & WRITES ACTIONS ---

// System Settings
export async function getSystemSettings(): Promise<SystemSettings> {
  const docRef = doc(db, COLL_SETTINGS, 'config');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as SystemSettings;
  }
  // Return temporary default to prevent crashes before seed completes
  return {
    shopName: 'Aether Essentials',
    currency: '$',
    contactEmail: 'contact@aetherstore.com',
    contactPhone: '+1 (555) 893-4123',
    address: '100 Minimalist Parkway, SF',
    adminPin: '1234'
  };
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
  const docRef = doc(db, COLL_SETTINGS, 'config');
  await updateDoc(docRef, settings);
}

// Theme Configurations
export async function getThemeConfig(): Promise<ThemeConfig> {
  const docRef = doc(db, COLL_THEME, 'config');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as ThemeConfig;
  }
  return {
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    logoUrl: '',
    logoText: 'AETHER',
    heroTitle: 'Curated Premium Essentials',
    heroSubtitle: 'Elevate your daily workspace with refined gear built for elite performance.',
    heroBannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    darkMode: false
  };
}

export async function updateThemeConfig(theme: Partial<ThemeConfig>): Promise<void> {
  const docRef = doc(db, COLL_THEME, 'config');
  await updateDoc(docRef, theme);
}

// Products
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, COLL_PRODUCTS));
  const list: Product[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Product);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveProduct(product: Product): Promise<void> {
  await setDoc(doc(db, COLL_PRODUCTS, product.id), product);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, COLL_PRODUCTS, productId));
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, COLL_CATEGORIES));
  const list: Category[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Category);
  });
  return list;
}

export async function saveCategory(category: Category): Promise<void> {
  await setDoc(doc(db, COLL_CATEGORIES, category.id), category);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_CATEGORIES, id));
}

// Subcategories
export async function getSubcategories(): Promise<Subcategory[]> {
  const snap = await getDocs(collection(db, COLL_SUBCATEGORIES));
  const list: Subcategory[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Subcategory);
  });
  return list;
}

export async function saveSubcategory(sub: Subcategory): Promise<void> {
  await setDoc(doc(db, COLL_SUBCATEGORIES, sub.id), sub);
}

export async function deleteSubcategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_SUBCATEGORIES, id));
}

// Brands
export async function getBrands(): Promise<Brand[]> {
  const snap = await getDocs(collection(db, COLL_BRANDS));
  const list: Brand[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Brand);
  });
  return list;
}

export async function saveBrand(brand: Brand): Promise<void> {
  await setDoc(doc(db, COLL_BRANDS, brand.id), brand);
}

export async function deleteBrand(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_BRANDS, id));
}

// Coupons
export async function getCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db, COLL_COUPONS));
  const list: Coupon[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Coupon);
  });
  return list;
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  await setDoc(doc(db, COLL_COUPONS, coupon.id), coupon);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_COUPONS, id));
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(db, COLL_ORDERS));
  const list: Order[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Order);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, COLL_ORDERS, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Order;
  }
  return null;
}

export function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' ? cleanUndefined(item) : item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean = { ...obj } as any;
    Object.keys(clean).forEach(key => {
      if (clean[key] === undefined) {
        delete clean[key];
      } else if (typeof clean[key] === 'object' && clean[key] !== null) {
        clean[key] = cleanUndefined(clean[key]);
      }
    });
    return clean;
  }
  return obj;
}

export async function createOrder(order: Order): Promise<void> {
  const cleanedOrder = cleanUndefined(order);
  await setDoc(doc(db, COLL_ORDERS, order.id), cleanedOrder);
  
  // Decrement inventory for each item
  for (const item of order.items) {
    try {
      const prodRef = doc(db, COLL_PRODUCTS, item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prod = prodSnap.data() as Product;
        const newInv = Math.max(0, prod.inventory - item.quantity);
        await updateDoc(prodRef, { inventory: newInv });
      }
    } catch (e) {
      console.error('Error updating inventory for order item:', e);
    }
  }

  // Add system notification for new order
  const newNotif: SystemNotification = {
    id: 'notif-' + Date.now(),
    title: 'New Order Received',
    message: `Order ${order.id} placed by ${order.customerName} for a total of ${order.total.toFixed(2)}`,
    type: 'order',
    read: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_NOTIFICATIONS, newNotif.id), newNotif);

  // Send Telegram notification if configured and enabled
  try {
    const settings = await getSystemSettings();
    if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
      const token = settings.telegramBotToken.trim();
      const chatId = settings.telegramChatId.trim();
      
      let itemsList = '';
      for (const item of order.items) {
        itemsList += `- ${item.title} (${item.quantity}x) - ${settings.currency}${item.price * item.quantity}\n`;
      }
      
      const message = `🔔 *নতুন অর্ডার এসেছে!* (New Order)\n\n` +
        `📦 *অর্ডার আইডি:* \`${order.id}\`\n` +
        `👤 *গ্রাহক:* ${order.customerName}\n` +
        `📞 *ফোন:* ${order.customerPhone}\n` +
        `📍 *ঠিকানা:* ${order.address}\n` +
        `🏙️ *জেলা/থানা:* ${order.district || ''} / ${order.upazila || ''}\n\n` +
        `🛒 *পণ্য তালিকা:*\n${itemsList}\n` +
        `💵 *মোট মূল্য:* ${settings.currency}${order.total}\n` +
        `💳 *পেমেন্ট পদ্ধতি:* ${order.paymentMethod.toUpperCase()}\n` +
        (order.transactionId ? `📝 *Transaction ID:* \`${order.transactionId}\`\n` : '') +
        (order.senderNumber ? `📱 *Sender Phone:* ${order.senderNumber}\n` : '');

      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }
  } catch (err) {
    console.error('Failed to send Telegram bot notification:', err);
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status'], paymentStatus: Order['paymentStatus']): Promise<void> {
  const orderRef = doc(db, COLL_ORDERS, orderId);
  await updateDoc(orderRef, { status, paymentStatus });
}

// Pages
export async function getPages(): Promise<StaticPage[]> {
  const snap = await getDocs(collection(db, COLL_PAGES));
  const list: StaticPage[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as StaticPage);
  });
  return list;
}

export async function savePage(page: StaticPage): Promise<void> {
  await setDoc(doc(db, COLL_PAGES, page.id), page);
}

export async function deletePage(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_PAGES, id));
}

// Menus
export async function getMenus(): Promise<CustomMenu[]> {
  const snap = await getDocs(collection(db, COLL_MENUS));
  const list: CustomMenu[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as CustomMenu);
  });
  return list;
}

export async function saveMenu(menu: CustomMenu): Promise<void> {
  await setDoc(doc(db, COLL_MENUS, menu.id), menu);
}

// Reviews
export async function getReviews(productId?: string): Promise<Review[]> {
  let snap;
  if (productId) {
    const q = query(collection(db, COLL_REVIEWS), where('productId', '==', productId));
    snap = await getDocs(q);
  } else {
    snap = await getDocs(collection(db, COLL_REVIEWS));
  }
  const list: Review[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Review);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addReview(review: Review): Promise<void> {
  await setDoc(doc(db, COLL_REVIEWS, review.id), review);

  // Re-calculate rating & reviews count on product
  try {
    const prodRef = doc(db, COLL_PRODUCTS, review.productId);
    const prodSnap = await getDoc(prodRef);
    if (prodSnap.exists()) {
      const prod = prodSnap.data() as Product;
      const allReviews = await getReviews(review.productId);
      const activeReviews = allReviews.filter(r => r.active);
      const count = activeReviews.length;
      const sum = activeReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 5;

      await updateDoc(prodRef, {
        rating: avg,
        reviewsCount: count
      });
    }
  } catch (e) {
    console.error('Error updating product ratings with review:', e);
  }

  // Notify of review
  const notif: SystemNotification = {
    id: 'notif-' + Date.now(),
    title: 'New Product Review',
    message: `${review.rating}★ rating left by ${review.userName} for product ID: ${review.productId}`,
    type: 'review',
    read: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_NOTIFICATIONS, notif.id), notif);
}

export async function toggleReviewActive(reviewId: string, active: boolean): Promise<void> {
  const docRef = doc(db, COLL_REVIEWS, reviewId);
  await updateDoc(docRef, { active });
}

// Notifications
export async function getNotifications(): Promise<SystemNotification[]> {
  const snap = await getDocs(collection(db, COLL_NOTIFICATIONS));
  const list: SystemNotification[] = [];
  snap.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as SystemNotification);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  const docRef = doc(db, COLL_NOTIFICATIONS, notifId);
  await updateDoc(docRef, { read: true });
}

export async function deleteNotification(notifId: string): Promise<void> {
  await deleteDoc(doc(db, COLL_NOTIFICATIONS, notifId));
}

// --- analytics summaries ---
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const orders = await getOrders();
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const revenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
  
  // Custom mock base visitor count + real dynamic visitor multiplier
  const totalRevenue = revenue;
  const totalOrders = orders.length;
  const totalSales = paidOrders.length;
  const visitorCount = 428 + (orders.length * 7);

  return {
    totalSales,
    totalRevenue,
    totalOrders,
    visitorCount
  };
}
