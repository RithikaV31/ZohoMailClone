// RightActionSidebar.tsx
import React, { useEffect, useState } from 'react';
import { Heart, MessageSquare, Link as LinkIcon, Edit3, Image as ImageIcon, Settings, Plus, Zap, Bell, X, Star, Mail, List, FileText, Check, Share, Trash2 } from 'lucide-react';
import { userIdKey } from './storage';
import { loadDrafts, addDraft, updateDraft as updateDraftStore, deleteDraft as deleteDraftStore } from './storage/drafts';
import { loadFavorites, addFavorite, updateFavorite as updateFavoriteStore, deleteFavorite as deleteFavoriteStore } from './storage/favorites';
import { loadLinks, addLink, updateLink as updateLinkStore, deleteLink as deleteLinkStore } from './storage/links';
import { loadGallery, addImage as addImageStore, deleteImage as deleteImageStore } from './storage/gallery';
import { loadNotifications, pushNotification, markAllRead, clearNotifications } from './storage/notifications';
import { loadSettings as loadSettingsLocal, saveCollection as saveCollectionLocal } from './storage';
import { ChatWindow } from './modals/ChatWindow';
import { ImagePreviewModal } from './modals/ImagePreviewModal';

const actions = [
  { id: 'favorite', icon: Heart, color: 'text-red-500', label: 'Favorites', desc: 'Starred items' },
  { id: 'chat', icon: MessageSquare, color: 'text-green-500', label: 'Messages', desc: 'Recent conversations' },
  { id: 'link', icon: LinkIcon, color: 'text-blue-400', label: 'Links', desc: 'Saved links' },
  { id: 'edit', icon: Edit3, color: 'text-yellow-500', label: 'Drafts', desc: 'Your drafts' },
  { id: 'image', icon: ImageIcon, color: 'text-teal-500', label: 'Gallery', desc: 'Images' },
  { id: 'add', icon: Plus, color: 'text-blue-500', label: 'Create', desc: 'Create new item' },
  { id: 'zap', icon: Zap, color: 'text-yellow-400', label: 'Quick Actions', desc: 'Actions' },
  { id: 'bell', icon: Bell, color: 'text-red-400', label: 'Notifications', desc: 'Alerts' },
  { id: 'settings', icon: Settings, color: 'text-gray-500', label: 'Settings', desc: 'Preferences' },
];

export default function RightActionSidebar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // data
  const [drafts, setDrafts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ darkMode: false, fontSize: 'base', layout: 'compact' });

  // UI
  const [selected, setSelected] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState<{ src: string; name?: string } | null>(null);

  useEffect(() => {
    let uid = localStorage.getItem(userIdKey);
    if (!uid) { uid = `u_${Math.random().toString(36).slice(2, 9)}`; localStorage.setItem(userIdKey, uid); }
    setUserId(uid);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setDrafts(loadDrafts(userId));
    setFavorites(loadFavorites(userId));
    setLinks(loadLinks(userId));
    setGallery(loadGallery(userId));
    setNotifications(loadNotifications(userId));
    // settings: load manually via key
    const raw = localStorage.getItem(`rightSidebar::${userId}::settings`);
    const s = raw ? JSON.parse(raw) : { darkMode: false, fontSize: 'base', layout: 'compact' };
    setSettings(s);
  }, [userId]);

  // Handlers (Favorites)
  const addNewFavorite = (payload?: Partial<any>) => {
    if (!userId) return;
    const f = addFavorite(userId, payload || { name: `Favorite ${Date.now()}` });
    setFavorites(prev => [f, ...prev]);
  };
  const updateFavorite = (id: string, updates: Partial<any>) => {
    if (!userId) return;
    const updated = updateFavoriteStore(userId, id, updates);
    setFavorites(loadFavorites(userId));
  };
  const removeFavorite = (id: string) => {
    if (!userId) return;
    deleteFavoriteStore(userId, id);
    setFavorites(loadFavorites(userId));
  };

  // Drafts
  const createDraft = (payload: Partial<any>) => {
    if (!userId) return;
    const d = addDraft(userId, payload);
    setDrafts(prev => [d, ...prev]);
  };
  const updateDraft = (id: string, updates: Partial<any>) => {
    if (!userId) return;
    updateDraftStore(userId, id, updates);
    setDrafts(loadDrafts(userId));
  };
  const deleteDraft = (id: string) => {
    if (!userId) return;
    deleteDraftStore(userId, id);
    setDrafts(loadDrafts(userId));
  };

  // Links
  const addNewLink = (payload: Partial<any>) => {
    if (!userId) return;
    const item = addLink(userId, payload);
    setLinks(prev => [item, ...prev]);
  };
  const updateLink = (id: string, updates: Partial<any>) => { if (!userId) return; updateLinkStore(userId, id, updates); setLinks(loadLinks(userId)); };
  const removeLink = (id: string) => { if (!userId) return; deleteLinkStore(userId, id); setLinks(loadLinks(userId)); };

  // Gallery
  const handleUploadImage = (file: File) => {
    if (!userId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = addImageStore(userId, file.name, dataUrl);
      setGallery(prev => [img, ...prev]);
    };
    reader.readAsDataURL(file);
  };
  const removeImage = (id: string) => { if (!userId) return; deleteImageStore(userId, id); setGallery(loadGallery(userId)); };

  // Notifications
  const pushNotif = (title: string, body?: string) => {
    if (!userId) return;
    pushNotification(userId, title, body);
    setNotifications(loadNotifications(userId));
  };
  const clearAllNotifs = () => { if (!userId) return; clearNotifications(userId); setNotifications([]); };
  const markReadAll = () => { if (!userId) return; markAllRead(userId); setNotifications(loadNotifications(userId)); };

  // Settings
  const toggleSetting = (key: string, value: any) => {
    if (!userId) return;
    const next = { ...(settings || {}), [key]: value };
    setSettings(next);
    localStorage.setItem(`rightSidebar::${userId}::settings`, JSON.stringify(next));
  };

  if (!ready) return null;

  return (
    <>
      {/* Sidebar icons */}
      <div className="hidden md:flex w-14 bg-white border-l border-gray-200 flex-col items-center py-4 gap-2">
        {actions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => setSelected(a.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`} title={a.label}>
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        <div className="mt-auto pt-4 text-xs text-gray-400 text-center w-full">
          <p>ID: {userId ? `${userId.substring(0, 4)}...` : '----'}</p>
        </div>
      </div>

      {/* Panels */}
      {/* Chat */}
      {selected === 'chat' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Messages</h3><button onClick={() => setSelected(null)}><X /></button></div>
          <ChatWindow userId={userId} />
        </div>
      )}

      {/* Gallery */}
      {selected === 'image' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Gallery</h3><button onClick={() => setSelected(null)}><X /></button></div>

          <div className="mb-3">
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f); }} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {gallery.map(g => (
              <div key={g.id} className="aspect-square overflow-hidden rounded cursor-pointer relative">
                <img src={g.dataUrl} alt={g.name} className="w-full h-full object-cover" onClick={() => setOpenPreview({ src: g.dataUrl, name: g.name })} />
                <button onClick={() => removeImage(g.id)} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {openPreview && <ImagePreviewModal src={openPreview.src} name={openPreview.name} onClose={() => setOpenPreview(null)} />}

      {/* Drafts (simple list + edit drawer) */}
      {selected === 'edit' && userId && (
        <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Drafts</h3><button onClick={() => setSelected(null)}><X /></button></div>

          <div className="mb-3">
            <button onClick={() => createDraft({ type: 'note', title: 'New Note', content: '' })} className="px-3 py-2 bg-blue-600 text-white rounded">New Draft</button>
          </div>

          <div className="space-y-2">
            {drafts.length === 0 && <div className="text-sm text-gray-500">No drafts.</div>}
            {drafts.map(d => (
              <div key={d.id} className="p-2 bg-gray-50 rounded border flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.title}</div>
                  <div className="text-xs text-gray-500">{String(d.type).toUpperCase()} · {d.dueDate ? `Due ${new Date(d.dueDate).toLocaleString()}` : ''}</div>
                </div>
                <div className="ml-2 flex flex-col gap-2">
                  <button onClick={() => {
                    const newTitle = prompt('Edit title', d.title);
                    if (newTitle) updateDraft(d.id, { title: newTitle });
                  }} className="text-xs text-blue-600">Edit</button>
                  <button onClick={() => { const open = confirm('Open editor?'); if (open) {
                    const newContent = prompt('Edit content', d.content || '') ?? undefined;
                    if (newContent !== undefined) updateDraft(d.id, { content: newContent });
                  }}} className="text-xs text-blue-600">Open</button>
                  <button onClick={() => deleteDraft(d.id)} className="text-xs text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {selected === 'link' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Links</h3><button onClick={() => setSelected(null)}><X /></button></div>

          <div className="mb-3">
            <button onClick={() => {
              const url = prompt('Link URL (https://...)');
              if (url) addNewLink({ url, title: url });
            }} className="px-3 py-2 bg-blue-600 text-white rounded">Add Link</button>
          </div>

          <div className="space-y-2">
            {links.map(l => (
              <div key={l.id} className="p-2 bg-gray-50 rounded border flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.title}</div>
                  <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate">{l.url}</a>
                </div>
                <div className="ml-2 flex gap-2">
                  <button onClick={() => { const newTitle = prompt('Edit title', l.title); if (newTitle) updateLink(l.id, { title: newTitle }); }} className="text-xs text-blue-600">Edit</button>
                  <button onClick={() => removeLink(l.id)} className="text-xs text-red-600">Delete</button>
                </div>
              </div>
            ))}
            {links.length === 0 && <div className="text-sm text-gray-500">No links saved.</div>}
          </div>
        </div>
      )}

      {/* Favorites */}
      {selected === 'favorite' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Favorites</h3><button onClick={() => setSelected(null)}><X /></button></div>

          <div className="mb-3">
            <button onClick={() => {
              const name = prompt('Favorite name');
              const url = prompt('Optional URL');
              if (name) addNewFavorite({ name, url });
            }} className="px-3 py-2 bg-blue-600 text-white rounded">Add Favorite</button>
          </div>

          <div className="space-y-2">
            {favorites.map(f => (
              <div key={f.id} className="p-2 bg-gray-50 rounded border flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.description}</div>
                </div>
                <div className="ml-2 flex gap-2">
                  <button onClick={() => { const newName = prompt('Rename', f.name); if (newName) updateFavorite(f.id, { name: newName }); }} className="text-xs text-blue-600">Rename</button>
                  <button onClick={() => { if (f.url) window.open(f.url, '_blank'); }} className="text-xs text-blue-600">Open</button>
                  <button onClick={() => removeFavorite(f.id)} className="text-xs text-red-600">Un-favorite</button>
                </div>
              </div>
            ))}
            {favorites.length === 0 && <div className="text-sm text-gray-500">No favorites yet.</div>}
          </div>
        </div>
      )}

      {/* Notifications */}
      {selected === 'bell' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <button onClick={() => pushNotif('Manual notification', 'You triggered a manual notif')} className="text-sm text-blue-600">Push</button>
              <button onClick={markReadAll} className="text-sm text-gray-600">Mark all read</button>
              <button onClick={clearAllNotifs} className="text-sm text-red-600">Clear</button>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>
          </div>

          <div className="space-y-2">
            {notifications.length === 0 && <div className="text-sm text-gray-500">No notifications.</div>}
            {notifications.map(n => (
              <div key={n.id} className={`p-2 rounded border ${n.read ? 'bg-white' : 'bg-red-50'}`}>
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-gray-500">{n.body}</div>
                <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {selected === 'settings' && userId && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Settings</h3><button onClick={() => setSelected(null)}><X /></button></div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Dark mode</span>
              <input type="checkbox" checked={settings.darkMode} onChange={(e) => toggleSetting('darkMode', e.target.checked)} />
            </label>

            <label className="flex items-center justify-between">
              <span>Font size</span>
              <select value={settings.fontSize} onChange={(e) => toggleSetting('fontSize', e.target.value)}>
                <option value="sm">Small</option>
                <option value="base">Base</option>
                <option value="lg">Large</option>
              </select>
            </label>

            <label className="flex items-center justify-between">
              <span>Layout</span>
              <select value={settings.layout} onChange={(e) => toggleSetting('layout', e.target.value)}>
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
              </select>
            </label>
          </div>

          <div className="text-xs text-gray-500 mt-4">Settings are persisted in localStorage for this browser.</div>
        </div>
      )}
    </>
  );
}
