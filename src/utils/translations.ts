/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function formatBanglaNumber(n: number | string): string {
  const str = String(n);
  return str.replace(/\d/g, (digit) => bnDigits[Number(digit)]);
}

export function formatPrice(price: number | string | undefined | null, lang: 'bn' | 'en' = 'bn'): string {
  const numPrice = price !== undefined && price !== null ? Number(price) : 0;
  const validPrice = isNaN(numPrice) ? 0 : numPrice;
  const formattedEnglish = new Intl.NumberFormat('en-US').format(validPrice);
  if (lang === 'bn') {
    return `৳ ${formatBanglaNumber(formattedEnglish)}`;
  }
  return `৳ ${formattedEnglish}`;
}

export function getProductImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map(img => String(img).trim()).filter(Boolean);
  }
  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(img => String(img).trim()).filter(Boolean);
        }
      } catch (e) {
        // Fallback
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (trimmed) {
      return [trimmed];
    }
  }
  return [];
}

export const translations = {
  bn: {
    // Navbar & Header
    home: 'হোম',
    shopAll: 'সব প্রোডাক্ট',
    cart: 'কার্ট',
    searchPlaceholder: 'পছন্দের প্রোডাক্ট খুঁজুন...',
    adminPanel: 'অ্যাডমিন প্যানেল',
    category: 'ক্যাটাগরি',
    loading: 'লোড হচ্ছে...',

    // Hero / Banner
    heroTitleDefault: 'সেরা মানের গ্যাজেট ও ইলেকট্রনিক্স গেয়ার',
    heroSubtitleDefault: 'আপনার দৈনন্দিন কাজকে সহজ করতে প্রিমিয়াম ও দীর্ঘস্থায়ী অ্যাকসেসরিজ কালেকশন।',

    // Product Section
    featuredProducts: 'বিশেষ আকর্ষনীয় প্রোডাক্টস',
    allProductsTitle: 'আমাদের সকল প্রোডাক্টস',
    addToCart: 'কার্টে যোগ করুন',
    outOfStock: 'স্টক শেষ',
    inStock: 'স্টকে আছে',
    sku: 'এসকেইউ (SKU)',
    rating: 'রেটিং',
    reviews: 'মতামত',
    originalPrice: 'আসল দাম',
    salePrice: 'ছাড়ের দাম',
    filterByCategory: 'ক্যাটাগরি ফিল্টার',
    sortBy: 'সাজান',
    sortNewest: 'নতুন প্রোডাক্ট',
    sortPriceLowHigh: 'দাম: কম থেকে বেশি',
    sortPriceHighLow: 'দাম: বেশি থেকে কম',
    sortRating: 'রেটিং অনুযায়ী',
    quickView: 'দ্রুত দেখুন',

    // Reviews section
    customerReviews: 'গ্রাহকদের মতামতসমূহ',
    noReviewsYet: 'এখনো কোনো মতামত দেওয়া হয়নি। প্রথম মতামত দিন!',
    addReviewTitle: 'আপনার মতামত লিখুন',
    yourName: 'আপনার নাম',
    yourEmail: 'আপনার ইমেইল',
    ratingLabel: 'আপনার রেটিং',
    commentLabel: 'মন্তব্য',
    submitReview: 'রিভিউ সাবমিট করুন',
    reviewSuccess: 'ধন্যবাদ! আপনার রিভিউটি সফলভাবে যুক্ত হয়েছে।',

    // Cart Drawer
    cartTitle: 'আপনার শপিং কার্ট',
    emptyCart: 'আপনার কার্টটি একদম খালি!',
    subtotal: 'উপ-মোট',
    deliveryCharge: 'ডেলিভারি চার্জ',
    codFee: 'ক্যাশ অন ডেলিভারি চার্জ',
    couponDiscount: 'কুপন ডিসকাউন্ট',
    total: 'সর্বমোট',
    checkoutBtn: 'অর্ডার করতে এগিয়ে যান',
    applyCoupon: 'কুপন কোড দিন',
    applyBtn: 'প্রয়োগ করুন',
    couponApplied: 'কুপন সফলভাবে সক্রিয় হয়েছে!',
    invalidCoupon: 'ভুল কুপন কোড',
    removeBtn: 'মুছে ফেলুন',

    // Checkout Modal / Address Form
    checkoutTitle: 'অর্ডার কনফার্ম করুন',
    billingDetails: 'ডেলিভারি ঠিকানা ও তথ্য',
    fullName: 'পূর্ণ নাম (ইংরেজি বা বাংলা)',
    fullNamePlaceholder: 'উদা: মো: আসিফ রহমান',
    mobileNumber: 'মোবাইল নম্বর (অবশ্যই সচল)',
    mobilePlaceholder: 'উদা: 017XXXXXXXX',
    district: 'জেলা',
    districtPlaceholder: 'উদা: ঢাকা / চট্টগ্রাম / সিলেট',
    upazila: 'উপজেলা / থানা',
    upazilaPlaceholder: 'উদা: উত্তরা / মিরপুর / ধানমন্ডি',
    area: 'এলাকা / গ্রাম / রোড নং',
    areaPlaceholder: 'উদা: হাউজ ১০, রোড ৫, সেক্টর ৪',
    fullAddress: 'সম্পূর্ণ ঠিকানা',
    fullAddressPlaceholder: 'উদা: ফ্ল্যাট ৩বি, হাউজ ১০, রোড ৫, সেক্টর ৪, উত্তরা, ঢাকা',
    postalCode: 'পোস্টাল কোড (ঐচ্ছিক)',
    postalCodePlaceholder: 'উদা: ১২৩০',
    emailOptional: 'ইমেইল ঠিকানা (ঐচ্ছিক)',
    emailOptionalPlaceholder: 'customer@example.com',

    // Checkout Payments
    paymentMethodTitle: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
    codLabel: 'ক্যাশ অন ডেলিভারি (COD)',
    codInstruction: 'পণ্যটি আপনার হাতে পৌঁছানোর পর ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।',
    bkashLabel: 'বিকাশ (bKash)',
    nagadLabel: 'নগদ (Nagad)',
    rocketLabel: 'রকেট (Rocket)',
    paymentInstruction: 'নিচের নম্বরে পেমেন্ট সম্পূর্ণ করে তথ্য দিন:',
    accountType: 'অ্যাকাউন্ট টাইপ',
    paymentInstructionsText: '১. প্রথমে উপরে উল্লিখিত নম্বরে প্রয়োজনীয় টাকা "Send Money" (বা Merchant হলে "Make Payment") করুন।\n২. ট্রানজেকশন সফল হলে নিচে আপনার পেমেন্টকৃত মোবাইল নম্বর এবং Transaction ID (TxnID) দিন।',
    senderPhoneInput: 'যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number)',
    txnIdInput: 'ট্রানজেকশন আইডি (Transaction ID / TxnID)',
    amountPaidInput: 'পরিশোধকৃত টাকার পরিমাণ (Amount Paid)',
    screenshotUpload: 'পেমেন্টের স্ক্রিনশট আপলোড করুন (ঐচ্ছিক)',
    screenshotUploadPlaceholder: 'ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ক্লিক করুন',
    shippingMethodTitle: 'ডেলিভারি অঞ্চল নির্বাচন করুন',
    insideDistrict: 'জেলা সদরের ভেতরে',
    outsideDistrict: 'জেলার বাইরে (সারা বাংলাদেশ)',
    estimatedDeliveryTime: 'ডেলিভারি সময়',
    placeOrderBtn: 'অর্ডার সম্পন্ন করুন',
    placingOrder: 'অর্ডার সাবমিট হচ্ছে...',
    orderSuccessTitle: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
    orderSuccessMsg: 'আমাদের সাথে থাকার জন্য ধন্যবাদ। আপনার অর্ডার আইডি:',
    orderSuccessVerification: 'আমাদের প্রতিনিধি খুব শীঘ্রই আপনার মোবাইলে কল করে অর্ডারটি নিশ্চিত করবেন।',
    orderTrackingBtn: 'অর্ডার ট্র্যাক করুন',
    continueShopping: 'কেনাকাটা চালিয়ে যান',

    // Order Tracking Form
    trackYourOrder: 'অর্ডার ট্র্যাক করুন',
    trackInputPlaceholder: 'আপনার অর্ডার আইডিটি দিন (যেমন: ORD-XXXX)',
    trackBtn: 'ট্র্যাক করুন',
    orderNotFound: 'দুঃখিত, এই আইডি দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি!',
    orderStatusLabel: 'অর্ডারের বর্তমান অবস্থা:',
    paymentStatusLabel: 'পেমেন্টের অবস্থা:',

    // Status Values
    pending: 'অপেক্ষমাণ (Pending)',
    processing: 'প্রক্রিয়াধীন (Processing)',
    shipped: 'পাঠানো হয়েছে (Shipped)',
    delivered: 'ডেলিভারি সম্পন্ন (Delivered)',
    cancelled: 'বাতিল (Cancelled)',
    paid: 'পরিশোধিত (Paid)',
    failed: 'ব্যর্থ (Failed)',

    // Footer
    contactUs: 'যোগাযোগ করুন',
    fastDelivery: 'দ্রুত ডেলিভারি',
    trustedService: 'বিশ্বস্ত কাস্টমার সাপোর্ট',
    rightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',

    // Admin Access Modal
    enterPin: 'অ্যাডমিন পিন প্রবেশ করান',
    pinPlaceholder: '৪ ডিজিটের সিকিউরিটি পিন দিন',
    pinError: 'ভুল পিন কোড! দয়া করে আবার চেষ্টা করুন।',
    pinSubmit: 'প্যানেল আনলক করুন',
    backToStore: 'স্টোরে ফিরে যান'
  },
  en: {
    // Navbar & Header
    home: 'Home',
    shopAll: 'Shop All',
    cart: 'Cart',
    searchPlaceholder: 'Search products...',
    adminPanel: 'Admin Panel',
    category: 'Category',
    loading: 'Loading...',

    // Hero / Banner
    heroTitleDefault: 'Premium Gadgets & Electronics Gear',
    heroSubtitleDefault: 'Elevate your environment with high quality accessories crafted for performance.',

    // Product Section
    featuredProducts: 'Featured Products',
    allProductsTitle: 'All Products',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    sku: 'SKU',
    rating: 'Rating',
    reviews: 'Reviews',
    originalPrice: 'Regular Price',
    salePrice: 'Sale Price',
    filterByCategory: 'Category',
    sortBy: 'Sort By',
    sortNewest: 'New Arrivals',
    sortPriceLowHigh: 'Price: Low to High',
    sortPriceHighLow: 'Price: High to Low',
    sortRating: 'Top Rated',
    quickView: 'Quick View',

    // Reviews section
    customerReviews: 'Customer Reviews',
    noReviewsYet: 'No reviews yet. Be the first to review!',
    addReviewTitle: 'Write a Review',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    ratingLabel: 'Rating',
    commentLabel: 'Comment',
    submitReview: 'Submit Review',
    reviewSuccess: 'Thank you! Your review has been added successfully.',

    // Cart Drawer
    cartTitle: 'Your Shopping Cart',
    emptyCart: 'Your cart is empty!',
    subtotal: 'Subtotal',
    deliveryCharge: 'Delivery Charge',
    codFee: 'COD Fee',
    couponDiscount: 'Coupon Discount',
    total: 'Total',
    checkoutBtn: 'Proceed to Checkout',
    applyCoupon: 'Apply Coupon',
    applyBtn: 'Apply',
    couponApplied: 'Coupon applied successfully!',
    invalidCoupon: 'Invalid coupon code',
    removeBtn: 'Remove',

    // Checkout Modal / Address Form
    checkoutTitle: 'Confirm Your Order',
    billingDetails: 'Delivery Details',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Asif Rahman',
    mobileNumber: 'Mobile Number',
    mobilePlaceholder: 'e.g. 017XXXXXXXX',
    district: 'District',
    districtPlaceholder: 'e.g. Dhaka / Chittagong / Sylhet',
    upazila: 'Upazila / Thana',
    upazilaPlaceholder: 'e.g. Uttara / Mirpur / Dhanmondi',
    area: 'Area / Village / Road No.',
    areaPlaceholder: 'e.g. House 10, Road 5, Sector 4',
    fullAddress: 'Full Address',
    fullAddressPlaceholder: 'e.g. Flat 3B, House 10, Road 5, Uttara, Dhaka',
    postalCode: 'Postal Code (Optional)',
    postalCodePlaceholder: 'e.g. 1230',
    emailOptional: 'Email Address (Optional)',
    emailOptionalPlaceholder: 'customer@example.com',

    // Checkout Payments
    paymentMethodTitle: 'Select Payment Method',
    codLabel: 'Cash on Delivery (COD)',
    codInstruction: 'Pay with cash upon delivery of the items directly to the courier.',
    bkashLabel: 'bKash',
    nagadLabel: 'Nagad',
    rocketLabel: 'Rocket',
    paymentInstruction: 'Send money to the following number:',
    accountType: 'Account Type',
    paymentInstructionsText: '1. Please Send Money (or Make Payment if Merchant) to the above number.\n2. Once completed, enter your sender number and Transaction ID (TxnID) below.',
    senderPhoneInput: 'Sender Number',
    txnIdInput: 'Transaction ID (TxnID)',
    amountPaidInput: 'Amount Paid',
    screenshotUpload: 'Upload Payment Screenshot (Optional)',
    screenshotUploadPlaceholder: 'Drag and drop image or click to select',
    shippingMethodTitle: 'Select Shipping Region',
    insideDistrict: 'Inside District',
    outsideDistrict: 'Outside District (All Bangladesh)',
    estimatedDeliveryTime: 'Delivery Time',
    placeOrderBtn: 'Place Order',
    placingOrder: 'Placing order...',
    orderSuccessTitle: 'Your order has been placed successfully!',
    orderSuccessMsg: 'Thank you for shopping. Your order ID:',
    orderSuccessVerification: 'Our agent will call you shortly to verify your mobile number and confirm the order.',
    orderTrackingBtn: 'Track Order',
    continueShopping: 'Continue Shopping',

    // Order Tracking Form
    trackYourOrder: 'Track Order',
    trackInputPlaceholder: 'Enter your Order ID (e.g. ORD-XXXX)',
    trackBtn: 'Track',
    orderNotFound: 'Sorry, no order found with this ID!',
    orderStatusLabel: 'Order Status:',
    paymentStatusLabel: 'Payment Status:',

    // Status Values
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    failed: 'Failed',

    // Footer
    contactUs: 'Contact Us',
    fastDelivery: 'Fast Delivery',
    trustedService: 'Trusted Customer Support',
    rightsReserved: 'All rights reserved.'
  }
};
