export type TaskType = 'exam' | 'treball' | 'opcional';
export type TermName = '1r Trimestre' | '2n Trimestre' | '3r Trimestre';
export type Term = TermName;

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
