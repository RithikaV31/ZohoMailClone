import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, User, ChevronLeft, Briefcase } from 'lucide-react';

// Define the Contact interface
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  notes?: string;
}

// Global persistence key using app ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const STORAGE_KEY = `contacts_app::${appId}`;

// Utility to generate unique ID
const genId = () =>
  typeof crypto !== 'undefined' && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Date.now().toString();

export default function ContactsApp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    notes: '',
  });

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        const initialContacts: Contact[] = [
          {
            id: genId(),
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 8900',
            company: 'Tech Corp',
            location: 'New York, USA',
            notes: 'Follow up on Q4 report.',
          },
          {
            id: genId(),
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            phone: '+1 234 567 8901',
            company: 'Design Studio',
            location: 'San Francisco, USA',
          },
        ];
        setContacts(initialContacts);
      }
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }, []);

  // Save data when changed
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts]);

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({ name: '', email: '', phone: '', company: '', location: '', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;

    const sanitizedData: Partial<Contact> = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== undefined && value !== '')
    );

    if (editingContact) {
      const updated = { ...editingContact, ...sanitizedData };
      setContacts((prev) => prev.map((c) => (c.id === editingContact.id ? updated : c)));
      if (selectedContact?.id === editingContact.id) setSelectedContact(updated);
    } else {
      const newContact: Contact = { id: genId(), ...sanitizedData } as Contact;
      setContacts([newContact, ...contacts]);
      setSelectedContact(newContact);
    }

    setShowModal(false);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  };

  const filteredContacts = contacts
    .filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const ModalInput = ({
    label,
    type = 'text',
    value,
    onChange,
    required = false,
    icon: Icon,
    placeholder,
  }: {
    label: string;
    type?: string;
    value: string | undefined;
    onChange: (value: string) => void;
    required?: boolean;
    icon: React.ElementType;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row min-h-0 bg-gray-50">

      {/* Sidebar */}
      <div
        className={`w-full md:w-80 border-r flex flex-col bg-white flex-shrink-0 shadow-md md:shadow-none ${
          selectedContact ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Contacts ({contacts.length})</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
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
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto touch-pan-y min-h-0">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{contact.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                  {contact.company && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3" /> {contact.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Panel */}
      <div
        className={`flex-1 flex flex-col min-h-0 bg-gray-50 ${
          !selectedContact ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Contact Details</h2>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(selectedContact)}
                  className="text-sm flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => deleteContact(selectedContact.id)}
                  className="text-sm p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto touch-pan-y p-6 w-full min-h-0">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center font-bold">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold">{selectedContact.name}</h3>
                    {selectedContact.company && (
                      <p className="text-lg text-gray-600">{selectedContact.company}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-words">{selectedContact.email}</p>
                      </div>
                    </div>

                    {selectedContact.phone && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedContact.phone}</p>
                        </div>
                      </div>
                    )}

                    {selectedContact.location && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{selectedContact.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedContact.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-lg font-semibold mb-2">Notes</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{selectedContact.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold">Select a contact to view details</p>
              <p className="text-md mt-2">
                Or click the <Plus className="w-4 h-4 inline-block text-blue-500" /> button to create a new one.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 border-b pb-2">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <ModalInput
                label="Name"
                required
                value={formData.name}
                icon={User}
                onChange={(v) => setFormData({ ...formData, name: v })}
                placeholder="Full Name"
              />

              <ModalInput
                label="Email"
                type="email"
                required
                value={formData.email}
                icon={Mail}
                onChange={(v) => setFormData({ ...formData, email: v })}
                placeholder="email@example.com"
              />

              <ModalInput
                label="Phone"
                type="tel"
                value={formData.phone}
                icon={Phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
                placeholder="(123) 456-7890"
              />

              <ModalInput
                label="Company"
                value={formData.company}
                icon={Briefcase}
                onChange={(v) => setFormData({ ...formData, company: v })}
                placeholder="Company Name"
              />

              <ModalInput
                label="Location"
                value={formData.location}
                icon={MapPin}
                onChange={(v) => setFormData({ ...formData, location: v })}
                placeholder="City, Country"
              />

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.email}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1"
              >
                {editingContact ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingContact ? 'Save Changes' : 'Add Contact'}
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
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
