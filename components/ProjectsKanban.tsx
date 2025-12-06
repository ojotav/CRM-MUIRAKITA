
import React, { useState, DragEvent, useEffect } from 'react';
import { Project, ProjectStatus, ProjectColumn, Subtask, Lead } from '../types';
import { 
  Plus, Calendar, X, Folder, Edit2, Trash2, CheckSquare, 
  Paperclip, FileText, Loader2, DollarSign, ListTodo, 
  Save, Eye, Zap, Clock, Briefcase
} from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface ProjectsKanbanProps {
  projects: Project[];
  leads: Lead[]; 
  onUpdateProject: (project: Project) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onDeleteProject: (id: string) => void;
}

const STATUS_STYLES: Record<ProjectStatus, { title: string; color: string; bg: string; border: string; borderLeft: string; badge: string }> = {
  'Em andamento': { 
      title: 'Em Andamento', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/5', 
      border: 'border-blue-500/10',
      borderLeft: 'border-l-blue-500',
      badge: 'bg-blue-500/10 text-blue-400'
  },
  'Pausado': { 
      title: 'Pausado', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/5', 
      border: 'border-yellow-500/10',
      borderLeft: 'border-l-yellow-500',
      badge: 'bg-yellow-500/10 text-yellow-400'
  },
  'Finalizado': { 
      title: 'Finalizado', 
      color: 'text-green-400', 
      bg: 'bg-green-500/5', 
      border: 'border-green-500/10',
      borderLeft: 'border-l-green-500',
      badge: 'bg-green-500/10 text-green-400'
  }
};

const SERVICE_TYPES = [
    'Chatbot WhatsApp',
    'Automação N8N/Make',
    'Desenvolvimento Web',
    'Integração CRM',
    'Tráfego Pago',
    'Consultoria',
    'Outros'
];

const ProjectsKanban: React.FC<ProjectsKanbanProps> = ({ projects, leads, onUpdateProject, onAddProject, onDeleteProject }) => {
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Form State
  const [currentProjectData, setCurrentProjectData] = useState<Partial<Project>>({
    name: '',
    clientName: '',
    description: '',
    category: 'Automação',
    serviceType: 'Chatbot WhatsApp',
    status: 'Em andamento',
    members: [MOCK_USERS[0]],
    progress: 0,
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    attachments: [],
    subtasks: []
  });

  useEffect(() => {
    const statusKeys = Object.keys(STATUS_STYLES) as ProjectStatus[];
    const newColumns = statusKeys.map(status => ({
      id: status,
      title: STATUS_STYLES[status].title,
      color: STATUS_STYLES[status].color,
      projects: projects.filter(p => p.status === status)
    }));
    setColumns(newColumns);
  }, [projects]);

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, targetStatus: ProjectStatus) => {
    e.preventDefault();
    if (!draggingId) return;

    const project = projects.find(p => p.id === draggingId);
    if (project && project.status !== targetStatus) {
      let newProgress = project.progress;
      if (targetStatus === 'Finalizado') {
        newProgress = 100;
      }
      onUpdateProject({ ...project, status: targetStatus, progress: newProgress });
    }
    setDraggingId(null);
  };

  const getDaysActive = (startDate: string) => {
      const start = new Date(startDate);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      return Math.floor(diff / (1000 * 3600 * 24));
  };

  const getUrgencyColor = (deadline: string) => {
      const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysLeft < 0) return 'text-red-500';
      if (daysLeft < 3) return 'text-red-400';
      if (daysLeft < 7) return 'text-orange-400';
      return 'text-green-400';
  };

  const findClientPhone = (clientName: string) => {
      const lead = leads.find(l => l.clientName.toLowerCase() === clientName.toLowerCase() || l.companyName?.toLowerCase() === clientName.toLowerCase());
      return lead?.phone;
  };

  const openWhatsApp = (e: React.MouseEvent, phone?: string) => {
      e.stopPropagation();
      if (!phone) {
          alert("Telefone do cliente não encontrado nos Leads.");
          return;
      }
      const number = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${number}`, '_blank');
  };

  const calculateProgress = (subtasks: Subtask[]) => {
      if (!subtasks || subtasks.length === 0) return 0;
      const completed = subtasks.filter(t => t.completed).length;
      return Math.round((completed / subtasks.length) * 100);
  };

  const openNewProjectModal = () => {
      setIsEditing(false);
      setCurrentProjectData({
        name: '',
        clientName: '',
        description: '',
        category: 'Automação',
        serviceType: 'Chatbot WhatsApp',
        status: 'Em andamento',
        members: [MOCK_USERS[0]],
        progress: 0,
        value: 0,
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        attachments: [],
        subtasks: []
      });
      setShowModal(true);
  };

  const openEditProjectModal = (project: Project) => {
      setIsEditing(true);
      setCurrentProjectData({ ...project });
      setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProjectData.name) return;

    const finalProgress = calculateProgress(currentProjectData.subtasks || []);

    const projectPayload = {
        ...currentProjectData,
        progress: finalProgress,
        members: currentProjectData.members || [],
        subtasks: currentProjectData.subtasks || [],
        attachments: currentProjectData.attachments || [],
        value: Number(currentProjectData.value) || 0,
    };

    if (isEditing && currentProjectData.id) {
        onUpdateProject(projectPayload as Project);
    } else {
        onAddProject(projectPayload as Omit<Project, 'id'>);
    }
    setShowModal(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('Tem certeza que deseja excluir este projeto?')) {
          onDeleteProject(id);
      }
  };

  const addSubtask = () => {
      if(!newSubtaskTitle.trim()) return;
      const newTask: Subtask = {
          id: Math.random().toString(36).substr(2, 9),
          title: newSubtaskTitle,
          completed: false
      };
      
      const updatedSubtasks = [...(currentProjectData.subtasks || []), newTask];
      setCurrentProjectData({
          ...currentProjectData,
          subtasks: updatedSubtasks,
          progress: calculateProgress(updatedSubtasks)
      });
      setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
      const updatedSubtasks = currentProjectData.subtasks?.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
      ) || [];
      
      setCurrentProjectData({
          ...currentProjectData,
          subtasks: updatedSubtasks,
          progress: calculateProgress(updatedSubtasks)
      });
  };

  const deleteSubtask = (id: string) => {
      const updatedSubtasks = currentProjectData.subtasks?.filter(t => t.id !== id) || [];
      setCurrentProjectData({
          ...currentProjectData,
          subtasks: updatedSubtasks,
          progress: calculateProgress(updatedSubtasks)
      });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `proj_${Math.random().toString(36).substr(2,5)}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    try {
      const { error } = await supabase.storage.from('documents').upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      setCurrentProjectData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), publicUrl]
      }));

    } catch (error) {
      alert('Erro ao fazer upload: Verifique se o bucket "documents" existe no Supabase.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (url: string) => {
    setCurrentProjectData(prev => ({
        ...prev,
        attachments: prev.attachments?.filter(a => a !== url)
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-charcoal-950">
      <div className="min-h-16 py-4 border-b border-charcoal-800 flex items-center justify-between px-4 md:px-6 bg-charcoal-900/50 backdrop-blur-sm z-20">
         <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Projetos</h2>
            <p className="text-xs md:text-sm text-slate-400 hidden md:block">Gestão de entregas.</p>
         </div>
         <button onClick={openNewProjectModal} className="bg-neon-purple hover:bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 shadow-lg shadow-neon-purple/20 transition-all">
           <Plus className="w-4 h-4" /> <span className="hidden md:inline">Novo Projeto</span><span className="md:hidden">Novo</span>
         </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 custom-scrollbar snap-x snap-mandatory">
        <div className="flex gap-4 md:gap-6 h-full min-w-max">
           {columns.map(column => {
             const style = STATUS_STYLES[column.id];
             const totalValue = column.projects.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

             return (
               <div 
                 key={column.id} 
                 className="w-[85vw] md:w-[380px] flex flex-col h-full rounded-2xl bg-charcoal-900/40 border border-charcoal-800/50 backdrop-blur-sm transition-colors snap-center"
                 onDragOver={onDragOver} 
                 onDrop={(e) => onDrop(e, column.id)}
               >
                  {/* Column Header */}
                  <div className={`p-4 border-b ${style.border} flex justify-between items-center rounded-t-2xl ${style.bg}`}>
                     <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${style.color.replace('text-', 'bg-')}`}></div>
                        <h3 className={`font-bold ${style.color} text-sm uppercase tracking-wider`}>{style.title}</h3>
                        <span className="text-xs bg-charcoal-950/40 text-slate-300 px-2 py-0.5 rounded border border-white/5 font-mono">
                            {column.projects.length}
                        </span>
                     </div>
                     <span className="text-xs font-mono text-slate-400 font-medium">
                        R$ {totalValue.toLocaleString('pt-BR', { notation: 'compact' })}
                     </span>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar">
                     {column.projects.map(project => {
                       const phone = findClientPhone(project.clientName);
                       const daysActive = getDaysActive(project.startDate);
                       const statusStyle = STATUS_STYLES[project.status];
                       
                       return (
                         <div 
                           key={project.id} 
                           draggable 
                           onDragStart={(e) => onDragStart(e, project.id)} 
                           className={`
                             bg-charcoal-800 rounded-xl shadow-lg border-l-[4px] md:border-l-[6px] border-t border-r border-b border-charcoal-700 
                             ${statusStyle.borderLeft} 
                             p-4 md:p-5 cursor-grab relative group active:cursor-grabbing hover:-translate-y-1 hover:shadow-2xl transition-all duration-200
                           `}
                           onClick={() => openEditProjectModal(project)}
                         >
                            {/* 1. Header */}
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-charcoal-700 to-charcoal-600 border border-charcoal-500 flex items-center justify-center text-slate-200 shadow-inner shrink-0">
                                        <Folder className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-slate-100 font-bold text-sm md:text-base truncate leading-tight group-hover:text-white transition-colors">{project.name}</h4>
                                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                                            <Briefcase className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            <span className="truncate">{project.clientName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md flex items-center gap-1 border ${daysActive > 30 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-charcoal-900 text-slate-500 border-charcoal-700'}`}>
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {daysActive}d
                                </div>
                            </div>

                            {/* 2. Main Info */}
                            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4 bg-charcoal-900/50 p-2 md:p-3 rounded-lg border border-charcoal-700/50">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Valor</span>
                                    <div className="flex items-center gap-1 text-green-400 font-mono font-bold text-xs md:text-sm">
                                        <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        {project.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Prazo</span>
                                    <div className={`flex items-center gap-1 font-medium text-xs md:text-sm ${getUrgencyColor(project.deadline)}`}>
                                        <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        {new Date(project.deadline).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Progress */}
                            <div className="mb-3 md:mb-4">
                                <div className="flex justify-between items-center text-[10px] md:text-xs mb-1.5">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <ListTodo className="w-2.5 h-2.5 md:w-3 md:h-3" /> 
                                        {project.subtasks.filter(t => t.completed).length}/{project.subtasks.length} Tarefas
                                    </span>
                                    <span className={`font-bold ${project.progress >= 100 ? 'text-green-400' : 'text-slate-200'}`}>
                                        {project.progress}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-charcoal-950 rounded-full overflow-hidden border border-charcoal-700/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${project.progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} 
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* 4. Footer */}
                            <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-charcoal-700/50">
                                <span className="text-[10px] bg-charcoal-900 text-slate-400 px-2 py-0.5 rounded border border-charcoal-600 truncate max-w-[80px] md:max-w-[100px]">
                                     {project.serviceType}
                                </span>

                                <div className="flex gap-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditProjectModal(project); }}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-charcoal-700 rounded-lg transition-colors"
                                        title="Visualizar Detalhes"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => openWhatsApp(e, phone)}
                                        className={`p-1.5 rounded-lg transition-colors ${phone ? 'text-slate-400 hover:text-green-400 hover:bg-green-400/10' : 'text-charcoal-600 cursor-not-allowed'}`}
                                        title={phone ? `WhatsApp: ${phone}` : "Sem telefone vinculado"}
                                    >
                                        <Zap className="w-4 h-4" />
                                    </button>

                                    <button 
                                        onClick={(e) => handleDelete(e, project.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Excluir Projeto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {project.attachments && project.attachments.length > 0 && (
                                <div className="absolute top-2 right-2 flex gap-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></div>
                                </div>
                            )}
                         </div>
                       );
                     })}
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
           <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-4 md:p-6 border-b border-charcoal-800 flex justify-between items-center bg-charcoal-950">
                 <div>
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                        {isEditing ? <Edit2 className="w-5 h-5 text-neon-purple" /> : <Plus className="w-5 h-5 text-neon-purple" />}
                        {isEditing ? 'Editar' : 'Novo Projeto'}
                    </h3>
                 </div>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-charcoal-800"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <form onSubmit={handleSubmit} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                     <div className="space-y-4 md:space-y-5">
                        <h4 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-2 md:mb-4 border-b border-charcoal-800 pb-2">Detalhes</h4>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nome do Projeto *</label>
                            <input type="text" placeholder="Ex: Automação Loja XP" value={currentProjectData.name} onChange={e => setCurrentProjectData({...currentProjectData, name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Cliente Vinculado</label>
                            <input list="leads-list" type="text" placeholder="Selecione um cliente..." value={currentProjectData.clientName} onChange={e => setCurrentProjectData({...currentProjectData, clientName: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none" />
                            <datalist id="leads-list">
                                {leads.map(lead => <option key={lead.id} value={lead.clientName}>{lead.companyName}</option>)}
                            </datalist>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tipo de Serviço</label>
                                <select value={currentProjectData.serviceType} onChange={e => setCurrentProjectData({...currentProjectData, serviceType: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none">
                                    {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Status</label>
                                <select value={currentProjectData.status} onChange={e => setCurrentProjectData({...currentProjectData, status: e.target.value as any})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none">
                                    <option value="Em andamento">Em andamento</option>
                                    <option value="Pausado">Pausado</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                            <textarea placeholder="Escopo do projeto..." value={currentProjectData.description} onChange={e => setCurrentProjectData({...currentProjectData, description: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white h-24 resize-none focus:border-neon-purple focus:outline-none" />
                        </div>
                        <h4 className="text-sm font-bold text-green-500 uppercase tracking-wider mt-4 md:mt-6 mb-2 md:mb-4 border-b border-charcoal-800 pb-2">Financeiro & Prazos</h4>
                        <div>
                             <label className="block text-sm text-slate-400 mb-1">Valor (R$)</label>
                             <div className="relative">
                                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                 <input type="number" placeholder="0,00" value={currentProjectData.value} onChange={e => setCurrentProjectData({...currentProjectData, value: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 pl-9 text-white focus:border-green-500 focus:outline-none" />
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="block text-sm text-slate-400 mb-1">Início</label><input type="date" value={currentProjectData.startDate} onChange={e => setCurrentProjectData({...currentProjectData, startDate: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" /></div>
                             <div><label className="block text-sm text-slate-400 mb-1">Entrega</label><input type="date" value={currentProjectData.deadline} onChange={e => setCurrentProjectData({...currentProjectData, deadline: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" /></div>
                        </div>
                     </div>
                     <div className="space-y-4 md:space-y-5 flex flex-col">
                        <h4 className="text-sm font-bold text-neon-purple uppercase tracking-wider mb-2 md:mb-4 border-b border-charcoal-800 pb-2">Tarefas</h4>
                        <div className="bg-charcoal-800/50 p-4 rounded-xl border border-charcoal-800 mb-2">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm text-slate-300 font-medium">Progresso Automático</span>
                                 <span className="text-xl font-bold text-white">{calculateProgress(currentProjectData.subtasks || [])}%</span>
                             </div>
                             <div className="h-2 w-full bg-charcoal-950 rounded-full overflow-hidden">
                                 <div className="h-full bg-neon-purple transition-all duration-300" style={{ width: `${calculateProgress(currentProjectData.subtasks || [])}%` }}></div>
                             </div>
                        </div>
                        <div className="flex-1 bg-charcoal-950 border border-charcoal-800 rounded-xl p-4 flex flex-col min-h-[200px]">
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} placeholder="Adicionar tarefa..." className="flex-1 bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none" />
                                <button type="button" onClick={addSubtask} className="bg-charcoal-800 hover:bg-neon-purple hover:text-white text-slate-400 p-2 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                {currentProjectData.subtasks?.map(task => (
                                    <div key={task.id} className="group flex items-center gap-3 bg-charcoal-900 p-2 rounded-lg border border-transparent hover:border-charcoal-700">
                                        <button type="button" onClick={() => toggleSubtask(task.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-neon-purple border-neon-purple text-white' : 'border-slate-600 hover:border-neon-purple'}`}>{task.completed && <CheckSquare className="w-3.5 h-3.5" />}</button>
                                        <span className={`text-sm flex-1 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</span>
                                        <button type="button" onClick={() => deleteSubtask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2 mb-2">Anexos</h4>
                             <div className="space-y-2">
                                 {currentProjectData.attachments?.map((url, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-charcoal-950 px-3 py-2 rounded-lg border border-charcoal-800">
                                        <div className="p-1.5 bg-charcoal-800 rounded text-neon-blue"><FileText className="w-4 h-4" /></div>
                                        <div className="flex-1 overflow-hidden"><a href={url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-white hover:underline truncate block">Doc {idx + 1}</a></div>
                                        <button type="button" onClick={() => removeAttachment(url)} className="text-slate-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                                    </div>
                                 ))}
                                 <label className={`flex items-center justify-center gap-2 w-full border border-dashed border-charcoal-700 bg-charcoal-800/30 hover:bg-charcoal-800 text-slate-400 py-3 rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                     {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                                     <span className="text-sm">{uploading ? 'Enviando...' : 'Anexar Arquivo'}</span>
                                     <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                                 </label>
                             </div>
                        </div>
                     </div>
                  </form>
              </div>
              <div className="p-4 border-t border-charcoal-800 bg-charcoal-950 flex justify-end gap-3 md:gap-4 shrink-0">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 md:px-6 md:py-3 rounded-xl text-slate-400 hover:bg-charcoal-800 transition-colors font-medium text-sm">Cancelar</button>
                  <button onClick={handleSubmit} className="px-6 py-2 md:px-8 md:py-3 rounded-xl bg-neon-purple hover:bg-purple-600 text-white font-bold shadow-lg shadow-neon-purple/20 flex items-center gap-2 text-sm">
                      <Save className="w-4 h-4" /> {isEditing ? 'Salvar' : 'Criar'}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsKanban;
