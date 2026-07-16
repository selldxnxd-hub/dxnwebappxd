import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, CheckCircle2, AlertCircle, Clock, Truck, ShieldCheck, HelpCircle } from 'lucide-react';
import { ThemeConfig, SystemSettings, Order } from '../types';
import { OrderService } from '../services/order';
import { formatCurrency, formatDate } from '../utils/formatter';

interface StaticPageViewerProps {
  slug: string;
  theme: ThemeConfig;
  settings: SystemSettings;
  lang: 'bn' | 'en';
  onGoHome: () => void;
}

export default function StaticPageViewer({
  slug,
  theme,
  settings,
  lang,
  onGoHome
}: StaticPageViewerProps) {
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderId.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackingOrder(null);

    try {
      const order = await OrderService.getById(trackOrderId.trim());
      if (order) {
        setTrackingOrder(order);
      } else {
        setTrackError(
          lang === 'bn' 
            ? 'দুঃখিত, এই অর্ডার আইডিটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডিটি প্রবেশ করান।' 
            : 'Sorry, this Order ID could not be found. Please check and try again.'
        );
      }
    } catch (err) {
      setTrackError(
        lang === 'bn' 
          ? 'সার্ভারে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
          : 'Failed to connect. Please try again.'
      );
    } finally {
      setTrackLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setContactSuccess(false);
    }, 4000);
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = trackingOrder ? getStatusStep(trackingOrder.status) : 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-left font-sans animate-in fade-in duration-200">
      
      {/* 1. ORDER TRACKING VIEW */}
      {slug === 'order-track' && (
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 uppercase">
              {lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {lang === 'bn' 
                ? 'আপনার ইনভয়েস থেকে অর্ডার আইডি প্রবেশ করিয়ে ডেলিভারি ট্র্যাকিং স্টেটাস চেক করুন।' 
                : 'Enter your custom Order ID from the receipt to monitor delivery state.'}
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              required
              placeholder={lang === 'bn' ? 'অর্ডার আইডি লিখুন (উদা: ORD-XXXXXXXX)' : 'Enter Order ID (e.g. ORD-171501)'}
              value={trackOrderId}
              onChange={(e) => setTrackOrderId(e.target.value)}
              className="flex-grow rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs outline-none focus:border-gray-900 font-mono"
            />
            <button
              type="submit"
              disabled={trackLoading}
              className="rounded-xl px-5 py-3 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Search className="h-4 w-4" />
              <span>{lang === 'bn' ? 'অনুসন্ধান' : 'Track'}</span>
            </button>
          </form>

          {/* LOADING STATE */}
          {trackLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: theme.primaryColor }} />
              <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest">CONNECTING ORDER DATABASE...</p>
            </div>
          )}

          {/* ERROR FEEDBACK */}
          {trackError && (
            <div className="max-w-md mx-auto p-4 rounded-xl border border-red-100 bg-red-50/50 flex items-start space-x-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <p>{trackError}</p>
            </div>
          )}

          {/* TRACKING TIMELINE RESULT */}
          {trackingOrder && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 space-y-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
                <div>
                  <span className="text-3xs font-bold font-mono text-gray-400 uppercase tracking-widest block">ORDER IDENTIFIER</span>
                  <span className="text-sm font-mono font-bold text-gray-950">{trackingOrder.id}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-3xs font-bold font-mono text-gray-400 uppercase tracking-widest block">ORDER DATE</span>
                  <span className="text-xs text-gray-700">{formatDate(trackingOrder.createdAt, lang)}</span>
                </div>
              </div>

              {/* STAT STEPPER TIMELINE */}
              <div className="relative pt-4 pb-8">
                {/* Connector line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-100 sm:left-1/2 sm:-ml-0.25 sm:top-12 sm:bottom-12" />
                
                <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-4 relative">
                  
                  {/* Step 1: Pending */}
                  <div className="flex sm:flex-col items-center text-left sm:text-center space-x-4 sm:space-x-0 sm:space-y-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 z-10 ${
                      currentStep >= 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{lang === 'bn' ? 'অর্ডার সফল হয়েছে' : 'Order Placed'}</h4>
                      <p className="text-3xs text-gray-400 font-medium">{lang === 'bn' ? 'অর্ডার পেন্ডিং অবস্থায় আছে' : 'Queue verified'}</p>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex sm:flex-col items-center text-left sm:text-center space-x-4 sm:space-x-0 sm:space-y-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 z-10 ${
                      currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{lang === 'bn' ? 'প্রসেসিং' : 'Processing'}</h4>
                      <p className="text-3xs text-gray-400 font-medium">{lang === 'bn' ? 'পেমেন্ট যাচাই করা হচ্ছে' : 'Payment auditing'}</p>
                    </div>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex sm:flex-col items-center text-left sm:text-center space-x-4 sm:space-x-0 sm:space-y-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 z-10 ${
                      currentStep >= 3 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{lang === 'bn' ? 'শিপড হয়েছে' : 'Shipped'}</h4>
                      <p className="text-3xs text-gray-400 font-medium">{lang === 'bn' ? 'কুরিয়ারে পাঠানো হয়েছে' : 'In transit'}</p>
                    </div>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="flex sm:flex-col items-center text-left sm:text-center space-x-4 sm:space-x-0 sm:space-y-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 z-10 ${
                      currentStep >= 4 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Completed'}</h4>
                      <p className="text-3xs text-gray-400 font-medium">{lang === 'bn' ? 'সফলভাবে বুঝিয়ে দেয়া হয়েছে' : 'Successfully delivered'}</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Order specifications recap */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="text-2xs font-bold font-mono uppercase tracking-wider text-gray-500">
                  {lang === 'bn' ? 'অর্ডার করা আইটেমসমূহ' : 'Purchased Systems'}
                </h3>
                <div className="space-y-2">
                  {trackingOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-100/60">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.product.title}</span>
                        <span className="text-3xs text-gray-400 font-mono">SKU: {item.product.sku}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">
                        {item.quantity} × {formatCurrency(item.product.price, settings.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal table details */}
                <div className="pt-4 border-t border-gray-100/60 grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-gray-500">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment Option:'}</span>
                  <span className="font-bold text-gray-900 text-right uppercase font-mono">{trackingOrder.paymentMethod}</span>

                  <span className="text-gray-500">{lang === 'bn' ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Status:'}</span>
                  <span className={`font-bold text-right ${
                    trackingOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {trackingOrder.paymentStatus === 'paid' 
                      ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid') 
                      : (lang === 'bn' ? 'বাকি' : 'Pending Verification')}
                  </span>

                  <span className="text-gray-500">{lang === 'bn' ? 'মোট মূল্য:' : 'Grand Total:'}</span>
                  <span className="font-mono font-black text-gray-950 text-right text-sm">
                    {formatCurrency(trackingOrder.total, settings.currency)}
                  </span>
                </div>

                {/* Address logistics card */}
                <div className="pt-4 border-t border-gray-100/60 text-xs space-y-2">
                  <span className="text-2xs font-mono font-bold text-gray-400 uppercase tracking-widest block">LOGISTICS ADDRESS</span>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/60 space-y-1">
                    <p className="font-bold text-gray-900">{trackingOrder.customerName}</p>
                    <p className="text-gray-600">{trackingOrder.customerPhone}</p>
                    <p className="text-gray-600 leading-relaxed">{trackingOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ABOUT US VIEW */}
      {slug === 'about' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase border-b border-gray-100 pb-4">
            {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Aether Electronics'}
          </h1>
          <div className="prose prose-sm leading-relaxed text-gray-700 space-y-4">
            <p>
              {lang === 'bn' 
                ? 'অ্যাথার ইলেকট্রনিক্স বাংলাদেশের প্রথম সারির একটি বিশেষায়িত গ্যাজেট এবং ইলেকট্রনিক্স ব্র্যান্ড স্টোর। আমাদের লক্ষ্য হলো বিশ্বমানের আসল এবং প্রিমিয়াম কোয়ালিটির কীবোর্ড, অডিও ইকুইপমেন্ট, এবং ডেস্ক সেটআপ অ্যাকসেসরিজ সরাসরি আমদানির মাধ্যমে বাংলাদেশের গ্রাহকদের কাছে পৌঁছে দেওয়া।' 
                : 'Aether Electronics is Bangladesh’s premier specialized boutique gear retailer. We curate authentic global brands, mechanical keyboard components, advanced acoustic equipment, and refined workspace hardware with a clear focus on minimalist design and durability.'}
            </p>
            <p>
              {lang === 'bn' 
                ? 'আমরা প্রতিটি ডিভাইসের জেনুইন কোয়ালিটি নিশ্চিত করি। আমাদের ক্যাটালগে থাকা প্রতিটি গ্যাজেট ১০০% অথেনটিক এবং আমদানিকৃত ওয়ারেন্টি সম্বলিত।' 
                : 'We operate directly with licensed manufacturers, providing complete transparency, verification logs, and active replacement support for every product we import.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. CONTACT US VIEW */}
      {slug === 'contact' && (
        <div className="space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase">
              {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Headquarters'}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 text-xs text-gray-600">
              <p className="text-sm text-gray-700 leading-relaxed font-sans">
                {lang === 'bn' 
                  ? 'যেকোনো জিজ্ঞাস্য, হোলসেল পার্টনারশিপ বা প্রোডাক্ট ওয়ারেন্টির তথ্যের জন্য আমাদের কাছে টিকিট জমা দিন অথবা মেইল করুন।' 
                  : 'Submit a service query directly to our support nodes. Our customer team responds within 24 standard business hours.'}
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">{lang === 'bn' ? 'অফিস ঠিকানা:' : 'Headquarters Address:'}</h4>
                    <p className="mt-1">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">{lang === 'bn' ? 'মোবাইল হটলাইন:' : 'Hotline Callsign:'}</h4>
                    <p className="mt-1 font-mono">{settings.contactPhone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">{lang === 'bn' ? 'ইমেইল সাপোর্ট:' : 'Secure Email:'}</h4>
                    <p className="mt-1 font-mono">{settings.contactEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Message Submission Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100/80">
              {contactSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-900">{lang === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Submitted Successfully'}</p>
                  <p className="text-3xs text-gray-400 font-mono">ENCRYPTED TICKET RECIEVED</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-3xs font-mono font-bold text-gray-400 uppercase tracking-widest block">{lang === 'bn' ? 'আপনার নাম' : 'Your Name'}</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono font-bold text-gray-400 uppercase tracking-widest block">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-gray-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono font-bold text-gray-400 uppercase tracking-widest block">{lang === 'bn' ? 'বিষয়' : 'Subject'}</label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono font-bold text-gray-400 uppercase tracking-widest block">{lang === 'bn' ? 'বার্তা লিখুন' : 'Detailed Message'}</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl py-3 text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {lang === 'bn' ? 'বার্তা পাঠান' : 'Transmit Ticket'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 4. PRIVACY POLICY VIEW */}
      {slug === 'privacy' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase border-b border-gray-100 pb-4">
            {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Protection'}
          </h1>
          <div className="prose prose-sm leading-relaxed text-gray-700 space-y-4">
            <p>
              {lang === 'bn' 
                ? 'আপনার তথ্যের গোপনীয়তা রক্ষা করা অ্যাথার ইলেকট্রনিক্স-এর জন্য অত্যন্ত গুরুত্বপূর্ণ। অর্ডার বুকিং, ডেলিভারি ট্র্যাকিং এবং গেটওয়ে পেমেন্ট প্রসেসিং-এর জন্য প্রয়োজনীয় তথ্য (নাম, ঠিকানা, ফোন নম্বর, ট্রানজেকশন আইডি) আমরা সুরক্ষিত ডিক্রিপ্টেড সার্ভারে সংরক্ষণ করি।' 
                : 'Aether Electronics strictly secures customer data, logistics parameters, and transaction records. Your personal identifiers (name, address, telephone line) are exclusively applied for packing queue allocations and delivery coordination.'}
            </p>
            <p>
              {lang === 'bn' 
                ? 'আমরা কোনো গ্রাহকের পেমেন্ট ট্রানজেকশন আইডি বা ব্রাউজিং হিস্টোরি তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।' 
                : 'We operate under decentralized standards. Third-party marketing access, profiling engines, and telemetry shares are completely restricted.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. RETURN & REFUND POLICY */}
      {slug === 'refund' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase border-b border-gray-100 pb-4">
            {lang === 'bn' ? 'রিটার্ন এবং রিফান্ড পলিসি' : 'Return & Refund Policies'}
          </h1>
          <div className="prose prose-sm leading-relaxed text-gray-700 space-y-4">
            <p>
              {lang === 'bn' 
                ? 'আমরা গ্রাহক সন্তুষ্টির ওপর সর্বোচ্চ গুরুত্ব দিই। অ্যাথার ইলেকট্রনিক্স থেকে কেনা যেকোনো জেনুইন গ্যাজেট যদি আনবক্সিং করার সময় ত্রুটিযুক্ত বা ক্ষতিগ্রস্ত অবস্থায় পাওয়া যায়, তবে আপনি ৩ কার্যদিবসের মধ্যে সেটি আমাদের রিটার্ন করে নতুন প্রোডাক্ট দাবি করতে পারবেন।' 
                : 'Every hardware curation undergoes diagnostic screening. However, if a product arrives structurally damaged or dead-on-arrival (DOA), you are eligible for a replacement check or complete balance refund within 3 days.'}
            </p>
            <p className="font-bold text-gray-950">
              {lang === 'bn' ? 'রিফান্ড গ্রহণের নিয়মাবলি:' : 'Prerequisites for Refunds:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>{lang === 'bn' ? 'প্রোডাক্টের মূল বক্স এবং মেকানিক্যাল প্যাকিং অক্ষত থাকতে হবে।' : 'The original container box and manual leaflets must remain intact.'}</li>
              <li>{lang === 'bn' ? 'আনবক্সিং করার সময় একটি ক্লিয়ার ভিডিও রেকর্ড করতে হবে (যাতে কোনো প্রকার কাটাছেঁড়া না থাকে)।' : 'An unboxing uncut video log is highly recommended for claims.'}</li>
              <li>{lang === 'bn' ? 'ম্যানুয়াল ট্রানজেকশন যাচাইয়ের পর ৩-৫ কার্যদিবসের মধ্যে বিকাশ/নগদে রিফান্ড সম্পন্ন করা হয়।' : 'Manual refunds are processed to your bKash/Nagad within 3-5 business days.'}</li>
            </ul>
          </div>
        </div>
      )}

      {/* 6. SHIPPING POLICY */}
      {slug === 'shipping' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase border-b border-gray-100 pb-4">
            {lang === 'bn' ? 'শিপিং এবং ডেলিভারি পলিসি' : 'Shipping Logistics Policy'}
          </h1>
          <div className="prose prose-sm leading-relaxed text-gray-700 space-y-4">
            <p>
              {lang === 'bn' 
                ? 'আমরা সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ব্যবস্থা পরিচালনা করি। আপনার অর্ডারটি বুক করার পর আমরা উপযুক্ত প্যাকিংয়ে কুরিয়ারে হস্তান্তর করি।' 
                : 'Aether logistics ensures heavy-duty packaging with robust shock-proof air bubbles to preserve fragile electronics during transit across Bangladesh.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/60">
                <span className="text-3xs font-bold font-mono text-emerald-600 uppercase tracking-widest block">INSIDE DISTRICTS</span>
                <span className="text-sm font-bold text-gray-900 block mt-1">{formatCurrency(settings.shippingInsideDistrict || 60, settings.currency)}</span>
                <span className="text-3xs text-gray-400 block font-medium mt-1">Delivery Time: 24 - 48 Hours</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/60">
                <span className="text-3xs font-bold font-mono text-emerald-600 uppercase tracking-widest block">OUTSIDE DISTRICTS</span>
                <span className="text-sm font-bold text-gray-900 block mt-1">{formatCurrency(settings.shippingOutsideDistrict || 120, settings.currency)}</span>
                <span className="text-3xs text-gray-400 block font-medium mt-1">Delivery Time: 48 - 72 Hours</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {lang === 'bn' 
                ? '৳ ৩,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে কুরিয়ার খরচ সম্পূর্ণ ফ্রি।' 
                : 'Courier charges are auto-waived completely for shopping baskets valued above ৳3,000.'}
            </p>
          </div>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS */}
      {slug === 'terms' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase border-b border-gray-100 pb-4">
            {lang === 'bn' ? 'শর্তাবলি এবং নিয়মাবলি' : 'Terms & Conditions'}
          </h1>
          <div className="prose prose-sm leading-relaxed text-gray-700 space-y-4">
            <p>
              {lang === 'bn' 
                ? 'অ্যাথার ইলেকট্রনিক্স ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি এই সাইটের শর্তাবলিতে একমত প্রকাশ করছেন। ওয়েবসাইট বা পেমেন্ট ট্রানজেকশনে কোনো প্রকার জালিয়াতি বা ফেক স্ক্রিনশট সাবমিট করা আইনত দণ্ডনীয়।' 
                : 'By browsing this storefront or placing order records, you formally consent to our operational rules. Fraudulent bKash/Nagad transactions or false screenshot uploads are strictly audited and blacklisted.'}
            </p>
            <p>
              {lang === 'bn' 
                ? 'ডেলিভারিকৃত প্রোডাক্টে কোনো প্রকার বাহ্যিক আঘাত বা ম্যানুয়াল ড্যামেজে রিফান্ড বা এক্সচেঞ্জ প্রযোজ্য হবে না।' 
                : 'Warranty parameters fail if hardware elements exhibit signs of water-immersion, structural casing cracks, or manual overclocking.'}
            </p>
          </div>
        </div>
      )}

      {/* GO BACK HOME */}
      <div className="pt-8 border-t border-gray-100 flex items-center justify-start">
        <button
          onClick={onGoHome}
          className="rounded-xl px-5 py-2.5 text-xs font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
        >
          {lang === 'bn' ? '← হোমপেজে ফিরে যান' : '← Back to Storefront'}
        </button>
      </div>

    </div>
  );
}
