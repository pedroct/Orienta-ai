
export interface Topic {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface Discipline {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
}

export interface StudyLog {
  id: string;
  date: number;
  category: string;
  disciplineId: string;
  topicId: string;
  duration: string; // HH:MM:SS
  material: string;
  isTheoryFinished: boolean;
  countInPlanning: boolean;
  scheduleRevision: boolean;
  questions: { correct: number; wrong: number };
  pages: { start: number; end: number };
  video: { title: string; start: string; end: string };
  comments: string;
}

export interface StudyPlan {
  id: string;
  name: string;
  observation?: string;
  imageUrl?: string;
  editais?: string;
  cargos?: string;
  isGeneral: boolean;
  disciplines: Discipline[];
  logs: StudyLog[];
  createdAt: number;
}

export type View = 'dashboard' | 'plan-details';
