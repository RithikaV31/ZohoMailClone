// storage/links.ts
import { genId, loadCollection, saveCollection } from './index';

export type LinkItem = { id: string; title: string; url: string; tags?: string[]; thumbnail?: string; createdAt: number };

export const loadLinks = (userId: string): LinkItem[] => (loadCollection(userId, 'links') as LinkItem[]).sort((a,b)=>b.createdAt - a.createdAt);

export const addLink = (userId: string, payload: Partial<LinkItem>) => {
  const links = loadLinks(userId);
  const item: LinkItem = {
    id: genId(),
    title: payload.title || payload.url || 'Untitled',
    url: payload.url || '',
    tags: payload.tags || [],
    thumbnail: payload.thumbnail || '',
    createdAt: Date.now(),
  };
  saveCollection(userId, 'links', [item, ...links]);
  return item;
};

export const updateLink = (userId: string, id: string, updates: Partial<LinkItem>) => {
  const next = loadLinks(userId).map(l => (l.id === id ? { ...l, ...updates } : l));
  saveCollection(userId, 'links', next);
  return next.find(r => r.id === id) || null;
};

export const deleteLink = (userId: string, id: string) => {
  const next = loadLinks(userId).filter(l => l.id !== id);
  saveCollection(userId, 'links', next);
  return next;
};
