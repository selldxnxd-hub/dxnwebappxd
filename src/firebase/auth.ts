/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously
} from 'firebase/auth';
import { auth } from './config';

/**
 * Signs in the Administrator with email and password.
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase Auth: administrator sign-in failed:', error);
    throw error;
  }
}

/**
 * Signs in anonymously (useful for basic secure sessions).
 */
export async function signInAdminAnonymously(): Promise<User> {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase Auth: anonymous sign-in failed:', error);
    throw error;
  }
}

/**
 * Signs out the Administrator.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Auth: sign-out failed:', error);
    throw error;
  }
}

/**
 * Subscribes to changes in the administrator authentication state.
 */
export function subscribeAdminState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  }, (error) => {
    console.error('Firebase Auth: authentication state subscription error:', error);
  });
}
