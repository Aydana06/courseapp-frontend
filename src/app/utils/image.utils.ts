import { environment } from '../../environments/environment';

export function getImageUrl(imagePath: string): string {
  if (!imagePath) {
    return '';
  }
  
  // If the image path already has a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with assets/, construct the full URL
  if (imagePath.startsWith('assets/')) {
    return `${environment.baseUrl}/${imagePath}`;
  }
  
  // If it's just a filename, assume it's in assets/images/
  if (!imagePath.includes('/')) {
    return `${environment.baseUrl}/assets/images/${imagePath}`;
  }
  
  // Otherwise, return the path as is
  return imagePath;
}
