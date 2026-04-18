// types/index.ts

export interface Task {
  id: string;
  title: string;
  order: number;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  tasks: Task[]; // A column contains an array of strict Tasks
}

export interface BoardState {
  id: string;
  name: string;
  columns: Column[]; // A board contains an array of strict Columns
}
