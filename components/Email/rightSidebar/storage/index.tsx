// storage/index.ts
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const PREFIX = 'rightSidebar';
export const userIdKey = `${PREFIX}::${appId}::userId`;

export const keyFor = (userId: string, collection: string) => `${PREFIX}::${appId}::${userId}::${collection}`;

export const safeParse = (v: string | null) => {
  try { return v ? JSON.parse(v) : null; } catch { return null; }
};

export const genId = () => {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return `id_${Math.random().toString(36).slice(2, 9)}`;
};

export const loadCollection = (userId: string, collection: string) => {
  const raw = localStorage.getItem(keyFor(userId, collection));
  return safeParse(raw) || [];
};

export const saveCollection = (userId: string, collection: string, data: any[]) => {
  localStorage.setItem(keyFor(userId, collection), JSON.stringify(data));
};
