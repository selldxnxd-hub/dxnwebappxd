/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Tag, AlertTriangle, Link, Check, Facebook, Send } from 'lucide-react';
import { Product, ThemeConfig, SystemSettings } from '../types';
import { motion } from 'motion/react';
import { translations, formatPrice, getProductImages } from '../utils/translations';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  theme: ThemeConfig;
  settings: SystemSettings;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  lang: 'bn' | 'en';
}

export default function ProductCard({
  product,
  theme,
  settings,
  onViewDetails,
  onAddToCart,
  onBuyNow,
  lang
}: ProductCardProps) {
  const t = translations[lang];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy product link:', err);
    });
  };

  // Check discount
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  // Inventory logic
  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;

  const productImages = getProductImages(product.images);

  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      onMouseEnter={() => {
        setIsHovered(true);
        if (productImages.length > 1) {
          setActiveImageIdx(1);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIdx(0);
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300"
    >
      {/* Visual Canvas Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 items-start">
          {hasDiscount && (
            <span className="inline-flex items-center space-x-1 rounded bg-red-500 px-2 py-0.5 text-3xs font-extrabold tracking-wide uppercase text-white shadow-xs">
              <Tag className="h-3 w-3" />
              <span>
                {lang === 'bn' ? `${discountPercent}% ছাড়` : `Save ${discountPercent}%`}
              </span>
            </span>
          )}
          {product.isFeatured && (
            <span 
              className="inline-flex items-center rounded px-2 py-0.5 text-3xs font-extrabold tracking-wide uppercase text-white shadow-xs"
              style={{ backgroundColor: theme.accentColor }}
            >
              {lang === 'bn' ? 'সেরা অফার' : 'Featured'}
            </span>
          )}
        </div>

        {/* Stock warning overlays */}
        <div className="absolute bottom-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center space-x-1 rounded bg-gray-900 px-2.5 py-1 text-3xs font-bold uppercase text-white">
              {lang === 'bn' ? 'স্টক শেষ' : 'Sold Out'}
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center space-x-1 rounded bg-amber-500 px-2 py-0.5 text-3xs font-bold uppercase text-white">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {lang === 'bn' ? `মাত্র ${product.inventory}টি বাকি` : `Only ${product.inventory} left`}
              </span>
            </span>
          ) : null}
        </div>

        {/* Image display */}
        <img
          src={productImages[activeImageIdx] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic details modal shortcut on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={() => onViewDetails(product)}
            className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-xs text-gray-800 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
          >
            <Eye className="h-5 w-5" />
          </button>

          <button
            onClick={handleCopyLink}
            className={`p-3 rounded-full shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
              copied ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
            title={lang === 'bn' ? (copied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন') : (copied ? 'Copied!' : 'Copy Link')}
          >
            {copied ? <Check className="h-5 w-5 animate-pulse" /> : <Link className="h-5 w-5" />}
          </button>
          
          {!isOutOfStock && (
            <button
              onClick={() => onAddToCart(product)}
              className="p-3 rounded-full shadow-xs text-white transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.accentColor }}
              title={t.addToCart}
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 text-left">
        <div className="flex items-center space-x-1 mb-1">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < Math.round(product.rating ?? 5) ? 'fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-3xs font-mono text-gray-400 font-semibold">
            ({product.reviewsCount || 0})
          </span>
        </div>

        <h3 className="font-sans text-sm font-bold text-gray-950 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {product.title}
        </h3>
        
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Pricing block */}
        <div className="mt-auto pt-3 flex items-baseline justify-between border-t border-gray-50 mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-base font-mono font-black text-emerald-700">
              {formatPrice(product.price, lang)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-mono font-semibold text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!, lang)}
              </span>
            )}
          </div>
        </div>

        {/* Social Sharing bar */}
        <div className="flex items-center justify-between py-1.5 mb-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            {lang === 'bn' ? 'শেয়ার করুন:' : 'Share Product:'}
          </span>
          <div className="flex items-center space-x-1.5">
            {/* Facebook Share */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `${window.location.origin}${window.location.pathname}?product=${product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5.5 h-5.5 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Share on Facebook"
              onClick={(e) => e.stopPropagation()}
            >
              <Facebook className="h-3 w-3" />
            </a>
            {/* WhatsApp Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${product.title}: ${window.location.origin}${window.location.pathname}?product=${product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5.5 h-5.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Share on WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[9px] font-black">W</span>
            </a>
            {/* Telegram Share */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                `${window.location.origin}${window.location.pathname}?product=${product.id}`
              )}&text=${encodeURIComponent(product.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5.5 h-5.5 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Share on Telegram"
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="h-2.5 w-2.5" />
            </a>
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                copied ? 'bg-emerald-500 text-white' : 'bg-gray-150 hover:bg-gray-250 text-gray-600'
              }`}
              title={lang === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}
            >
              {copied ? <Check className="h-3 w-3" /> : <Link className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Instant Buy Now CTA */}
        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onBuyNow(product);
          }}
          className="w-full inline-flex items-center justify-center space-x-1.5 rounded-xl py-2.5 text-xs font-black tracking-wide uppercase text-white shadow-xs hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer text-center"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>
            {isOutOfStock 
              ? (lang === 'bn' ? 'স্টক আউট' : 'Out of Stock') 
              : (lang === 'bn' ? 'অর্ডার করুন (Buy Now)' : 'Order Now')}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
