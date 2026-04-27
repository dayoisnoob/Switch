// ─── YOUR JOB ────────────────────────────────────────────────────────────────
// These types mirror your backend exactly. Fill them in from your Drizzle
// schema — you already know these shapes better than anyone.
// Keep them here. Every component imports from this file, never from the API.
// ─────────────────────────────────────────────────────────────────────────────

export type PriorityEnum = "none" | "low" | "medium" | "high" | "urgent";
export type WorkspaceRole = "owner" | "admin" | "member";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  isActive: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  cards: Card[];
}

export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string | null;
  priority: PriorityEnum;
  dueDate: string | null;
  coverImageUrl: string | null;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignees: CardAssignee[];
  labels: CardLabel[];
}

export interface CardAssignee {
  id: string;
  cardId: string;
  userId: string;
  user: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

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
