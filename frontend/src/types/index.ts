export type UserRole = 'admin' | 'member';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskActionType = 'status_changed' | 'reassigned' | 'edited';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt: string;
  creator?: User;
  _count?: { tasks: number };
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  assignedTo: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  actionType: TaskActionType;
  oldValue: string | null;
  newValue: string | null;
  changedBy: number;
  timestamp: string;
  changedByUser?: User;
}

export interface DashboardSummary {
  byStatus: { status: TaskStatus; count: number }[];
  byProject: { project_id: number; project_name: string; count: number }[];
  byUser: { user_id: number; user_name: string; count: number }[];
}

export interface LoginResponse {
  access_token: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: number;
  assigned_to: number;
  due_date?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: number;
  assigned_to?: number;
  due_date?: string | null;
}

export interface ListTasksQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: number;
  assigned_to?: number;
  page?: number;
  limit?: number;
}
