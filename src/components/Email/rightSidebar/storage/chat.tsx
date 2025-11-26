// storage/chat.ts
import { genId, loadCollection, saveCollection } from './index';

export type Message = { id: string; conversationId: string; from: string; text: string; createdAt: number };
export type Conversation = { id: string; title: string; updatedAt: number };

export const loadConversations = (userId: string): Conversation[] =>
  (loadCollection(userId, 'conversations') as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);

export const loadMessages = (userId: string, conversationId: string): Message[] =>
  (loadCollection(userId, `messages::${conversationId}`) as Message[]) || [];

export const createConversation = (userId: string, title: string) => {
  const convs = loadConversations(userId);
  const c: Conversation = { id: genId(), title, updatedAt: Date.now() };
  saveCollection(userId, 'conversations', [c, ...convs]);
  return c;
};

export const addMessage = (userId: string, conversationId: string, from: string, text: string) => {
  const msg: Message = { id: genId(), conversationId, from, text, createdAt: Date.now() };
  const msgs = loadMessages(userId, conversationId);
  saveCollection(userId, `messages::${conversationId}`, [...msgs, msg]);
  const convs = loadConversations(userId).map(c => (c.id === conversationId ? { ...c, updatedAt: Date.now() } : c));
  saveCollection(userId, 'conversations', convs);
  return msg;
};
