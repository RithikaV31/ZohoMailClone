import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, Search } from 'lucide-react';

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
      title: 'Project Ideas',
      content: 'Build a task management app with React and TypeScript',
      color: 'bg-yellow-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Shopping List',
      content: 'Milk, Eggs, Bread, Coffee',
      color: 'bg-green-100',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const startEdit = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    setNotes(notes.map(note =>
      note.id === selectedNote.id
        ? { ...note, title: editTitle, content: editContent, updatedAt: new Date() }
        : note
    ));
    setIsEditing(false);
    setSelectedNote({ ...selectedNote, title: editTitle, content: editContent });
  };

  const changeColor = (noteId: string, color: string) => {
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, color } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, color });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex bg-white">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Notes</h1>
            <button
              onClick={createNote}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedNote?.id === note.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {note.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${note.color} border`} />
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No notes found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={saveNote}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(selectedNote)}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {['bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-pink-100', 'bg-purple-100'].map(color => (
                    <button
                      key={color}
                      onClick={() => changeColor(selectedNote.id, color)}
                      className={`w-6 h-6 rounded ${color} border hover:scale-110 transition ${
                        selectedNote.color === color ? 'ring-2 ring-offset-1 ring-gray-900' : ''
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-gray-900 outline-none border-b-2 border-transparent focus:border-blue-500 pb-2"
                    placeholder="Note title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-96 text-gray-800 outline-none resize-none"
                    placeholder="Start typing your note..."
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedNote.title}</h2>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedNote.content}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a note to view</p>
              <p className="text-sm mt-2">Or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
