// storage/favorites.ts
import { genId, loadCollection, saveCollection } from './index';

export type Favorite = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  tags?: string[];
  favoriteDate: number;
};

export const loadFavorites = (userId: string): Favorite[] =>
  (loadCollection(userId, 'favorites') as Favorite[]).sort((a, b) => b.favoriteDate - a.favoriteDate);

export const addFavorite = (userId: string, payload: Partial<Favorite>) => {
  const favs = loadFavorites(userId);
  const item: Favorite = {
    id: genId(),
    name: payload.name || 'Untitled',
    description: payload.description || '',
    url: payload.url || '',
    tags: payload.tags || [],
    favoriteDate: Date.now(),
  };
  const next = [item, ...favs];
  saveCollection(userId, 'favorites', next);
  return item;
};

export const updateFavorite = (userId: string, id: string, updates: Partial<Favorite>) => {
  const favs = loadFavorites(userId);
  const next = favs.map(f => (f.id === id ? { ...f, ...updates } : f));
  saveCollection(userId, 'favorites', next);
  return next.find(f => f.id === id) || null;
};

export const deleteFavorite = (userId: string, id: string) => {
  const next = loadFavorites(userId).filter(f => f.id !== id);
  saveCollection(userId, 'favorites', next);
  return next;
};
