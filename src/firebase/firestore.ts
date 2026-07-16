/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
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
  SeoConfig,
  ContactMessage,
  AuditLog,
  DeliveryArea
} from '../types';

// Generic Collections
export const COLL_SETTINGS = 'settings';
export const COLL_THEME = 'theme';
export const COLL_PRODUCTS = 'products';
export const COLL_CATEGORIES = 'categories';
export const COLL_SUBCATEGORIES = 'subcategories';
export const COLL_BRANDS = 'brands';
export const COLL_ORDERS = 'orders';
export const COLL_COUPONS = 'coupons';
export const COLL_REVIEWS = 'reviews';
export const COLL_PAGES = 'pages';
export const COLL_MENUS = 'menus';
export const COLL_NOTIFICATIONS = 'notifications';
export const COLL_SEO = 'seo';
export const COLL_CONTACT = 'contact';
export const COLL_LOGS = 'logs';
export const COLL_DELIVERY_AREAS = 'delivery_areas';

// --- GENERIC REALTIME SUBSCRIPTION UTILITIES ---

/**
 * Subscribes to a whole Firestore collection in real-time.
 */
export function subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void) {
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const list: T[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as any as T);
    });
    callback(list);
  }, (error) => {
    console.error(`Firestore real-time subscription error for collection [${collectionName}]:`, error);
  });
}

/**
 * Subscribes to a single Firestore document in real-time.
 */
export function subscribeDocument<T>(collectionName: string, docId: string, callback: (data: T | null) => void) {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as any as T);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Firestore real-time subscription error for document [${collectionName}/${docId}]:`, error);
  });
}


// --- 1. WEBSITE, SETTINGS & THEME CONFIGS ---

export function subscribeSystemSettings(callback: (settings: SystemSettings | null) => void) {
  return subscribeDocument<SystemSettings>(COLL_SETTINGS, 'config', callback);
}

export async function getSystemSettings(): Promise<SystemSettings | null> {
  const docRef = doc(db, COLL_SETTINGS, 'config');
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as SystemSettings) : null;
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
  const docRef = doc(db, COLL_SETTINGS, 'config');
  await setDoc(docRef, settings, { merge: true });
  await addAuditLog('SYSTEM_SETTINGS_UPDATE', 'System', 'Updated website global settings');
}

export function subscribeThemeConfig(callback: (theme: ThemeConfig | null) => void) {
  return subscribeDocument<ThemeConfig>(COLL_THEME, 'config', callback);
}

export async function getThemeConfig(): Promise<ThemeConfig | null> {
  const docRef = doc(db, COLL_THEME, 'config');
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as ThemeConfig) : null;
}

export async function updateThemeConfig(theme: Partial<ThemeConfig>): Promise<void> {
  const docRef = doc(db, COLL_THEME, 'config');
  await setDoc(docRef, theme, { merge: true });
  await addAuditLog('THEME_CONFIG_UPDATE', 'System', 'Updated storefront design assets and theme');
}


// --- 2. PRODUCTS, CATEGORIES, SUBCATEGORIES, BRANDS ---

export function subscribeProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, COLL_PRODUCTS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(list);
  });
}

export async function saveProduct(product: Product): Promise<void> {
  await setDoc(doc(db, COLL_PRODUCTS, product.id), product);
  await addAuditLog('PRODUCT_SAVE', 'Admin', `Saved product: ${product.title} (${product.sku})`);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, COLL_PRODUCTS, productId));
  await addAuditLog('PRODUCT_DELETE', 'Admin', `Deleted product ID: ${productId}`);
}

export function subscribeCategories(callback: (categories: Category[]) => void) {
  return subscribeCollection<Category>(COLL_CATEGORIES, callback);
}

export async function saveCategory(category: Category): Promise<void> {
  await setDoc(doc(db, COLL_CATEGORIES, category.id), category);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, COLL_CATEGORIES, categoryId));
}

export function subscribeSubcategories(callback: (subcategories: Subcategory[]) => void) {
  return subscribeCollection<Subcategory>(COLL_SUBCATEGORIES, callback);
}

export async function saveSubcategory(sub: Subcategory): Promise<void> {
  await setDoc(doc(db, COLL_SUBCATEGORIES, sub.id), sub);
}

export async function deleteSubcategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_SUBCATEGORIES, id));
}

export function subscribeBrands(callback: (brands: Brand[]) => void) {
  return subscribeCollection<Brand>(COLL_BRANDS, callback);
}

export async function saveBrand(brand: Brand): Promise<void> {
  await setDoc(doc(db, COLL_BRANDS, brand.id), brand);
}

export async function deleteBrand(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_BRANDS, id));
}


// --- 3. PAGES & MENUS ---

export function subscribePages(callback: (pages: StaticPage[]) => void) {
  return subscribeCollection<StaticPage>(COLL_PAGES, callback);
}

export async function savePage(page: StaticPage): Promise<void> {
  await setDoc(doc(db, COLL_PAGES, page.id), page);
}

export async function deletePage(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_PAGES, id));
}

export function subscribeMenus(callback: (menus: CustomMenu[]) => void) {
  return subscribeCollection<CustomMenu>(COLL_MENUS, callback);
}

export async function saveMenu(menu: CustomMenu): Promise<void> {
  await setDoc(doc(db, COLL_MENUS, menu.id), menu);
}


// --- 4. ORDERS, PAYMENTS & SHIPPING ---

export function subscribeOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, COLL_ORDERS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(list);
  });
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
  
  // Inventory Adjustment Batching / Transaction
  const batch = writeBatch(db);
  for (const item of order.items) {
    const prodRef = doc(db, COLL_PRODUCTS, item.productId);
    const prodSnap = await getDoc(prodRef);
    if (prodSnap.exists()) {
      const prod = prodSnap.data() as Product;
      const newInv = Math.max(0, prod.inventory - item.quantity);
      batch.update(prodRef, { inventory: newInv });
    }
  }
  await batch.commit();

  // Create alert notification
  const notificationId = 'notif-' + Date.now();
  const notif: SystemNotification = {
    id: notificationId,
    title: 'New Hardware Order Received',
    message: `Order ${order.id} placed by ${order.customerName} totals ${order.total.toFixed(2)}`,
    type: 'order',
    read: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_NOTIFICATIONS, notificationId), notif);
  await addAuditLog('ORDER_CREATE', 'System', `New Order ${order.id} verified and queued.`);
}

export async function updateOrderStatus(orderId: string, status: Order['status'], paymentStatus: Order['paymentStatus']): Promise<void> {
  const orderRef = doc(db, COLL_ORDERS, orderId);
  await updateDoc(orderRef, { status, paymentStatus });
  await addAuditLog('ORDER_STATUS_UPDATE', 'Admin', `Order ${orderId} updated to Status: ${status}, Payment: ${paymentStatus}`);
}


// --- 5. REVIEWS & COUPONS ---

export function subscribeReviews(productId: string | null, callback: (reviews: Review[]) => void) {
  let q = query(collection(db, COLL_REVIEWS), orderBy('createdAt', 'desc'));
  if (productId) {
    q = query(collection(db, COLL_REVIEWS), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    const list: Review[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Review);
    });
    callback(list);
  });
}

export async function addReview(review: Review): Promise<void> {
  await setDoc(doc(db, COLL_REVIEWS, review.id), review);
  
  // Re-calculate the product rating average
  const prodRef = doc(db, COLL_PRODUCTS, review.productId);
  const prodSnap = await getDoc(prodRef);
  if (prodSnap.exists()) {
    const q = query(collection(db, COLL_REVIEWS), where('productId', '==', review.productId));
    const allReviewsSnap = await getDocs(q);
    const list: Review[] = [];
    allReviewsSnap.forEach((d) => {
      const rev = d.data() as Review;
      if (rev.active) list.push(rev);
    });
    
    const count = list.length;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 5;
    
    await updateDoc(prodRef, {
      rating: avg,
      reviewsCount: count
    });
  }

  // Log and Notify
  const notificationId = 'notif-' + Date.now();
  const notif: SystemNotification = {
    id: notificationId,
    title: 'New Critique Logged',
    message: `${review.rating} Star left by ${review.userName}`,
    type: 'review',
    read: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_NOTIFICATIONS, notificationId), notif);
}

export function subscribeCoupons(callback: (coupons: Coupon[]) => void) {
  return subscribeCollection<Coupon>(COLL_COUPONS, callback);
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  await setDoc(doc(db, COLL_COUPONS, coupon.id), coupon);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_COUPONS, id));
}


// --- 6. NOTIFICATIONS, SEO & CONTACT ---

export function subscribeNotifications(callback: (notifications: SystemNotification[]) => void) {
  const q = query(collection(db, COLL_NOTIFICATIONS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: SystemNotification[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as SystemNotification);
    });
    callback(list);
  });
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, COLL_NOTIFICATIONS, notifId), { read: true });
}

export async function deleteNotification(notifId: string): Promise<void> {
  await deleteDoc(doc(db, COLL_NOTIFICATIONS, notifId));
}

export function subscribeSeoConfig(callback: (seo: SeoConfig[]) => void) {
  return subscribeCollection<SeoConfig>(COLL_SEO, callback);
}

export async function saveSeoConfig(seo: SeoConfig): Promise<void> {
  await setDoc(doc(db, COLL_SEO, seo.id), seo);
}

export function subscribeContactMessages(callback: (messages: ContactMessage[]) => void) {
  const q = query(collection(db, COLL_CONTACT), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: ContactMessage[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ContactMessage);
    });
    callback(list);
  });
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  await setDoc(doc(db, COLL_CONTACT, msg.id), msg);
  
  // Push Notification for new Message
  const notificationId = 'notif-' + Date.now();
  const notif: SystemNotification = {
    id: notificationId,
    title: 'New Client Inquiry',
    message: `${msg.name}: ${msg.subject}`,
    type: 'contact',
    read: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_NOTIFICATIONS, notificationId), notif);
}


// --- 7. AUDIT LOGGING ---

export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const q = query(collection(db, COLL_LOGS), orderBy('createdAt', 'desc'), limit(150));
  return onSnapshot(q, (snapshot) => {
    const list: AuditLog[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as AuditLog);
    });
    callback(list);
  });
}

export async function addAuditLog(action: string, user: string, details: string): Promise<void> {
  const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const log: AuditLog = {
    id: logId,
    action,
    user,
    details,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLL_LOGS, logId), log);
}

// --- 8. DELIVERY MANAGEMENT SYSTEM ---

export function subscribeDeliveryAreas(callback: (areas: DeliveryArea[]) => void) {
  return subscribeCollection<DeliveryArea>(COLL_DELIVERY_AREAS, callback);
}

export async function saveDeliveryArea(area: DeliveryArea): Promise<void> {
  await setDoc(doc(db, COLL_DELIVERY_AREAS, area.id), area);
  await addAuditLog('DELIVERY_AREA_SAVE', 'Admin', `Saved delivery area: ${area.district} -> ${area.upazila} -> ${area.area}`);
}

export async function deleteDeliveryArea(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL_DELIVERY_AREAS, id));
  await addAuditLog('DELIVERY_AREA_DELETE', 'Admin', `Deleted delivery area ID: ${id}`);
}
