/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Star, Tag, ShoppingBag, ArrowRight, ShieldCheck, Heart, Search, X, HelpCircle, AlertCircle, RefreshCw, CheckCircle, ArrowLeft, BookOpen, ChevronRight, Check,
  Facebook, Instagram, Youtube, Phone, MessageCircle, Share2, MoreVertical, Link
} from 'lucide-react';
import {
  seedDatabaseIfEmpty, getSystemSettings, getThemeConfig, getProducts, getCategories, getPages
} from './services/db';
import {
  subscribeSystemSettings,
  subscribeThemeConfig,
  subscribeProducts,
  subscribeCategories,
  subscribePages
} from './firebase/firestore';
import { Product, Category, CartItem, ThemeConfig, SystemSettings, Coupon, StaticPage } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PinModal from './components/PinModal';
import AdminPanel from './components/AdminPanel';
import ReviewsSection from './components/ReviewsSection';
import StaticPageViewer from './components/StaticPageViewer';
import { motion } from 'motion/react';
import { translations, formatPrice, formatBanglaNumber, getProductImages } from './utils/translations';

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#059669', // Emerald
  secondaryColor: '#064e3b',
  accentColor: '#10b981',
  fontFamily: 'Inter',
  logoUrl: '',
  logoText: 'AETHER BD',
  heroTitle: 'প্রিমিয়াম গ্যাজেট ও ইলেকট্রনিক্স গিয়ার',
  heroSubtitle: 'আপনার দৈনন্দিন জীবনকে গতিশীল ও নান্দনিক করতে সেরা কোয়ালিটির গ্যাজেট কালেকশন।',
  heroBannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
  darkMode: false
};

const DEFAULT_SETTINGS: SystemSettings = {
  shopName: 'অ্যাথার ইলেকট্রনিক্স',
  currency: '৳',
  contactEmail: 'contact@aetherstore.com.bd',
  contactPhone: '+880 1712-345678',
  address: 'বনানী, ঢাকা, বাংলাদেশ',
  adminPin: '45600',
  codEnabled: true,
  shippingInsideDistrict: 80,
  shippingOutsideDistrict: 150,
  freeShippingMinAmount: 3000
};

export default function App() {
  // Bangladesh language toggle (BN by default as requested)
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('store_lang') as 'bn' | 'en') || 'bn';
  });

  const handleLangChange = (newLang: 'bn' | 'en') => {
    setLang(newLang);
    localStorage.setItem('store_lang', newLang);
  };

  // DB configurations states with fast, zero-delay static placeholders for immediate initial load
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Synchronize language with admin-configured default language if user hasn't manually switched
  useEffect(() => {
    if (settings.defaultLanguage && !localStorage.getItem('store_lang')) {
      setLang(settings.defaultLanguage);
    }
  }, [settings]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);

  const t = translations[lang];

  // Application navigational/filtering state
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = Home, 'all' = Shop All, 'cat-xxx' = specific
  const [activeStaticPage, setActiveStaticPage] = useState<string | null>(null); // 'about' | 'contact' | 'privacy' etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  // Interactive overlays states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [productDetailActiveImg, setProductDetailActiveImg] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // checkout promo passing states
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | null>(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);

  // Invoice success feedback states
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [orderedItemsForSuccess, setOrderedItemsForSuccess] = useState<CartItem[]>([]);

  // CMS active state
  const [activeAdmin, setActiveAdmin] = useState(false);

  // Global loading states
  const [appInitLoading, setAppInitLoading] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);

  // Derive the up-to-date viewed product from the real-time products array to ensure
  // any updates in the Admin Panel reflect on the product details page in real-time.
  const currentViewedProduct = viewedProduct
    ? products.find((p) => p.id === viewedProduct.id) || viewedProduct
    : null;

  const currentViewedImages = currentViewedProduct
    ? getProductImages(currentViewedProduct.images)
    : [];

  // Load store states from firestore with real-time subscriptions
  useEffect(() => {
    // 1. Ensure the DB is auto-seeded first
    seedDatabaseIfEmpty().then(() => {
      // 2. Establish real-time sync listeners for production-ready instantaneous UI updates
      const unsubSettings = subscribeSystemSettings((sysSettings) => {
        if (sysSettings) setSettings(sysSettings);
      });

      const unsubTheme = subscribeThemeConfig((sysTheme) => {
        if (sysTheme) setTheme(sysTheme);
      });

      const unsubProducts = subscribeProducts((sysProducts) => {
        setProducts(sysProducts);
        setAppInitLoading(false);
      });

      const unsubCats = subscribeCategories((sysCats) => {
        setCategories(sysCats);
      });

      const unsubPages = subscribePages((sysPages) => {
        setStaticPages(sysPages);
      });

      return () => {
        unsubSettings();
        unsubTheme();
        unsubProducts();
        unsubCats();
        unsubPages();
      };
    }).catch((e) => {
      console.error('Initialization error during seeding/subscriptions:', e);
      setAppInitLoading(false);
    });

    // Recover cart state from local storage
    const savedCart = localStorage.getItem('aether_cart_registry');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Auto-load product if query param is set
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (prodId) {
        const found = products.find(p => p.id === prodId || p.slug === prodId);
        if (found) {
          setViewedProduct(found);
          setProductDetailActiveImg(0);
          setSelectedColor(found.colors && found.colors.length > 0 ? found.colors[0] : null);
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [products]);

  // Auto-slide viewed product images if multiple exist
  useEffect(() => {
    if (!currentViewedImages || currentViewedImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setProductDetailActiveImg((prev) => (prev + 1) % currentViewedImages.length);
    }, 3500); // Auto slide every 3.5 seconds
    
    return () => clearInterval(interval);
  }, [currentViewedImages, viewedProduct]);

  // Save cart changes to browser local storage
  const saveCartToLocalStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('aether_cart_registry', JSON.stringify(newCart));
  };

  // Trigger catalog refresh (realtime handles the sync, this provides UI feedback)
  const handleRefreshApp = async () => {
    setCatalogRefreshing(true);
    setTimeout(() => {
      setCatalogRefreshing(false);
    }, 600);
  };

  // --- CART MANAGEMENT ---
  const handleAddToCart = (product: Product, quantity = 1, color?: string) => {
    const itemColor = color || selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    const existingIndex = cart.findIndex(item => item.product.id === product.id && item.selectedColor === itemColor);
    let newCart: CartItem[] = [];

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = Math.min(product.inventory, existing.quantity + quantity);
      newCart = [...cart];
      newCart[existingIndex] = { ...existing, quantity: newQty };
    } else {
      newCart = [...cart, { product, quantity: Math.min(product.inventory, quantity), selectedColor: itemColor }];
    }

    saveCartToLocalStorage(newCart);
    setShowCart(true); // Pop cart drawer
  };

  const handleBuyNow = (product: Product, color?: string) => {
    const itemColor = color || selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    const existingIndex = cart.findIndex(item => item.product.id === product.id && item.selectedColor === itemColor);
    let newCart: CartItem[] = [];

    if (existingIndex > -1) {
      newCart = [...cart];
    } else {
      newCart = [...cart, { product, quantity: 1, selectedColor: itemColor }];
    }

    saveCartToLocalStorage(newCart);
    setShowCart(false);
    setShowCheckout(true);
  };

  const getProductShareUrl = (product: Product) => {
    return `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  };

  const handleCopyLink = (product: Product) => {
    const shareUrl = getProductShareUrl(product);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, color?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const boundedQty = Math.max(1, Math.min(prod.inventory, quantity));
    const newCart = cart.map(item => 
      (item.product.id === productId && item.selectedColor === color) 
        ? { ...item, quantity: boundedQty } 
        : item
    );
    saveCartToLocalStorage(newCart);
  };

  const handleRemoveCartItem = (productId: string, color?: string) => {
    const newCart = cart.filter(item => !(item.product.id === productId && item.selectedColor === color));
    saveCartToLocalStorage(newCart);
  };

  // --- TRANSITS & TRIGGERS ---
  const handleTriggerCheckout = (appliedCoupon: Coupon | null, discountAmount: number) => {
    setCheckoutCoupon(appliedCoupon);
    setCheckoutDiscount(discountAmount);
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setSuccessOrderId(orderId);
    setOrderedItemsForSuccess([...cart]);
    // Wipe basket
    saveCartToLocalStorage([]);
    setShowCheckout(false);
    setViewedProduct(null);
    setActiveCategory(null); // return home
  };

  const handleViewDetails = (product: Product) => {
    setViewedProduct(product);
    setProductDetailActiveImg(0);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FILTERING AND SORTING ---
  const filteredProducts = products.filter(prod => {
    // 1. Category Filter
    if (activeCategory && activeCategory !== 'all' && prod.categoryId !== activeCategory) {
      return false;
    }
    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesTitle = prod.title.toLowerCase().includes(query);
      const matchesSku = prod.sku.toLowerCase().includes(query);
      const matchesDesc = prod.description.toLowerCase().includes(query);
      return matchesTitle || matchesSku || matchesDesc;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default (createdAt sorted inside DB query)
  });

  const featuredProducts = products.filter(p => p.isFeatured && p.inventory > 0).slice(0, 4);

  // App initialization rendering screen
  if (appInitLoading || !theme || !settings) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <h3 className="text-sm font-bold tracking-widest text-gray-800 font-mono">
          INITIALIZING ENTERPRISE DB...
        </h3>
        <p className="text-2xs text-gray-500 font-mono mt-1">Please wait while configuration nodes synchronize.</p>
      </div>
    );
  }

  // RENDER ADMIN CMS VIEW
  if (activeAdmin) {
    return (
      <AdminPanel
        theme={theme}
        settings={settings}
        onExitAdmin={() => setActiveAdmin(false)}
        onRefreshApp={handleRefreshApp}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col text-gray-950 transition-colors duration-200 selection:bg-blue-100"
      style={{ fontFamily: theme.fontFamily }}
    >
      
      {/* Dynamic top ribbon alert */}
      <div 
        className="w-full text-center py-2 text-2xs font-bold font-mono tracking-widest text-white uppercase px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <span>
          {lang === 'bn' 
            ? '৳ ৩,০০০ বা তার বেশি অর্ডারে সারা বাংলাদেশে ফ্রী হোম ডেলিভারি!' 
            : 'Free delivery all over Bangladesh on orders ৳3,000 or more!'}
        </span>
      </div>

      {/* Navigation menu */}
      <Navbar
        theme={theme}
        settings={settings}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        activeCategory={null}
        onCartClick={() => setShowCart(true)}
        onShopClick={() => {
          setActiveCategory(null);
          setActiveStaticPage(null);
          setViewedProduct(null);
          setSuccessOrderId(null);
          setTimeout(() => {
            const el = document.getElementById('store-products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
        onHomeClick={() => {
          setActiveCategory(null);
          setActiveStaticPage(null);
          setViewedProduct(null);
          setSuccessOrderId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTriggerAdmin={() => setShowPinModal(true)}
        lang={lang}
        onLangChange={handleLangChange}
      />

      {/* RENDER SUCCESS INVOICE RECEIPT OVERLAY */}
      {successOrderId && (
        <div className="mx-auto max-w-3xl px-4 py-16 animate-in fade-in duration-300 text-left">
          <div className="rounded-2xl border border-green-100 bg-green-50/30 p-8 space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-3 border-b border-green-100/80 pb-6">
              <div className="p-3 bg-green-500 rounded-full text-white shadow-lg">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-gray-950 font-sans tracking-tight">Invoice Receipt Cleared</h2>
              <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                Thank you! Your transaction signature has been approved. Order ID <span className="font-mono font-bold text-blue-600">{successOrderId}</span> is now queued for double-walled packing.
              </p>
            </div>

            {/* Order specifications recap */}
            <div className="space-y-4">
              <h3 className="text-2xs font-bold font-mono uppercase tracking-wider text-gray-500">
                Purchased Curated Hardware
              </h3>
              <div className="space-y-3.5">
                {orderedItemsForSuccess.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-3 rounded-lg border border-gray-100/80">
                    <div className="flex items-center space-x-3">
                      <img src={getProductImages(item.product.images)[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'} className="h-9 w-9 rounded object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-gray-900 block">{item.product.title}</span>
                        <span className="text-3xs text-gray-400 font-mono">SKU: {item.product.sku}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {item.quantity} × {settings.currency}{item.product.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-green-100/80">
              <div className="text-left">
                <span className="text-3xs font-mono uppercase text-gray-400 block font-bold">Delivery Estimate</span>
                <span className="text-xs font-bold text-gray-800">DHL Express Tracked (2-3 Business Days)</span>
              </div>
              <button
                onClick={() => setSuccessOrderId(null)}
                className="rounded-lg px-6 py-3 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Continue Exploring Curations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOREFRONT CONTENT BODY */}
      {!successOrderId && (
        <main className="flex-grow">
          {activeStaticPage ? (
            <StaticPageViewer
              slug={activeStaticPage}
              theme={theme}
              settings={settings}
              lang={lang}
              onGoHome={() => setActiveStaticPage(null)}
            />
          ) : (
            <>
              {/* HOME VIEW: Hero slider and landing elements */}
              {!activeCategory && !currentViewedProduct && (
                <div className="space-y-16 pb-16">
                  
                  {/* Dynamic hero header */}
                  <Hero 
                    theme={theme} 
                    onExploreClick={() => {
                      const el = document.getElementById('store-products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }} 
                  />

                  {/* All Products Grid Section directly on Home */}
                  <div id="store-products-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 text-left space-y-6 scroll-mt-20">
                    
                    {/* Catalog Header with Search & Sort */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-gray-950 uppercase">
                          {lang === 'bn' ? 'আমাদের সকল প্রোডাক্টস' : 'Our Product Collection'}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {lang === 'bn' 
                            ? `মোট ${formatBanglaNumber(filteredProducts.length)}টি প্রিমিয়াম প্রোডাক্ট` 
                            : `Explore our range of ${filteredProducts.length} premium systems`}
                        </p>
                      </div>

                      {/* Search and Sort controls */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden bg-white w-full sm:w-48"
                          />
                          <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
                        </div>

                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                        >
                          <option value="default">{lang === 'bn' ? 'অর্ডারিং: সাধারণ' : 'Default Sort'}</option>
                          <option value="price-asc">{t.sortPriceLowHigh}</option>
                          <option value="price-desc">{t.sortPriceHighLow}</option>
                          <option value="rating">{t.sortRating}</option>
                        </select>
                      </div>
                    </div>

                    {/* Products Grid */}
                    {catalogRefreshing ? (
                      <div className="h-96 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="h-80 border border-dashed border-gray-200/80 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/30">
                        <ShoppingBag className="h-8 w-8 text-gray-300 mb-2 animate-bounce" />
                        <h3 className="text-sm font-bold text-gray-800">{lang === 'bn' ? 'কোনো প্রোডাক্ট মিলছে না' : 'No products match filters'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{lang === 'bn' ? 'অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে সার্চ করুন।' : 'Please modify your search criteria or clear query filter.'}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            theme={theme}
                            settings={settings}
                            onViewDetails={handleViewDetails}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            lang={lang}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quality & Philosophy block */}
                  <div className="bg-gray-50 border-y border-gray-100 py-16 text-left">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <span className="h-8 w-8 rounded bg-gray-900 text-white flex items-center justify-center font-mono text-xs font-bold">I</span>
                        <h3 className="text-sm font-bold tracking-wider uppercase text-gray-950 font-sans">
                          {lang === 'bn' 
                            ? (theme.feature1TitleBn || 'শতভাগ অরিজিনাল প্রোডাক্ট') 
                            : (theme.feature1TitleEn || '100% Authentic Quality')}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">
                          {lang === 'bn' 
                            ? (theme.feature1DescBn || 'সরাসরি প্রস্তুতকারক ও গ্লোবাল ব্র্যান্ড থেকে আমদানিকৃত ১০০% খাঁটি গ্যাজেট এবং ইলেকট্রনিক্স অ্যাকসেসরিজ।') 
                            : (theme.feature1DescEn || 'Imported directly from global manufacturers to ensure 100% authentic and certified devices.')}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <span className="h-8 w-8 rounded bg-gray-900 text-white flex items-center justify-center font-mono text-xs font-bold">II</span>
                        <h3 className="text-sm font-bold tracking-wider uppercase text-gray-950 font-sans">
                          {lang === 'bn' 
                            ? (theme.feature2TitleBn || 'দ্রুততম হোম ডেলিভারি') 
                            : (theme.feature2TitleEn || 'Super Fast Delivery')}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">
                          {lang === 'bn' 
                            ? (theme.feature2DescBn || 'সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি সুবিধা। জেলা সদরে মাত্র ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন করা হয়।') 
                            : (theme.feature2DescEn || 'Get fast doorstep delivery across Bangladesh. Deliveries inside district hubs completed within 24-48 hours.')}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <span className="h-8 w-8 rounded bg-gray-900 text-white flex items-center justify-center font-mono text-xs font-bold">III</span>
                        <h3 className="text-sm font-bold tracking-wider uppercase text-gray-950 font-sans">
                          {lang === 'bn' 
                            ? (theme.feature3TitleBn || 'সহজ রিটার্ন ও ওয়ারেন্টি সুবিধা') 
                            : (theme.feature3TitleEn || 'Easy Return & Warranty')}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">
                          {lang === 'bn' 
                            ? (theme.feature3DescBn || 'প্রতিটি ডিভাইসের সাথে পাচ্ছেন নিশ্চিত ওয়ারেন্টি কার্ড এবং যেকোনো সমস্যায় ৩ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ গ্যারান্টি।') 
                            : (theme.feature3DescEn || 'Every premium gadget is covered by comprehensive replacement warranty and hassle-free 3-day exchanges.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {/* SHOP CATALOG VIEW */}
          {activeCategory && !currentViewedProduct && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-left space-y-6 animate-in fade-in">
              
              {/* Directory path finder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-gray-950 uppercase">
                    {activeCategory === 'all' 
                      ? (lang === 'bn' ? 'সকল প্রিমিয়াম প্রোডাক্টস' : 'All Hardware Curations') 
                      : categories.find(c => c.id === activeCategory)?.name || 'Storefront Curations'}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {lang === 'bn' 
                      ? `মোট ${formatBanglaNumber(filteredProducts.length)}টি প্রোডাক্ট পাওয়া গেছে` 
                      : `Showing ${filteredProducts.length} premium systems`}
                  </p>
                </div>

                {/* Search and Sort controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden bg-white w-full sm:w-48"
                    />
                    <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="default">{lang === 'bn' ? 'অর্ডারিং: সাধারণ' : 'Default Sort'}</option>
                    <option value="price-asc">{t.sortPriceLowHigh}</option>
                    <option value="price-desc">{t.sortPriceHighLow}</option>
                    <option value="rating">{t.sortRating}</option>
                  </select>
                </div>
              </div>

              {/* Products Catalog Display Grid */}
              {catalogRefreshing ? (
                <div className="h-96 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-80 border border-dashed border-gray-200/80 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <ShoppingBag className="h-8 w-8 text-gray-300 mb-2 animate-bounce" />
                  <h3 className="text-sm font-bold text-gray-800">{lang === 'bn' ? 'কোনো প্রোডাক্ট মিলছে না' : 'No curations match filters'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lang === 'bn' ? 'অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে সার্চ করুন অথবা ফিল্টার মুছুন।' : 'Please modify your search criteria or clear query filter.'}</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-4 text-xs font-bold text-emerald-600 underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'ফিল্টার পরিষ্কার করুন' : 'Clear All Filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      theme={theme}
                      settings={settings}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRODUCT DETAIL SPECIFICATION PAGE */}
          {currentViewedProduct && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-left animate-in fade-in duration-200 space-y-12">
              
              {/* Back navigation */}
              {/* Return to gallery catalog action */}
              <button
                onClick={() => setViewedProduct(null)}
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-3xs hover:bg-gray-50 transition-colors cursor-pointer mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{lang === 'bn' ? 'সব প্রোডাক্টে ফিরে যান' : 'Return to Catalog'}</span>
              </button>

              {/* Core layouts details split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                
                {/* Images Showcase */}
                <div className="space-y-4">
                  <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img
                      src={currentViewedImages[productDetailActiveImg] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
                      alt={currentViewedProduct.title || ''}
                      className="h-full w-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Image thumbnails slider */}
                  {currentViewedImages.length > 1 && (
                    <div className="flex space-x-3.5">
                      {currentViewedImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setProductDetailActiveImg(index)}
                          className={`h-16 w-16 overflow-hidden rounded-lg border bg-gray-50 transition-all cursor-pointer ${
                            productDetailActiveImg === index ? 'scale-105 shadow-sm border-emerald-500' : 'border-gray-200'
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specifications Description and Actions */}
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                        {currentViewedProduct.sku || 'N/A'}
                      </span>
                      {(currentViewedProduct.inventory ?? 0) <= 0 ? (
                        <span className="text-[10px] font-bold font-mono tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                          {t.outOfStock}
                        </span>
                      ) : (currentViewedProduct.inventory ?? 0) <= 5 ? (
                        <span className="text-[10px] font-bold font-mono tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase animate-pulse">
                          {lang === 'bn' ? 'স্টক প্রায় শেষ!' : 'Low Inventory Warning'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold font-mono tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">
                          {lang === 'bn' ? `স্টকে আছে (${formatBanglaNumber(currentViewedProduct.inventory ?? 0)}টি)` : `In Stock (${currentViewedProduct.inventory ?? 0} units)`}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <h1 className="text-2xl sm:text-3xl font-black text-gray-950 font-sans tracking-tight flex-1">
                        {currentViewedProduct.title || ''}
                      </h1>
                      
                      {/* 3-dot Share Menu Dropdown */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setShareMenuOpen(!shareMenuOpen)}
                          className="p-2.5 rounded-xl border border-gray-150 bg-white text-gray-600 hover:text-gray-900 shadow-3xs transition-all hover:bg-gray-50 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Share Options"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {shareMenuOpen && (
                          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              onClick={() => {
                                handleCopyLink(currentViewedProduct);
                                setShareMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Link className="h-4 w-4 text-gray-400" />
                              <span>{lang === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy Product Link'}</span>
                            </button>
                            
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent((currentViewedProduct.title || '') + ' - ' + getProductShareUrl(currentViewedProduct))}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setShareMenuOpen(false)}
                              className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="h-4 w-4 text-emerald-500" />
                              <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে শেয়ার' : 'Share to WhatsApp'}</span>
                            </a>

                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductShareUrl(currentViewedProduct))}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setShareMenuOpen(false)}
                              className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Facebook className="h-4 w-4 text-blue-600" />
                              <span>{lang === 'bn' ? 'ফেসবুকে শেয়ার' : 'Share on Facebook'}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {copySuccess && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 text-3xs font-bold font-mono tracking-wide animate-in fade-in duration-200">
                        {lang === 'bn' ? '✓ লিংকটি সফলভাবে ক্লিপবোর্ডে কপি হয়েছে!' : '✓ Product link successfully copied to clipboard!'}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(currentViewedProduct.rating ?? 5) ? 'fill-current' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-500">
                        {Number(currentViewedProduct.rating ?? 5.0).toFixed(1)} / 5.0 ({lang === 'bn' ? `${formatBanglaNumber(currentViewedProduct.reviewsCount ?? 0)}টি রিভিউ` : `${currentViewedProduct.reviewsCount ?? 0} reviews`})
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline space-x-3">
                    <span className="text-2xl font-mono font-black text-gray-950">
                      {formatPrice(currentViewedProduct.price ?? 0, lang)}
                    </span>
                    {currentViewedProduct.compareAtPrice && currentViewedProduct.compareAtPrice > currentViewedProduct.price && (
                      <span className="text-sm font-mono text-gray-400 line-through">
                        {formatPrice(currentViewedProduct.compareAtPrice, lang)}
                      </span>
                    )}
                  </div>

                  {/* Color Selector */}
                  {currentViewedProduct.colors && currentViewedProduct.colors.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-3xs font-bold font-mono text-gray-400 uppercase tracking-wider block">
                        {lang === 'bn' ? 'কালার সিলেক্ট করুন (Select Color)' : 'Select Product Color'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentViewedProduct.colors.map((color, index) => {
                          const isSelected = selectedColor === color;
                          const isHex = color.startsWith('#') || color.match(/^rgba?\(.*\)$/);
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color)}
                              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-3xs scale-105' 
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span 
                                className={`w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0 ${isSelected ? 'ring-2 ring-emerald-500' : ''}`} 
                                style={{ backgroundColor: isHex ? color : undefined }} 
                              />
                              <span>{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Spec description block */}
                  <div className="space-y-1.5">
                    <span className="text-3xs font-bold font-mono text-gray-400 uppercase tracking-wider block">
                      {lang === 'bn' ? 'প্রোডাক্ট টেকনিক্যাল স্পেসিফিকেশন' : 'Product Technical Specifications'}
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100/60 font-sans">
                      {currentViewedProduct.description || ''}
                    </p>
                  </div>

                  {/* Add to basket & Buy Now Actions */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        disabled={(currentViewedProduct.inventory ?? 0) <= 0}
                        onClick={() => handleBuyNow(currentViewedProduct)}
                        className="flex-1 inline-flex items-center justify-center rounded-xl py-4 text-sm font-black text-white shadow-md hover:opacity-90 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <ArrowRight className="mr-2 h-4 w-4 animate-bounce" />
                        <span>{(currentViewedProduct.inventory ?? 0) <= 0 ? t.outOfStock : (lang === 'bn' ? 'এখনি অর্ডার করুন (Buy Now)' : 'Buy Now')}</span>
                      </button>

                      <button
                        disabled={(currentViewedProduct.inventory ?? 0) <= 0}
                        onClick={() => handleAddToCart(currentViewedProduct, 1)}
                        className="flex-1 inline-flex items-center justify-center rounded-xl py-4 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>{(currentViewedProduct.inventory ?? 0) <= 0 ? t.outOfStock : t.addToCart}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Product Critiques Feed Section */}
              <ReviewsSection
                product={currentViewedProduct}
                theme={theme}
                settings={settings}
                lang={lang}
              />

            </div>
          )}
          </>
          )}

        </main>
      )}

      {/* LIVE SUPPORT & CONNECT HUB */}
      {(settings.supportNumber || settings.supportWhatsapp || settings.facebookUrl || settings.instagramUrl || settings.youtubeUrl || settings.tiktokUrl) && (
        <section className="bg-gray-950 border-t border-gray-900 py-12 text-left">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900/60 border border-gray-850 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Left Side: Live support branding */}
              <div className="space-y-3 max-w-lg text-center lg:text-left">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ● Live Customer Support (২৪/৭ কাস্টমার সাপোর্ট)
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight leading-snug">
                  {lang === 'bn' ? 'যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি যোগাযোগ করুন' : 'Have Questions? Connect Directly with Support Now'}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm font-sans leading-relaxed">
                  {lang === 'bn' ? 'অর্ডার, ডেলিভারি বা যেকোনো প্রোডাক্ট সম্পর্কিত তথ্যের জন্য আমাদের কল করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ করুন।' : 'Get instant responses regarding your order status, delivery, or detailed product specifications.'}
                </p>
              </div>

              {/* Right Side: Active CTAs & Social Links */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-4 w-full lg:w-auto">
                
                {/* Call Support Card */}
                {settings.supportNumber && (
                  <a
                    href={`tel:${settings.supportNumber}`}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
                  >
                    <Phone className="h-5 w-5 animate-pulse" />
                    <div className="text-left font-sans">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">{lang === 'bn' ? 'সরাসরি কল করুন' : 'CALL SUPPORT'}</p>
                      <p className="text-base font-extrabold tracking-tight">{settings.supportNumber}</p>
                    </div>
                  </a>
                )}

                {/* WhatsApp Support Card */}
                {settings.supportWhatsapp && (
                  <a
                    href={`https://wa.me/${settings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-3 bg-gray-850 hover:bg-gray-800 border border-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                    <div className="text-left font-sans">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{lang === 'bn' ? 'হোয়াটসঅ্যাপে মেসেজ করুন' : 'WHATSAPP CHAT'}</p>
                      <p className="text-base font-extrabold tracking-tight">{settings.supportWhatsapp}</p>
                    </div>
                  </a>
                )}

              </div>
            </div>

            {/* Social channels underneath if configured */}
            {(settings.facebookUrl || settings.instagramUrl || settings.youtubeUrl || settings.tiktokUrl) && (
              <div className="mt-8 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-3xs uppercase font-bold font-mono tracking-widest text-gray-500">
                  {lang === 'bn' ? 'আমাদের সামাজিক যোগাযোগ মাধ্যমসমূহ' : 'FOLLOW US ON SOCIAL NODES'}
                </span>
                <div className="flex items-center gap-3">
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-blue-600 transition-all shadow-sm"
                      title="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-pink-600 transition-all shadow-sm"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-red-600 transition-all shadow-sm"
                      title="YouTube"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                  {settings.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-emerald-500 transition-all shadow-sm flex items-center justify-center"
                      title="TikTok"
                    >
                      {/* TikTok generic video node indicator */}
                      <Share2 className="h-4 w-4 text-emerald-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer 
        className="border-t bg-gray-900 text-gray-400 py-12 text-left"
        style={{ borderTopColor: `${theme.primaryColor}20` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
          <div className="space-y-3">
            <h4 className="font-sans text-sm font-bold text-white tracking-widest">{settings.shopName.toUpperCase()}</h4>
            <p className="text-gray-500 leading-relaxed max-w-xs font-sans text-2xs">
              Structurally refined essentials and mechanical hardware integrations engineered to elevate performance and minimalist harmony.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <h4 className="text-3xs font-bold uppercase text-gray-500 tracking-widest">Company Node</h4>
              <button onClick={() => { setActiveStaticPage('about'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</button>
              <button onClick={() => { setActiveStaticPage('contact'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}</button>
              <button onClick={() => { setActiveStaticPage('order-track'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Order Tracking'}</button>
            </div>
            <div className="space-y-2 text-left">
              <h4 className="text-3xs font-bold uppercase text-gray-500 tracking-widest">Policies</h4>
              <button onClick={() => { setActiveStaticPage('privacy'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</button>
              <button onClick={() => { setActiveStaticPage('refund'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'রিটার্ন পলিসি' : 'Return & Refund'}</button>
              <button onClick={() => { setActiveStaticPage('shipping'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'শিপিং পলিসি' : 'Shipping Guidelines'}</button>
              <button onClick={() => { setActiveStaticPage('terms'); setViewedProduct(null); setActiveCategory(null); setSuccessOrderId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-gray-500 hover:text-white transition-colors text-left font-sans cursor-pointer">{lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}</button>
            </div>
          </div>
          
          <div className="space-y-2 text-left md:text-right flex flex-col md:items-end justify-between">
            <div className="space-y-1">
              <h4 className="text-3xs font-bold uppercase text-gray-500 tracking-widest">Office Coordinates</h4>
              <p className="text-gray-500">{settings.address}</p>
              <p className="text-gray-500">Tel: {settings.contactPhone}</p>
              <p className="text-gray-500">Email: {settings.contactEmail}</p>
            </div>
            
            <span className="text-3xs text-gray-600 block pt-4">
              © {new Date().getFullYear()} {settings.shopName}. All structural rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* --- CART DRAWER OVERLAY --- */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        theme={theme}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleTriggerCheckout}
        lang={lang}
      />

      {/* --- CHECKOUT GATEWAY MODAL --- */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        appliedCoupon={checkoutCoupon}
        discountAmount={checkoutDiscount}
        theme={theme}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
        lang={lang}
      />

      {/* --- SECRET PIN ACCESS LOCK --- */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        settings={settings}
        theme={theme}
        onUnlockSuccess={() => {
          setShowPinModal(false);
          setActiveAdmin(true); // Jump directly into CMS Console
        }}
      />

    </div>
  );
}
