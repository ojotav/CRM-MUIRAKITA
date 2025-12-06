import { Lead, Project, User, Transaction, Task } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'ADMIN',
  avatar: 'https://picsum.photos/100/100',
  role: 'Admin',
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Sara Costa', avatar: 'https://picsum.photos/101/101', role: 'Editor' },
  { id: 'u3', name: 'Miguel Rocha', avatar: 'https://picsum.photos/102/102', role: 'Visualizador' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Bot de Agendamento',
    description: 'Automação para clínica odontológica via WhatsApp.',
    category: 'Automação',
    status: 'Em andamento',
    progress: 65,
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    deadline: '2023-12-31',
    clientName: 'Dra. Ana Cláudia',
    serviceType: 'Chatbot WhatsApp',
    value: 4500,
    startDate: '2023-09-01',
    subtasks: [
      { id: 's1', title: 'Fluxo de Boas vindas', completed: true, assignee: MOCK_USERS[0] },
      { id: 's2', title: 'Integração Calendar', completed: false, assignee: MOCK_USERS[1] },
    ],
    attachments: [],
  },
  {
    id: 'p2',
    name: 'Dashboards PowerBI',
    description: 'Visualização de dados de vendas.',
    category: 'Dados',
    status: 'Finalizado',
    progress: 100,
    members: [MOCK_USERS[1]],
    deadline: '2023-10-30',
    clientName: 'Varejo Express',
    serviceType: 'BI & Analytics',
    value: 8000,
    startDate: '2023-10-01',
    subtasks: [],
    attachments: [],
  },
  {
    id: 'p3',
    name: 'Integração CRM',
    description: 'Conectar RD Station com Pipedrive via Make.',
    category: 'Integração',
    status: 'Pausado',
    progress: 30,
    members: [MOCK_USERS[0]],
    deadline: '2024-01-15',
    clientName: 'Startup Flow',
    serviceType: 'Make.com',
    value: 2500,
    startDate: '2023-11-01',
    subtasks: [],
    attachments: [],
  },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    clientName: 'João Silva',
    companyName: 'Acme Corp',
    phone: '(11) 99123-4567',
    email: 'joao@acme.com',
    status: 'Novo',
    value: 15000,
    dateAdded: '2023-11-01',
    origin: 'Tráfego Pago',
    serviceInterest: 'Automação Completa',
    warmth: 'Morno',
    nextActionDate: '2023-11-05',
    nextActionDescription: 'Ligar para qualificar',
    notes: '',
    attachments: [],
  },
  {
    id: 'l2',
    clientName: 'Mariana Souza',
    companyName: 'TechFlow',
    phone: '(21) 99876-5432',
    email: 'mariana@techflow.io',
    status: 'Qualificado',
    value: 5000,
    dateAdded: '2023-10-28',
    origin: 'Indicação',
    serviceInterest: 'Chatbot Simples',
    warmth: 'Quente',
    nextActionDate: '2023-11-03',
    nextActionDescription: 'Enviar proposta comercial',
    notes: '',
    attachments: [],
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    clientId: 'p1',
    clientName: 'Dra. Ana Cláudia',
    description: 'Entrada Projeto Bot',
    amount: 2250,
    dueDate: '2023-11-01',
    status: 'Pago',
    method: 'PIX',
    paidDate: '2023-11-01',
  },
  {
    id: 't2',
    clientId: 'p3',
    clientName: 'Startup Flow',
    description: 'Pagamento Único',
    amount: 2500,
    dueDate: '2023-11-15',
    status: 'A vencer',
    method: 'Boleto',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'tk1',
    title: 'Reunião de Alinhamento com Ana',
    description: 'Alinhar escopo do projeto',
    priority: 'Alta',
    dueDate: '2023-11-10',
    tags: ['Reunião', 'Importante'],
  },
  {
    id: 'tk2',
    title: 'Cobrar fatura Varejo Express',
    description: 'Fatura referente ao projeto PowerBI',
    priority: 'Média',
    dueDate: '2023-11-02',
    tags: ['Cobrança'],
  },
];
