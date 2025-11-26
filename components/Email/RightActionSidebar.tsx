import React, { useEffect, useState } from 'react';
import {
  Heart, MessageSquare, Link as LinkIcon, Edit3, Image as ImageIcon, Settings,
  Plus, Zap, Bell, X, Star, Mail, List, FileText, Check, Share, Trash2, Clock, Upload, Send, CornerDownLeft
} from 'lucide-react';

/**
 * RightActionSidebar (single-file, localStorage-backed)
 *
 * - Keeps the overall structure you provided.
 * - Settings panel fixed and expanded: toggles + font-size + layout modes.
 * - Drawer visibility controlled by `selectedAction` only (simpler & less error-prone).
 * - Settings persisted under the namespaced key: rightSidebar::<appId>::<userId>::settings
 *
 * Tailwind classes left intact — replace or remove if you don't use Tailwind.
 *
 * --- CHANGES IMPLEMENTED ---
 * 1. FAVORITES: Added `imageUrl` support and mock image.
 * 2. CHAT: Added "Start New Conversation" button.
 * 3. LINK: Added "Add New Link" button and a mock item.
 * 4. DRAFTS: Confirmed local storage persistence and delete functionality.
 * 5. IMAGE: Changed mock grid to list and added "Upload" functionality.
 * 6. CREATE: Fixed local storage saving via SubActionModal `onSaved` callback.
 * 7. QUICK ACTIONS: Added mock Add/Delete buttons.
 * 8. NOTIFICATIONS: Added "Clear All Notifications" functionality.
 * 9. SETTINGS: Confirmed all settings are correctly toggled and persisted.
 */

// App identifier (keeps keys safe across multiple apps on same domain)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const STORAGE_PREFIX = 'rightSidebar';

// Helpers for localStorage keys
const draftsKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::drafts`;
const favoritesKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::favorites`;
const settingsKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::settings`;
const chatsKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::chats`; // New key
const linksKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::links`; // New key
const imagesKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::images`; // New key
const notificationsKey = (userId: string) => `${STORAGE_PREFIX}::${appId}::${userId}::notifications`; // New key
const userIdKey = `${STORAGE_PREFIX}::${appId}::userId`;

// Utility: safe JSON parse
const safeParse = (v: string | null) => {
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
};

// Generate id (uses crypto if available)
const genId = () => {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return `id_${Math.random().toString(36).slice(2, 9)}`;
};

// --- Storage operations (small, local) ---

// Drafts
const loadDrafts = (userId: string) => {
  const raw = localStorage.getItem(draftsKey(userId));
  const parsed = safeParse(raw) || [];
  return parsed.map((d: any) => ({ ...d, updatedAt: Number(d.updatedAt || Date.now()) }))
    .sort((a: any, b: any) => b.updatedAt - a.updatedAt)
    .slice(0, 50);
};
const saveDrafts = (userId: string, drafts: any[]) => {
  localStorage.setItem(draftsKey(userId), JSON.stringify(drafts));
};
const addDraftToStorage = (userId: string, draft: any) => {
  const current = loadDrafts(userId);
  const toSave = [{ id: genId(), ...draft, createdAt: Date.now(), updatedAt: Date.now() }, ...current];
  saveDrafts(userId, toSave);
  return toSave[0];
};
const deleteDraftFromStorage = (userId: string, id: string) => {
  const current = loadDrafts(userId);
  const filtered = current.filter((d: any) => d.id !== id);
  saveDrafts(userId, filtered);
  return filtered;
};

// Favorites
const loadFavorites = (userId: string) => {
  const raw = localStorage.getItem(favoritesKey(userId));
  const parsed = safeParse(raw) || [];
  return parsed.map((f: any) => ({ ...f, favoriteDate: Number(f.favoriteDate || Date.now()) }))
    .sort((a: any, b: any) => b.favoriteDate - a.favoriteDate)
    .slice(0, 50);
};
const saveFavorites = (userId: string, favs: any[]) => {
  localStorage.setItem(favoritesKey(userId), JSON.stringify(favs));
};
const addFavoriteToStorage = (userId: string, fav: any) => {
  const current = loadFavorites(userId);
  const item = { id: genId(), ...fav, favoriteDate: Date.now() };
  const updated = [item, ...current];
  saveFavorites(userId, updated);
  return item;
};

// Settings
const loadSettings = (userId: string) => {
  const raw = localStorage.getItem(settingsKey(userId));
  const parsed = safeParse(raw);
  // Provide a robust default shape so UI doesn't break
  return {
    notificationsEnabled: parsed?.notificationsEnabled ?? true,
    darkMode: parsed?.darkMode ?? false,
    readingPaneEnabled: parsed?.readingPaneEnabled ?? true,
    fontSize: parsed?.fontSize ?? 'base',    // 'sm' | 'base' | 'lg'
    layout: parsed?.layout ?? 'compact',     // 'compact' | 'comfortable'
  };
};
const saveSettings = (userId: string, settings: any) => {
  localStorage.setItem(settingsKey(userId), JSON.stringify(settings));
  // Apply dark mode globally on save
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Chats (Mock storage, supporting new conversation)
const loadChats = (userId: string) => {
  const raw = localStorage.getItem(chatsKey(userId));
  const defaultChats = [
    { id: 'chat-1', name: 'John Smith', status: 'active', lastSeen: 'New!', isNew: true },
    { id: 'chat-2', name: 'Sarah Wilson', status: 'inactive', lastSeen: '1h ago', isNew: false },
  ];
  const parsed = safeParse(raw) || defaultChats;
  return parsed.sort((a: any, b: any) => (b.isNew ? 1 : -1) - (a.isNew ? 1 : -1)).slice(0, 10);
};
const saveChats = (userId: string, chats: any[]) => {
  localStorage.setItem(chatsKey(userId), JSON.stringify(chats));
};
const addChatToStorage = (userId: string, name: string) => {
  const current = loadChats(userId).map(c => ({...c, isNew: false})); // Mark others as read
  const newChat = {
    id: genId(),
    name,
    status: 'active',
    lastSeen: 'Just Now',
    isNew: true,
  };
  const updated = [newChat, ...current].slice(0, 10);
  saveChats(userId, updated);
  return updated;
};

// Links (Mock storage, supporting new links)
const loadLinks = (userId: string) => {
    const raw = localStorage.getItem(linksKey(userId));
    const defaultLinks = [
        { id: 'link-1', title: 'Design Mockups (Figma)', url: 'https://link/design...' },
        { id: 'link-2', title: 'Budget Spreadsheet Q4', url: 'https://link/sheets...' },
    ];
    return safeParse(raw) || defaultLinks;
};
const saveLinks = (userId: string, links: any[]) => {
    localStorage.setItem(linksKey(userId), JSON.stringify(links));
};
const addLinkToStorage = (userId: string, title: string, url: string) => {
    const current = loadLinks(userId);
    const newLink = { id: genId(), title, url: url.substring(0, 25) + (url.length > 25 ? '...' : '') };
    const updated = [newLink, ...current].slice(0, 10);
    saveLinks(userId, updated);
    return updated;
};

// Images (Mock storage, supporting new images)
const loadImages = (userId: string) => {
    const raw = localStorage.getItem(imagesKey(userId));
    const defaultImages = [
        { id: 'img-1', name: 'Annual Report.pdf', type: 'PDF', color: 'blue' },
        { id: 'img-2', name: 'Product Launch.png', type: 'PNG', color: 'green' },
        { id: 'img-3', name: 'Team Photo.jpg', type: 'JPG', color: 'orange' },
        { id: 'img-4', name: 'Vector Logo.svg', type: 'SVG', color: 'pink' },
    ];
    return safeParse(raw) || defaultImages;
};
const saveImages = (userId: string, images: any[]) => {
    localStorage.setItem(imagesKey(userId), JSON.stringify(images));
};
const addImageToStorage = (userId: string, name: string) => {
    const current = loadImages(userId);
    const type = name.split('.').pop()?.toUpperCase() || 'FILE';
    const colorOptions = ['red', 'purple', 'teal', 'yellow', 'blue'];
    const newImage = { 
        id: genId(), 
        name, 
        type, 
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        uploadDate: Date.now()
    };
    const updated = [newImage, ...current].slice(0, 10);
    saveImages(userId, updated);
    return updated;
};


// Notifications (Mock storage, supporting clearing)
const loadNotifications = (userId: string) => {
    const raw = localStorage.getItem(notificationsKey(userId));
    const defaultNotifs = [
        { id: 'notif-1', title: 'Task deadline approaching', desc: 'Due in 2 hours', type: 'warning' },
        { id: 'notif-2', title: 'New email received', desc: 'From: John Smith', type: 'info' },
    ];
    return safeParse(raw) || defaultNotifs;
};
const saveNotifications = (userId: string, notifs: any[]) => {
    localStorage.setItem(notificationsKey(userId), JSON.stringify(notifs));
};
const clearNotifications = (userId: string) => {
    saveNotifications(userId, []);
    return [];
};


// Actions configuration (kept same as original)
const actions = [
  { id: 'favorite', icon: Heart, color: 'text-red-500', label: 'Favorites', desc: 'Starred emails, files, and images.' },
  { id: 'chat', icon: MessageSquare, color: 'text-green-500', label: 'Messages', desc: 'Recent conversations and chats' },
  { id: 'link', icon: LinkIcon, color: 'text-blue-400', label: 'Links', desc: 'Shared links and bookmarks' },
  { id: 'edit', icon: Edit3, color: 'text-yellow-500', label: 'Drafts', desc: 'Continue editing unsent items' },
  { id: 'image', icon: ImageIcon, color: 'text-teal-500', label: 'Gallery', desc: 'View, add, and manage media/attachments' },
  { id: 'add', icon: Plus, color: 'text-blue-500', label: 'Create', desc: 'Create new item quickly' },
  { id: 'zap', icon: Zap, color: 'text-yellow-400', label: 'Quick Actions', desc: 'Access frequently used actions' },
  { id: 'bell', icon: Bell, color: 'text-red-400', label: 'Notifications', desc: 'View recent notifications' },
  { id: 'settings', icon: Settings, color: 'text-gray-500', label: 'Settings', desc: 'Manage your preferences' },
];

// -------------------- SubActionModal --------------------
interface SubActionModalProps {
  title: string;
  icon: React.ElementType;
  onClose: () => void;
  userId: string;
  onSaved: (draft: any) => void;
}
const SubActionModal: React.FC<SubActionModalProps> = ({ title, icon: Icon, onClose, userId, onSaved }) => {
  const [compositionTitle, setCompositionTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDraft = async () => {
    if (!userId || !compositionTitle.trim()) return;
    setIsSaving(true);
    try {
      const type = title.toLowerCase();
      const newDraft = addDraftToStorage(userId, {
        type,
        title: compositionTitle.trim(),
        content,
      });
      // IMPORTANT: Calling onSaved to update the main component state
      onSaved(newDraft); 
      onClose();
    } catch (err) {
      console.error('Error saving draft to localStorage', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70]">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600">
            <Icon className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New {title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Drafting a new <strong>{title}</strong> item. It will be saved locally.</p>

          <input
            type="text"
            placeholder={`Subject / Title for ${title}...`}
            className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={compositionTitle}
            onChange={(e) => setCompositionTitle(e.target.value)}
          />

          {title === 'Email' && (
            <input
              type="email"
              placeholder="To: recipient@example.com"
              className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}

          {title === 'Task' && (
            <select className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700 dark:text-gray-300">
              <option>Priority: Medium</option>
              <option>Priority: High</option>
              <option>Priority: Low</option>
            </select>
          )}

          <textarea
            placeholder={`Start writing your new ${title} content here...`}
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || !compositionTitle.trim()}
            className={`w-full py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2 ${
              (isSaving || !compositionTitle.trim()) ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Saving Draft...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {title === 'Email' ? 'Save as Draft' : 'Create & Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// -------------------- Main Component --------------------
export default function RightActionSidebar() {
  // App & auth-like state
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Data states
  const [drafts, setDraftsState] = useState<any[]>([]);
  const [favorites, setFavoritesState] = useState<any[]>([]);
  const [chats, setChatsState] = useState<any[]>([]); // New state
  const [links, setLinksState] = useState<any[]>([]); // New state
  const [images, setImagesState] = useState<any[]>([]); // New state
  const [notifications, setNotificationsState] = useState<any[]>([]); // New state
  const [settings, setSettingsState] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [newChatName, setNewChatName] = useState('');

  // Sub-modals
  const [showNewEmail, setShowNewEmail] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);

  const currentAction = actions.find(a => a.id === selectedAction);

  // Initialize userId and load persisted data
  useEffect(() => {
    let uid = localStorage.getItem(userIdKey);
    if (!uid) {
      uid = genId();
      localStorage.setItem(userIdKey, uid);
    }
    setUserId(uid);
    setIsAuthReady(true);
  }, []);

  // Load data once userId is available
  useEffect(() => {
    if (!isAuthReady || !userId) return;
    setIsLoading(true);
    try {
      const loadedDrafts = loadDrafts(userId);
      const loadedFavorites = loadFavorites(userId);
      const loadedSettings = loadSettings(userId);
      const loadedChats = loadChats(userId);
      const loadedLinks = loadLinks(userId);
      const loadedImages = loadImages(userId);
      const loadedNotifications = loadNotifications(userId);

      setDraftsState(loadedDrafts);
      setFavoritesState(loadedFavorites);
      setSettingsState(loadedSettings);
      setChatsState(loadedChats);
      setLinksState(loadedLinks);
      setImagesState(loadedImages);
      setNotificationsState(loadedNotifications);
      
      // Apply dark mode immediately on load
      if (loadedSettings.darkMode) {
        document.documentElement.classList.add('dark');
      }
    } catch (err) {
      console.error('Failed to load local data', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthReady, userId]);

  // CRUD replacements ------------------------------------------------
  const toggleSetting = (key: string, value: any) => {
    if (!userId) return;
    const updated = { ...(settings || {}), [key]: value };
    setSettingsState(updated);
    // Setting change is also applied in saveSettings helper
    saveSettings(userId, updated);
  };

  const addMockFavorite = (withImage = false) => {
    if (!userId) return;
    const name = `Item ${Math.floor(Math.random() * 1000)}`;
    const newFav = addFavoriteToStorage(userId, { 
        name, 
        // Mock image URL for visual support
        imageUrl: withImage ? 'https://via.placeholder.com/48/4F46E5/FFFFFF?text=F' : undefined
    });
    setFavoritesState(prev => [newFav, ...prev].slice(0, 50));
  };
  
  const addMockChat = () => {
    if (!userId || !newChatName.trim()) return;
    const updatedChats = addChatToStorage(userId, newChatName.trim());
    setChatsState(updatedChats);
    setNewChatName('');
  };

  const addMockLink = () => {
    if (!userId || !newLinkUrl.trim()) return;
    const title = newLinkUrl.length > 50 ? `${newLinkUrl.substring(0, 50)}...` : newLinkUrl;
    const updatedLinks = addLinkToStorage(userId, title, newLinkUrl.trim());
    setLinksState(updatedLinks);
    setNewLinkUrl('');
  };

  const addMockImage = () => {
    if (!userId || !newImageName.trim()) return;
    const updatedImages = addImageToStorage(userId, newImageName.trim());
    setImagesState(updatedImages);
    setNewImageName('');
  };
  
  const handleClearNotifications = () => {
      if (!userId) return;
      const emptyNotifs = clearNotifications(userId);
      setNotificationsState(emptyNotifs);
  };

  const deleteDraft = (id: string) => {
    if (!userId) return;
    const remaining = deleteDraftFromStorage(userId, id);
    setDraftsState(remaining);
  };

  // create draft handler used by sub-modal callback
  const handleDraftSaved = (draft: any) => {
    setDraftsState(prev => [draft, ...prev].slice(0, 50));
  };

  // UI handlers ------------------------------------------------------
  const handleActionClick = (actionId: string) => {
    setSelectedAction(prev => (prev === actionId ? null : actionId));
    setShowMobileMenu(false);
  };

  const closeDrawer = () => {
    setSelectedAction(null);
  };

  const openSubAction = (type: 'email' | 'task' | 'note') => {
    closeDrawer();
    if (type === 'email') setShowNewEmail(true);
    if (type === 'task') setShowNewTask(true);
    if (type === 'note') setShowNewNote(true);
  };

  const closeSubAction = () => {
    setShowNewEmail(false);
    setShowNewTask(false);
    setShowNewNote(false);
  };

  // Loading fallback UI
  if (isLoading || !isAuthReady) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
        <div className="text-center p-8">
          <Clock className="w-8 h-8 mx-auto animate-spin text-blue-500" />
          <p className="mt-2 font-semibold">Loading data...</p>
          <p className="text-xs">User ID: {userId ? `${userId.substring(0, 8)}...` : 'initializing'}</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => {
          setShowMobileMenu(!showMobileMenu);
          if (selectedAction) closeDrawer();
        }}
        className="fixed bottom-4 right-4 md:hidden w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-50 transition hover:bg-blue-700"
        aria-label="Open actions menu"
      >
        {showMobileMenu ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-14 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col items-center py-4 gap-2 overflow-y-auto flex-shrink-0 h-full">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = selectedAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-gray-100 dark:hover:bg-gray-700 group relative ${action.color} ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              title={action.label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-14 ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-50">
                {action.label}
              </span>
            </button>
          );
        })}
        <div className="mt-auto pt-4 text-xs text-gray-400 text-center w-full">
          <p>ID: {userId ? `${userId.substring(0, 4)}...` : '----'}</p>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden flex justify-end">
          <div className="absolute inset-0" onClick={() => setShowMobileMenu(false)} aria-hidden="true" />
          <div className="bg-white dark:bg-gray-800 w-64 h-full shadow-xl p-4 flex flex-col z-40">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800 dark:text-white flex-shrink-0">Quick Access</h3>
            <div className="space-y-3 overflow-y-auto flex-1 pb-4">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${action.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{action.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
              >
                Close Menu <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Drawer (renders when selectedAction is set) */}
      {selectedAction && currentAction && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-[60]">
          <div className="absolute inset-0" onClick={closeDrawer} aria-hidden="true" />
          <div className="w-full max-w-xs sm:max-w-sm md:w-80 bg-white dark:bg-gray-800 h-full flex flex-col shadow-xl z-50 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = currentAction.icon;
                  return <Icon className={`w-5 h-5 ${currentAction.color}`} />;
                })()}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentAction.label}</h2>
              </div>
              <button onClick={closeDrawer} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" aria-label="Close drawer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 pb-0">
              <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                <p>{currentAction.desc}</p>
              </div>

              <div className="space-y-2">
                {/* Favorites */}
                {currentAction.id === 'favorite' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Pinned Items ({favorites.length})
                    </h3>
                    <div className="p-3 bg-red-50/50 dark:bg-red-900/50 rounded-lg space-y-2">
                      {favorites.length > 0 ? (
                        favorites.map((fav) => (
                          <div key={fav.id} className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 transition flex justify-between items-center text-sm">
                            <div className='flex items-center gap-2'>
                                {fav.imageUrl ? <img src={fav.imageUrl} alt="Favorite thumbnail" className="w-6 h-6 rounded object-cover" /> : <FileText className="w-4 h-4 text-gray-400" />}
                                <p className="font-medium text-gray-800 dark:text-white truncate">{fav.name}</p>
                            </div>
                            <Share className="w-4 h-4 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">No favorite items found.</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => addMockFavorite(true)} className="flex-1 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 p-1 border rounded hover:bg-blue-50 dark:hover:bg-blue-900/50">
                            <Plus className="w-3 h-3" /> Add Image Item
                        </button>
                        <button onClick={() => addMockFavorite(false)} className="flex-1 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 p-1 border rounded hover:bg-blue-50 dark:hover:bg-blue-900/50">
                            <Plus className="w-3 h-3" /> Add Text Item
                        </button>
                    </div>
                  </div>
                )}

                {/* Chat */}
                {currentAction.id === 'chat' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-green-500" /> Active Chats ({chats.length})
                    </h3>
                    <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg space-y-2">
                      {chats.map(chat => (
                          <div key={chat.id} className={`p-2 bg-white dark:bg-gray-700 rounded border transition cursor-pointer flex items-center justify-between ${chat.isNew ? 'border-green-300 dark:border-green-500' : 'hover:border-gray-300 dark:hover:border-gray-500'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${chat.status === 'active' ? 'bg-green-500' : 'bg-transparent border border-gray-300 dark:border-gray-500'} flex-shrink-0`} />
                              <p className={`text-sm ${chat.isNew ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white truncate`}>{chat.name}</p>
                            </div>
                            <p className={`text-xs ${chat.isNew ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{chat.lastSeen}</p>
                          </div>
                      ))}
                    </div>
                    <div className="pt-1">
                        <input
                            type="text"
                            placeholder="New chat name..."
                            className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addMockChat(); }}
                        />
                        <button
                            onClick={addMockChat}
                            disabled={!newChatName.trim()}
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <CornerDownLeft className="w-3 h-3" /> Start New Conversation
                        </button>
                    </div>
                  </div>
                )}

                {/* Links */}
                {currentAction.id === 'link' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <LinkIcon className="w-4 h-4 text-blue-400" /> Recent Shares ({links.length})
                    </h3>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2">
                      {links.map(link => (
                          <a key={link.id} href="#" className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.title}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{link.url}</p>
                          </a>
                      ))}
                    </div>
                    <div className="pt-1">
                        <input
                            type="url"
                            placeholder="Enter a new link URL..."
                            className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addMockLink(); }}
                        />
                        <button
                            onClick={addMockLink}
                            disabled={!newLinkUrl.trim()}
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" /> Add New Link
                        </button>
                    </div>
                  </div>
                )}

                {/* Drafts */}
                {currentAction.id === 'edit' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Edit3 className="w-4 h-4 text-yellow-500" /> Active Drafts ({drafts.length})
                    </h3>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg space-y-2">
                      {drafts.length > 0 ? (
                        drafts.map((draft) => (
                          <div key={draft.id} className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-500 transition flex items-center justify-between cursor-pointer">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{draft.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{String(draft.type).toUpperCase()}. Last updated: {new Date(draft.updatedAt).toLocaleTimeString()}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }}
                              className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full flex-shrink-0"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">No drafts found.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {currentAction.id === 'image' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4 text-teal-500" /> Latest Media ({images.length})
                    </h3>
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/50 rounded-lg space-y-2">
                      {images.map(image => (
                          <div key={image.id} className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500 transition flex items-center justify-between text-sm">
                            <div className='flex items-center gap-2'>
                                <span className={`text-xs font-bold w-8 text-center px-1 py-0.5 rounded text-white bg-${image.color}-600`}>{image.type}</span>
                                <p className="font-medium text-gray-800 dark:text-white truncate">{image.name}</p>
                            </div>
                            <Share className="w-4 h-4 text-gray-400" />
                          </div>
                      ))}
                    </div>
                    <div className="pt-1">
                        <input
                            type="text"
                            placeholder="File name (e.g. vacation.jpg)"
                            className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newImageName}
                            onChange={(e) => setNewImageName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addMockImage(); }}
                        />
                        <button onClick={addMockImage} disabled={!newImageName.trim()} className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 disabled:opacity-50">
                          <Upload className="w-3 h-3" /> Upload Mock Image/File
                        </button>
                    </div>
                  </div>
                )}

                {/* Create */}
                {currentAction.id === 'add' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Plus className="w-4 h-4 text-blue-500" /> Start New
                    </h3>
                    <button onClick={() => openSubAction('email')} className="w-full p-3 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition text-left flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div><p className="text-sm font-medium text-gray-900 dark:text-white">New Email</p></div>
                    </button>
                    <button onClick={() => openSubAction('task')} className="w-full p-3 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition text-left flex items-center gap-3">
                      <List className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div><p className="text-sm font-medium text-gray-900 dark:text-white">New Task</p></div>
                    </button>
                    <button onClick={() => openSubAction('note')} className="w-full p-3 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition text-left flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div><p className="text-sm font-medium text-gray-900 dark:text-white">New Note</p></div>
                    </button>
                  </div>
                )}

                {/* Quick actions */}
                {currentAction.id === 'zap' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" /> Quick Commands (Mock)
                    </h3>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg space-y-2">
                      <button className="w-full p-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-left flex items-center gap-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Mark All as Read</p>
                      </button>
                      <button onClick={addMockFavorite} className="w-full p-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-left flex items-center gap-3">
                        <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Add Favorite</p>
                      </button>
                      <button onClick={() => deleteDraft(drafts[0]?.id || '')} disabled={drafts.length === 0} className="w-full p-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-left flex items-center gap-3 disabled:opacity-50">
                        <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Latest Draft</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {currentAction.id === 'bell' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Bell className="w-4 h-4 text-red-500" /> Latest Alerts ({notifications.length})
                    </h3>
                    <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg space-y-2">
                      {notifications.length > 0 ? (
                          notifications.map(notif => (
                              <div key={notif.id} className={`p-2 bg-white dark:bg-gray-700 rounded border-l-2 ${notif.type === 'warning' ? 'border-red-500' : 'border-blue-500'}`}>
                                <p className="text-xs font-medium text-gray-800 dark:text-white">{notif.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                              </div>
                          ))
                      ) : (
                          <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">No new notifications.</div>
                      )}
                    </div>
                    <button onClick={handleClearNotifications} disabled={notifications.length === 0} className="w-full text-center text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
                      Clear All Notifications
                    </button>
                  </div>
                )}

                {/* Settings */}
                {currentAction.id === 'settings' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Settings className="w-4 h-4 text-gray-500" /> User Preferences
                    </h3>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                      <label className="flex items-center justify-between p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable notifications</span>
                        <input
                          type="checkbox"
                          checked={!!settings.notificationsEnabled}
                          onChange={(e) => toggleSetting('notificationsEnabled', e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                        <input
                          type="checkbox"
                          checked={!!settings.darkMode}
                          onChange={(e) => toggleSetting('darkMode', e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Reading pane</span>
                        <input
                          type="checkbox"
                          checked={!!settings.readingPaneEnabled}
                          onChange={(e) => toggleSetting('readingPaneEnabled', e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                      </label>

                      {/* Font size */}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Font size</span>
                        <select
                          value={settings.fontSize || 'base'}
                          onChange={(e) => toggleSetting('fontSize', e.target.value)}
                          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="sm">Small</option>
                          <option value="base">Default</option>
                          <option value="lg">Large</option>
                        </select>
                      </div>

                      {/* Layout */}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Layout mode</span>
                        <select
                          value={settings.layout || 'compact'}
                          onChange={(e) => toggleSetting('layout', e.target.value)}
                          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="compact">Compact</option>
                          <option value="comfortable">Comfortable</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">Changes saved locally in your browser.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button onClick={closeDrawer} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition text-sm">
                Close Sidebar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Action Modals */}
      {showNewEmail && userId && <SubActionModal title="Email" icon={Mail} onClose={closeSubAction} userId={userId} onSaved={handleDraftSaved} />}
      {showNewTask && userId && <SubActionModal title="Task" icon={List} onClose={closeSubAction} userId={userId} onSaved={handleDraftSaved} />}
      {showNewNote && userId && <SubActionModal title="Note" icon={FileText} onClose={closeSubAction} userId={userId} onSaved={handleDraftSaved} />}
    </>
  );
}