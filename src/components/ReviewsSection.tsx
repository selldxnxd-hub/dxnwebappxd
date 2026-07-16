/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldAlert, PenTool, CheckCircle } from 'lucide-react';
import { Product, Review, ThemeConfig, SystemSettings } from '../types';
import { getReviews, addReview } from '../services/db';
import { motion } from 'motion/react';
import { translations } from '../utils/translations';

interface ReviewsSectionProps {
  product: Product;
  theme: ThemeConfig;
  settings: SystemSettings;
  lang: 'bn' | 'en';
}

export default function ReviewsSection({
  product,
  theme,
  settings,
  lang
}: ReviewsSectionProps) {
  const t = translations[lang];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch reviews on load
  const loadReviewsData = async () => {
    setIsLoading(true);
    try {
      const data = await getReviews(product.id);
      // Filter out non-active reviews
      setReviews(data.filter(r => r.active));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!userName.trim() || !userEmail.trim() || !comment.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে সব তথ্য দিন।' : 'Please populate all submission fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview: Review = {
        id: 'rev-' + Date.now(),
        productId: product.id,
        userName: userName.trim(),
        userEmail: userEmail.trim().toLowerCase(),
        rating,
        comment: comment.trim(),
        active: true,
        createdAt: new Date().toISOString()
      };

      await addReview(newReview);
      
      setSuccessMsg(t.reviewSuccess);
      setUserName('');
      setUserEmail('');
      setComment('');
      setRating(5);
      
      // Reload reviews
      await loadReviewsData();
    } catch (err) {
      setErrorMsg(lang === 'bn' ? 'রিভিউ সাবমিট করতে ত্রুটি হয়েছে।' : 'Network error publishing review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8 text-left">
      <h3 className="text-lg font-bold text-gray-950 mb-6 flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-gray-700" />
        <span>{t.customerReviews} ({reviews.length})</span>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Score Summary */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Average Rating Block */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex items-center space-x-5">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-gray-950 font-mono">
                {Number(product.rating ?? 5.0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 block font-mono">{lang === 'bn' ? '৫ এর মধ্যে' : 'out of 5'}</span>
            </div>
            <div>
              <div className="flex text-amber-400 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating ?? 5) ? 'fill-current' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-2xs text-gray-500 font-mono">
                {lang === 'bn' ? `${reviews.length}টি প্রকৃত গ্রাহক রিভিউয়ের ভিত্তিতে` : `Based on ${reviews.length} authentic customer critiques`}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Feed of critiques */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 w-full animate-pulse bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200/80 p-8 text-center flex flex-col items-center justify-center">
              <Star className="h-8 w-8 text-gray-300 mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-gray-800">{t.noReviewsYet}</h4>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id} 
                id={`review-item-${rev.id}`}
                className="rounded-xl border border-gray-100 p-5 space-y-3 animate-in fade-in duration-250 text-left bg-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">{rev.userName}</h5>
                    <span className="text-3xs text-gray-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Score stars */}
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed font-sans">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
