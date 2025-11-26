import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Search, Folder, Tag, X } from 'lucide-react';

// Define the Bookmark interface
interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

// Global persistence key using app ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const STORAGE_KEY = `bookmarks_app::${appId}`;

// Utility to generate unique ID
const genId = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString());

export default function BookmarksApp() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Development',
    tags: '',
  });

  // --- Persistence Logic (runs on mount) ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Parse dates correctly
        const loadedBookmarks: Bookmark[] = JSON.parse(stored).map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
        }));
        setBookmarks(loadedBookmarks);
      } else {
        // Initialize with default data if empty
        const initialBookmarks: Bookmark[] = [
          {
            id: genId(),
            title: 'React Documentation',
            url: 'https://react.dev',
            category: 'Development',
            tags: ['react', 'docs'],
            createdAt: new Date(Date.now() - 86400000),
          },
          {
            id: genId(),
            title: 'Tailwind CSS Docs',
            url: 'https://tailwindcss.com/docs',
            category: 'Design',
            tags: ['tailwind', 'css'],
            createdAt: new Date(),
          },
        ];
        setBookmarks(initialBookmarks);
      }
    } catch (e) {
      console.error("Could not load bookmarks from storage:", e);
    }
  }, []);

  // --- Persistence Logic (runs on change) ---
  useEffect(() => {
    // Only save if bookmarks array is populated after initial load
    if (bookmarks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }, [bookmarks]);


  const handleAdd = () => {
    if (!formData.title || !formData.url) return;

    const newBookmark: Bookmark = {
      id: genId(),
      title: formData.title,
      url: formData.url,
      // Default to 'General' if category is empty
      category: formData.category.trim() || 'General',
      tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      createdAt: new Date(),
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    setShowModal(false);
    setFormData({ title: '', url: '', category: 'Development', tags: '' });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  // Dynamically generate categories (including 'All')
  const categories = ['All', ...Array.from(new Set(bookmarks.map(b => b.category)))].sort();

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by latest first

  const formatUrlDisplay = (url: string) => {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname;
    } catch {
      return url;
    }
  };

  const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => (
    <div
      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white flex-1 text-lg leading-snug break-words">
          {bookmark.title}
        </h3>
        <button
          onClick={() => deleteBookmark(bookmark.id)}
          className="p-1 ml-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition flex-shrink-0"
          title="Delete Bookmark"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <a
        href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-3 truncate"
        title={bookmark.url}
      >
        <span className="truncate">{formatUrlDisplay(bookmark.url)}</span>
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>

      <div className="flex flex-wrap gap-2 text-xs items-center">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
          <Folder className="w-3 h-3 text-yellow-500" />
          {bookmark.category}
        </div>
        {bookmark.tags.length > 0 && bookmark.tags.map(tag => (
          <span
            key={tag}
            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Added: {new Date(bookmark.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      {/* Header & Controls (Fixed height) */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Bookmark Manager</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow-md transition transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, URL, or tag..."
              className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none w-full sm:w-auto"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {filteredBookmarks.map(bookmark => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}

          {filteredBookmarks.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-xl font-semibold">No bookmarks found</p>
              <p className="text-sm mt-2">Try adjusting your search filters or click "Add New" to get started.</p>
            </div>
          )}
        </div>
        {/* Adds bottom padding so the last item isn't flush with the bottom of the viewport */}
        <div className="h-10"></div> 
      </div>

      {/* Add Bookmark Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className='flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700'>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Bookmark</h3>
                <button 
                    onClick={() => setShowModal(false)} 
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Bookmark title (e.g., Cool JS Library)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/resource"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Development, Reading, Finance, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated, lowercase recommended)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="js, docs, tutorial"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                disabled={!formData.title || !formData.url}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 rounded-lg font-medium shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Plus className="w-5 h-5" />
                Add Bookmark
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ title: '', url: '', category: 'Development', tags: '' });
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}