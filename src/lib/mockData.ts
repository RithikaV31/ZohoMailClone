export interface Folder {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export interface Email {
  id: string;
  from_email: string;
  from_name: string;
  to_emails: Array<{ email: string; name: string }>;
  cc_emails: Array<{ email: string; name: string }>;
  bcc_emails: Array<{ email: string; name: string }>;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  is_draft: boolean;
  has_attachments: boolean;
  folder_id: string;
  sent_at: string;
  created_at: string;
}

export const defaultFolders: Folder[] = [
  { id: '1', name: 'Inbox', type: 'inbox', icon: 'inbox' },
  { id: '2', name: 'Sent', type: 'sent', icon: 'send' },
  { id: '3', name: 'Drafts', type: 'drafts', icon: 'file-text' },
  { id: '4', name: 'Spam', type: 'spam', icon: 'alert-octagon' },
  { id: '5', name: 'Trash', type: 'trash', icon: 'trash-2' },
];

export const sampleEmails: Email[] = [
  {
    id: '1',
    from_email: 'john@example.com',
    from_name: 'John Doe',
    to_emails: [{ email: 'me@example.com', name: 'Me' }],
    cc_emails: [],
    bcc_emails: [],
    subject: 'Welcome to Thiran360AI Mail',
    body: 'Hello! This is a sample email to help you get started with your new mail application. Feel free to compose new messages and organize your inbox.',
    is_read: false,
    is_starred: false,
    is_draft: false,
    has_attachments: false,
    folder_id: '1',
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    from_email: 'sarah@example.com',
    from_name: 'Sarah Smith',
    to_emails: [{ email: 'me@example.com', name: 'Me' }],
    cc_emails: [],
    bcc_emails: [],
    subject: 'Project Update',
    body: 'Hi there,\n\nI wanted to give you a quick update on the project. Everything is going well and we are on track to meet our deadline.\n\nBest regards,\nSarah',
    is_read: true,
    is_starred: true,
    is_draft: false,
    has_attachments: false,
    folder_id: '1',
    sent_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
