import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SeoConfig } from '../types';

export const SeoService = {
  get: async (): Promise<SeoConfig> => {
    const docRef = doc(db, 'seo', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SeoConfig;
    }
    return {
      id: 'config',
      metaTitle: 'অ্যাথার ইলেকট্রনিক্স | অরিজিনাল গ্যাজেট শপ',
      metaDescription: 'বাংলাদেশে সেরা কোয়ালিটির আসল গ্যাজেট এবং প্রিমিয়াম ইলেকট্রনিক্স গিয়ার।',
      metaKeywords: 'gadget, electronics, premium sound, bangladesh, elite keyboard, desk setup'
    };
  },

  update: async (config: Partial<SeoConfig>): Promise<void> => {
    const docRef = doc(db, 'seo', 'config');
    await setDoc(docRef, config, { merge: true });
  }
};
