import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, Search, ArrowLeft } from 'lucide-react'; 

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Ideas: Build a Task Management App',
      content: 'This note has a lot of content to test scrolling: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Section 2: This is even more content to ensure the scrollbar appears correctly on mobile and desktop views when the content overflows the screen height. We need a really long block of text here to make sure we hit the scroll limits. Testing the line breaks, paragraphs, and general text flow. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      color: 'bg-yellow-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Shopping List',
      content: 'Milk, Eggs, Bread, Coffee, Tomatoes, Lettuce, Cheese, Pasta, Basil, Olive Oil, Chicken Breast, Apples, Bananas, Yogurt.',
      color: 'bg-green-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Meeting Agenda',
      content: '1. Review Q3 results. 2. Discuss Q4 goals. 3. Finalize holiday schedule.',
      color: 'bg-blue-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true); 

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      color: 'bg-blue-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
    setShowSidebar(false); 
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
      setShowSidebar(true); 
    }
  };

  const startEdit = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
    setShowSidebar(false); 
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updatedNote = { 
      ...selectedNote, 
      title: editTitle, 
      content: editContent, 
      updatedAt: new Date() 
    };

    setNotes(notes.map(note =>
      note.id === selectedNote.id
        ? updatedNote
        : note
    ));
    setIsEditing(false);
    setSelectedNote(updatedNote); 
  };

  const changeColor = (noteId: string, color: string) => {
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, color } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, color } : null);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setShowSidebar(false); 
  };

  const goBackToNotes = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setShowSidebar(true);
  };

  // --- Layout Classes for Responsiveness ---
  
  const sidebarClass = showSidebar ? 'w-full md:w-80 flex' : 'hidden md:flex md:w-80';
  const editorClass = showSidebar ? 'hidden md:flex flex-1' : 'w-full flex md:flex-1';


  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      
      {/* Sidebar - Note List */}
      <div className={`${sidebarClass} border-r bg-white flex-col shadow-lg transition-all duration-300`}>
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-gray-900">📝 Notes</h1>
            <button
              onClick={createNote}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition duration-150 ease-in-out"
              aria-label="Create new note"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => handleNoteSelect(note)}
                className={`p-4 border-b cursor-pointer transition duration-150 ease-in-out ${
                  selectedNote?.id === note.id ? 'bg-blue-100/70 border-l-4 border-blue-500' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{note.title || "Untitled Note"}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{note.content || "Empty content"}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {note.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${note.color} border border-gray-300 flex-shrink-0`} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="italic">No notes found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content - Note Viewer/Editor */}
      <div className={`${editorClass} flex-col bg-white transition-all duration-300`}>
        {selectedNote ? (
          <>
            {/* Header/Controls */}
            <div className="border-b p-4 flex items-center justify-between bg-gray-50 flex-wrap gap-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={goBackToNotes}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm transition shadow-sm font-semibold md:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Notes
                </button>

                {isEditing ? (
                  <button
                    onClick={saveNote}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(selectedNote)}
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-xl text-sm transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-1 border border-gray-300 p-1 rounded-xl bg-white shadow-inner">
                  {['bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-pink-100', 'bg-purple-100'].map(color => (
                    <button
                      key={color}
                      onClick={() => changeColor(selectedNote.id, color)}
                      className={`w-6 h-6 rounded-lg ${color} border border-gray-400 hover:scale-110 transition duration-150 ease-in-out ${
                        selectedNote.color === color ? 'ring-2 ring-offset-2 ring-gray-900 shadow-md' : ''
                      }`}
                      aria-label={`Change note color to ${color.split('-')[1]}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition duration-150"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Note Content/Editor Area with fixed scrolling and padding */}
            {/* Added pb-32 (padding-bottom 8rem) to ensure the bottom content is not cut off */}
            <div className={`flex-1 overflow-y-auto p-8 ${selectedNote.color} pb-32`}> 
              {isEditing ? (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-3xl font-extrabold text-gray-900 bg-transparent outline-none border-b-2 border-gray-300 focus:border-blue-600 pb-2 transition"
                    placeholder="Note title"
                    autoFocus
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    // Added h-full and min-h-[50vh] to ensure the content expands and scrolling works
                    className="w-full h-full min-h-[50vh] text-lg text-gray-800 bg-transparent outline-none resize-none leading-relaxed"
                    placeholder="Start typing your note..."
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{selectedNote.title || "Untitled Note"}</h2>
                  <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
                  <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                    <p>Created: {selectedNote.createdAt.toLocaleString()}</p>
                    <p>Last Modified: {selectedNote.updatedAt.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Added a floating '+' button for mobile accessibility */}
            <div className="md:hidden fixed bottom-6 right-6">
              <button
                onClick={createNote}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition duration-150 ease-in-out"
                aria-label="Create new note"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500 p-8">
              <p className="text-xl font-semibold">👋 Welcome to your Notes App</p>
              <p className="text-md mt-2">
                {showSidebar 
                  ? "Select a note from the list or click + to create a new one."
                  : "Click the 'Notes' back button to see your list."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}