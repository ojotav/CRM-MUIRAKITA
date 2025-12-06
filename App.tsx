import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardHome from './components/DashboardHome';
import LeadsKanban from './components/LeadsKanban';
import ProjectsKanban from './components/ProjectsKanban';
import FinancialModule from './components/FinancialModule';
import TasksModule from './components/TasksModule';
import { ViewState, Project, Lead, Transaction, Task } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data inicial
  useEffect(() => {
    fetchData();
    const unsubscribe = setupRealtimeListeners();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('dateAdded', { ascending: false });
      if (leadsError) console.error('Erro ao carregar leads:', leadsError);
      if (leadsData) setLeads(leadsData as Lead[]);

      // Projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (projectsError) console.error('Erro ao carregar projetos:', projectsError);
      if (projectsData) setProjects(projectsData as Project[]);

      // Transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .order('dueDate', { ascending: true });
      if (transError) console.error('Erro ao carregar transações:', transError);
      if (transData) setTransactions(transData as Transaction[]);

      // Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('dueDate', { ascending: true });
      if (tasksError) console.error('Erro ao carregar tarefas:', tasksError);
      if (tasksData) setTasks(tasksData as Task[]);
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time listeners
  const setupRealtimeListeners = () => {
    // Leads listener
    const leadsChannel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => {
          console.log('Leads atualizado');
          fetchData();
        }
      )
      .subscribe();

    // Projects listener
    const projectsChannel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          console.log('Projetos atualizado');
          fetchData();
        }
      )
      .subscribe();

    // Transactions listener
    const transactionsChannel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          console.log('Transações atualizado');
          fetchData();
        }
      )
      .subscribe();

    // Tasks listener
    const tasksChannel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          console.log('Tarefas atualizado');
          fetchData();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(tasksChannel);
    };
  };

  const formatError = (error: any): string => {
    if (!error) return 'Erro desconhecido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.details) return error.details;
    return JSON.stringify(error);
  };

  const sanitizePayload = (obj: any) => {
    const newObj = { ...obj };
    // Remove campos vazios que podem causar problemas
    if (newObj.attachments && newObj.attachments.length === 0) {
      delete newObj.attachments;
    }
    return newObj;
  };

  // === HANDLERS ===

  const handleAddProject = async (p: Omit<Project, 'id'>) => {
    try {
      const payload = sanitizePayload({
        ...p,
        created_at: new Date().toISOString(),
        value: Number(p.value), // Garantir que é número
        progress: Number(p.progress || 0), // Garantir que é número
      });

      const { data, error } = await supabase
        .from('projects')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) {
        setProjects((prev) => [data[0] as Project, ...prev]);
        alert('✅ Projeto criado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      alert(`❌ Erro ao adicionar projeto: ${formatError(error)}`);
    }
  };

  const handleUpdateProject = async (updated: Project) => {
    try {
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      const payload = sanitizePayload({
        ...updated,
        value: Number(updated.value),
        progress: Number(updated.progress),
      });

      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', updated.id);

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        alert(`❌ Erro ao atualizar: ${formatError(error)}`);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar projeto:', error);
      alert(`❌ Erro ao atualizar: ${formatError(error)}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Projeto deletado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar projeto:', error);
      alert(`❌ Erro ao excluir: ${formatError(error)}`);
    }
  };

  const handleAddLead = async (l: Omit<Lead, 'id'>) => {
    try {
      const payload = sanitizePayload({
        ...l,
        dateAdded: new Date().toISOString(),
        value: Number(l.value), // Garantir que é número
      });

      const { data, error } = await supabase
        .from('leads')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) {
        setLeads((prev) => [data[0] as Lead, ...prev]);
        alert('✅ Lead criado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar lead:', error);
      alert(`❌ Erro ao salvar lead: ${formatError(error)}`);
    }
  };

  const handleUpdateLead = async (updated: Lead) => {
    try {
      setLeads((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );

      const payload = sanitizePayload({
        ...updated,
        value: Number(updated.value),
      });

      const { error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', updated.id);

      if (error) {
        console.error('Erro ao atualizar lead:', error);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Lead deletado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar lead:', error);
    }
  };

  const handleConvertToProject = async (lead: Lead) => {
    try {
      const newProject: Omit<Project, 'id'> = {
        name: `Projeto: ${lead.clientName}`,
        clientName: lead.clientName,
        description: `Projeto originado do lead. Serviço: ${lead.serviceInterest}. Origem: ${lead.origin}`,
        category: 'Automação',
        serviceType: lead.serviceInterest || 'Outros',
        status: 'Em andamento',
        progress: 0,
        value: lead.value,
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        members: [],
        subtasks: [],
        attachments: lead.attachments || [],
      };

      await handleAddProject(newProject);
      await handleUpdateLead({ ...lead, status: 'Fechado' });
      alert(`✅ Lead ${lead.clientName} convertido com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao converter lead:', error);
      alert(`❌ Erro ao converter lead: ${formatError(error)}`);
    }
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      // Remove campos que não existem na tabela
      const payload = sanitizePayload({
        ...t,
        created_at: new Date().toISOString(), // Nome CORRETO da coluna no Supabase
        amount: Number(t.amount), // Garantir que é número
      });

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) {
        setTransactions((prev) => [...prev, data[0] as Transaction]);
        alert('✅ Transação criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      alert(`❌ Erro ao adicionar transação: ${formatError(error)}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Transação deletada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar transação:', error);
      alert(`❌ Erro ao deletar: ${formatError(error)}`);
    }
  };

  const handleUpdateTransaction = async (
    id: string,
    updates: Partial<Transaction>
  ) => {
    try {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      const payload = {
        ...updates,
        amount: updates.amount ? Number(updates.amount) : undefined,
      };

      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      alert(`❌ Erro ao atualizar: ${formatError(error)}`);
    }
  };

  const handleAddTask = async (t: Omit<Task, 'id'>) => {
    try {
      const payload = sanitizePayload({
        ...t,
        created_at: new Date().toISOString(),
        // A tabela tasks NÃO tem 'completed', usar 'column_id' ou outro campo
        // Se precisar de um status, ajuste aqui
      });

      // Remove campos que não existem na tabela tasks
      delete (payload as any).completed;
      delete (payload as any).type;

      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) {
        setTasks((prev) => [...prev, data[0] as Task]);
        alert('✅ Tarefa criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      alert(`❌ Erro ao adicionar tarefa: ${formatError(error)}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Tarefa deletada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const renderView = () => {
    if (loading)
      return (
        <div className="h-full flex items-center justify-center text-neon-blue gap-2">
          <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          Carregando sistema...
        </div>
      );

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardHome
            projects={projects}
            leads={leads}
            transactions={transactions}
          />
        );
      case 'projects':
        return (
          <ProjectsKanban
            projects={projects}
            leads={leads}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'leads':
        return (
          <LeadsKanban
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onConvertToProject={handleConvertToProject}
          />
        );
      case 'financial':
        return (
          <FinancialModule
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
          />
        );
      case 'tasks':
        return (
          <TasksModule
            tasks={tasks}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Em desenvolvimento
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-charcoal-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        setView={setView}
        collapsed={sidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar onMobileMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-hidden relative">{renderView()}</main>
      </div>
    </div>
  );
};

export default App;
