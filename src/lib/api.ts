const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string | null;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'DELETED';
  startsAt: string;
  endsAt: string;
  uploadPermission: 'PUBLIC' | 'APPROVAL_REQUIRED';
  faceRecognitionEnabled: boolean;
  retentionDays: number;
  organizerId: string;
  createdAt: string;
  qrCodeDataUrl?: string;
}

export interface Photo {
  id: string;
  roomId: string;
  storageKey: string;
  contentType: string;
  status: string;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  uploadedAt: string;
  originalFileName: string | null;
  source: string;
  sizeBytes: number;
}

export interface Face {
  id: string;
  photoId: string;
  faceIndex: number;
  faceThumbKey: string;
  faceThumbUrl: string;
  createdAt: string;
}

export interface JoinRoomResponse {
  guestToken: string;
  sessionId: string;
  room: {
    id: string;
    name: string;
    code: string;
    status: string;
    endsAt: string;
    uploadPermission: string;
    faceRecognitionEnabled: boolean;
  };
}

export interface UploadUrlResponse {
  bucket: string;
  key: string;
  uploadUrl: string;
  expiresInSeconds: number;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    signup: (data: { email: string; password: string; fullName?: string }) =>
      request<{ accessToken: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    signin: (data: { email: string; password: string }) =>
      request<{ accessToken: string; user: User }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ sub: string; email: string }>('/auth/me'),
  },

  rooms: {
    list: () => request<Room[]>('/rooms'),
    get: (id: string) => request<Room>(`/rooms/${id}`),
    create: (data: {
      name: string;
      startsAt: string;
      endsAt: string;
      uploadPermission?: string;
      faceRecognitionEnabled?: boolean;
      retentionDays?: number;
    }) => request<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/rooms/${id}`, { method: 'DELETE' }),
    join: (code: string, data: { displayName?: string }) =>
      request<JoinRoomResponse>(`/rooms/${code}/join`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  photos: {
    uploadUrl: (roomId: string, data: { fileName: string; contentType: string; sizeBytes: number }) =>
      request<UploadUrlResponse>(`/rooms/${roomId}/photos/upload-url`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    complete: (roomId: string, data: {
      bucket: string;
      key: string;
      contentType: string;
      sizeBytes: number;
      originalFileName?: string;
      guestToken?: string;
    }) => request<Photo>(`/rooms/${roomId}/photos/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    list: (roomId: string) => request<Photo[]>(`/rooms/${roomId}/photos`),
  },

  faces: {
    list: (roomId: string) => request<Face[]>(`/rooms/${roomId}/faces`),
    byFace: (roomId: string, faceId: string) =>
      request<Photo[]>(`/rooms/${roomId}/faces/${faceId}/photos`),
    selfieMatch: async (roomId: string, file: File): Promise<Photo[]> => {
      const token = getToken();
      const form = new FormData();
      form.append('selfie', file);
      const res = await fetch(`${BASE_URL}/rooms/${roomId}/faces/selfie-match`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as any;
        throw new Error(err.message ?? 'Selfie match failed');
      }
      return res.json();
    },
  },
};

// ── Guest session helpers ─────────────────────────────────────────────────────

const GUEST_KEY = 'eventsnap_guest_sessions';

interface GuestSession {
  guestToken: string;
  sessionId: string;
  displayName?: string;
  roomName: string;
}

export function saveGuestSession(roomId: string, session: GuestSession) {
  const all = getGuestSessions();
  all[roomId] = session;
  localStorage.setItem(GUEST_KEY, JSON.stringify(all));
}

export function getGuestSession(roomId: string): GuestSession | null {
  return getGuestSessions()[roomId] ?? null;
}

function getGuestSessions(): Record<string, GuestSession> {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? '{}');
  } catch {
    return {};
  }
}
