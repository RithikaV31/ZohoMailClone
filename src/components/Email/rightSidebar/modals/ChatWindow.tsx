// modals/ChatWindow.tsx
import React, { useEffect, useState } from 'react';
import { loadConversations, loadMessages, addMessage, createConversation } from '../storage/chat';

export const ChatWindow: React.FC<{ userId: string }> = ({ userId }) => {
  const [convs, setConvs] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => { if (!userId) return; setConvs(loadConversations(userId)); }, [userId]);
  useEffect(() => { if (activeConv && userId) setMsgs(loadMessages(userId, activeConv.id)); }, [activeConv, userId]);

  const startConv = () => { if(!userId) return; const c = createConversation(userId, `Chat ${new Date().toLocaleTimeString()}`); setConvs(prev => [c, ...prev]); setActiveConv(c); };
  const send = () => { if (!activeConv || !text.trim() || !userId) return; addMessage(userId, activeConv.id, 'me', text.trim()); setText(''); setMsgs(loadMessages(userId, activeConv.id)); };

  return (
    <div className="flex gap-3 h-full">
      <div className="w-1/3 p-2 bg-gray-50 rounded flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <strong>Conversations</strong>
          <button onClick={startConv} className="text-sm text-blue-600">New</button>
        </div>
        <div className="space-y-2 overflow-auto">
          {convs.map(c => (
            <div key={c.id} onClick={() => setActiveConv(c)} className={`p-2 rounded cursor-pointer ${activeConv?.id === c.id ? 'bg-white border' : 'hover:bg-white'}`}>
              <div className="font-medium text-sm truncate">{c.title}</div>
              <div className="text-xs text-gray-500">{new Date(c.updatedAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-2 bg-white rounded flex flex-col">
        <div className="flex-1 overflow-auto mb-2">
          {msgs.map(m => (
            <div key={m.id} className="mb-3">
              <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
              <div className={`p-2 rounded inline-block ${m.from === 'me' ? 'bg-blue-50' : 'bg-gray-100'}`}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type message" />
          <button onClick={send} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
};
