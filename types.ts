export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'Admin' | 'Editor' | 'Visualizador';
}

// === KANBAN BOARD & TASKS ===
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate: string;
  column_id?: string;
  tags?: string[];
  assignee?: User;
  commentsCount?: number;
  attachmentsCount?: number;
  subtasks?: { total: number; completed: number };
  created_at?: string;
}

// === RECURRING TRANSACTIONS (Novo) ===
export interface RecurringTransaction {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number; // 1-31
  dayOfWeek?: number; // 0-6
  method: PaymentMethod;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
  nextDueDate: string;
  lastGeneratedDate?: string;
  autoGenerate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// === PROJECT MODULE ===
export type ProjectStatus = 'Em andamento' | 'Pausado' | 'Finalizado';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: User;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  serviceType: string;
  status: ProjectStatus;
  value: number;
  startDate: string;
  deadline: string;
  progress: number;
  subtasks: Subtask[];
  description?: string;
  category: string;
  members: User[];
  attachments?: string[];
  created_at?: string;
}

// === LEADS / CRM MODULE ===
export type LeadStatus = 'Novo' | 'Qualificado' | 'Proposta Enviada' | 'Negociação' | 'Fechado' | 'Perdido';
export type LeadWarmth = 'Frio' | 'Morno' | 'Quente';
export type LeadOrigin = 'Instagram' | 'Tráfego Pago' | 'Indicação' | 'Orgânico' | 'Parceria' | 'Outro';

export interface Lead {
  id: string;
  clientName: string;
  companyName?: string;
  phone: string;
  email?: string;
  website?: string;
  origin: LeadOrigin;
  serviceInterest: string;
  status: LeadStatus;
  warmth: LeadWarmth;
  value: number;
  dateAdded: string;
  nextActionDate?: string;
  nextActionDescription?: string;
  notes?: string;
  lastStatusUpdate?: string;
  attachments?: string[];
}

// === FINANCIAL MODULE ===
export type PaymentStatus = 'Em dia' | 'A vencer' | 'Atrasado' | 'Pago';
export type PaymentMethod = 'PIX' | 'Cartão' | 'Recorrência' | 'Boleto';

export interface Transaction {
  id: string;
  clientId?: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  created_at?: string;
}

export type ViewState = 'dashboard' | 'projects' | 'leads' | 'tasks' | 'financial' | 'settings';
