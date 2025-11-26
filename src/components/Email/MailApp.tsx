// MailApp.tsx (Full Corrected Code with Working Send)

import { useState, useEffect } from 'react';
import LeftAppSidebar from './LeftAppSidebar';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import ComposeModal from './ComposeModal';
import RightActionSidebar from './RightActionSidebar';
import CalendarApp from '../Calendar/CalendarApp';
import TodoApp from '../Todo/TodoApp';
import NotesApp from '../Notes/NotesApp';
import ContactsApp from '../Contacts/ContactsApp';
import BookmarksApp from '../Bookmarks/BookmarksApp';
import MobileFolderMenu from './MobileFolderMenu';
import { sampleEmails } from '../../lib/mockData';

interface Email {
  id: string;
  from_email: string;
  from_name: string;
  to_emails: Array<{ email: string; name: string }>;
  cc_emails: Array<{ email: string; name: string }>;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  sent_at: string;
  created_at: string;
  folder_id: string;
}

interface SentEmailData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

export default function MailApp() {
  const [activeApp, setActiveApp] = useState('mail');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderType, setSelectedFolderType] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    subject: string;
    from_email: string;
    from_name: string;
  } | null>(null);
  const [allEmails, setAllEmails] = useState<Email[]>([]);

  const currentUser = { name: "John Doe", email: "john.doe@example.com" };

  // Folder Select
  const handleFolderSelect = (folderId: string, folderType: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderType(folderType);
    setSelectedEmail(null);
  };

  // Select Email
  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  // Compose New
  const handleCompose = () => {
    setReplyTo(null);
    setIsComposeOpen(true);
  };

  // Reply
  const handleReply = (email: Email) => {
    setReplyTo({
      id: email.id,
      subject: email.subject,
      from_email: email.from_email,
      from_name: email.from_name,
    });
    setIsComposeOpen(true);
  };

  const handleBack = () => {
    setSelectedEmail(null);
  };

  // SEND EMAIL (WORKING)
  const handleSendEmail = (data: SentEmailData) => {
    const sentFolderId = '2';

    const newEmail: Email = {
      id: Date.now().toString(),
      from_email: currentUser.email,
      from_name: currentUser.name,
      to_emails: data.to.split(',').map(e => ({ email: e.trim(), name: e.trim() })),
      cc_emails: data.cc ? data.cc.split(',').map(e => ({ email: e.trim(), name: e.trim() })) : [],
      subject: data.subject,
      body: data.body,
      is_read: true,
      is_starred: false,
      has_attachments: false,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      folder_id: sentFolderId,
    };

    setAllEmails(prev => [newEmail, ...prev]);

    // Automatically switch to Sent folder
    handleFolderSelect(sentFolderId, "sent");
  };

  useEffect(() => {
    setAllEmails([...sampleEmails] as Email[]);
    setSelectedFolderId("1");
    setSelectedFolderType("inbox");
  }, []);

  const handleDeleteEmail = (id: string) => {
    setAllEmails(prev =>
      prev.map(e => (e.id === id ? { ...e, folder_id: '5' } : e))
    );
    setSelectedEmail(null);
  };

  const handleMoveEmail = (id: string, folderId: string) => {
    setAllEmails(prev =>
      prev.map(e => (e.id === id ? { ...e, folder_id: folderId } : e))
    );
  };

  // Main Renderer
  const renderContent = () => {
    switch (activeApp) {
      case 'calendar':
        return <CalendarApp />;
      case 'todo':
        return <TodoApp />;
      case 'notes':
        return <NotesApp />;
      case 'contacts':
        return <ContactsApp />;
      case 'bookmarks':
        return <BookmarksApp />;
      case 'mail':
      default:
        return selectedEmail ? (
          <EmailDetail
            email={selectedEmail}
            onBack={handleBack}
            onReply={handleReply}
            onDelete={handleDeleteEmail}
            onMove={handleMoveEmail}
          />
        ) : (
          <EmailList
            folderId={selectedFolderId}
            folderType={selectedFolderType}
            onEmailSelect={handleEmailSelect}
            selectedEmailId={selectedEmail?.id || null}
            emails={allEmails}
            onDelete={handleDeleteEmail}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftAppSidebar activeApp={activeApp} onAppChange={setActiveApp} />

      <div className="flex-1 flex bg-gray-50 pt-14 sm:pt-0 overflow-hidden">
        {activeApp === 'mail' ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="hidden md:flex w-56 flex-shrink-0">
              <Sidebar
                onFolderSelect={handleFolderSelect}
                onCompose={handleCompose}
                selectedFolderId={selectedFolderId}
                allEmails={allEmails}
              />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedEmail && (
                <MobileFolderMenu
                  currentFolderId={selectedFolderId}
                  onFolderSelect={handleFolderSelect}
                  onCompose={handleCompose}
                />
              )}

              <div className="flex-1 overflow-y-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderContent()}
          </div>
        )}

        <RightActionSidebar />
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyTo(null);
        }}
        replyTo={replyTo}
        onSend={handleSendEmail}   // FIXED: No JSX comment inside prop
      />
    </div>
  );
}
