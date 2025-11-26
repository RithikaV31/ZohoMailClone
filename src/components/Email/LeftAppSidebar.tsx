// LeftAppSidebar.tsx (Fixed Mobile Scrolling)

import { useState } from 'react';
import { Mail, Calendar, CheckSquare, FileText, Users, Bookmark, ChevronDown } from 'lucide-react';

interface LeftAppSidebarProps {
  activeApp: string;
  onAppChange: (app: string) => void;
}

interface AppItem {
  id: string;
  icon: typeof Mail;
  label: string;
}

const apps: AppItem[] = [
  { id: 'mail', icon: Mail, label: 'Mail' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'todo', icon: CheckSquare, label: 'ToDo' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'contacts', icon: Users, label: 'Contacts' },
  { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
];

export default function LeftAppSidebar({ activeApp, onAppChange }: LeftAppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeAppItem = apps.find(app => app.id === activeApp) || apps[0];

  const handleAppSelect = (appId: string) => {
    onAppChange(appId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. Desktop/Tablet Vertical Sidebar */}
      <div className="hidden sm:flex w-16 bg-[#2d3748] flex-col items-center py-4 gap-2 h-screen overflow-y-auto flex-shrink-0">
        {apps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;

          return (
            <button
              key={app.id}
              onClick={() => handleAppSelect(app.id)}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition relative group ${
                isActive
                  ? 'bg-[#3d4d62] text-white'
                  : 'text-gray-400 hover:bg-[#3d4d62] hover:text-white'
              }`}
              title={app.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium hidden md:inline">{app.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Mobile Horizontal App Bar (Dropdown/Kebab Menu) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 bg-[#2d3748] flex items-center py-2 px-2 z-40 flex-shrink-0">
        
        {/* Active App/Dropdown Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#3d4d62] text-white transition"
          >
            <activeAppItem.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{activeAppItem.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl z-50">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppSelect(app.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition ${
                    app.id === activeApp ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <app.icon className="w-4 h-4" />
                  {app.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}