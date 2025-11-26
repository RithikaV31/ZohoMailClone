import { useEffect, useState } from 'react';
import { ArrowLeft, Reply, Forward, Trash2, Archive, Tag, MoreVertical, Star, Paperclip } from 'lucide-react';

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
}

interface EmailDetailProps {
  email: Email | null;
  onBack: () => void;
  onReply: (email: Email) => void;
  onDelete?: (emailId: string) => void;
  onMove?: (emailId: string, folderId: string) => void;
}

export default function EmailDetail({ email, onBack, onReply, onDelete, onMove }: EmailDetailProps) {
  const [starred, setStarred] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false); // New state for mobile actions

  useEffect(() => {
    if (email) {
      setStarred(email.is_starred);
    }
  }, [email]);

  const toggleStar = () => {
    if (!email) return;
    setStarred(!starred);
  };

  const handleDelete = () => {
    if (!email || !onDelete) return;
    onDelete(email.id);
    onBack();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // Use smaller format for mobile date display
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select an email to read</p>
          <p className="text-gray-400 text-sm mt-2">Choose an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Action Bar: Reduced padding on mobile (p-3 vs px-6 py-4) */}
      <div className="border-b p-3 sm:px-6 sm:py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Back</span>
          </button>

          {/* Action Buttons: Desktop vs Mobile grouping */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            
            {/* Always visible actions */}
            <button
              onClick={toggleStar}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Star"
            >
              <Star
                className={`w-5 h-5 ${
                  starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                }`}
              />
            </button>
            <button
              onClick={() => onReply(email)}
              className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:inline-flex" // Hide on mobile
              title="Reply"
            >
              <Reply className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Forward">
                <Forward className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={handleDelete} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Delete">
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Archive">
                <Archive className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Label">
                <Tag className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Mobile/More Button */}
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="More"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {/* Mobile Dropdown Menu for hidden actions */}
            {showMoreActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    <button onClick={() => onReply(email)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 sm:hidden">
                        <Reply className="w-4 h-4" /> Reply
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Forward className="w-4 h-4" /> Forward
                    </button>
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Archive className="w-4 h-4" /> Archive
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Label
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* Subject Line: Truncate on mobile, bold on desktop */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 truncate">
          {email.subject || '(No subject)'}
        </h1>

        {/* Sender Info: Reduced vertical space and condensed info on mobile */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {email.from_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{email.from_name}</div>
              <div className="text-xs sm:text-sm text-gray-600 truncate">{email.from_email}</div>
              <div className="text-xs text-gray-500 mt-0 sm:mt-1 truncate">
                to {email.to_emails.map(t => t.email).join(', ')}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatDateTime(email.sent_at || email.created_at)}
          </div>
        </div>
      </div>

      {/* Email Body: Standard Padding */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {email.has_attachments && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Paperclip className="w-4 h-4" />
              <span className="font-medium">Attachments</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="px-3 py-2 bg-white border rounded-lg text-sm text-gray-700">
                document.pdf
              </div>
              {/* Add more attachment previews here */}
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
            {email.body}
          </div>
        </div>
      </div>

      {/* Bottom Reply/Forward Bar: Fixed width padding */}
      <div className="border-t p-3 sm:p-4 bg-gray-50 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => onReply(email)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition text-sm">
            <Forward className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}