import { StatusType } from "@/services/card.service";

export interface BoardLabel {
  id: string;
  name: string;
  colour: string;
}

export interface BoardAssignee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface BoardCard {
  id: string;
  title: string;
  description: string;
  priority: "none" | "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  creator: CardCreator;
  assignees: BoardAssignee[];
  labels: BoardLabel[];
  commentCount: number;
  activityCount: number;
}

export interface CardCreator {
  id: string;
  firstName: string;
  lastName: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  mappedStatus: StatusType;
  cards: BoardCard[];
}

export interface BoardState {
  id: string;
  projectId: string;
  columns: BoardColumn[];
}
