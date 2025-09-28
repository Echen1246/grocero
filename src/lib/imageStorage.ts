import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'recipes/recipe-id.jpg')
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Firebase Storage
 * @param path - The storage path of the image to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Generate a unique filename for an image
 * @param originalName - The original filename
 * @param recipeId - Optional recipe ID to include in the filename
 * @returns string - A unique filename
 */
export function generateImageFilename(originalName: string, recipeId?: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = recipeId || 'recipe';
  return `recipes/${baseName}-${timestamp}.${extension}`;
}

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @returns boolean - True if valid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
}
