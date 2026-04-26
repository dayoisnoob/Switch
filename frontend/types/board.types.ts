interface BoardLabel {
  id: string;
  name: string;
  color: string;
}

interface BoardAssignee {
  id: string;
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
  coverImageUrl: string | null;
  order: number;
  createdBy: string;
  assignees: BoardAssignee[];
  labels: BoardLabel[];
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  cards: BoardCard[];
}

export interface BoardState {
  id: string;
  projectId: string;
  columns: BoardColumn[];
}
