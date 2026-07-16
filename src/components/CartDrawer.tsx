/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Tag, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { CartItem, Coupon, ThemeConfig, SystemSettings } from '../types';
import { subscribeCoupons } from '../firebase/firestore';
import { motion } from 'motion/react';
import { translations, formatPrice } from '../utils/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  theme: ThemeConfig;
  settings: SystemSettings;
  onUpdateQuantity: (productId: string, quantity: number, color?: string) => void;
  onRemoveItem: (productId: string, color?: string) => void;
  onCheckout: (appliedCoupon: Coupon | null, discountAmount: number) => void;
  lang: 'bn' | 'en';
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  theme,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  lang
}: CartDrawerProps) {
  const t = translations[lang];
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  // Compute Subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Validate Promo Coupon
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setIsValidating(true);
    setPromoError('');
    setPromoSuccess('');

    // Fetch coupons dynamically with real-time subscription helper (we listen once)
    const unsub = subscribeCoupons((coupons) => {
      unsub(); // stop listening immediately after matching
      const match = coupons.find(c => c.code.toUpperCase() === promoCode.trim().toUpperCase());

      if (!match) {
        setPromoError(t.invalidCoupon);
        setAppliedCoupon(null);
      } else if (!match.active) {
        setPromoError(lang === 'bn' ? 'এই কুপনটি বর্তমানে সচল নেই।' : 'This coupon is inactive.');
        setAppliedCoupon(null);
      } else if (match.minOrderValue && subtotal < match.minOrderValue) {
        setPromoError(
          lang === 'bn' 
            ? `এই কুপনটি ব্যবহার করতে ন্যূনতম ${formatPrice(match.minOrderValue, lang)} অর্ডার করতে হবে।`
            : `Minimum order value of ${formatPrice(match.minOrderValue, lang)} required for this coupon.`
        );
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(match);
        setPromoSuccess(t.couponApplied);
      }
      setIsValidating(false);
    });
  };

  // Compute discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-950">{t.cartTitle}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {lang === 'bn' ? 'টি পণ্য' : 'items'}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[350px] text-center">
                <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4 animate-bounce">
                  <ShoppingBag className="h-12 w-12" />
                </div>
                <h3 className="text-base font-bold text-gray-800">{t.emptyCart}</h3>
                <p className="text-xs text-gray-400 max-w-xs mt-2 leading-relaxed">
                  {lang === 'bn' ? 'আমাদের অসাধারণ কালেকশন থেকে আপনার পছন্দের প্রোডাক্ট খুঁজে কার্টে যোগ করুন।' : 'Browse our premium gadgets and elevate your daily experience.'}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-md"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={`${item.product.id}-${item.selectedColor || ''}`} 
                  id={`cart-item-${item.product.id}-${item.selectedColor || ''}`}
                  className="flex items-center space-x-4 border-b border-gray-50 pb-4 animate-in fade-in"
                >
                  <img 
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'} 
                    alt={item.product.title} 
                    className="h-16 w-16 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {item.product.title}
                    </h4>
                    {item.selectedColor && (
                      <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mt-1">
                        {lang === 'bn' ? `কালার: ${item.selectedColor}` : `Color: ${item.selectedColor}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                      {formatPrice(item.product.price, lang)}
                    </p>
                    
                    {/* Quantity controllers */}
                    <div className="flex items-center space-x-2.5 mt-2">
                      <div className="flex items-center border rounded-lg border-gray-200 bg-white">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold font-mono text-gray-800">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                          disabled={item.quantity >= item.product.inventory}
                          className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-gray-900">
                      {formatPrice(item.product.price * item.quantity, lang)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout block */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
              {/* Promo input code */}
              <div className="space-y-1">
                <label className="text-2xs font-bold font-mono tracking-wider text-gray-500 uppercase block text-left">
                  {t.applyCoupon}
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. PROMO10"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm uppercase placeholder-gray-400 font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                    {appliedCoupon && (
                      <Check className="absolute top-2.5 right-3 h-4.5 w-4.5 text-green-500" />
                    )}
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={isValidating || !promoCode.trim()}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: theme.secondaryColor }}
                  >
                    {isValidating ? (lang === 'bn' ? 'যাচাই...' : 'Applying...') : t.applyBtn}
                  </button>
                </div>
                
                {promoError && (
                  <p className="text-xs text-red-600 flex items-center space-x-1 mt-1 text-left">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{promoError}</span>
                  </p>
                )}
                {promoSuccess && (
                  <p className="text-xs text-green-600 flex items-center space-x-1 mt-1 text-left">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{promoSuccess}</span>
                  </p>
                )}
              </div>

              {/* Price summary listing */}
              <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal, lang)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center space-x-1">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{t.couponDiscount} ({appliedCoupon?.code})</span>
                    </span>
                    <span className="font-bold">-{formatPrice(discount, lang)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>{t.deliveryCharge}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 font-mono">{lang === 'bn' ? 'পরবর্তী ধাপে হিসাবকৃত' : 'Calculated at checkout'}</span>
                </div>

                <div className="flex justify-between border-t border-gray-200/80 pt-2 text-base font-extrabold text-gray-950">
                  <span>{t.total}</span>
                  <span className="font-extrabold text-emerald-700">{formatPrice(grandTotal, lang)}</span>
                </div>
              </div>

              {/* Trigger checkout */}
              <button
                onClick={() => onCheckout(appliedCoupon, discount)}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md bg-emerald-600"
                style={{ backgroundColor: theme.accentColor }}
              >
                {t.checkoutBtn}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
