import api from '../lib/api';
import type {
  Comment,
  CreateCommentDto,
  LoginResponse,
  User,
  Project,
  Task,
  TaskActivity,
  Tag,
  DashboardSummary,
  CreateTagDto,
  CreateUserDto,
  CreateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  ListTasksQuery,
} from '../types';

const get = async <T>(url: string, config?: { params?: unknown }): Promise<T> => {
  const { data } = await api.get<T>(url, config);
  return data;
};

const post = async <T, B>(url: string, body?: B): Promise<T> => {
  const { data } = await api.post<T>(url, body);
  return data;
};

const patch = async <T, B>(url: string, body: B): Promise<T> => {
  const { data } = await api.patch<T>(url, body);
  return data;
};

const del = async <T>(url: string): Promise<T> => {
  const { data } = await api.delete<T>(url);
  return data;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return post<LoginResponse, { email: string; password: string }>('/auth/login', {
    email,
    password,
  });
};

export const getMe = async (): Promise<User> => {
  return get<User>('/auth/me');
};

export const getUsers = async (): Promise<User[]> => {
  return get<User[]>('/users');
};

export const createUser = async (dto: CreateUserDto): Promise<User> => {
  return post<User, CreateUserDto>('/users', dto);
};

export const deleteUser = async (id: number): Promise<{ id: number }> => {
  return del<{ id: number }>(`/users/${id}`);
};

export const getProjects = async (): Promise<Project[]> => {
  return get<Project[]>('/projects');
};

export const createProject = async (dto: CreateProjectDto): Promise<Project> => {
  return post<Project, CreateProjectDto>('/projects', dto);
};

export const deleteProject = async (id: number): Promise<{ id: number }> => {
  return del<{ id: number }>(`/projects/${id}`);
};

export const getTasks = async (query?: ListTasksQuery): Promise<Task[]> => {
  return get<Task[]>('/tasks', { params: query });
};

export const createTask = async (dto: CreateTaskDto): Promise<Task> => {
  return post<Task, CreateTaskDto>('/tasks', dto);
};

export const updateTask = async (id: number, dto: UpdateTaskDto): Promise<Task> => {
  return patch<Task, UpdateTaskDto>(`/tasks/${id}`, dto);
};

export const deleteTask = async (id: number): Promise<{ id: number }> => {
  return del<{ id: number }>(`/tasks/${id}`);
};

export const getTaskActivity = async (taskId: number): Promise<TaskActivity[]> => {
  return get<TaskActivity[]>(`/tasks/${taskId}/activity`);
};

export const getTaskComments = async (taskId: number): Promise<Comment[]> => {
  return get<Comment[]>(`/tasks/${taskId}/comments`);
};

export const createTaskComment = async (
  taskId: number,
  dto: CreateCommentDto,
): Promise<Comment> => {
  return post<Comment, CreateCommentDto>(`/tasks/${taskId}/comments`, dto);
};

export const getTags = async (): Promise<Tag[]> => {
  return get<Tag[]>('/tags');
};

export const createTag = async (dto: CreateTagDto): Promise<Tag> => {
  return post<Tag, CreateTagDto>('/tags', dto);
};

export const getDashboard = async (): Promise<DashboardSummary> => {
  return get<DashboardSummary>('/dashboard');
};
