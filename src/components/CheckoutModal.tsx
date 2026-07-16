/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, CreditCard, Shield, Truck, Sparkles, CheckCircle, ArrowLeft, ArrowRight, Smartphone, Copy, Check } from 'lucide-react';
import { CartItem, Coupon, ThemeConfig, SystemSettings, Order, OrderItem, DeliveryArea } from '../types';
import { createOrder, subscribeDeliveryAreas } from '../firebase/firestore';
import { sendTelegramOrderNotification } from '../utils/telegram';
import { motion } from 'motion/react';
import { translations, formatPrice } from '../utils/translations';
import { bangladeshDistrictsData } from '../utils/bangladeshData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  theme: ThemeConfig;
  settings: SystemSettings;
  onOrderSuccess: (orderId: string) => void;
  lang: 'bn' | 'en';
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  appliedCoupon,
  discountAmount,
  theme,
  settings,
  onOrderSuccess,
  lang
}: CheckoutModalProps) {
  const t = translations[lang];

  // Real-time Delivery Areas state & listener
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');

  React.useEffect(() => {
    const unsubscribe = subscribeDeliveryAreas((areas) => {
      setDeliveryAreas(areas.filter(a => a.enabled));
    });
    return () => unsubscribe();
  }, []);

  // Steps: 1 = Address / Shipping region, 2 = Payment Selection & Submission
  const [step, setStep] = useState<1 | 2>(1);

  // Address Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('');
  const [districtSelection, setDistrictSelection] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [upazilaSelection, setUpazilaSelection] = useState('');
  const [customUpazila, setCustomUpazila] = useState('');

  const handleDistrictDropdownChange = (val: string) => {
    setDistrictSelection(val);
    setUpazilaSelection('');
    setUpazila('');
    setCustomUpazila('');
    if (val === 'custom') {
      setDistrict(customDistrict);
    } else {
      const selectedItem = bangladeshDistrictsData[val];
      if (selectedItem) {
        const nameToStore = lang === 'bn' ? selectedItem.bn : selectedItem.en;
        setDistrict(nameToStore);
        if (val === 'Dhaka') {
          setIsInsideDistrict(true);
        } else {
          setIsInsideDistrict(false);
        }
      } else {
        setDistrict('');
      }
    }
  };

  const handleCustomDistrictInputChange = (val: string) => {
    setCustomDistrict(val);
    setDistrict(val);
  };

  const handleUpazilaDropdownChange = (val: string) => {
    setUpazilaSelection(val);
    if (val === 'custom') {
      setUpazila(customUpazila);
    } else {
      setUpazila(val);
    }
  };

  const handleCustomUpazilaInputChange = (val: string) => {
    setCustomUpazila(val);
    setUpazila(val);
  };
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Shipping Region
  const [isInsideDistrict, setIsInsideDistrict] = useState<boolean>(true);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  
  // Manual Payment Info
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  if (!isOpen) return null;

  // Configuration thresholds
  const shippingInside = settings.shippingInsideDistrict ?? 80;
  const shippingOutside = settings.shippingOutsideDistrict ?? 150;
  const freeShipMin = settings.freeShippingMinAmount ?? 3000;
  const codFee = settings.codFee ?? 0;

  // Price arithmetic
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= freeShipMin;
  
  // Custom delivery area lookup
  const selectedAreaObj = selectedAreaId ? deliveryAreas.find(a => a.id === selectedAreaId) : null;
  const shippingCharge = isFreeShipping 
    ? 0 
    : (selectedAreaObj 
        ? selectedAreaObj.deliveryCharge 
        : (isInsideDistrict ? shippingInside : shippingOutside));
        
  const currentCodFee = (paymentMethod === 'cod') ? codFee : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCharge + currentCodFee);

  // Next Step validation
  const handleNextStep = () => {
    setCheckoutError('');
    if (!name.trim()) {
      setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' : 'Please enter your Full Name.');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর লিখুন (১১ ডিজিট)।' : 'Please enter a valid 11-digit Mobile Number.');
      return;
    }
    if (!district.trim()) {
      setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে আপনার জেলা উল্লেখ করুন।' : 'Please specify your District.');
      return;
    }
    if (!upazila.trim()) {
      setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে আপনার উপজেলা বা থানা লিখুন।' : 'Please enter your Upazila/Thana.');
      return;
    }
    if (!area.trim()) {
      setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে আপনার সুনির্দিষ্ট এলাকা/মহল্লা/গ্রাম সিলেক্ট বা টাইপ করুন।' : 'Please select or type your Specific Area/Village.');
      return;
    }
    setStep(2);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (paymentMethod !== 'cod') {
      if (!senderNumber.trim()) {
        setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে প্রেরকের মোবাইল নম্বর লিখুন।' : 'Please supply the payment Sender Number.');
        return;
      }
      if (!transactionId.trim()) {
        setCheckoutError(lang === 'bn' ? 'অনুগ্রহ করে লেনদেনের Transaction ID (TxnID) লিখুন।' : 'Please supply the Transaction ID (TxnID).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Compile Order items
      const items: OrderItem[] = cart.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.images[0] || '',
        selectedColor: item.selectedColor
      }));

      // 2. Generate Order ID (BD-Prefix)
      const orderId = 'BD-' + Math.floor(100000 + Math.random() * 900000);

      // 3. Form full address
      const composedAddress = `${area}, ${upazila}, ${district}`;

      // 4. Determine payment label
      let finalPaymentMethod = t.codLabel;
      if (paymentMethod === 'bkash') finalPaymentMethod = `${t.bkashLabel} (নম্বর: ${senderNumber}, TxnID: ${transactionId})`;
      if (paymentMethod === 'nagad') finalPaymentMethod = `${t.nagadLabel} (নম্বর: ${senderNumber}, TxnID: ${transactionId})`;
      if (paymentMethod === 'rocket') finalPaymentMethod = `${t.rocketLabel} (নম্বর: ${senderNumber}, TxnID: ${transactionId})`;

      // 5. Assemble Firestore Order model
      const newOrder: Order = {
        id: orderId,
        customerName: name,
        customerEmail: email || 'not_provided@store.com',
        customerPhone: phone,
        address: composedAddress,
        city: district,
        postalCode: postalCode || '',
        country: 'Bangladesh',
        items,
        subtotal,
        discount: discountAmount,
        shipping: shippingCharge,
        total,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending', // Admins verify manual payments
        paymentMethod: finalPaymentMethod,
        couponCode: appliedCoupon?.code || null,
        createdAt: new Date().toISOString(),
        
        // BD Localization Formats
        district: district || null,
        upazila: upazila || null,
        area: area || null,
        senderNumber: paymentMethod !== 'cod' ? senderNumber : null,
        transactionId: paymentMethod !== 'cod' ? transactionId : null,
        amountPaid: paymentMethod !== 'cod' ? total : null,
        paymentScreenshotUrl: null
      };

      // 6. Save order to Firestore (automatically logs and notifications)
      await createOrder(newOrder);

      // Send to Telegram Bot in the background (All details A-Z)
      sendTelegramOrderNotification(newOrder).catch(err => console.error("Telegram notification failed:", err));

      // 7. Fire successful checkout callback
      onOrderSuccess(orderId);
    } catch (err) {
      console.error(err);
      setCheckoutError(lang === 'bn' ? 'অর্ডার প্রসেস করতে ত্রুটি হয়েছে। সংযোগ চেক করে আবার চেষ্টা করুন।' : 'Failed to place order. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment variables for UI
  const getSelectedPaymentDetails = () => {
    if (paymentMethod === 'bkash') {
      return {
        num: settings.bkashNumber || '01712345678',
        type: settings.bkashType || 'Personal',
        instruction: settings.bkashInstruction || t.paymentInstructionsText,
        qr: settings.bkashQrUrl
      };
    }
    if (paymentMethod === 'nagad') {
      return {
        num: settings.nagadNumber || '01812345678',
        type: settings.nagadType || 'Personal',
        instruction: settings.nagadInstruction || t.paymentInstructionsText,
        qr: settings.nagadQrUrl
      };
    }
    if (paymentMethod === 'rocket') {
      return {
        num: settings.rocketNumber || '01912345678',
        type: settings.rocketType || 'Personal',
        instruction: settings.rocketInstruction || t.paymentInstructionsText,
        qr: settings.rocketQrUrl
      };
    }
    return null;
  };

  const activePay = getSelectedPaymentDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh]"
      >
        {/* LEFT FORM SIDE */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Truck className="h-5 w-5" style={{ color: theme.primaryColor }} />
                <span>{t.checkoutTitle}</span>
              </h2>
              <p className="text-2xs sm:text-xs text-gray-500 mt-1">
                {step === 1 ? t.billingDetails : t.paymentMethodTitle}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Banner */}
          {checkoutError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 animate-pulse">
              {checkoutError}
            </div>
          )}

          {/* STEP 1: Bangladesh Address Format & Shipping Region Selection */}
          {step === 1 && (
            <div className="space-y-5 text-left flex-1">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">১</span>
                  <span>{t.billingDetails}</span>
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-gray-700">{t.fullName} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-gray-700">{t.mobileNumber} <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.mobilePlaceholder}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-gray-700">{t.district} <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={districtSelection}
                        onChange={(e) => handleDistrictDropdownChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="">{lang === 'bn' ? '-- জেলা নির্বাচন করুন --' : '-- Select District --'}</option>
                        {Object.values(bangladeshDistrictsData).map((dist) => (
                          <option key={dist.en} value={dist.en}>
                            {lang === 'bn' ? `${dist.bn} (${dist.en})` : `${dist.en} (${dist.bn})`}
                          </option>
                        ))}
                        <option value="custom">{lang === 'bn' ? 'অন্যান্য... (টাইপ করুন)' : 'Other... (Type Custom)'}</option>
                      </select>
                    </div>

                    {districtSelection === 'custom' && (
                      <div className="space-y-1 animate-in slide-in-from-top duration-200">
                        <label className="text-2xs font-bold text-gray-700">{lang === 'bn' ? 'কাস্টম জেলার নাম' : 'Custom District'} <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={customDistrict}
                          onChange={(e) => handleCustomDistrictInputChange(e.target.value)}
                          placeholder={lang === 'bn' ? 'আপনার জেলার নাম লিখুন' : 'Enter your district name'}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-gray-700">{t.upazila} <span className="text-red-500">*</span></label>
                    {districtSelection && districtSelection !== 'custom' && bangladeshDistrictsData[districtSelection] ? (
                      <select
                        required
                        value={upazilaSelection}
                        onChange={(e) => handleUpazilaDropdownChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="">{lang === 'bn' ? '-- উপজেলা নির্বাচন করুন --' : '-- Select Upazila --'}</option>
                        {bangladeshDistrictsData[districtSelection].upazilas.map((upa) => {
                          const displayVal = lang === 'bn' ? upa.bn : upa.en;
                          return (
                            <option key={upa.en} value={displayVal}>
                              {lang === 'bn' ? `${upa.bn} (${upa.en})` : `${upa.en} (${upa.bn})`}
                            </option>
                          );
                        })}
                        <option value="custom">{lang === 'bn' ? 'অন্যান্য... (টাইপ করুন)' : 'Other... (Type Custom)'}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={upazila}
                        onChange={(e) => setUpazila(e.target.value)}
                        placeholder={t.upazilaPlaceholder}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  {upazilaSelection === 'custom' && districtSelection && districtSelection !== 'custom' && (
                    <div className="space-y-1 sm:col-span-2 animate-in slide-in-from-top duration-200">
                      <label className="text-2xs font-bold text-gray-700">{lang === 'bn' ? 'কাস্টম উপজেলার নাম' : 'Custom Upazila'} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={customUpazila}
                        onChange={(e) => handleCustomUpazilaInputChange(e.target.value)}
                        placeholder={lang === 'bn' ? 'আপনার উপজেলার নাম লিখুন' : 'Enter your upazila name'}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Smart Delivery Area Selection */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-2xs font-bold text-gray-700">
                      {lang === 'bn' ? 'সুনির্দিষ্ট এলাকা / মহল্লা / গ্রাম' : 'Specific Area / Village / Union'} <span className="text-red-500">*</span>
                    </label>
                    {district && upazila && deliveryAreas.filter(a => 
                      a.district.toLowerCase() === district.toLowerCase() &&
                      a.upazila.toLowerCase() === upazila.toLowerCase()
                    ).length > 0 ? (
                      <select
                        required
                        value={selectedAreaId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedAreaId(val);
                          const chosenObj = deliveryAreas.find(a => a.id === val);
                          if (chosenObj) {
                            setArea(chosenObj.area);
                            // Auto adjust payment method if COD is disabled for this area
                            if (!chosenObj.codEnabled && paymentMethod === 'cod') {
                              setPaymentMethod('bkash');
                            }
                          } else {
                            setArea('');
                          }
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="">{lang === 'bn' ? '-- এলাকা নির্বাচন করুন --' : '-- Select Area --'}</option>
                        {deliveryAreas.filter(a => 
                          a.district.toLowerCase() === district.toLowerCase() &&
                          a.upazila.toLowerCase() === upazila.toLowerCase()
                        ).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.area} (ডেলিভারি চার্জ: ৳{a.deliveryCharge} {a.codEnabled ? '' : ` - ${lang === 'bn' ? 'শুধু অনলাইন পেমেন্ট' : 'Online Pay Only'}`})
                          </option>
                        ))}
                        <option value="custom">{lang === 'bn' ? 'অন্যান্য এলাকা... (ম্যানুয়ালি লিখুন)' : 'Other... (Type manually)'}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          setSelectedAreaId('');
                        }}
                        placeholder={lang === 'bn' ? 'যেমন: আলগী বাজার, সেক্টর ১০, ঝাউতলা' : 'e.g. Algi Bazar, Sector 10, Jautola'}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  {selectedAreaId === 'custom' && (
                    <div className="space-y-1 sm:col-span-2 animate-in slide-in-from-top duration-200">
                      <label className="text-2xs font-bold text-gray-700">{lang === 'bn' ? 'ম্যানুয়াল এলাকার নাম লিখুন' : 'Manual Area Name'} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={area === 'custom' ? '' : area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder={lang === 'bn' ? 'আপনার সুনির্দিষ্ট এলাকার নাম লিখুন' : 'Enter your specific area name'}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Method Auto Display */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">
                    {lang === 'bn' ? 'ডেলিভারি চার্জ (Delivery Cost)' : 'Delivery Cost'}
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase font-sans">
                    {lang === 'bn' ? 'স্বয়ংক্রিয় হিসাবকৃত' : 'Auto-Calculated'}
                  </span>
                </div>

                {selectedAreaObj ? (
                  <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-50/30 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-extrabold text-emerald-950">
                          {lang === 'bn' ? 'সরাসরি ডেলিভারি চার্জ প্রযোজ্য' : 'Direct Area Shipping Cost Applied'}
                        </p>
                        <p className="text-2xs text-emerald-700 font-normal mt-0.5">
                          {lang === 'bn' ? `আপনার নির্বাচনকৃত এলাকা "${selectedAreaObj.area}" এর জন্য নির্ধারিত চার্জ।` : `Determined cost specifically for "${selectedAreaObj.area}".`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono">
                        {isFreeShipping ? (lang === 'bn' ? 'ফ্রি' : 'FREE') : `৳${selectedAreaObj.deliveryCharge}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {districtSelection ? (
                            isInsideDistrict 
                              ? (lang === 'bn' ? 'ঢাকার ভিতরে হোম ডেলিভারি' : 'Inside Dhaka Home Delivery')
                              : (lang === 'bn' ? 'ঢাকার বাইরে ডেলিভারি' : 'Outside Dhaka Delivery')
                          ) : (
                            lang === 'bn' ? 'আপনার জেলা সিলেক্ট করুন' : 'Please select your District'
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {districtSelection ? (
                            isInsideDistrict 
                              ? `${lang === 'bn' ? 'ডেলিভারি সময়' : 'Delivery time'}: ${settings.shippingDeliveryTime || '১-২ দিন'}`
                              : `${lang === 'bn' ? 'ডেলিভারি সময়' : 'Delivery time'}: ৩-৫ দিন`
                          ) : (
                            lang === 'bn' ? 'জেলা সিলেক্ট করলে চার্জ স্বয়ংক্রিয়ভাবে হিসাব হবে' : 'Select a district to calculate shipping'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-gray-950">
                        {!districtSelection ? (
                          '—'
                        ) : isFreeShipping ? (
                          lang === 'bn' ? 'ফ্রি' : 'FREE'
                        ) : (
                          formatPrice(shippingCharge, lang)
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-bold shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <span>{lang === 'bn' ? 'পেমেন্ট ধাপে যান' : 'Proceed to Payment'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mobile Payments (bKash, Nagad, Rocket) or Cash On Delivery */}
          {step === 2 && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="mr-1 hover:text-gray-950 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 inline text-gray-500" />
                  </button>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">২</span>
                  <span>{t.paymentMethodTitle}</span>
                </h3>

                {/* Main Payment Toggles */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
                  {/* COD */}
                  {settings.codEnabled !== false && (!selectedAreaObj || selectedAreaObj.codEnabled !== false) && (
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                        paymentMethod === 'cod' ? 'bg-emerald-50/30 border-emerald-500' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Truck className="h-5 w-5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-900">{t.codLabel}</span>
                    </div>
                  )}

                  {/* bKash */}
                  {settings.bkashEnabled !== false && (
                    <div
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                        paymentMethod === 'bkash' ? 'bg-pink-50/30 border-pink-500' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 text-pink-600" />
                      <span className="text-xs font-bold text-gray-900">{t.bkashLabel}</span>
                    </div>
                  )}

                  {/* Nagad */}
                  {settings.nagadEnabled !== false && (
                    <div
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                        paymentMethod === 'nagad' ? 'bg-orange-50/30 border-orange-500' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-bold text-gray-900">{t.nagadLabel}</span>
                    </div>
                  )}

                  {/* Rocket */}
                  {settings.rocketEnabled && (
                    <div
                      onClick={() => setPaymentMethod('rocket')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                        paymentMethod === 'rocket' ? 'bg-purple-50/30 border-purple-500' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-bold text-gray-900">{t.rocketLabel}</span>
                    </div>
                  )}
                </div>

                {/* Payment instructions details based on selection */}
                {paymentMethod === 'cod' ? (
                  <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30">
                    <p className="text-sm font-semibold text-emerald-800">
                      {settings.codInstruction || t.codInstruction}
                    </p>
                    {codFee > 0 && (
                      <p className="text-2xs text-gray-500 mt-1">
                        {lang === 'bn' ? `ক্যাশ অন ডেলিভারি অর্ডারে অতিরিক্ত ${formatPrice(codFee, lang)} চার্জ প্রযোজ্য হবে।` : `An additional COD fee of ${formatPrice(codFee, lang)} applies.`}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 text-sm">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 mb-3">
                        <div className="flex items-center space-x-3">
                          {/* Payment Brand Custom Circular Badges */}
                          {paymentMethod === 'bkash' && (
                            <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 select-none">
                              bK
                            </div>
                          )}
                          {paymentMethod === 'nagad' && (
                            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 select-none font-sans">
                              নগদ
                            </div>
                          )}
                          {paymentMethod === 'rocket' && (
                            <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 select-none">
                              R
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">{paymentMethod.toUpperCase()} NUMBER</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-base font-black text-gray-950 font-mono tracking-wide">{activePay?.num}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyNumber(activePay?.num || '')}
                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                                  copiedNumber 
                                    ? 'bg-emerald-600 text-white border-emerald-600' 
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {copiedNumber ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                <span>{copiedNumber ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (lang === 'bn' ? 'কপি করুন' : 'Copy')}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">{t.accountType}</p>
                          <span className="inline-block bg-white border px-2.5 py-0.5 rounded text-xs font-bold text-emerald-800 mt-1 shadow-3xs">
                            {activePay?.type === 'Personal' && lang === 'bn' ? 'পার্সোনাল' : activePay?.type === 'Agent' && lang === 'bn' ? 'এজেন্ট' : activePay?.type === 'Merchant' && lang === 'bn' ? 'মার্চেন্ট' : activePay?.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Instruction text */}
                        <div className="flex-1 text-left">
                          <p className="font-bold text-xs text-gray-700">{t.paymentInstruction}</p>
                          <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100 text-left">
                            {activePay?.instruction}
                          </p>
                        </div>

                        {/* Optional QR Code */}
                        {activePay?.qr && (
                          <div className="flex-shrink-0 flex flex-col items-center justify-center p-2 bg-white border rounded-xl w-28 h-28 mx-auto sm:mx-0">
                            <img 
                              src={activePay.qr} 
                              alt="Payment QR" 
                              className="w-24 h-24 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[8px] font-bold text-gray-400 mt-1">SCAN TO PAY</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manual Payment Verification Input Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-2xs font-bold text-gray-700">{t.senderPhoneInput} <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-bold text-gray-700">{t.txnIdInput} <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 9K23M921LA"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono placeholder-gray-400 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  {lang === 'bn' ? 'ঠিকানা পরিবর্তন করুন' : 'Back to Address'}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] rounded-xl py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  <Shield className="h-4 w-4" />
                  <span>
                    {isSubmitting ? t.placingOrder : `${t.placeOrderBtn} (${formatPrice(total, lang)})`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT SIDE SUMMARY PANEL */}
        <div className="w-full md:w-80 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col justify-between overflow-y-auto max-h-56 md:max-h-none">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 mb-4 text-left flex items-center justify-between">
              <span>{lang === 'bn' ? 'অর্ডার সামারি' : 'Order Specification'}</span>
              <span className="bg-white border text-[10px] px-1.5 py-0.5 rounded-full font-bold text-gray-500">
                {cart.reduce((a, b) => a + b.quantity, 0)} {lang === 'bn' ? 'টি' : 'Items'}
              </span>
            </h3>

            <div className="space-y-3 max-h-32 md:max-h-[300px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor || ''}`} className="flex items-center space-x-3 text-left bg-white p-2 rounded-lg border border-gray-100">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="h-10 w-10 rounded-md object-cover bg-white border flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.title}</h4>
                    {item.selectedColor && (
                      <p className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 inline-block">
                        {lang === 'bn' ? `কালার: ${item.selectedColor}` : `Color: ${item.selectedColor}`}
                      </p>
                    )}
                    <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                      {item.quantity} × {formatPrice(item.product.price, lang)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900">
                    {formatPrice(item.product.price * item.quantity, lang)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200/80 pt-4 mt-4 space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-600">
              <span>{t.subtotal}</span>
              <span className="font-semibold text-gray-950">{formatPrice(subtotal, lang)}</span>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{t.couponDiscount}</span>
                <span>-{formatPrice(discountAmount, lang)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex justify-between text-gray-600">
              <span>{t.deliveryCharge}</span>
              {isFreeShipping ? (
                <span className="text-emerald-600 font-bold uppercase text-[10px]">{lang === 'bn' ? 'বিনামূল্যে' : 'Free Shipping'}</span>
              ) : (
                <span className="font-semibold text-gray-950">{formatPrice(shippingCharge, lang)}</span>
              )}
            </div>

            {/* COD Fee */}
            {currentCodFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{t.codFee}</span>
                <span className="font-semibold text-gray-950">{formatPrice(currentCodFee, lang)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between border-t border-gray-200 pt-2.5 text-sm font-extrabold text-gray-900">
              <span>{t.total}</span>
              <span className="text-base font-black text-emerald-700">{formatPrice(total, lang)}</span>
            </div>

            {/* Security Note */}
            <p className="text-[9px] text-gray-400 text-center pt-2.5 flex items-center justify-center space-x-1">
              <Shield className="h-3 w-3 text-emerald-600" />
              <span>{lang === 'bn' ? '১০০% নিরাপদ বাংলাদেশী পেমেন্ট যাচাইকরণ।' : '100% Secured manual payment checks.'}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
