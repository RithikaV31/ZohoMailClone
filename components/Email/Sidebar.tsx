import { useEffect, useState } from 'react';
import { Inbox, Send, FileText, Trash2, AlertOctagon, Plus, LogOut, PenSquare, X, Users } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // KEEP THIS COMMENTED OUT IF CONTEXT IS NOT PROVIDED
import { defaultFolders, type Folder } from '../../lib/mockData';

interface FolderWithCount extends Folder {
  unreadCount?: number;
}

interface Email {
  id: string;
  folder_id: string;
  is_read: boolean;
}

interface SidebarProps {
  onFolderSelect: (folderId: string, folderType: string) => void;
  onCompose: () => void;
  selectedFolderId: string | null;
  allEmails?: Email[];
}

interface Group {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const iconMap: Record<string, typeof Inbox> = {
  inbox: Inbox,
  send: Send,
  'file-text': FileText,
  'trash-2': Trash2,
  'alert-octagon': AlertOctagon,
};

export default function Sidebar({ onFolderSelect, onCompose, selectedFolderId, allEmails = [] }: SidebarProps) {
  const [folders, setFolders] = useState<FolderWithCount[]>(defaultFolders.map(f => ({ ...f, unreadCount: 0 })));
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Work', color: 'bg-blue-500' },
    { id: '2', name: 'Personal', color: 'bg-green-500' },
  ]);
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Important', color: 'bg-red-500' },
    { id: '2', name: 'Follow Up', color: 'bg-yellow-500' },
  ]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  // 🔥 Using a dummy function to avoid errors if useAuth is not linked
  const signOut = () => console.log('Signing out...');

  useEffect(() => {
    if (!selectedFolderId && folders.length > 0) {
      const inbox = folders.find(f => f.type === 'inbox');
      if (inbox) {
        onFolderSelect(inbox.id, inbox.type);
      }
    }
  }, [selectedFolderId, folders, onFolderSelect]); // Added dependency array for safety

  useEffect(() => {
    const updatedFolders = defaultFolders.map(folder => {
      const unreadCount = allEmails.filter(
        email => email.folder_id === folder.id && !email.is_read
      ).length;
      return { ...folder, unreadCount };
    });
    setFolders(updatedFolders);
  }, [allEmails]);

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
    setGroups([...groups, {
      id: Date.now().toString(),
      name: newGroupName,
      color: colors[Math.floor(Math.random() * colors.length)],
    }]);
    setNewGroupName('');
    setShowGroupModal(false);
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const addTag = () => {
    if (!newTagName.trim()) return;
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-orange-500', 'bg-teal-500'];
    setTags([...tags, {
      id: Date.now().toString(),
      name: newTagName,
      color: colors[Math.floor(Math.random() * colors.length)],
    }]);
    setNewTagName('');
    setShowTagModal(false);
  };

  const removeTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex-col overflow-hidden flex flex-shrink-0">
      <div className="p-3 border-b flex-shrink-0">
        <button
          onClick={onCompose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <PenSquare className="w-4 h-4" />
          <span className="text-sm">New Task</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-0.5">
          {folders.map((folder) => {
            const Icon = iconMap[folder.icon] || Inbox;
            return (
              <button
                key={folder.id}
                onClick={() => onFolderSelect(folder.id, folder.type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded transition text-sm ${
                  selectedFolderId === folder.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {folder.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-2 mt-3">
          <div className="border-t pt-3">
            <div className="px-2 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase">Groups</span>
                <button onClick={() => setShowGroupModal(true)} className="p-0.5 hover:bg-gray-100 rounded">
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="space-y-0.5">
              {groups.map(group => (
                <div
                  key={group.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </div>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-2 mt-3">
          <div className="border-t pt-3">
            <div className="px-2 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase">Tags</span>
                <button onClick={() => setShowTagModal(true)} className="p-0.5 hover:bg-gray-100 rounded">
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="space-y-0.5">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </div>
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t p-2 flex-shrink-0">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">Add New Group</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGroup()}
              placeholder="Group name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addGroup}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">Add New Tag</h3>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Tag name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addTag}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setShowTagModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
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