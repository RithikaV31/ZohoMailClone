import { useEffect, useState } from 'react';
import { Star, Paperclip, Trash2 } from 'lucide-react';
import { type Email } from '../../lib/mockData';


interface EmailListProps {
  folderId: string | null;
  folderType: string | null;
  onEmailSelect: (email: Email) => void;
  selectedEmailId: string | null;
  emails: Email[];
  onDelete: (emailId: string) => void;
}

export default function EmailList({ folderId, folderType, onEmailSelect, selectedEmailId, emails: allEmails, onDelete }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId) return;

    setLoading(true);
    const filteredEmails = allEmails.filter(email => email.folder_id === folderId);
    setEmails(filteredEmails);
    setLoading(false);
  }, [folderId, allEmails]);

  const toggleStar = (e: React.MouseEvent, emailId: string, currentStarred: boolean) => {
    e.stopPropagation();
    setEmails(emails.map(email =>
      email.id === emailId ? { ...email, is_starred: !currentStarred } : email
    ));
  };

  const markAsRead = (emailId: string) => {
    setEmails(emails.map(email =>
      email.id === emailId ? { ...email, is_read: true } : email
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (body: string) => {
    return body.slice(0, 100) + (body.length > 100 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No emails in this folder</p>
          <p className="text-gray-400 text-sm mt-2">Your {folderType} folder is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="divide-y">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => {
              markAsRead(email.id);
              onEmailSelect(email);
            }}
            // 🔥 Added 'group' class back here for hover effects
            className={`p-4 hover:bg-gray-50 cursor-pointer transition group ${
              selectedEmailId === email.id ? 'bg-blue-50' : ''
            } ${!email.is_read ? 'bg-blue-50/30' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => toggleStar(e, email.id, email.is_starred)}
                className="mt-1 flex-shrink-0" // Added flex-shrink-0
                title="Star"
              >
                <Star
                  className={`w-5 h-5 transition ${
                    email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-gray-900 truncate ${!email.is_read ? 'font-bold' : ''}`}>
                    {email.from_name}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto flex-shrink-0">
                    {formatDate(email.sent_at || email.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  {/* Subject should be truncated on smaller screens */}
                  <h3 className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {email.subject || '(No subject)'}
                  </h3>
                  {email.has_attachments && (
                    <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                {/* Preview text needs truncation to avoid wrapping */}
                <p className="text-sm text-gray-600 truncate">
                  {getPreview(email.body)}
                </p>
              </div>

              {/* Delete button is on the far right and is hidden until hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(email.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}