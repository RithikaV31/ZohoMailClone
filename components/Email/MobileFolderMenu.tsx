// MobileFolderMenu.tsx (Final Compose Button Fix)

import { useState } from 'react';
import { Menu, MoreVertical, Folder, ChevronDown, PenSquare } from 'lucide-react';

interface Folder {
    id: string;
    name: string;
    type: string;
}

// Hardcoded list used for folder dropdown structure
const defaultFolders: Folder[] = [
    { id: '1', name: 'Inbox', type: 'inbox' },
    { id: '2', name: 'Sent', type: 'sent' },
    { id: '3', name: 'Drafts', type: 'drafts' },
    { id: '4', name: 'Spam', type: 'spam' },
    { id: '5', name: 'Trash', type: 'trash' },
];

interface MobileFolderMenuProps {
    currentFolderId: string | null;
    onFolderSelect: (id: string, type: string) => void;
    onCompose: () => void; // Added onCompose to allow button functionality
}

export default function MobileFolderMenu({ currentFolderId, onFolderSelect, onCompose }: MobileFolderMenuProps) {
    const currentFolder = defaultFolders.find(f => f.id === currentFolderId) || defaultFolders[0];
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    return (
        <div className="md:hidden sticky top-0 bg-white border-b z-30 p-3 flex items-center justify-between flex-shrink-0">
            
            {/* Folder Dropdown (Left side) */}
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition"
                >
                    <Folder className="w-4 h-4 text-blue-600" />
                    {currentFolder.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl z-40">
                        {defaultFolders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => {
                                    onFolderSelect(folder.id, folder.type);
                                    setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                    folder.id === currentFolderId ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {folder.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions (Right side) */}
            <div className="flex items-center gap-1 relative">
                
                {/* Compose Button (Fixed to use onCompose prop) */}
                <button 
                    onClick={onCompose}
                    className="flex items-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    title="New Task/Compose"
                >
                    <PenSquare className="w-4 h-4" />
                </button>

                {/* More Actions (Three dots) */}
                <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="More Actions"
                >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* More Actions Dropdown */}
                {isMoreOpen && (
                    <div className="absolute right-0 top-full mt-2 w-36 bg-white border rounded-lg shadow-xl z-40">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">Actions</div>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Settings
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}