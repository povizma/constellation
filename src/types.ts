export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  effort: number;          // 1-10, drives node size
  assignee?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Dependency {
  id: string;
  source: string;          // task id that must finish first
  target: string;          // task id that depends on source
}

export interface ProjectState {
  tasks: Record<string, Task>;
  dependencies: Record<string, Dependency>;
}
