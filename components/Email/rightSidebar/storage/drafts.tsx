// storage/drafts.ts
import { genId, loadCollection, saveCollection } from './index';

export type Draft = {
  id: string;
  type: 'email' | 'task' | 'note';
  title: string;
  content?: string;
  attachments?: { name: string; dataUrl: string }[];
  dueDate?: number | null;
  createdAt: number;
  updatedAt: number;
};

export const loadDrafts = (userId: string): Draft[] =>
  (loadCollection(userId, 'drafts') as Draft[]).sort((a, b) => b.updatedAt - a.updatedAt);

export const addDraft = (userId: string, payload: Partial<Draft>): Draft => {
  const drafts = loadDrafts(userId);
  const newDraft: Draft = {
    id: genId(),
    type: (payload.type || 'note') as any,
    title: payload.title || 'Untitled',
    content: payload.content || '',
    attachments: payload.attachments || [],
    dueDate: payload.dueDate ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const next = [newDraft, ...drafts];
  saveCollection(userId, 'drafts', next);
  return newDraft;
};

export const updateDraft = (userId: string, id: string, updates: Partial<Draft>) => {
  const drafts = loadDrafts(userId);
  const next = drafts.map(d => (d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d));
  saveCollection(userId, 'drafts', next);
  return next.find(d => d.id === id) || null;
};

export const deleteDraft = (userId: string, id: string) => {
  const drafts = loadDrafts(userId);
  const next = drafts.filter(d => d.id !== id);
  saveCollection(userId, 'drafts', next);
  return next;
};
