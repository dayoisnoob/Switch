// ─── YOUR JOB ────────────────────────────────────────────────────────────────
// These types mirror your backend exactly. Fill them in from your Drizzle
// schema — you already know these shapes better than anyone.
// Keep them here. Every component imports from this file, never from the API.
// ─────────────────────────────────────────────────────────────────────────────

export type PriorityEnum = "none" | "low" | "medium" | "high" | "urgent";
export type WorkspaceRole = "owner" | "admin" | "member";

export interface Attachment {
  id: string;
  cardId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "card_assigned" | "card_due_soon" | "comment_added" | "mentioned";
  title: string;
  body: string;
  entityId: string | null;
  entityType: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── API response wrapper (matches your ApiResponse class) ───────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  status?: string;
}
