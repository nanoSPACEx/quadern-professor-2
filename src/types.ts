export type TaskType = 'exam' | 'treball' | 'opcional';
export type Term = 1 | 2 | 3;

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  weight: number;
  term: Term;
}

export interface Student {
  id: string;
  name: string;
  grades: Record<string, number | null>; // taskId -> grade
}

export interface Group {
  id: string;
  name: string;
  year: string;
  tasks: Task[];
  students: Student[];
}
