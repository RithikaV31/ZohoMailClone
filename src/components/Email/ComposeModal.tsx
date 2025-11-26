import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, Paperclip } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    id: string;
    subject: string;
    from_email: string;
    from_name: string;
  } | null;
  onSend: (data: { 
    to: string; 
    cc: string; 
    bcc: string; 
    subject: string; 
    body: string;
    attachments?: File[];
  }) => void;
}

export default function ComposeModal({ isOpen, onClose, replyTo, onSend }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.from_email);
      setSubject(replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`);
    } else {
      setTo('');
      setSubject('');
      setCc('');
      setBcc('');
      setBody('');
      setAttachments([]);
    }
  }, [replyTo, isOpen]);

  const handleSend = () => {
    if (!to || !subject) return;

    onSend({ to, cc, bcc, subject, body, attachments });

    // reset fields
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setAttachments([]);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isMinimized ? 'bottom-0 right-4' : 'inset-0'} z-50 flex items-end justify-end sm:p-4`}>
      {!isMinimized && (
        <div
          className="absolute inset-0 bg-black/20 hidden sm:block"
          onClick={onClose}
        />
      )}

      <div className={`
        bg-white shadow-2xl flex flex-col relative
        ${isMinimized ? 'w-80 rounded-t-lg' : 'w-full h-full sm:max-w-3xl sm:h-[600px] sm:rounded-lg'}
      `}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b rounded-t-lg">
          <h3 className="font-semibold text-gray-800">
            {replyTo ? 'Reply' : 'New Message'}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY */}
        {!isMinimized && (
          <>
            {/* INPUTS */}
            <div className="p-4 space-y-3 border-b">

              {/* TO */}
              <div className="flex items-center gap-2">
                <label className="w-12 text-gray-600">To</label>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1 outline-none text-sm"
                  placeholder="Recipients"
                />
                <button className="text-xs text-blue-600" onClick={() => setShowCC(!showCC)}>Cc</button>
                <button className="text-xs text-blue-600" onClick={() => setShowBCC(!showBCC)}>Bcc</button>
              </div>

              {showCC && (
                <div className="flex items-center gap-2">
                  <label className="w-12 text-gray-600">Cc</label>
                  <input
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="CC"
                  />
                </div>
              )}

              {showBCC && (
                <div className="flex items-center gap-2">
                  <label className="w-12 text-gray-600">Bcc</label>
                  <input
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="BCC"
                  />
                </div>
              )}

              {/* SUBJECT */}
              <div className="flex items-center gap-2">
                <label className="w-12 text-gray-600">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 outline-none text-sm"
                  placeholder="Subject"
                />
              </div>
            </div>

            {/* TEXTAREA */}
            <div className="flex-1 p-4">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full text-sm outline-none resize-none"
                placeholder="Message..."
              />
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">

              {/* FILE INPUT (HIDDEN) */}
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(Array.from(e.target.files));
                  }
                }}
              />

              {/* ATTACHMENT BUTTON */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                {attachments.length > 0 && (
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {attachments.length === 1 
                      ? attachments[0].name 
                      : `${attachments.length} files selected`}
                  </span>
                )}
              </div>

              {/* SEND BUTTON */}
              <button
                onClick={handleSend}
                disabled={!to || !subject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 inline-block mr-2" />
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
