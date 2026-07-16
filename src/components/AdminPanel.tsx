/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ShoppingBag, FolderHeart, Coins, MessageSquare, Palette, Settings, Bell, LogOut,
  Plus, Trash2, Edit, Check, AlertTriangle, PackageOpen, RefreshCw, Eye, Tag, Users, DollarSign, ListOrdered, CheckCircle,
  Search, Menu, X, Calendar, Sun, Moon, ChevronLeft, ChevronRight, Info, ShieldCheck, Download, Sparkles, MapPin
} from 'lucide-react';
import {
  Product, Category, Subcategory, Order, Coupon, Review, ThemeConfig, SystemSettings, SystemNotification, AnalyticsSummary, DeliveryArea
} from '../types';
import {
  saveProduct, deleteProduct,
  saveCategory, deleteCategory,
  updateOrderStatus,
  saveCoupon, deleteCoupon,
  toggleReviewActive,
  addReview,
  markNotificationAsRead, deleteNotification,
  updateSystemSettings, updateThemeConfig
} from '../services/db';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeOrders,
  subscribeCoupons,
  subscribeReviews,
  subscribeNotifications,
  subscribeDeliveryAreas,
  saveDeliveryArea,
  deleteDeliveryArea
} from '../firebase/firestore';

// Helper to extract image source from HTML string (like ImgBB or PostImg embed codes) or return original link
export function parseEmbedOrImageUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  // If it's HTML, extract src or href
  if (trimmed.startsWith('<') || trimmed.includes('<img') || trimmed.includes('<a') || trimmed.includes('src=')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1].trim();
    }
    const hrefMatch = trimmed.match(/href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1].trim();
    }
  }
  return trimmed;
}

interface AdminPanelProps {
  theme: ThemeConfig;
  settings: SystemSettings;
  onExitAdmin: () => void;
  onRefreshApp: () => void; // Trigger root component to reload state
}

type AdminTab = 'dashboard' | 'products' | 'categories' | 'delivery' | 'orders' | 'coupons' | 'reviews' | 'theme' | 'settings' | 'notifications';

export default function AdminPanel({
  theme,
  settings,
  onExitAdmin,
  onRefreshApp
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Loaded database states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [actionToasts, setActionToasts] = useState<{ id: string; type: 'success' | 'error'; message: string }[]>([]);

  const showSuccessToast = (msg: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setActionToasts(prev => [...prev, { id, type: 'success', message: msg }]);
    setTimeout(() => {
      setActionToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const showErrorToast = (msg: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setActionToasts(prev => [...prev, { id, type: 'error', message: msg }]);
    setTimeout(() => {
      setActionToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // --- FORM STATES ---
  // Product Form (Edit or Create)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodSKU, setProdSKU] = useState('');
  const [prodInventory, setProdInventory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImages, setProdImages] = useState(''); // comma-separated strings
  const [prodImageFields, setProdImageFields] = useState<string[]>(['']);
  const [prodColors, setProdColors] = useState<string[]>([]);
  const [prodCategory, setProdCategory] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);

  // Category Form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Coupon Form
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'percentage' | 'fixed'>('percentage');
  const [cpValue, setCpValue] = useState('');
  const [cpMinOrder, setCpMinOrder] = useState('');

  // Theme customizer forms
  const [themePrimary, setThemePrimary] = useState(theme.primaryColor);
  const [themeSecondary, setThemeSecondary] = useState(theme.secondaryColor);
  const [themeAccent, setThemeAccent] = useState(theme.accentColor);
  const [themeFont, setThemeFont] = useState(theme.fontFamily);
  const [themeLogoText, setThemeLogoText] = useState(theme.logoText);
  const [themeLogoUrl, setThemeLogoUrl] = useState(theme.logoUrl);
  const [themeHeroTitle, setThemeHeroTitle] = useState(theme.heroTitle);
  const [themeHeroSubtitle, setThemeHeroSubtitle] = useState(theme.heroSubtitle);
  const [themeHeroBannerUrl, setThemeHeroBannerUrl] = useState(theme.heroBannerUrl);
  const [themeBannerSlides, setThemeBannerSlides] = useState(theme.bannerSlides ? theme.bannerSlides.join(', ') : '');

  // 3 Feature/Philosophy cards states
  const [feature1TitleEn, setFeature1TitleEn] = useState(theme.feature1TitleEn || '');
  const [feature1TitleBn, setFeature1TitleBn] = useState(theme.feature1TitleBn || '');
  const [feature1DescEn, setFeature1DescEn] = useState(theme.feature1DescEn || '');
  const [feature1DescBn, setFeature1DescBn] = useState(theme.feature1DescBn || '');

  const [feature2TitleEn, setFeature2TitleEn] = useState(theme.feature2TitleEn || '');
  const [feature2TitleBn, setFeature2TitleBn] = useState(theme.feature2TitleBn || '');
  const [feature2DescEn, setFeature2DescEn] = useState(theme.feature2DescEn || '');
  const [feature2DescBn, setFeature2DescBn] = useState(theme.feature2DescBn || '');

  const [feature3TitleEn, setFeature3TitleEn] = useState(theme.feature3TitleEn || '');
  const [feature3TitleBn, setFeature3TitleBn] = useState(theme.feature3TitleBn || '');
  const [feature3DescEn, setFeature3DescEn] = useState(theme.feature3DescEn || '');
  const [feature3DescBn, setFeature3DescBn] = useState(theme.feature3DescBn || '');

  // Store Settings forms
  const [setShopName, setSetShopName] = useState(settings.shopName);
  const [setCurrency, setSetCurrency] = useState(settings.currency);
  const [setContactEmail, setSetContactEmail] = useState(settings.contactEmail);
  const [setContactPhone, setSetContactPhone] = useState(settings.contactPhone);
  const [setAddress, setSetAddress] = useState(settings.address);
  const [setPin, setSetPin] = useState(settings.adminPin);
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled === true);

  // Bangladesh payments & shipping configurations
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber || '');
  const [bkashType, setBkashType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings.bkashType || 'Personal');
  const [bkashEnabled, setBkashEnabled] = useState(settings.bkashEnabled !== false);
  const [bkashInstruction, setBkashInstruction] = useState(settings.bkashInstruction || '');

  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber || '');
  const [nagadType, setNagadType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings.nagadType || 'Personal');
  const [nagadEnabled, setNagadEnabled] = useState(settings.nagadEnabled !== false);
  const [nagadInstruction, setNagadInstruction] = useState(settings.nagadInstruction || '');

  const [rocketNumber, setRocketNumber] = useState(settings.rocketNumber || '');
  const [rocketType, setRocketType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings.rocketType || 'Personal');
  const [rocketEnabled, setRocketEnabled] = useState(settings.rocketEnabled === true);
  const [rocketInstruction, setRocketInstruction] = useState(settings.rocketInstruction || '');

  const [codEnabled, setCodEnabled] = useState(settings.codEnabled !== false);
  const [codInstruction, setCodInstruction] = useState(settings.codInstruction || '');

  const [shippingInside, setShippingInside] = useState(String(settings.shippingInsideDistrict ?? 80));
  const [shippingOutside, setShippingOutside] = useState(String(settings.shippingOutsideDistrict ?? 150));
  const [shippingFreeMin, setShippingFreeMin] = useState(String(settings.freeShippingMinAmount ?? 3000));
  const [codFee, setCodFee] = useState(String(settings.codFee ?? 0));
  const [shippingDeliveryTime, setShippingDeliveryTime] = useState(settings.shippingDeliveryTime || '');

  // Social Links & Live Support Settings
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || '');
  const [supportNumber, setSupportNumber] = useState(settings.supportNumber || '');
  const [supportWhatsapp, setSupportWhatsapp] = useState(settings.supportWhatsapp || '');
  const [defaultLanguage, setDefaultLanguage] = useState<'bn' | 'en'>(settings.defaultLanguage || 'bn');

  // UI Redesign States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminThemeMode, setAdminThemeMode] = useState<'dark' | 'light'>('dark');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Delivery Management States
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [areaDistrict, setAreaDistrict] = useState('');
  const [areaUpazila, setAreaUpazila] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaCharge, setAreaCharge] = useState('80');
  const [areaCod, setAreaCod] = useState(true);
  const [areaEnabled, setAreaEnabled] = useState(true);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');

  // Fake Review creation form states
  const [fakeReviewProductId, setFakeReviewProductId] = useState('');
  const [fakeReviewUserName, setFakeReviewUserName] = useState('');
  const [fakeReviewRating, setFakeReviewRating] = useState(5);
  const [fakeReviewComment, setFakeReviewComment] = useState('');
  const [fakeReviewIsSubmitting, setFakeReviewIsSubmitting] = useState(false);
  const [fakeReviewSuccess, setFakeReviewSuccess] = useState('');
  const [fakeReviewError, setFakeReviewError] = useState('');

  // Real-time Order Toast Notifications States
  interface NewOrderToast {
    id: string;
    customerName: string;
    total: number;
    timestamp: number;
  }
  const [toasts, setToasts] = useState<NewOrderToast[]>([]);
  const lastOrderIds = useRef<Set<string>>(new Set());
  const isFirstOrderLoad = useRef(true);

  // Dynamic real-time analytics summary computed from active orders
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
  const analyticsSummary: AnalyticsSummary = {
    totalSales: paidOrders.length,
    totalRevenue: totalRevenue,
    totalOrders: orders.length,
    visitorCount: 428 + (orders.length * 7)
  };

  // Setup real-time listeners for all cloud resources
  useEffect(() => {
    setIsLoading(true);

    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
      setIsLoading(false);
    });

    const unsubCategories = subscribeCategories((data) => {
      setCategories(data);
    });

    const unsubOrders = subscribeOrders((data) => {
      setOrders(data);
    });

    const unsubCoupons = subscribeCoupons((data) => {
      setCoupons(data);
    });

    const unsubReviews = subscribeReviews(null, (data) => {
      setReviews(data);
    });

    const unsubNotifications = subscribeNotifications((data) => {
      setNotifications(data);
    });

    const unsubAreas = subscribeDeliveryAreas((data) => {
      setDeliveryAreas(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubCoupons();
      unsubReviews();
      unsubNotifications();
      unsubAreas();
    };
  }, []);

  // Realtime order toast checker
  useEffect(() => {
    if (orders.length === 0) return;

    if (isFirstOrderLoad.current) {
      lastOrderIds.current = new Set(orders.map(o => o.id));
      isFirstOrderLoad.current = false;
    } else {
      const newOrders = orders.filter(o => !lastOrderIds.current.has(o.id));
      if (newOrders.length > 0) {
        newOrders.forEach(o => {
          // Play sound
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
              const ctx = new AudioContext();
              const now = ctx.currentTime;
              
              // Ding
              const osc1 = ctx.createOscillator();
              const gain1 = ctx.createGain();
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(880, now);
              gain1.gain.setValueAtTime(0.2, now);
              gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
              osc1.connect(gain1);
              gain1.connect(ctx.destination);
              osc1.start(now);
              osc1.stop(now + 0.8);

              // Dong
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(659.25, now + 0.12);
              gain2.gain.setValueAtTime(0.15, now + 0.12);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.start(now + 0.12);
              osc2.stop(now + 1.0);
            }
          } catch (_) {}

          // Add toast
          const newToast: NewOrderToast = {
            id: o.id,
            customerName: o.customerName,
            total: o.total,
            timestamp: Date.now()
          };
          setToasts(prev => [newToast, ...prev].slice(0, 5));
          
          // Add to seen IDs
          lastOrderIds.current.add(o.id);
        });
      }
    }
  }, [orders]);

  const clearMessages = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  // --- ACTIONS: PRODUCTS ---
  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdPrice(prod.price.toString());
    setProdComparePrice(prod.compareAtPrice ? prod.compareAtPrice.toString() : '');
    setProdSKU(prod.sku);
    setProdInventory(prod.inventory.toString());
    setProdDesc(prod.description);
    setProdImages(prod.images.join(', '));
    setProdImageFields(prod.images && prod.images.length > 0 ? [...prod.images] : ['']);
    setProdColors(prod.colors && prod.colors.length > 0 ? [...prod.colors] : []);
    setProdCategory(prod.categoryId);
    setProdFeatured(prod.isFeatured);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProductForm = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdPrice('');
    setProdComparePrice('');
    setProdSKU('');
    setProdInventory('');
    setProdDesc('');
    setProdImages('');
    setProdImageFields(['']);
    setProdColors([]);
    setProdCategory(categories[0]?.id || '');
    setProdFeatured(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!prodTitle || !prodPrice || !prodSKU || !prodInventory || !prodCategory) {
      setErrorMsg('Please populate all mandatory product specifications.');
      return;
    }

    setIsActionLoading(true);
    try {
      // Parse images from multiple image fields using parseEmbedOrImageUrl
      let imgArray = prodImageFields
        .map(url => parseEmbedOrImageUrl(url))
        .filter(url => url.length > 0);

      // Fallback to prodImages comma separated field if multi-fields list is empty
      if (imgArray.length === 0 && prodImages) {
        imgArray = prodImages
          .split(',')
          .map(url => parseEmbedOrImageUrl(url))
          .filter(url => url.length > 0);
      }

      // Default visual if no image supplied
      if (imgArray.length === 0) {
        imgArray.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800');
      }

      const prodSlug = prodTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const prodId = editingProduct ? editingProduct.id : 'prod-' + Date.now();

      const savedProduct: Product = {
        id: prodId,
        title: prodTitle.trim(),
        slug: prodSlug,
        description: prodDesc.trim(),
        price: Number(prodPrice),
        compareAtPrice: prodComparePrice ? Number(prodComparePrice) : undefined,
        images: imgArray,
        colors: prodColors.map(c => c.trim()).filter(c => c.length > 0),
        categoryId: prodCategory,
        inventory: Math.floor(Number(prodInventory)),
        sku: prodSKU.toUpperCase().trim(),
        isFeatured: prodFeatured,
        rating: editingProduct ? editingProduct.rating : 5,
        reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      await saveProduct(savedProduct);
      setSuccessMsg(`Product "${savedProduct.title}" successfully saved!`);
      showSuccessToast(`Product "${savedProduct.title}" successfully saved!`);
      handleResetProductForm();
      onRefreshApp(); // trigger catalog refresh
    } catch (e: any) {
      console.error("Firebase Error in handleSaveProduct:", e);
      setErrorMsg(e?.message || 'Failed to save product specification.');
      showErrorToast(e?.message || 'Failed to save product specification.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProductClick = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product?')) return;
    clearMessages();
    setIsActionLoading(true);
    try {
      await deleteProduct(id);
      setSuccessMsg('Product specification deleted successfully.');
      showSuccessToast('Product specification deleted successfully.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleDeleteProduct:", e);
      setErrorMsg(e?.message || 'Failed to delete product.');
      showErrorToast(e?.message || 'Failed to delete product.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: CATEGORIES ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!catName.trim()) return;

    setIsActionLoading(true);
    try {
      const id = 'cat-' + catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: Category = {
        id,
        name: catName.trim(),
        slug: id,
        description: catDesc.trim()
      };

      await saveCategory(newCat);
      setCatName('');
      setCatDesc('');
      setSuccessMsg('Category successfully added.');
      showSuccessToast('Category successfully added.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleSaveCategory:", e);
      setErrorMsg(e?.message || 'Failed to save category.');
      showErrorToast(e?.message || 'Failed to save category.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCategoryClick = async (id: string) => {
    if (!window.confirm('Delete this category? All catalog products under this category remains.')) return;
    clearMessages();
    setIsActionLoading(true);
    try {
      await deleteCategory(id);
      setSuccessMsg('Category deleted successfully.');
      showSuccessToast('Category deleted successfully.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleDeleteCategoryClick:", e);
      setErrorMsg(e?.message || 'Failed to delete category.');
      showErrorToast(e?.message || 'Failed to delete category.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: DELIVERY ZONES ---
  const handleSaveDeliveryArea = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!areaDistrict.trim() || !areaUpazila.trim() || !areaName.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsActionLoading(true);
    try {
      const areaId = editingArea?.id || 'zone-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const newArea: DeliveryArea = {
        id: areaId,
        district: areaDistrict.trim(),
        upazila: areaUpazila.trim(),
        area: areaName.trim(),
        deliveryCharge: Number(areaCharge) || 0,
        codEnabled: areaCod,
        enabled: areaEnabled
      };

      await saveDeliveryArea(newArea);
      setAreaDistrict('');
      setAreaUpazila('');
      setAreaName('');
      setAreaCharge('80');
      setAreaCod(true);
      setAreaEnabled(true);
      setEditingArea(null);
      setSuccessMsg(editingArea ? 'Delivery Area successfully updated.' : 'Delivery Area successfully created.');
      showSuccessToast(editingArea ? 'Delivery Area successfully updated.' : 'Delivery Area successfully created.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleSaveDeliveryArea:", e);
      setErrorMsg(e?.message || 'Failed to save delivery area.');
      showErrorToast(e?.message || 'Failed to save delivery area.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDeliveryArea = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivery area?')) return;
    clearMessages();
    setIsActionLoading(true);
    try {
      await deleteDeliveryArea(id);
      setSuccessMsg('Delivery Area deleted successfully.');
      showSuccessToast('Delivery Area deleted successfully.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleDeleteDeliveryArea:", e);
      setErrorMsg(e?.message || 'Failed to delete delivery area.');
      showErrorToast(e?.message || 'Failed to delete delivery area.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: ORDERS ---
  const handleUpdateOrderStatus = async (orderId: string, currentOrder: Order, newStatus: Order['status']) => {
    clearMessages();
    setIsActionLoading(true);
    try {
      // Automatic payment match on shipped/delivered
      const newPaymentStatus: Order['paymentStatus'] = 
        newStatus === 'shipped' || newStatus === 'delivered' ? 'paid' : currentOrder.paymentStatus;
        
      await updateOrderStatus(orderId, newStatus, newPaymentStatus);
      setSuccessMsg(`Order ${orderId} updated to "${newStatus}"!`);
      showSuccessToast(`Order ${orderId} updated to "${newStatus}"!`);
    } catch (e: any) {
      console.error("Firebase Error in handleUpdateOrderStatus:", e);
      setErrorMsg(e?.message || 'Failed to update order status.');
      showErrorToast(e?.message || 'Failed to update order status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: COUPONS ---
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!cpCode || !cpValue) return;

    setIsActionLoading(true);
    try {
      const newCoupon: Coupon = {
        id: 'cp-' + cpCode.toLowerCase().trim(),
        code: cpCode.toUpperCase().trim(),
        discountType: cpType,
        discountValue: Number(cpValue),
        minOrderValue: cpMinOrder ? Number(cpMinOrder) : undefined,
        active: true,
        expiryDate: '2028-12-31'
      };

      await saveCoupon(newCoupon);
      setCpCode('');
      setCpValue('');
      setCpMinOrder('');
      setSuccessMsg(`Coupon "${newCoupon.code}" added successfully.`);
      showSuccessToast(`Coupon "${newCoupon.code}" added successfully.`);
    } catch (e: any) {
      console.error("Firebase Error in handleSaveCoupon:", e);
      setErrorMsg(e?.message || 'Failed to save coupon.');
      showErrorToast(e?.message || 'Failed to save coupon.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCouponClick = async (id: string) => {
    clearMessages();
    setIsActionLoading(true);
    try {
      await deleteCoupon(id);
      setSuccessMsg('Discount coupon deactivated.');
      showSuccessToast('Discount coupon deactivated.');
    } catch (e: any) {
      console.error("Firebase Error in handleDeleteCouponClick:", e);
      setErrorMsg(e?.message || 'Failed to delete coupon.');
      showErrorToast(e?.message || 'Failed to delete coupon.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: REVIEWS ---
  const handleToggleReview = async (id: string, currentActive: boolean) => {
    clearMessages();
    setIsActionLoading(true);
    try {
      await toggleReviewActive(id, !currentActive);
      setSuccessMsg('Review approval status updated.');
      showSuccessToast('Review approval status updated.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleToggleReview:", e);
      setErrorMsg(e?.message || 'Failed to moderate review.');
      showErrorToast(e?.message || 'Failed to moderate review.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddFakeReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFakeReviewError('');
    setFakeReviewSuccess('');

    if (!fakeReviewProductId) {
      setFakeReviewError('Please select a product first.');
      return;
    }
    if (!fakeReviewUserName.trim()) {
      setFakeReviewError('Please enter a customer name.');
      return;
    }
    if (!fakeReviewComment.trim()) {
      setFakeReviewError('Please write review feedback.');
      return;
    }

    setFakeReviewIsSubmitting(true);
    try {
      const generatedEmail = `user_${Date.now()}@fakedonor.com`;
      const newReview: Review = {
        id: 'rev-' + Date.now(),
        productId: fakeReviewProductId,
        userName: fakeReviewUserName.trim(),
        userEmail: generatedEmail,
        rating: fakeReviewRating,
        comment: fakeReviewComment.trim(),
        active: true,
        createdAt: new Date().toISOString()
      };

      await addReview(newReview);
      setFakeReviewSuccess('Review created and ratings synchronized successfully!');
      showSuccessToast('Review created successfully!');
      
      // Reset form fields
      setFakeReviewUserName('');
      setFakeReviewComment('');
      setFakeReviewRating(5);
      
      // Trigger update
      onRefreshApp();
    } catch (err: any) {
      console.error("Firebase Error in handleAddFakeReview:", err);
      setFakeReviewError(err?.message || 'Failed to create fake review.');
      showErrorToast(err?.message || 'Failed to create fake review.');
    } finally {
      setFakeReviewIsSubmitting(false);
    }
  };

  // --- ACTIONS: THEME DESIGN ---
  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsActionLoading(true);
    try {
      const slidesArray = themeBannerSlides
        .split(',')
        .map(url => parseEmbedOrImageUrl(url.trim()))
        .filter(url => url.length > 0);

      const updatedTheme: ThemeConfig = {
        primaryColor: themePrimary,
        secondaryColor: themeSecondary,
        accentColor: themeAccent,
        fontFamily: themeFont,
        logoText: themeLogoText,
        logoUrl: themeLogoUrl,
        heroTitle: themeHeroTitle,
        heroSubtitle: themeHeroSubtitle,
        heroBannerUrl: themeHeroBannerUrl,
        darkMode: theme.darkMode,
        bannerSlides: slidesArray,
        
        feature1TitleEn,
        feature1TitleBn,
        feature1DescEn,
        feature1DescBn,

        feature2TitleEn,
        feature2TitleBn,
        feature2DescEn,
        feature2DescBn,

        feature3TitleEn,
        feature3TitleBn,
        feature3DescEn,
        feature3DescBn
      };

      await updateThemeConfig(updatedTheme);
      setSuccessMsg('Visual Theme successfully customized! Refreshing storefront layouts.');
      showSuccessToast('Visual Theme successfully customized!');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleSaveTheme:", e);
      setErrorMsg(e?.message || 'Failed to update theme configuration.');
      showErrorToast(e?.message || 'Failed to update theme configuration.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsActionLoading(true);
    try {
      const updatedSettings: SystemSettings = {
        shopName: setShopName,
        currency: setCurrency,
        contactEmail: setContactEmail,
        contactPhone: setContactPhone,
        address: setAddress,
        adminPin: setPin,
        bkashNumber,
        bkashType,
        bkashEnabled,
        bkashInstruction,
        nagadNumber,
        nagadType,
        nagadEnabled,
        nagadInstruction,
        rocketNumber,
        rocketType,
        rocketEnabled,
        rocketInstruction,
        codEnabled,
        codInstruction,
        shippingInsideDistrict: Number(shippingInside) || 0,
        shippingOutsideDistrict: Number(shippingOutside) || 0,
        freeShippingMinAmount: Number(shippingFreeMin) || 0,
        codFee: Number(codFee) || 0,
        shippingDeliveryTime,
        telegramBotToken,
        telegramChatId,
        telegramEnabled,
        facebookUrl,
        instagramUrl,
        youtubeUrl,
        tiktokUrl,
        supportNumber,
        supportWhatsapp,
        defaultLanguage
      };

      await updateSystemSettings(updatedSettings);
      setSuccessMsg('Bangladesh Localization & System parameters saved successfully.');
      showSuccessToast('Settings saved successfully.');
      onRefreshApp();
    } catch (e: any) {
      console.error("Firebase Error in handleSaveSettings:", e);
      setErrorMsg(e?.message || 'Failed to update system settings.');
      showErrorToast(e?.message || 'Failed to update system settings.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ACTIONS: ALERTS & NOTIFICATIONS ---
  const handleMarkNotification = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (e) {
      console.error(e);
    }
  };

  // Get human-readable date
  const [currentDateTime, setCurrentDateTime] = useState('');
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) + ' ' + now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'products' as AdminTab, label: 'Products', icon: ShoppingBag, category: 'Catalog' },
    { id: 'categories' as AdminTab, label: 'Categories', icon: FolderHeart, category: 'Catalog' },
    { id: 'delivery' as AdminTab, label: 'Delivery Zones', icon: MapPin, category: 'Catalog' },
    { id: 'orders' as AdminTab, label: 'Orders & Sales', icon: ListOrdered, category: 'Transactions' },
    { id: 'coupons' as AdminTab, label: 'Promo Coupons', icon: Tag, category: 'Marketing' },
    { id: 'reviews' as AdminTab, label: 'Reviews Feed', icon: MessageSquare, category: 'Feedback' },
    { id: 'theme' as AdminTab, label: 'Visual Theme', icon: Palette, category: 'Appearance' },
    { id: 'settings' as AdminTab, label: 'Store Config', icon: Settings, category: 'System' },
    { id: 'notifications' as AdminTab, label: 'Notifications', icon: Bell, category: 'System', badge: notifications.filter(n => !n.read).length }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none text-left transition-colors duration-300 ${
      adminThemeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Bar Navigation */}
      <header className={`h-16 border-b flex items-center justify-between px-4 md:px-6 transition-colors duration-200 z-30 sticky top-0 backdrop-blur-md ${
        adminThemeMode === 'dark' 
          ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu Mobile */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-xs md:text-sm font-bold tracking-wider uppercase text-emerald-500">
              {settings.shopName || 'Store Admin'}
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono border border-emerald-900/30">
            SECURE ACCESS
          </span>
        </div>

        {/* Global Search and Shortcuts Topbar */}
        <div className="hidden md:flex items-center space-x-4 max-w-md flex-1 mx-4">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-full pl-9 pr-4 py-1.5 transition-all outline-hidden border ${
                adminThemeMode === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Top bar Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="hidden lg:inline-block text-xs font-mono text-slate-400">
            {currentDateTime}
          </span>

          {/* Quick theme toggle */}
          <button
            onClick={() => setAdminThemeMode(adminThemeMode === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              adminThemeMode === 'dark' ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Console Theme"
          >
            {adminThemeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Unread Alert badge */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              adminThemeMode === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-2xs font-bold font-mono uppercase transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lock Session</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Dashboard Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Control Sidebar Panel - Collapsible & Glass */}
        <aside className={`hidden md:flex flex-col transition-all duration-300 border-r flex-shrink-0 relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          adminThemeMode === 'dark' 
            ? 'bg-slate-900 border-slate-850' 
            : 'bg-white border-slate-200'
        }`}>
          {/* Collapse toggle arrow */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute top-3 -right-3 h-6 w-6 rounded-full border flex items-center justify-center cursor-pointer shadow-sm z-20 ${
              adminThemeMode === 'dark' 
                ? 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Category group filters */}
              {['Overview', 'Catalog', 'Transactions', 'Marketing', 'Appearance', 'System'].map((cat) => {
                const groupItems = menuItems.filter(item => item.category === cat);
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    {!sidebarCollapsed && (
                      <div className="px-3 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                          {cat}
                        </span>
                      </div>
                    )}
                    {groupItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            sidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
                          } ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md'
                              : adminThemeMode === 'dark'
                                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <IconComponent className="h-4.5 w-4.5 flex-shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                          {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Sidebar bottom indicator */}
            {!sidebarCollapsed && (
              <div className={`mt-6 p-3 rounded-lg border text-center ${
                adminThemeMode === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-[9px] font-mono text-slate-500">AETHER ADMIN SECURITY</p>
                <p className="text-[8px] font-mono text-emerald-500 mt-0.5">● CONTROL CONSOLE ACTIVE</p>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-over Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            />

            {/* Drawer Content */}
            <div className={`relative flex-1 flex flex-col max-w-xs w-full p-4 transition-transform duration-300 ${
              adminThemeMode === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/40 mb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                  {settings.shopName}
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSearchQuery('');
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : adminThemeMode === 'dark'
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Right Active Room Screen */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-200 ${
          adminThemeMode === 'dark' ? 'bg-slate-950/60' : 'bg-slate-100'
        }`}>
          {/* Mobile Global Search bar inside main on small screens */}
          <div className="md:hidden mb-4">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder={`Search in ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs rounded-lg pl-9 pr-4 py-2 transition-all outline-hidden border ${
                  adminThemeMode === 'dark' 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-emerald-600' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>
          
          {/* Messages Alerts feedback */}
          {successMsg && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-400 flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-950/40 border border-red-800/40 p-4 text-xs font-semibold text-red-400 flex items-center space-x-2 animate-in fade-in">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-400 font-mono">Synchronizing database nodes...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Overview Dashboard</h2>
                    <span className="text-2xs font-mono text-gray-400 uppercase">Updated real-time</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 space-y-3 cursor-pointer ${
                      adminThemeMode === 'dark'
                        ? 'bg-slate-900/40 border-slate-850 text-slate-100 hover:border-emerald-500/30 shadow-lg'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/30 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Gross Revenue</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                          <DollarSign className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold font-mono tracking-tight text-emerald-500">
                          {settings.currency || '৳'}{(analytics?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">Dynamic tracker active</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 space-y-3 cursor-pointer ${
                      adminThemeMode === 'dark'
                        ? 'bg-slate-900/40 border-slate-850 text-slate-100 hover:border-emerald-500/30 shadow-lg'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/30 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Sales Transactions</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold font-mono tracking-tight text-blue-500">
                          {analytics?.totalSales || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">100% credit cleared</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 space-y-3 cursor-pointer ${
                      adminThemeMode === 'dark'
                        ? 'bg-slate-900/40 border-slate-850 text-slate-100 hover:border-emerald-500/30 shadow-lg'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/30 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Orders Logged</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                          <ListOrdered className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold font-mono tracking-tight text-amber-500">
                          {analytics?.totalOrders || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono font-sans">Fulfillment registers</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 space-y-3 cursor-pointer ${
                      adminThemeMode === 'dark'
                        ? 'bg-slate-900/40 border-slate-850 text-slate-100 hover:border-emerald-500/30 shadow-lg'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/30 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Visitor Sessions</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold font-mono tracking-tight text-purple-500">
                          {analytics?.visitorCount || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">Dynamic tracker active</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders log */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Recent Orders Activity</h3>
                      <span className="text-3xs font-mono text-gray-400">Viewing latest {orders.slice(0, 5).length} entries</span>
                    </div>

                    <div className="divide-y divide-gray-800">
                      {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions recorded yet.</div>
                      ) : (
                        orders.slice(0, 5).map((ord) => (
                          <div key={ord.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-blue-400">{ord.id}</span>
                                <span className="text-gray-400 font-semibold">{ord.customerName}</span>
                              </div>
                              <p className="text-3xs text-gray-500 font-mono">
                                {new Date(ord.createdAt).toLocaleString()} • {ord.items.length} items
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-3 font-mono font-bold">
                              <span>{settings.currency}{ord.total.toFixed(2)}</span>
                              
                              <span className={`px-2 py-0.5 rounded text-3xs uppercase ${
                                ord.status === 'delivered' ? 'bg-green-950 text-green-300' :
                                ord.status === 'shipped' ? 'bg-blue-950 text-blue-300' : 'bg-amber-950 text-amber-300'
                              }`}>
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">
                      {editingProduct ? 'Edit Product Specification' : 'Products Catalog Management'}
                    </h2>
                    <button
                      onClick={handleResetProductForm}
                      className="px-3 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-750 font-semibold cursor-pointer"
                    >
                      Clear / New
                    </button>
                  </div>

                  {/* Create or Edit Form */}
                  <form onSubmit={handleSaveProduct} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">
                      Product Parameters & Spec Registry
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Title</label>
                        <input
                          type="text"
                          required
                          value={prodTitle}
                          onChange={(e) => setProdTitle(e.target.value)}
                          placeholder="e.g. Nexus Pro Mechanical Switch"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">SKU Code</label>
                        <input
                          type="text"
                          required
                          value={prodSKU}
                          onChange={(e) => setProdSKU(e.target.value)}
                          placeholder="NEX-SW-PRO"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Category Selector</label>
                        <select
                          required
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Price ({settings.currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="129.99"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Slash Price (Compare-At)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={prodComparePrice}
                          onChange={(e) => setProdComparePrice(e.target.value)}
                          placeholder="149.99"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Inventory Units Count</label>
                        <input
                          type="number"
                          required
                          value={prodInventory}
                          onChange={(e) => setProdInventory(e.target.value)}
                          placeholder="45"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-gray-800/60 bg-gray-950/40 p-4">
                      <div>
                        <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-300 block mb-1">
                          Product Pictures / Images (পণ্যটির ছবিসমূহ)
                        </label>
                        <p className="text-3xs text-gray-500 font-mono">
                          Provide direct links or ImgBB full-linked HTML embed codes. The system will automatically clean them.
                        </p>
                      </div>

                      {/* Info block for ImgBB HTML codes */}
                      <div className="rounded-lg border border-emerald-950 bg-emerald-950/10 p-3 text-xs text-emerald-400 space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span>ImgBB বা HTML এমবেড লিংক সাপোর্ট (Auto Extraction)</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-3xs font-medium">
                          আপনি সরাসরি ইমেজের লিংক দিতে পারেন অথবা <strong className="text-emerald-300">ImgBB / PostImg / ibb</strong> থেকে পাওয়া <code className="bg-gray-900 text-yellow-400 px-1 py-0.5 rounded">&lt;a href="..."&gt;&lt;img src="..."&gt;&lt;/a&gt;</code> টাইপের HTML এমবেড কোড সরাসরি এখানে পেস্ট করতে পারেন। আমাদের কোড স্বয়ংক্রিয়ভাবে আসল ছবিটির লিংক বের করে নিবে এবং ওয়েবসাইটে সুন্দরভাবে দেখাবে।
                        </p>
                      </div>

                      <div className="space-y-3">
                        {prodImageFields.map((field, idx) => {
                          const parsedUrl = parseEmbedOrImageUrl(field);
                          const isHtml = field.trim() !== parsedUrl;

                          return (
                            <div key={idx} className="space-y-2 rounded-lg border border-gray-800/40 bg-gray-950/60 p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 font-mono text-xs font-bold w-6">{idx + 1}.</span>
                                <input
                                  type="text"
                                  value={field}
                                  onChange={(e) => {
                                    const updated = [...prodImageFields];
                                    updated[idx] = e.target.value;
                                    setProdImageFields(updated);
                                  }}
                                  placeholder="Paste direct URL or ImgBB HTML code here..."
                                  className="flex-1 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-100 focus:border-emerald-500 focus:outline-hidden"
                                />
                                {prodImageFields.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = prodImageFields.filter((_, i) => i !== idx);
                                      setProdImageFields(updated);
                                    }}
                                    className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
                                    title="Remove this image box"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              {/* Real-time Parsed Preview & Status feedback */}
                              {field.trim().length > 0 && (
                                <div className="flex items-start space-x-3 bg-gray-950/80 p-2 rounded-md border border-gray-900 ml-6">
                                  <div className="relative w-12 h-12 bg-gray-900 border border-gray-800 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {parsedUrl ? (
                                      <img
                                        src={parsedUrl}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=200';
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[9px] text-gray-500 font-mono">No Image</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center space-x-1.5 flex-wrap">
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/40">
                                        Active Link
                                      </span>
                                      {isHtml && (
                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-900/40 animate-pulse">
                                          ✨ HTML Extracted
                                        </span>
                                      )}
                                      <span className="text-[9px] text-gray-500 font-mono">
                                        Responsive Fit: Cover / Auto-Scaled
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono truncate select-all" title={parsedUrl}>
                                      {parsedUrl}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setProdImageFields([...prodImageFields, ''])}
                        className="inline-flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors py-1 cursor-pointer ml-6"
                      >
                        <span>+ Add More Image Box (আরো ছবি যোগ করুন)</span>
                      </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-800/50">
                      <label className="text-3xs font-bold uppercase tracking-wider text-gray-400 block">
                        Product Colors (রং বা কালার অপশনসমূহ)
                      </label>
                      {prodColors.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {prodColors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center space-x-1.5 bg-gray-800 border border-gray-750 px-2.5 py-1 rounded-full text-xs font-medium text-gray-200"
                            >
                              <span 
                                className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0" 
                                style={{ backgroundColor: color.startsWith('#') || color.match(/^rgba?\(.*\)$/) ? color : undefined }} 
                              />
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={() => setProdColors(prodColors.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-400 ml-1 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-3xs text-gray-500 font-mono">No color options configured. Default single color.</p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          id="newColorInput"
                          placeholder="e.g. Red, Blue, #10B981, Black"
                          className="flex-1 max-w-xs rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs font-mono text-gray-100 focus:border-emerald-500 focus:outline-hidden"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.currentTarget as HTMLInputElement).value.trim();
                              if (val && !prodColors.includes(val)) {
                                setProdColors([...prodColors, val]);
                                (e.currentTarget as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('newColorInput') as HTMLInputElement;
                            if (input) {
                              const val = input.value.trim();
                              if (val && !prodColors.includes(val)) {
                                setProdColors([...prodColors, val]);
                                input.value = '';
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-750 text-xs font-bold text-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Add Color
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs font-bold uppercase tracking-wider text-gray-400">Product Technical Description</label>
                      <textarea
                        rows={3}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Input mechanical specifications, biological fiber materials details..."
                        className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="prodFeatured"
                        checked={prodFeatured}
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        className="h-4.5 w-4.5 rounded-sm border-gray-800 bg-gray-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="prodFeatured" className="text-xs font-bold text-gray-300 cursor-pointer select-none">
                        Promote to Home Featured Row
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-3 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={handleResetProductForm}
                        className="px-4 py-2 text-xs font-semibold rounded bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="px-6 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer text-white"
                      >
                        {isActionLoading ? 'Saving spec...' : editingProduct ? 'Apply Modifications' : 'Publish Product'}
                      </button>
                    </div>
                  </form>

                  {/* Products Catalog list */}
                  <div className={`border rounded-xl overflow-hidden ${
                    adminThemeMode === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className={`px-6 py-4 border-b flex items-center justify-between ${
                      adminThemeMode === 'dark' ? 'border-slate-850' : 'border-slate-200 bg-slate-50/50'
                    }`}>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                        Active Inventory Catalog ({products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).length} of {products.length})
                      </h3>
                      {searchQuery && (
                        <span className="text-3xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                          Filtered by "{searchQuery}"
                        </span>
                      )}
                    </div>
 
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b font-mono text-3xs uppercase ${
                            adminThemeMode === 'dark' ? 'bg-slate-950/60 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <th className="p-4">Visual</th>
                            <th className="p-4">SKU / Item</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Inventory</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-center">Controls</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${
                          adminThemeMode === 'dark' ? 'divide-slate-850' : 'divide-slate-200'
                        }`}>
                          {products
                            .filter(p => 
                              p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((p) => (
                              <tr key={p.id} className={`transition-colors ${
                                adminThemeMode === 'dark' ? 'hover:bg-slate-850/40' : 'hover:bg-slate-50'
                              }`}>
                                <td className="p-4">
                                  <img
                                    src={p.images[0]}
                                    alt={p.title}
                                    className={`h-10 w-10 object-cover rounded border ${
                                      adminThemeMode === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                                    }`}
                                    referrerPolicy="no-referrer"
                                  />
                                </td>
                                <td className="p-4">
                                  <span className="font-mono text-emerald-500 font-bold block">{p.sku}</span>
                                  <span className={`font-semibold ${adminThemeMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{p.title}</span>
                                </td>
                                <td className="p-4 font-mono font-bold">
                                  {settings.currency || '৳'}{p.price.toFixed(2)}
                                </td>
                                <td className="p-4">
                                  <span className={`font-mono font-semibold px-2 py-0.5 rounded-full text-3xs ${
                                    p.inventory <= 5 
                                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  }`}>
                                    {p.inventory} units
                                  </span>
                                </td>
                                <td className="p-4 text-slate-500">
                                  {categories.find(c => c.id === p.categoryId)?.name || p.categoryId}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleEditProductClick(p)}
                                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                                        adminThemeMode === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      }`}
                                      title="Edit Specification"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProductClick(p.id)}
                                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors cursor-pointer"
                                      title="Delete specification"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                                No matching inventory products found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Store Categories Configuration</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Category */}
                    <form onSubmit={handleSaveCategory} className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Create New Category</h3>
                      
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">Category Name</label>
                        <input
                          type="text"
                          required
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          placeholder="e.g. Fiber Accessories"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">Brief Description</label>
                        <textarea
                          rows={2}
                          value={catDesc}
                          onChange={(e) => setCatDesc(e.target.value)}
                          placeholder="Accessories crafted with sustainable high-density fibers..."
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                      >
                        Publish Category
                      </button>
                    </form>

                    {/* Categories grid list */}
                    <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Configured Node Categories</h3>
                      </div>

                      <div className="divide-y divide-gray-800">
                        {categories.map((c) => (
                          <div key={c.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="font-mono text-blue-400 text-3xs font-bold uppercase">{c.id}</span>
                              <h4 className="text-gray-200 font-bold">{c.name}</h4>
                              <p className="text-3xs text-gray-500">{c.description}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteCategoryClick(c.id)}
                              className="p-1.5 rounded bg-red-950/40 hover:bg-red-950/80 border border-red-900/30 text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DELIVERY ZONES */}
              {activeTab === 'delivery' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className={`border-b pb-4 flex items-center justify-between ${
                    adminThemeMode === 'dark' ? 'border-slate-850' : 'border-slate-200'
                  }`}>
                    <div>
                      <h2 className="text-xl font-bold font-mono tracking-tight">Bangladesh Delivery Zones (ডেলিভারি এরিয়া ম্যানেজমেন্ট)</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Configure customized shipping costs and Cash-on-Delivery rules by specific District, Upazila, and local areas.
                      </p>
                    </div>
                    {areaSearchQuery && (
                      <span className="text-3xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                        Filtered Area Results
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Delivery Zone Form */}
                    <form onSubmit={handleSaveDeliveryArea} className={`lg:col-span-1 border rounded-xl p-5 space-y-4 text-left ${
                      adminThemeMode === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-500">
                        {editingArea ? '✏️ Edit Delivery Area' : '➕ Create Delivery Area'}
                      </h3>
                      
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-slate-400">District (জেলা) *</label>
                        <input
                          type="text"
                          required
                          value={areaDistrict}
                          onChange={(e) => setAreaDistrict(e.target.value)}
                          placeholder="e.g. Dhaka, Chandpur, Chittagong"
                          className={`w-full rounded-lg px-3 py-2 text-xs transition-all outline-hidden border ${
                            adminThemeMode === 'dark' 
                              ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-slate-400">Upazila / Thana (উপজেলা) *</label>
                        <input
                          type="text"
                          required
                          value={areaUpazila}
                          onChange={(e) => setAreaUpazila(e.target.value)}
                          placeholder="e.g. Dhanmondi, Haimchar, Mirpur"
                          className={`w-full rounded-lg px-3 py-2 text-xs transition-all outline-hidden border ${
                            adminThemeMode === 'dark' 
                              ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-slate-400">Area Name / Union / Post (এলাকা) *</label>
                        <input
                          type="text"
                          required
                          value={areaName}
                          onChange={(e) => setAreaName(e.target.value)}
                          placeholder="e.g. Algi Bazar, Sector 10, West Kafrul"
                          className={`w-full rounded-lg px-3 py-2 text-xs transition-all outline-hidden border ${
                            adminThemeMode === 'dark' 
                              ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-slate-400">Delivery Charge (ডেলিভারি চার্জ - ৳) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={areaCharge}
                          onChange={(e) => setAreaCharge(e.target.value)}
                          placeholder="80"
                          className={`w-full rounded-lg px-3 py-2 text-xs transition-all outline-hidden border ${
                            adminThemeMode === 'dark' 
                              ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="flex items-center space-x-6 py-2">
                        <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={areaCod}
                            onChange={(e) => setAreaCod(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-600 h-4 w-4"
                          />
                          <span>Cash on Delivery (COD)</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={areaEnabled}
                            onChange={(e) => setAreaEnabled(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-600 h-4 w-4"
                          />
                          <span>Enabled</span>
                        </label>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                        >
                          {isActionLoading ? 'Saving...' : editingArea ? 'Update Zone' : 'Register Zone'}
                        </button>
                        {editingArea && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArea(null);
                              setAreaDistrict('');
                              setAreaUpazila('');
                              setAreaName('');
                              setAreaCharge('80');
                              setAreaCod(true);
                              setAreaEnabled(true);
                            }}
                            className="px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Delivery Areas List */}
                    <div className={`lg:col-span-2 border rounded-xl overflow-hidden ${
                      adminThemeMode === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      <div className={`px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        adminThemeMode === 'dark' ? 'border-slate-850 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
                      }`}>
                        <div>
                          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                            Configured Zones ({deliveryAreas.length})
                          </h3>
                        </div>
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={areaSearchQuery}
                            onChange={(e) => setAreaSearchQuery(e.target.value)}
                            placeholder="Search district, upazila, area..."
                            className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-3xs outline-hidden border ${
                              adminThemeMode === 'dark'
                                ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-600'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className={`text-3xs uppercase font-mono tracking-wider ${
                            adminThemeMode === 'dark' ? 'bg-slate-950/40 text-slate-400 border-b border-slate-850' : 'bg-slate-50 text-slate-500 border-b border-slate-200'
                          }`}>
                            <tr>
                              <th className="p-3">District</th>
                              <th className="p-3">Upazila</th>
                              <th className="p-3">Area</th>
                              <th className="p-3">Cost</th>
                              <th className="p-3">COD</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${adminThemeMode === 'dark' ? 'divide-slate-850' : 'divide-slate-200'}`}>
                            {deliveryAreas.filter(area => {
                              const q = areaSearchQuery.toLowerCase();
                              return (
                                area.district.toLowerCase().includes(q) ||
                                area.upazila.toLowerCase().includes(q) ||
                                area.area.toLowerCase().includes(q)
                              );
                            }).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-xs">
                                  No delivery zones configured yet.
                                </td>
                              </tr>
                            ) : (
                              deliveryAreas
                                .filter(area => {
                                  const q = areaSearchQuery.toLowerCase();
                                  return (
                                    area.district.toLowerCase().includes(q) ||
                                    area.upazila.toLowerCase().includes(q) ||
                                    area.area.toLowerCase().includes(q)
                                  );
                                })
                                .map((area) => (
                                  <tr key={area.id} className="hover:bg-slate-950/20 transition-colors">
                                    <td className="p-3 font-semibold">{area.district}</td>
                                    <td className="p-3 text-slate-400">{area.upazila}</td>
                                    <td className="p-3 text-emerald-400 font-mono text-xs">{area.area}</td>
                                    <td className="p-3 font-mono font-bold text-yellow-400">৳{area.deliveryCharge}</td>
                                    <td className="p-3">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        area.codEnabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      }`}>
                                        {area.codEnabled ? 'YES' : 'NO'}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        area.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                                      }`}>
                                        {area.enabled ? 'Active' : 'Disabled'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right space-x-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingArea(area);
                                          setAreaDistrict(area.district);
                                          setAreaUpazila(area.upazila);
                                          setAreaName(area.area);
                                          setAreaCharge(area.deliveryCharge.toString());
                                          setAreaCod(area.codEnabled);
                                          setAreaEnabled(area.enabled);
                                        }}
                                        className="p-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 cursor-pointer"
                                        title="Edit Zone"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDeliveryArea(area.id)}
                                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                                        title="Delete Zone"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS CONTROL */}
              {activeTab === 'orders' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className={`border-b pb-4 flex items-center justify-between ${
                    adminThemeMode === 'dark' ? 'border-slate-850' : 'border-slate-200'
                  }`}>
                    <div>
                      <h2 className="text-xl font-bold font-mono tracking-tight">Active Customer Orders Logs</h2>
                      <p className="text-xs text-slate-500 mt-1">Manage, dispatch, track, and authorize payments for all orders across Bangladesh.</p>
                    </div>
                    {searchQuery && (
                      <span className="text-3xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                        Match Count: {orders.filter(ord => 
                          ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ord.customerPhone.includes(searchQuery) ||
                          (ord.transactionId && ord.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (ord.district && ord.district.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).length}
                      </span>
                    )}
                  </div>

                  <div className={`border rounded-xl overflow-hidden ${
                    adminThemeMode === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className={`px-6 py-4 border-b flex items-center justify-between ${
                      adminThemeMode === 'dark' ? 'border-slate-850 bg-slate-900/60' : 'border-slate-200 bg-slate-50/60'
                    }`}>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Order Registers</h3>
                      <span className="text-3xs font-mono text-slate-400">Showing latest orders first</span>
                    </div>

                    <div className={`divide-y ${
                      adminThemeMode === 'dark' ? 'divide-slate-850' : 'divide-slate-200'
                    }`}>
                      {orders.filter(ord => 
                        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ord.customerPhone.includes(searchQuery) ||
                        (ord.transactionId && ord.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (ord.district && ord.district.toLowerCase().includes(searchQuery.toLowerCase()))
                      ).length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-mono text-xs">
                          No matching active customer orders found.
                        </div>
                      ) : (
                        orders
                          .filter(ord => 
                            ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ord.customerPhone.includes(searchQuery) ||
                            (ord.transactionId && ord.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (ord.district && ord.district.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map((ord) => (
                            <div key={ord.id} className={`p-6 text-xs space-y-4 transition-colors ${
                              adminThemeMode === 'dark' ? 'hover:bg-slate-950/20' : 'hover:bg-slate-50/50'
                            }`}>
                              <div className={`flex flex-col lg:flex-row lg:items-center justify-between border-b pb-3 gap-4 ${
                                adminThemeMode === 'dark' ? 'border-slate-850' : 'border-slate-250/60'
                              }`}>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-emerald-500 font-black text-sm">{ord.id}</span>
                                    <span className={`font-bold ${adminThemeMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{ord.customerName}</span>
                                  </div>
                                  <p className="text-3xs text-slate-500 font-mono">
                                    {new Date(ord.createdAt).toLocaleString()} • {ord.customerEmail || 'No Email'} • {ord.customerPhone}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Status:</span>
                                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => handleUpdateOrderStatus(ord.id, ord, st as Order['status'])}
                                      className={`px-2.5 py-1 rounded text-3xs font-mono font-bold uppercase transition-all cursor-pointer ${
                                        ord.status === st
                                          ? st === 'delivered' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : st === 'cancelled' 
                                              ? 'bg-red-600 text-white shadow-sm' 
                                              : 'bg-blue-600 text-white shadow-sm'
                                          : adminThemeMode === 'dark'
                                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Details layout */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <span className="text-3xs font-mono uppercase text-slate-500 font-bold tracking-wider">Shipping Address:</span>
                                  <div className={`p-3 rounded-lg border leading-relaxed font-mono text-3xs ${
                                    adminThemeMode === 'dark' ? 'bg-slate-950/40 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}>
                                    <p className="font-semibold text-slate-400">এলাকা/ঠিকানা:</p>
                                    <p className="mb-2 text-slate-200 font-sans">{ord.address}</p>
                                    <p className="font-semibold text-slate-400">জেলা & উপজেলা:</p>
                                    <p className="text-slate-200 font-sans">
                                      {ord.district || ord.city || 'N/A'}, {ord.upazila || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-3xs font-mono uppercase text-slate-500 font-bold tracking-wider">Payment Signature (বাংলাদেশী):</span>
                                  <div className={`p-3 rounded-lg border text-3xs space-y-1.5 ${
                                    adminThemeMode === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200 shadow-3xs'
                                  }`}>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Method:</span>
                                      <span className={`font-bold font-mono px-1.5 rounded uppercase ${
                                        ord.paymentMethod.toLowerCase().includes('bkash') ? 'bg-pink-500/15 text-pink-500' :
                                        ord.paymentMethod.toLowerCase().includes('nagad') ? 'bg-orange-500/15 text-orange-500' :
                                        ord.paymentMethod.toLowerCase().includes('rocket') ? 'bg-purple-500/15 text-purple-500' : 'bg-slate-500/15 text-slate-500'
                                      }`}>{ord.paymentMethod}</span>
                                    </div>
                                    {ord.senderNumber && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500 font-sans">প্রেরক নম্বর:</span>
                                        <span className="font-mono font-bold text-slate-300">{ord.senderNumber}</span>
                                      </div>
                                    )}
                                    {ord.transactionId && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">TrxID:</span>
                                        <span className="font-mono font-extrabold text-amber-500 select-all">{ord.transactionId}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t border-slate-800/40 pt-1.5 mt-1.5">
                                      <span className="text-slate-500">Status:</span>
                                      <span className={`font-mono font-bold uppercase ${ord.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {ord.paymentStatus}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-3xs font-mono uppercase text-slate-500 font-bold tracking-wider">Ordered Systems:</span>
                                  <div className="space-y-1.5">
                                    {ord.items.map((item, idx) => (
                                      <div key={idx} className={`flex items-center justify-between p-2 rounded border ${
                                        adminThemeMode === 'dark' ? 'bg-slate-950/20 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}>
                                        <span className="font-sans font-semibold truncate max-w-[150px]">{item.title}</span>
                                        <span className="font-mono text-3xs text-slate-400">
                                          {item.quantity} × {settings.currency || '৳'}{item.price.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className={`pt-3 flex justify-between items-center border-t font-mono font-bold text-slate-300 ${
                                adminThemeMode === 'dark' ? 'border-slate-850' : 'border-slate-200'
                              }`}>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    className={`px-3 py-1 text-3xs font-bold uppercase rounded cursor-pointer transition-colors inline-flex items-center space-x-1 ${
                                      adminThemeMode === 'dark' ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/35 border border-blue-600/35' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                    }`}
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      window.print();
                                    }}
                                    className={`px-3 py-1 text-3xs font-bold uppercase rounded cursor-pointer transition-colors ${
                                      adminThemeMode === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-750' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    Print Invoice
                                  </button>
                                </div>
                                <span className={`text-sm ${adminThemeMode === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                  Total Charge: <span className="text-emerald-500 font-extrabold">{settings.currency || '৳'}{ord.total.toFixed(2)}</span>
                                </span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PROMO COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Discount Promo Coupons</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Coupon */}
                    <form onSubmit={handleSaveCoupon} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Register Promo Coupon</h3>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Coupon Code</label>
                        <input
                          type="text"
                          required
                          value={cpCode}
                          onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                          placeholder="e.g. WELCOME15"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-100 uppercase focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Type</label>
                          <select
                            value={cpType}
                            onChange={(e) => setCpType(e.target.value as 'percentage' | 'fixed')}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-100 focus:border-blue-500 focus:outline-hidden"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Value</label>
                          <input
                            type="number"
                            required
                            value={cpValue}
                            onChange={(e) => setCpValue(e.target.value)}
                            placeholder="15"
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Min Order Requirement (Optional)</label>
                        <input
                          type="number"
                          value={cpMinOrder}
                          onChange={(e) => setCpMinOrder(e.target.value)}
                          placeholder="100"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-100 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                      >
                        Publish Coupon
                      </button>
                    </form>

                    {/* Coupons List */}
                    <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Active Coupons</h3>
                      </div>

                      <div className="divide-y divide-gray-800 text-xs">
                        {coupons.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">No active promotional coupons.</div>
                        ) : (
                          coupons.map((cp) => (
                            <div key={cp.id} className="p-4 flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-green-400 font-extrabold bg-green-950/40 px-2 py-0.5 rounded border border-green-900/30">
                                    {cp.code}
                                  </span>
                                  <span className="text-gray-300 font-bold">
                                    {cp.discountType === 'percentage' ? `${cp.discountValue}% Off` : `${settings.currency}${cp.discountValue} Off`}
                                  </span>
                                </div>
                                {cp.minOrderValue && (
                                  <p className="text-3xs text-gray-500 font-mono">
                                    Requires minimum order of {settings.currency}{cp.minOrderValue}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteCouponClick(cp.id)}
                                className="p-1.5 rounded bg-red-950/40 hover:bg-red-950/80 border border-red-900/30 text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: REVIEWS MODERATION */}
              {activeTab === 'reviews' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Review Critiques Moderation</h2>
                  </div>

                  {/* Create Fake/Custom Review Form */}
                  <form onSubmit={handleAddFakeReview} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Create Custom Review (ফেক রিভিউ যোগ করুন)</span>
                    </h3>

                    {fakeReviewSuccess && (
                      <div className="rounded-lg bg-green-950/40 border border-green-900/30 text-green-400 p-3 text-xs font-semibold">
                        {fakeReviewSuccess}
                      </div>
                    )}

                    {fakeReviewError && (
                      <div className="rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 p-3 text-xs font-semibold">
                        {fakeReviewError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Select Product */}
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Select Target Product</label>
                        <select
                          required
                          value={fakeReviewProductId}
                          onChange={(e) => setFakeReviewProductId(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Customer Name */}
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Customer Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Asifur Rahman"
                          value={fakeReviewUserName}
                          onChange={(e) => setFakeReviewUserName(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Rating Selector */}
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Rating Score</label>
                        <select
                          value={fakeReviewRating}
                          onChange={(e) => setFakeReviewRating(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value={5}>★★★★★ (5 Stars)</option>
                          <option value={4}>★★★★☆ (4 Stars)</option>
                          <option value={3}>★★★☆☆ (3 Stars)</option>
                          <option value={2}>★★☆☆☆ (2 Stars)</option>
                          <option value={1}>★☆☆☆☆ (1 Star)</option>
                        </select>
                      </div>
                    </div>

                    {/* Review Comment Text */}
                    <div className="space-y-1 text-xs">
                      <label className="text-3xs font-bold uppercase text-gray-400">Review Text / Comment</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="আপনার সুন্দর রিভিউ টেক্সটটি লিখুন (যেমন: প্রোডাক্টটির কোয়ালিটি অনেক জোস এবং চমৎকার বিল্ড কোয়ালিটি...)"
                        value={fakeReviewComment}
                        onChange={(e) => setFakeReviewComment(e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={fakeReviewIsSubmitting}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase px-4 py-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {fakeReviewIsSubmitting ? 'Creating...' : 'Add Custom Review'}
                    </button>
                  </form>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Customer Critiques Feed</h3>
                    </div>

                    <div className="divide-y divide-gray-800">
                      {reviews.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No reviews published yet.</div>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="p-6 text-xs space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                              <div>
                                <span className="text-gray-400 font-bold block">{rev.userName} ({rev.userEmail})</span>
                                <span className="text-3xs text-gray-500 font-mono">{new Date(rev.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-amber-400 font-extrabold">{rev.rating}★ Stars</span>
                                <button
                                  onClick={() => handleToggleReview(rev.id, rev.active)}
                                  className={`px-3 py-1 rounded text-3xs font-mono font-bold uppercase cursor-pointer transition-colors ${
                                    rev.active
                                      ? 'bg-green-950 text-green-300 border border-green-900/30'
                                      : 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30'
                                  }`}
                                >
                                  {rev.active ? 'Approved / Public' : 'Disabled / Hidden'}
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed font-mono bg-gray-950/25 p-3 rounded border border-gray-850">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: THEME CUSTOMIZER */}
              {activeTab === 'theme' && (
                <form onSubmit={handleSaveTheme} className="space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Visual Theme Customizer</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
                    
                    {/* Brand Identity & Palette */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Identity & Color Scheme</h3>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Primary Color</label>
                          <input
                            type="text"
                            required
                            value={themePrimary}
                            onChange={(e) => setThemePrimary(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Secondary</label>
                          <input
                            type="text"
                            required
                            value={themeSecondary}
                            onChange={(e) => setThemeSecondary(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Accent</label>
                          <input
                            type="text"
                            required
                            value={themeAccent}
                            onChange={(e) => setThemeAccent(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Logo text</label>
                          <input
                            type="text"
                            value={themeLogoText}
                            onChange={(e) => setThemeLogoText(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase text-gray-400">Font Family</label>
                          <select
                            value={themeFont}
                            onChange={(e) => setThemeFont(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100 focus:outline-hidden"
                          >
                            <option value="Inter">Inter (Sans-Serif)</option>
                            <option value="Space Grotesk">Space Grotesk (Tech)</option>
                            <option value="JetBrains Mono">JetBrains Mono (Mono)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Logo Image URL (Overrides Logo Text)</label>
                        <input
                          type="text"
                          value={themeLogoUrl}
                          onChange={(e) => setThemeLogoUrl(e.target.value)}
                          placeholder="e.g. https://logo.png"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100"
                        />
                        {themeLogoUrl && (
                          <div className="mt-2 relative h-10 w-24 rounded overflow-hidden border border-gray-800 bg-gray-950 flex items-center justify-center p-1">
                            <img src={themeLogoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hero Showcase Customization */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Store Showcase Banner</h3>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Hero Title text</label>
                        <input
                          type="text"
                          required
                          value={themeHeroTitle}
                          onChange={(e) => setThemeHeroTitle(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Hero Subtitle text</label>
                        <textarea
                          rows={2}
                          required
                          value={themeHeroSubtitle}
                          onChange={(e) => setThemeHeroSubtitle(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-3xs font-bold uppercase text-gray-400">Hero Background image URL</label>
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                            Rec: 1920x600 px (16:5 Ratio)
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={themeHeroBannerUrl}
                          onChange={(e) => setThemeHeroBannerUrl(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 text-xs focus:border-emerald-500 focus:outline-hidden"
                          placeholder="Paste background URL or ImgBB HTML code..."
                        />
                        {themeHeroBannerUrl && (
                          <div className="mt-2 relative h-20 rounded-lg overflow-hidden border border-gray-800 bg-gray-950">
                            {(() => {
                              const cleanedUrl = parseEmbedOrImageUrl(themeHeroBannerUrl);
                              const isHtml = themeHeroBannerUrl.trim() !== cleanedUrl;
                              return (
                                <>
                                  <img 
                                    src={cleanedUrl} 
                                    alt="Hero Preview" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200';
                                    }}
                                  />
                                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-gray-300 flex items-center space-x-1">
                                    <span>Primary Background Preview</span>
                                    {isHtml && <span className="text-yellow-400 font-bold">✨ HTML Extracted</span>}
                                  </div>
                                  <div className="absolute bottom-2 right-2 bg-black/85 px-2 py-1 rounded text-[9px] font-mono text-gray-400 max-w-xs truncate">
                                    {cleanedUrl}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-500 font-mono">
                          This image serves as the default hero backdrop on desktop and mobile viewports.
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-800/60">
                        <div className="flex items-center justify-between">
                          <label className="text-3xs font-bold uppercase text-gray-400">Featured Sliding Banners (comma-separated URLs)</label>
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                            Rec: 1920x600 px (16:5 Ratio)
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={themeBannerSlides}
                          onChange={(e) => setThemeBannerSlides(e.target.value)}
                          placeholder="e.g. https://img1.jpg, https://img2.jpg"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 font-mono text-gray-100 text-xs focus:border-emerald-500 focus:outline-hidden"
                        />
                        
                        {/* Elegant Help Box with Pixel Guides in Bangla and English */}
                        <div className="rounded-xl border border-blue-950 bg-blue-950/10 p-3.5 space-y-2">
                          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                            <span>ব্যানার সাইজ ও মাল্টিপল স্লাইডার গাইড (Banner Size & Slider Guide)</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-3xs text-gray-300 font-medium leading-relaxed font-sans">
                            <div className="space-y-1 border-r border-gray-800/60 pr-3">
                              <p className="text-yellow-400 font-bold">🇧🇩 বাংলা গাইড:</p>
                              <p>১. <strong className="text-white">সাইজ ও রেজোলিউশন:</strong> সেরা ভিউ পাওয়ার জন্য ব্যানারের ইমেজের সাইজ <strong className="text-emerald-400">1920x600 px</strong> (১৬:৫ চওড়া অনুপাত) হওয়া উচিত।</p>
                              <p>২. <strong className="text-white">অটো-স্লাইড:</strong> কমা <code className="bg-gray-900 text-emerald-400 px-1 rounded">,</code> দিয়ে একাধিক ইমেজের লিংক দিলে তা অটোমেটিক প্রতি ৫ সেকেন্ড পর পর স্লাইড করবে।</p>
                              <p>৩. <strong className="text-white">ImgBB সাপোর্ট:</strong> সরাসরি লিংক বা ImgBB-র HTML কোডও এখানে দিতে পারবেন।</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-yellow-400 font-bold">🇬🇧 English Guide:</p>
                              <p>1. <strong className="text-white">Size & Resolution:</strong> For best visual quality, upload wide banner images of <strong className="text-emerald-400">1920x600 pixels</strong> (16:5 ratio).</p>
                              <p>2. <strong className="text-white">Auto-Slide:</strong> Separate multiple banner links with a comma <code className="bg-gray-900 text-emerald-400 px-1 rounded">,</code> to enable the premium auto-sliding slideshow (5s interval).</p>
                              <p>3. <strong className="text-white">Direct or HTML:</strong> Copy-paste raw image links or ImgBB full-linked HTML codes directly.</p>
                            </div>
                          </div>
                        </div>

                        {themeBannerSlides && (
                          <div className="space-y-2 pt-1">
                            <span className="text-3xs font-extrabold uppercase text-gray-400 block font-mono">Parsed Banner Slides Previews:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {themeBannerSlides.split(',').map((url, idx) => {
                                const trimmed = url.trim();
                                if (!trimmed) return null;
                                const cleaned = parseEmbedOrImageUrl(trimmed);
                                const isHtml = trimmed !== cleaned;
                                return (
                                  <div key={idx} className="relative h-24 rounded-lg overflow-hidden border border-gray-800 bg-gray-950 flex flex-col justify-end group">
                                    <img 
                                      src={cleaned} 
                                      alt={`Slide ${idx+1}`} 
                                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200';
                                      }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-black/20 p-2 z-10">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900">
                                          Slide #{idx+1}
                                        </span>
                                        {isHtml && (
                                          <span className="text-[8px] font-black text-yellow-400 font-mono bg-yellow-950/80 px-1 rounded animate-pulse">
                                            HTML Extracted
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-gray-400 font-mono truncate mt-1 select-all" title={cleaned}>
                                        {cleaned}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customizable Feature/Philosophy Cards */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Custom Philosophy / Feature Cards (Footer Section)</h3>
                      <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                        Customize the three highlight/trust cards shown near the footer of your website. Leave blank to use defaults.
                      </p>

                      {/* Feature 1 */}
                      <div className="p-4 bg-gray-950/60 rounded-lg border border-gray-800 space-y-4">
                        <span className="text-2xs font-extrabold uppercase text-emerald-400 tracking-wider">Feature Card I (Default: 100% Authentic Quality)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (English)</label>
                            <input
                              type="text"
                              value={feature1TitleEn}
                              onChange={(e) => setFeature1TitleEn(e.target.value)}
                              placeholder="100% Authentic Quality"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (Bangla)</label>
                            <input
                              type="text"
                              value={feature1TitleBn}
                              onChange={(e) => setFeature1TitleBn(e.target.value)}
                              placeholder="শতভাগ অরিজিনাল প্রোডাক্ট"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (English)</label>
                            <textarea
                              rows={2}
                              value={feature1DescEn}
                              onChange={(e) => setFeature1DescEn(e.target.value)}
                              placeholder="Imported directly from global manufacturers to ensure 100% authentic and certified devices."
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (Bangla)</label>
                            <textarea
                              rows={2}
                              value={feature1DescBn}
                              onChange={(e) => setFeature1DescBn(e.target.value)}
                              placeholder="সরাসরি প্রস্তুতকারক ও গলোবাল ব্র্যান্ড থেকে আমদানিকৃত ১০০% খাঁটি গ্যাজেট এবং ইলেকট্রনিক্স অ্যাকসেসরিজ।"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="p-4 bg-gray-950/60 rounded-lg border border-gray-800 space-y-4">
                        <span className="text-2xs font-extrabold uppercase text-emerald-400 tracking-wider">Feature Card II (Default: Super Fast Delivery)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (English)</label>
                            <input
                              type="text"
                              value={feature2TitleEn}
                              onChange={(e) => setFeature2TitleEn(e.target.value)}
                              placeholder="Super Fast Delivery"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (Bangla)</label>
                            <input
                              type="text"
                              value={feature2TitleBn}
                              onChange={(e) => setFeature2TitleBn(e.target.value)}
                              placeholder="দ্রুততম হোম ডেলিভারি"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (English)</label>
                            <textarea
                              rows={2}
                              value={feature2DescEn}
                              onChange={(e) => setFeature2DescEn(e.target.value)}
                              placeholder="Get fast doorstep delivery across Bangladesh. Deliveries inside district hubs completed within 24-48 hours."
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (Bangla)</label>
                            <textarea
                              rows={2}
                              value={feature2DescBn}
                              onChange={(e) => setFeature2DescBn(e.target.value)}
                              placeholder="সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি সুবিধা। জেলা সদরে মাত্র ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন করা হয়।"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div className="p-4 bg-gray-950/60 rounded-lg border border-gray-800 space-y-4">
                        <span className="text-2xs font-extrabold uppercase text-emerald-400 tracking-wider">Feature Card III (Default: Easy Return & Warranty)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (English)</label>
                            <input
                              type="text"
                              value={feature3TitleEn}
                              onChange={(e) => setFeature3TitleEn(e.target.value)}
                              placeholder="Easy Return & Warranty"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Title (Bangla)</label>
                            <input
                              type="text"
                              value={feature3TitleBn}
                              onChange={(e) => setFeature3TitleBn(e.target.value)}
                              placeholder="সহজ রিটার্ন ও ওয়ারেন্টি সুবিধা"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (English)</label>
                            <textarea
                              rows={2}
                              value={feature3DescEn}
                              onChange={(e) => setFeature3DescEn(e.target.value)}
                              placeholder="Every premium gadget is covered by comprehensive replacement warranty and hassle-free 3-day exchanges."
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Description (Bangla)</label>
                            <textarea
                              rows={2}
                              value={feature3DescBn}
                              onChange={(e) => setFeature3DescBn(e.target.value)}
                              placeholder="প্রতিটি ডিভাইসের সাথে পাচ্ছেন নিশ্চিত ওয়ারেন্টি কার্ড এবং যেকোনো সমস্যায় ৩ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ গ্যারান্টি।"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs text-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="px-6 py-2.5 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 transition-colors text-white cursor-pointer"
                    >
                      {isActionLoading ? 'Saving specifications...' : 'Save Visual Theme'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 8: STORE SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-200 text-left">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight text-white">Global Store & Bangladesh Localization Settings</h2>
                    <p className="text-xs text-gray-400 mt-1">Configure default payment channels, account details, and shipping tariffs tailored for Bangladesh.</p>
                  </div>

                  {/* Core Parameters */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 text-xs">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">1. Core Store Parameters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Store Name</label>
                        <input
                          type="text"
                          required
                          value={setShopName}
                          onChange={(e) => setSetShopName(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Currency Symbol</label>
                        <input
                          type="text"
                          required
                          value={setCurrency}
                          onChange={(e) => setSetCurrency(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Contact Support Email</label>
                        <input
                          type="email"
                          required
                          value={setContactEmail}
                          onChange={(e) => setSetContactEmail(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Contact Telephone</label>
                        <input
                          type="text"
                          required
                          value={setContactPhone}
                          onChange={(e) => setSetContactPhone(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Office Physical Address</label>
                        <input
                          type="text"
                          required
                          value={setAddress}
                          onChange={(e) => setSetAddress(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Administrative Pin Signature</label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={setPin}
                          onChange={(e) => setSetPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono font-bold tracking-widest text-yellow-400 focus:border-blue-500 focus:outline-hidden"
                        />
                        <p className="text-3xs text-gray-500 font-mono mt-1">
                          This numeric passcode signature unlocks this control center. Default is 45600.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Default System Language</label>
                        <select
                          value={defaultLanguage}
                          onChange={(e) => setDefaultLanguage(e.target.value as 'bn' | 'en')}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans text-xs focus:border-blue-500 focus:outline-hidden"
                        >
                          <option value="bn">Bangla (বাংলা)</option>
                          <option value="en">English (English)</option>
                        </select>
                        <p className="text-3xs text-gray-500 font-mono mt-1">
                          Select default language for first-time visitors of your website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Financial Services (MFS) */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 text-xs">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">2. Mobile Financial Services (MFS)</h3>

                    {/* bKash configuration */}
                    <div className="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-950/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          <span className="font-bold font-mono text-pink-500 uppercase">bKash (বিকাশ)</span>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bkashEnabled}
                            onChange={(e) => setBkashEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-850 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                          <span className="ms-2 text-3xs text-gray-400 uppercase font-bold font-mono">Enabled</span>
                        </label>
                      </div>

                      {bkashEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">bKash Wallet Number</label>
                            <input
                              type="text"
                              value={bkashNumber}
                              onChange={(e) => setBkashNumber(e.target.value)}
                              placeholder="e.g. 017xxxxxxxx"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Account Type</label>
                            <select
                              value={bkashType}
                              onChange={(e) => setBkashType(e.target.value as any)}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                            >
                              <option value="Personal">Personal (ব্যক্তিগত)</option>
                              <option value="Agent">Agent (এজেন্ট)</option>
                              <option value="Merchant">Merchant (মার্চেন্ট)</option>
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-3xs font-bold uppercase text-gray-400">Payment Instructions (Bangla)</label>
                            <textarea
                              value={bkashInstruction}
                              onChange={(e) => setBkashInstruction(e.target.value)}
                              rows={2}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nagad configuration */}
                    <div className="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-950/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="font-bold font-mono text-orange-500 uppercase">Nagad (নগদ)</span>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={nagadEnabled}
                            onChange={(e) => setNagadEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-850 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                          <span className="ms-2 text-3xs text-gray-400 uppercase font-bold font-mono">Enabled</span>
                        </label>
                      </div>

                      {nagadEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Nagad Wallet Number</label>
                            <input
                              type="text"
                              value={nagadNumber}
                              onChange={(e) => setNagadNumber(e.target.value)}
                              placeholder="e.g. 018xxxxxxxx"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Account Type</label>
                            <select
                              value={nagadType}
                              onChange={(e) => setNagadType(e.target.value as any)}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                            >
                              <option value="Personal">Personal (ব্যক্তিগত)</option>
                              <option value="Agent">Agent (এজেন্ট)</option>
                              <option value="Merchant">Merchant (মার্চেন্ট)</option>
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-3xs font-bold uppercase text-gray-400">Payment Instructions (Bangla)</label>
                            <textarea
                              value={nagadInstruction}
                              onChange={(e) => setNagadInstruction(e.target.value)}
                              rows={2}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rocket configuration */}
                    <div className="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-950/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className="font-bold font-mono text-purple-500 uppercase">Rocket (রকেট)</span>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rocketEnabled}
                            onChange={(e) => setRocketEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-850 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          <span className="ms-2 text-3xs text-gray-400 uppercase font-bold font-mono">Enabled</span>
                        </label>
                      </div>

                      {rocketEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Rocket Wallet Number</label>
                            <input
                              type="text"
                              value={rocketNumber}
                              onChange={(e) => setRocketNumber(e.target.value)}
                              placeholder="e.g. 019xxxxxxxx"
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-bold uppercase text-gray-400">Account Type</label>
                            <select
                              value={rocketType}
                              onChange={(e) => setRocketType(e.target.value as any)}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                            >
                              <option value="Personal">Personal (ব্যক্তিগত)</option>
                              <option value="Agent">Agent (এজেন্ট)</option>
                              <option value="Merchant">Merchant (মার্চেন্ট)</option>
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-3xs font-bold uppercase text-gray-400">Payment Instructions (Bangla)</label>
                            <textarea
                              value={rocketInstruction}
                              onChange={(e) => setRocketInstruction(e.target.value)}
                              rows={2}
                              className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery & Bangladesh Shipping Tariffs */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 text-xs">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">3. Delivery & Bangladesh Shipping Tariffs</h3>

                    {/* Cash On Delivery toggle */}
                    <div className="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-950/40">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase font-mono text-gray-200">Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={codEnabled}
                            onChange={(e) => setCodEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-850 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          <span className="ms-2 text-3xs text-gray-400 uppercase font-bold font-mono">Enabled</span>
                        </label>
                      </div>
                      
                      {codEnabled && (
                        <div className="space-y-2">
                          <label className="text-3xs font-bold uppercase text-gray-400">COD Instructions (Bangla)</label>
                          <textarea
                            value={codInstruction}
                            onChange={(e) => setCodInstruction(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans"
                          />
                        </div>
                      )}
                    </div>

                    {/* Shipping rates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Shipping Inside Dhaka District (৳)</label>
                        <input
                          type="number"
                          required
                          value={shippingInside}
                          onChange={(e) => setShippingInside(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Shipping Outside Dhaka District (৳)</label>
                        <input
                          type="number"
                          required
                          value={shippingOutside}
                          onChange={(e) => setShippingOutside(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Free Delivery Threshold (৳ Min Purchase)</label>
                        <input
                          type="number"
                          required
                          value={shippingFreeMin}
                          onChange={(e) => setShippingFreeMin(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Set to 0 to disable free delivery discount.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase text-gray-400">Cash on Delivery Processing Fee (৳)</label>
                        <input
                          type="number"
                          required
                          value={codFee}
                          onChange={(e) => setCodFee(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-3xs font-bold uppercase text-gray-400">Estimated Delivery Time Window (Bangla / English)</label>
                        <input
                          type="text"
                          required
                          value={shippingDeliveryTime}
                          onChange={(e) => setShippingDeliveryTime(e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telegram Integration Panel */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="font-bold font-mono text-blue-400 uppercase">4. Telegram Order Notification Bot</span>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramEnabled}
                          onChange={(e) => setTelegramEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-gray-850 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-2 text-3xs text-gray-400 uppercase font-bold font-mono">Enabled</span>
                      </label>
                    </div>

                    {telegramEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 text-left">
                          <label className="text-3xs font-bold uppercase text-gray-400">Telegram Bot Token</label>
                          <input
                            type="password"
                            value={telegramBotToken}
                            onChange={(e) => setTelegramBotToken(e.target.value)}
                            placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                          />
                          <p className="text-[10px] text-gray-500 font-mono mt-1">
                            Your HTTP API Token provided by @BotFather.
                          </p>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-3xs font-bold uppercase text-gray-400">Telegram Chat ID / User ID</label>
                          <input
                            type="text"
                            value={telegramChatId}
                            onChange={(e) => setTelegramChatId(e.target.value)}
                            placeholder="e.g. 987654321"
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 font-mono text-gray-100"
                          />
                          <p className="text-[10px] text-gray-500 font-mono mt-1">
                            Your numeric Chat ID or Group ID. Find it via @userinfobot or @GetChatID_Bot.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Media & Live Support Links */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 text-xs text-left">
                    <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold font-mono text-emerald-400 uppercase">5. Social Links & Live Support channels</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Facebook */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">Facebook Page URL (ফেসবুক পেজ লিংক)</label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="e.g. https://facebook.com/yourpage"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      {/* Instagram */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">Instagram Profile URL (ইনস্টাগ্রাম প্রোফাইল লিংক)</label>
                        <input
                          type="url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          placeholder="e.g. https://instagram.com/yourprofile"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      {/* YouTube */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">YouTube Channel URL (ইউটিউব চ্যানেল লিংক)</label>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="e.g. https://youtube.com/@yourchannel"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      {/* TikTok */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">TikTok Profile URL (টিকটক প্রোফাইল লিংক)</label>
                        <input
                          type="url"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          placeholder="e.g. https://tiktok.com/@yourprofile"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                      </div>

                      {/* Live Support Phone Number */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">Live Support Call Number (সরাসরি কল করার নাম্বার)</label>
                        <input
                          type="text"
                          value={supportNumber}
                          onChange={(e) => setSupportNumber(e.target.value)}
                          placeholder="e.g. 01712345678"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                        <p className="text-[10px] text-gray-500 font-mono mt-1">
                          A primary voice number shown prominently in the website's support area.
                        </p>
                      </div>

                      {/* WhatsApp Support Number */}
                      <div className="space-y-1 text-left">
                        <label className="text-3xs font-bold uppercase text-gray-400">WhatsApp Support Number (হোয়াটসঅ্যাপ চ্যাট নাম্বার)</label>
                        <input
                          type="text"
                          value={supportWhatsapp}
                          onChange={(e) => setSupportWhatsapp(e.target.value)}
                          placeholder="e.g. 01712345678"
                          className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-gray-100"
                        />
                        <p className="text-[10px] text-gray-500 font-mono mt-1">
                          Enter number with/without country code for direct WhatsApp chat links.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="px-6 py-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all text-white cursor-pointer active:scale-[0.98] inline-flex items-center space-x-2 shadow-md"
                    >
                      {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin mr-1" />}
                      <span>Save Settings</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 9: NOTIFICATIONS ALERTS LIST */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold font-mono tracking-tight">Operational Alerts & Notifications</h2>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">Alarms Registers</h3>
                      <span className="text-3xs font-mono text-gray-500">Unread: {notifications.filter(n => !n.read).length}</span>
                    </div>

                    <div className="divide-y divide-gray-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No security or transactional alerts registered.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-5 flex items-start justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`h-2 w-2 rounded-full ${notif.read ? 'bg-gray-700' : 'bg-red-500 animate-pulse'}`} />
                                <h4 className={`font-bold ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>{notif.title}</h4>
                                <span className="text-[9px] font-mono px-1.5 rounded uppercase bg-gray-950 text-gray-500 font-extrabold border border-gray-800">
                                  {notif.type}
                                </span>
                              </div>
                              <p className="text-gray-400 leading-relaxed font-mono">{notif.message}</p>
                              <span className="text-3xs text-gray-600 font-mono block">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkNotification(notif.id)}
                                  className="px-2 py-1 rounded bg-gray-850 hover:bg-gray-800 text-3xs font-mono font-bold uppercase transition-colors cursor-pointer"
                                >
                                  Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotif(notif.id)}
                                className="p-1 rounded bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Detailed Order Popup / Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs text-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-left">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-emerald-500">Order Information Card</span>
                <h3 className="text-sm font-extrabold font-mono text-white">ID: {selectedOrderDetails.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-1">
                  <span className="text-3xs font-mono text-slate-500 font-bold uppercase tracking-wider">Order Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase font-mono ${
                      selectedOrderDetails.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      selectedOrderDetails.status === 'cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                      'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}>
                      {selectedOrderDetails.status}
                    </span>
                    <span className="text-3xs text-slate-400 font-mono">
                      {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-1">
                  <span className="text-3xs font-mono text-slate-500 font-bold uppercase tracking-wider">Payment Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase font-mono ${
                      selectedOrderDetails.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedOrderDetails.paymentStatus}
                    </span>
                    <span className="text-3xs font-mono text-slate-400 font-bold uppercase">
                      {selectedOrderDetails.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information Grid */}
              <div className="space-y-2">
                <h4 className="text-3xs font-mono uppercase font-bold tracking-wider text-slate-400">Customer Credentials & Delivery</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-850 bg-slate-950/40 font-mono text-3xs space-y-2 md:space-y-0">
                  <div className="space-y-1.5">
                    <p><span className="text-slate-500 font-sans">Name:</span> <span className="font-sans font-bold text-slate-200">{selectedOrderDetails.customerName}</span></p>
                    <p><span className="text-slate-500 font-sans">Phone:</span> <span className="text-slate-200 select-all font-bold">{selectedOrderDetails.customerPhone}</span></p>
                    <p><span className="text-slate-500 font-sans">Email:</span> <span className="text-slate-200 select-all">{selectedOrderDetails.customerEmail || 'No Email'}</span></p>
                  </div>
                  <div className="space-y-1.5">
                    <p><span className="text-slate-500 font-sans">Address/এলাকা:</span> <span className="font-sans text-slate-200">{selectedOrderDetails.address}</span></p>
                    <p><span className="text-slate-500 font-sans">District/জেলা:</span> <span className="font-sans text-slate-200">{selectedOrderDetails.district || selectedOrderDetails.city || 'N/A'}</span></p>
                    <p><span className="text-slate-500 font-sans">Upazila/উপজেলা:</span> <span className="font-sans text-slate-200">{selectedOrderDetails.upazila || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Payment Signatures */}
              {(selectedOrderDetails.senderNumber || selectedOrderDetails.transactionId) && (
                <div className="space-y-2">
                  <h4 className="text-3xs font-mono uppercase font-bold tracking-wider text-slate-400">Mobile Financial Service Metadata (MFS)</h4>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-850 bg-slate-950/40 font-mono text-3xs">
                    {selectedOrderDetails.senderNumber && (
                      <div className="space-y-0.5">
                        <p className="text-slate-500">Sender Phone (বিকাশ/নগদ নম্বর):</p>
                        <p className="text-slate-200 font-bold select-all text-xs">{selectedOrderDetails.senderNumber}</p>
                      </div>
                    )}
                    {selectedOrderDetails.transactionId && (
                      <div className="space-y-0.5">
                        <p className="text-slate-500">Transaction TrxID Code:</p>
                        <p className="text-amber-500 font-bold select-all text-xs">{selectedOrderDetails.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-3">
                <h4 className="text-3xs font-mono uppercase font-bold tracking-wider text-slate-400">Purchased Items Details</h4>
                <div className="divide-y divide-slate-850 border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-950/30 transition-colors">
                      <div className="space-y-1">
                        <h5 className="font-sans font-bold text-slate-100">{item.title}</h5>
                        <p className="text-3xs text-slate-500 font-mono">
                          SKU Code: {item.sku || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="text-slate-400 font-bold">{item.quantity}</span>
                        <span className="text-slate-500 mx-1">×</span>
                        <span className="text-slate-300">{settings.currency || '৳'}{item.price.toFixed(2)}</span>
                        <span className="text-slate-500 mx-2">=</span>
                        <span className="text-emerald-400 font-extrabold">{settings.currency || '৳'}{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculation list */}
              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 font-mono space-y-1 text-right">
                <div className="flex justify-between text-3xs text-slate-500">
                  <span>Products Subtotal:</span>
                  <span>{settings.currency || '৳'}{(selectedOrderDetails.total - (selectedOrderDetails.shippingCost || 0)).toFixed(2)}</span>
                </div>
                {selectedOrderDetails.shippingCost && (
                  <div className="flex justify-between text-3xs text-slate-500">
                    <span>Shipping Delivery Charge:</span>
                    <span>{settings.currency || '৳'}{selectedOrderDetails.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs border-t border-slate-800/40 pt-2 mt-2 text-slate-200 font-extrabold">
                  <span className="text-slate-400">Total Invoice Charge:</span>
                  <span className="text-emerald-400 text-sm">{settings.currency || '৳'}{selectedOrderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-750 font-mono font-bold uppercase rounded-lg text-white transition-all cursor-pointer"
                >
                  Print Invoice
                </button>
              </div>
              
              <div className="flex space-x-1">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={async () => {
                      await handleUpdateOrderStatus(selectedOrderDetails.id, selectedOrderDetails, st as Order['status']);
                      setSelectedOrderDetails(prev => prev ? { ...prev, status: st as Order['status'] } : null);
                    }}
                    className={`px-2.5 py-1.5 rounded text-3xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      selectedOrderDetails.status === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Order Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className="pointer-events-auto bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-2xl flex flex-col space-y-2 text-xs text-left text-white animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                🔔 NEW ORDER RECEIVED
              </span>
              <button 
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-slate-100">
                Customer: <span className="text-emerald-400">{t.customerName}</span>
              </p>
              <p className="text-slate-400 mt-0.5">
                Order ID: <span className="font-mono text-slate-300">{t.id}</span>
              </p>
              <p className="font-bold text-slate-100 mt-1">
                Amount: <span className="text-yellow-400">{settings.currency || '৳'}{t.total.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  const targetOrder = orders.find(o => o.id === t.id);
                  if (targetOrder) {
                    setSelectedOrderDetails(targetOrder);
                    setActiveTab('orders');
                  }
                  setToasts(prev => prev.filter(x => x.id !== t.id));
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
              >
                View Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Success/Error Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {actionToasts.map(t => (
          <div 
            key={t.id}
            className={`pointer-events-auto border rounded-xl p-4 shadow-2xl flex items-start space-x-3 text-xs text-left text-white animate-slide-in ${
              t.type === 'success' ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900 border-red-500/30'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100">
                {t.type === 'success' ? 'SUCCESS' : 'ERROR'}
              </p>
              <p className="text-slate-300 mt-1">{t.message}</p>
            </div>
            <button 
              onClick={() => setActionToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-500 hover:text-white flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
