/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import {
  uploadBannerImage,
  uploadUserProfilePicture,
  uploadProductPicture,
  uploadStoreBanner,
  UploadResult
} from '../utils/storageService';

interface ImageUploadControlProps {
  label: string;
  labelHi?: string;
  currentImageUrl?: string;
  type: 'banner' | 'profile' | 'product' | 'store';
  identifier: string;
  onImageUploaded: (url: string) => void;
  aspectRatio?: 'square' | 'banner' | 'wide';
  className?: string;
}

export default function ImageUploadControl({
  label,
  labelHi,
  currentImageUrl,
  type,
  identifier,
  onImageUploaded,
  aspectRatio = 'square',
  className = ''
}: ImageUploadControlProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WEBP).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File size is too large (max 10MB).' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      let result: UploadResult;

      if (type === 'banner') {
        result = await uploadBannerImage(file, identifier || 'app_banner');
      } else if (type === 'profile') {
        result = await uploadUserProfilePicture(identifier || 'user', file);
      } else if (type === 'product') {
        result = await uploadProductPicture(identifier || 'item', file);
      } else {
        result = await uploadStoreBanner(identifier || 'store', file);
      }

      setPreviewUrl(result.url);
      onImageUploaded(result.url);

      const storageNotice = result.isFallbackDataUrl
        ? 'Image saved & optimized locally!'
        : 'Uploaded directly to Firebase Storage!';

      setStatusMessage({
        type: 'success',
        text: `${storageNotice} (${result.fileSizeKB} KB)`
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload image'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Aspect ratio styles
  const ratioClasses = {
    square: 'aspect-square h-32 w-32 rounded-2xl',
    banner: 'aspect-[3/1] w-full h-36 rounded-2xl',
    wide: 'aspect-[16/9] w-full h-44 rounded-2xl'
  }[aspectRatio];

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {label} {labelHi && <span className="text-slate-400 font-normal ml-1">({labelHi})</span>}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <RefreshCw className="h-3 w-3" /> Change Photo
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-3 text-center ${ratioClasses} ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
            : previewUrl
            ? 'border-slate-200 bg-slate-50 hover:border-emerald-400'
            : 'border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30'
        }`}
      >
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-xs">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg shadow-sm">
                <Upload className="h-3.5 w-3.5" /> Replace Image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
            {uploading ? (
              <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
            ) : (
              <ImageIcon className="h-6 w-6 text-slate-400" />
            )}
            <p className="text-xs font-bold text-slate-700">
              {uploading ? 'Uploading & Processing...' : 'Click or Drag & Drop'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">PNG, JPG or WEBP (Max 10MB)</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 rounded-xl">
            <Loader2 className="h-7 w-7 text-emerald-600 animate-spin" />
            <span className="text-xs font-extrabold text-slate-800">Processing Storage...</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1 text-[11px] truncate">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
