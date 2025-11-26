// storage/notifications.ts
import { genId, loadCollection, saveCollection } from './index';

export type Notification = { id: string; title: string; body?: string; createdAt: number; read?: boolean };

export const loadNotifications = (userId: string): Notification[] =>
  (loadCollection(userId, 'notifications') as Notification[]).sort((a,b)=>b.createdAt - a.createdAt);

export const pushNotification = (userId: string, title: string, body?: string) => {
  const n: Notification = { id: genId(), title, body, createdAt: Date.now(), read: false };
  const arr = [n, ...loadNotifications(userId)];
  saveCollection(userId, 'notifications', arr);
  return n;
};

export const markAllRead = (userId: string) => {
  const arr = loadNotifications(userId).map(n => ({ ...n, read: true }));
  saveCollection(userId, 'notifications', arr);
  return arr;
};

export const clearNotifications = (userId: string) => {
  saveCollection(userId, 'notifications', []);
  return [];
};
