import type { UIMessage } from "ai";

type SessionMeta = {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
};

const SESSIONS_KEY = "ai-chat-sessions";
const MESSAGES_PREFIX = "ai-chat-msg-";

function loadRaw(key: string): unknown {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveRaw(key: string, data: unknown): void {
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadSessions(): SessionMeta[] {
    const sessions = loadRaw(SESSIONS_KEY);
    return Array.isArray(sessions) ? sessions : [];
}

export function saveSessions(sessions: SessionMeta[]): void {
    saveRaw(SESSIONS_KEY, sessions);
}

export function loadMessages(sessionId: string): UIMessage[] {
    const messages = loadRaw(`${MESSAGES_PREFIX}${sessionId}`);
    return Array.isArray(messages) ? messages : [];
}

export function saveMessages(sessionId: string, messages: UIMessage[]): void {
    saveRaw(`${MESSAGES_PREFIX}${sessionId}`, messages);
}

export function deleteSession(sessionId: string): void {
    localStorage.removeItem(`${MESSAGES_PREFIX}${sessionId}`);
    const sessions = loadSessions();
    saveSessions(sessions.filter((s) => s.id !== sessionId));
}

export function createSession(name?: string): SessionMeta {
    const now = Date.now();
    return {
        id: crypto.randomUUID(),
        name: name || "New conversation",
        createdAt: now,
        updatedAt: now,
    };
}

export type { SessionMeta };
