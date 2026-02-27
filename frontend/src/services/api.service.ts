import api from '../lib/api';
import type {
  LoginResponse,
  User,
  Project,
  Task,
  TaskActivity,
  DashboardSummary,
  CreateUserDto,
  CreateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  ListTasksQuery,
} from '../types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users');
  return data;
};

export const createUser = async (dto: CreateUserDto): Promise<User> => {
  const { data } = await api.post('/users', dto);
  return data;
};

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get('/projects');
  return data;
};

export const createProject = async (dto: CreateProjectDto): Promise<Project> => {
  const { data } = await api.post('/projects', dto);
  return data;
};

export const getTasks = async (query?: ListTasksQuery): Promise<Task[]> => {
  const { data } = await api.get('/tasks', { params: query });
  return data;
};

export const createTask = async (dto: CreateTaskDto): Promise<Task> => {
  const { data } = await api.post('/tasks', dto);
  return data;
};

export const updateTask = async (id: number, dto: UpdateTaskDto): Promise<Task> => {
  const { data } = await api.patch(`/tasks/${id}`, dto);
  return data;
};

export const getTaskActivity = async (taskId: number): Promise<TaskActivity[]> => {
  const { data } = await api.get(`/tasks/${taskId}/activity`);
  return data;
};

export const getDashboard = async (): Promise<DashboardSummary> => {
  const { data } = await api.get('/dashboard');
  return data;
};
