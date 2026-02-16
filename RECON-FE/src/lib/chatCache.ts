/**
 * In-memory cache for AI chat. Persists to localStorage so history survives navigation and refresh.
 * Scoped by user id so each user (or guest) has their own history. Cleared on logout.
 * Entries expire after CHAT_CACHE_TTL_MS (default 24h).
 */

const STORAGE_KEY_PREFIX = 'recon_ai_chat';
const CHAT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function storageKey(userId: string | undefined): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : `${STORAGE_KEY_PREFIX}_guest`;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CachedChat {
  messages: ChatMessage[];
  updatedAt: number;
}

function getCached(userId: string | undefined): CachedChat | null {
  try {
    const key = storageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as CachedChat;
    if (!Array.isArray(data.messages)) return null;
    const now = Date.now();
    if (now - data.updatedAt > CHAT_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function getCachedChatMessages(userId?: string): ChatMessage[] {
  const cached = getCached(userId);
  return cached?.messages ?? [];
}

export function setCachedChatMessages(messages: ChatMessage[], userId?: string): void {
  try {
    const key = storageKey(userId);
    if (messages.length === 0) {
      localStorage.removeItem(key);
      return;
    }
    const data: CachedChat = {
      messages,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota / private mode
  }
}

export function clearCachedChat(userId?: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    // ignore
  }
}
