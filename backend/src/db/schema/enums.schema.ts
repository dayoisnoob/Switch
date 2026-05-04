import { pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'CANCELED',
]);
export const priorityEnum = pgEnum('priority', [
  'none',
  'low',
  'medium',
  'high',
  'urgent',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'card_assigned',
  'card_unassigned',
  'card_due_soon',
  'comment_added',
  'mentioned',
]);

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'email_verification',
  'password_reset',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'Active',
  'Paused',
  'Planning',
  'Completed',
]);

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const workspaceRoleEnum = pgEnum('workspace_role', [
  'Owner',
  'Admin',
  'Member',
]);
