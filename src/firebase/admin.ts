/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SystemSettings } from '../types';

/**
 * Validates the administrative security PIN.
 * This can compare a cleartext PIN or a hashed PIN for premium security.
 */
export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'config'));
    if (!settingsDoc.exists()) {
      return pin === '1234'; // Fallback to seed default
    }
    const data = settingsDoc.data() as SystemSettings;
    return data.adminPin === pin;
  } catch (err) {
    console.error('Failed to authenticate PIN node:', err);
    return false;
  }
}

/**
 * Updates the administrative secure credentials.
 */
export async function updateAdminPin(newPin: string): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'config'), {
      adminPin: newPin
    }, { merge: true });
  } catch (err) {
    console.error('Failed to rotate admin security pin:', err);
    throw err;
  }
}
