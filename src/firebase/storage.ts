/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The HTML File object to upload
 * @param path The destination path in the storage bucket (e.g. "products/prod-123/image.jpg")
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error(`Firebase Storage upload failure for [${path}]:`, error);
    throw error;
  }
}

/**
 * Deletes a file from Firebase Storage using its full download URL or bucket path.
 * @param url The full HTTPS download URL or path of the object to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract path from the full download URL if necessary
    let fileRef = ref(storage, url);
    if (url.startsWith('http')) {
      const decodedUrl = decodeURIComponent(url);
      const urlParts = decodedUrl.split('/o/');
      if (urlParts.length > 1) {
        const fullPath = urlParts[1].split('?')[0];
        fileRef = ref(storage, fullPath);
      }
    }
    await deleteObject(fileRef);
  } catch (error) {
    console.error(`Firebase Storage delete failure for [${url}]:`, error);
    throw error;
  }
}
