const IMG_BASE = (import.meta.env.VITE_IMG_BASE_URL ?? '').replace(/\/$/, '');

export const getImageUrl = (path?: string | null, fallback = ''): string => {
  if (!path) return fallback;
  if (path.startsWith('http') || path.startsWith('//') || path.startsWith('blob:')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return IMG_BASE ? `${IMG_BASE}${p}` : path;
};

// Derives Cloudinary video URL by swapping image/upload → video/upload in the base
export const getVideoUrl = (path?: string | null, fallback = ''): string => {
  if (!path) return fallback;
  if (path.startsWith('http') || path.startsWith('//') || path.startsWith('blob:')) return path;
  const base = IMG_BASE.replace('/image/upload', '/video/upload');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : path;
};
