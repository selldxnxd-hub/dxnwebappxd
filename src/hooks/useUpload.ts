import { useState } from 'react';
import { StorageService } from '../services/storage';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    try {
      const url = await StorageService.uploadFile(file);
      setIsUploading(false);
      return url;
    } catch (e) {
      setIsUploading(false);
      const errMsg = e instanceof Error ? e.message : 'Upload failed';
      setError(errMsg);
      return null;
    }
  };

  return {
    upload,
    isUploading,
    error
  };
};
