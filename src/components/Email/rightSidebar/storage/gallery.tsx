// storage/gallery.ts
import { genId, loadCollection, saveCollection } from './index';

export type GalleryItem = { id: string; name: string; dataUrl: string; createdAt: number };

export const loadGallery = (userId: string): GalleryItem[] => (loadCollection(userId, 'gallery') as GalleryItem[]).sort((a,b)=>b.createdAt - a.createdAt);

export const addImage = (userId: string, name: string, dataUrl: string) => {
  const items = loadGallery(userId);
  const item: GalleryItem = { id: genId(), name, dataUrl, createdAt: Date.now() };
  saveCollection(userId, 'gallery', [item, ...items]);
  return item;
};

export const deleteImage = (userId: string, id: string) => {
  const next = loadGallery(userId).filter(i => i.id !== id);
  saveCollection(userId, 'gallery', next);
  return next;
};
