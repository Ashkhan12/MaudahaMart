/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadResult {
  url: string;
  storagePath?: string;
  isFallbackDataUrl: boolean;
  fileSizeKB: number;
}

/**
 * Compresses an image file in the browser using an HTML Canvas element.
 * Downscales images exceeding max dimensions and applies quality compression.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              // Fallback if canvas.toBlob is unsupported
              const byteString = atob(dataUrl.split(',')[1]);
              const ia = new Uint8Array(byteString.length);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const fallbackBlob = new Blob([ia], { type: mimeType });
              resolve({ dataUrl, blob: fallbackBlob });
            }
          },
          mimeType,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Core image uploader with Firebase Storage integration & client-side compression fallback.
 */
export async function uploadMediaFile(
  file: File | Blob,
  storageFolder: 'banners' | 'profiles' | 'products' | 'stores',
  fileIdentifier: string,
  maxWidth: number = 1000,
  maxHeight: number = 1000
): Promise<UploadResult> {
  const sanitizedId = fileIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${sanitizedId}_${Date.now()}.jpg`;
  const fullPath = `${storageFolder}/${fileName}`;

  try {
    // 1. Compress image client-side for rapid transmission & lightweight storage
    const { dataUrl, blob } = await compressImage(file, maxWidth, maxHeight, 0.82);
    const fileSizeKB = Math.round(blob.size / 1024);

    // 2. Attempt upload to Firebase Storage
    try {
      const storageRef = ref(storage, fullPath);
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          folder: storageFolder,
          originalName: (file as File).name || fileIdentifier
        }
      };

      const snapshot = await uploadBytes(storageRef, blob, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        url: downloadUrl,
        storagePath: fullPath,
        isFallbackDataUrl: false,
        fileSizeKB
      };
    } catch (storageErr) {
      console.warn(`[StorageService] Firebase Storage upload failed for ${fullPath}, using compressed Data URL fallback:`, storageErr);
      return {
        url: dataUrl,
        storagePath: undefined,
        isFallbackDataUrl: true,
        fileSizeKB
      };
    }
  } catch (err) {
    console.error(`[StorageService] Compression error for ${fullPath}:`, err);
    throw new Error(`Could not process image file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Service API: Upload App Banners or Store Banners
 */
export async function uploadBannerImage(
  file: File | Blob,
  bannerTitle: string = 'app_banner'
): Promise<UploadResult> {
  return uploadMediaFile(file, 'banners', bannerTitle, 1200, 600);
}

/**
 * Service API: Upload User Profile Picture
 */
export async function uploadUserProfilePicture(
  userId: string,
  file: File | Blob
): Promise<UploadResult> {
  return uploadMediaFile(file, 'profiles', `user_${userId}`, 400, 400);
}

/**
 * Service API: Upload Product Picture
 */
export async function uploadProductPicture(
  productIdOrName: string,
  file: File | Blob
): Promise<UploadResult> {
  return uploadMediaFile(file, 'products', `prod_${productIdOrName}`, 600, 600);
}

/**
 * Service API: Upload Store / Restaurant / Boutique Banner or Cover
 */
export async function uploadStoreBanner(
  storeId: string,
  file: File | Blob
): Promise<UploadResult> {
  return uploadMediaFile(file, 'stores', `store_${storeId}`, 1000, 500);
}
