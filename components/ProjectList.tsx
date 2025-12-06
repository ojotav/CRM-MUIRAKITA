
import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  MoreVertical,
  Calendar,
  X
} from 'lucide-react';
import { Project, User } from '../types';
import { MOCK_USERS } from '../constants';

interface ProjectListProps {
  projects: Project[];
  onAddProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddProject }) => {
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    category: '',
    members: [MOCK_USERS[0]]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    onAddProject({
        id: Math.random().toString(36).substr(2, 9),
        name: newProject.name,
        description: newProject.description || '',
        category: newProject.category || 'Geral',
        status: 'Execução',
        progress: 0,
        members: newProject.members || [],
        deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
    });
    setShowModal(false);
    setNewProject({ name: '', description: '', category: '', members: [MOCK_USERS[0]] });
  };

  const toggleMember = (user: User) => {
     const current = newProject.members || [];
     const exists = current.find(u => u.id === user.id);
     if (exists) {
        setNewProject({ ...newProject, members: current.filter(u => u.id !== user.id) });
     } else {
        setNewProject({ ...newProject, members: [...current, user] });
     }
  };

  const getCategoryColor = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) return 'from-pink-500/20 to-purple-500/20 text-pink-400';
    if (lower.includes('ti') || lower.includes('dev')) return 'from-blue-500/20 to-cyan-500/20 text-cyan-400';
    if (lower.includes('marketing')) return 'from-orange-500/20 to-yellow-500/20 text-orange-400';
    return 'from-purple-500/20 to-blue-500/20 text-slate-300';
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Projetos Ativos</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gerencie e acompanhe prazos em todos os departamentos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-neon-purple hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 hover:border-charcoal-600 transition-all group relative">
            <div className="absolute top-6 right-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-500 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(project.category)}`}>
                <Folder className="w-6 h-6" />
              </div>
              <div className="pr-8">
                <h3 className="text-lg font-bold text-slate-100 leading-tight">{project.name}</h3>
                <span className="text-xs text-slate-500 border border-charcoal-700 px-2 py-0.5 rounded uppercase tracking-wider mt-1 inline-block">
                  {project.category}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Progresso</span>
                <span className="text-white font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-charcoal-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    project.progress >= 100 ? 'bg-green-500' : 'bg-neon-blue'
                  }`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-charcoal-800">
              <div className="flex -space-x-2">
                {project.members && project.members.map(m => (
                    <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-charcoal-900" title={m.name} alt="Membro" />
                ))}
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                 <Calendar className="w-3 h-3" />
                 {project.deadline}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-charcoal-800 flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">Criar Novo Projeto</h3>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Nome do Projeto</label>
                    <input 
                      type="text" 
                      value={newProject.name}
                      onChange={e => setNewProject({...newProject, name: e.target.value})}
                      className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none"
                      placeholder="ex: Redesign do Site"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                    <textarea 
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                      className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none resize-none h-24"
                      placeholder="Objetivos e escopo do projeto..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                        <input
                            type="text"
                            value={newProject.category}
                            onChange={e => setNewProject({...newProject, category: e.target.value})}
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none placeholder:text-slate-600"
                            placeholder="ex: Design, Marketing..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Prazo</label>
                        <input 
                            type="date"
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none" 
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm text-slate-400 mb-2">Equipe</label>
                    <div className="flex gap-2">
                        {MOCK_USERS.map(user => {
                            const selected = newProject.members?.find(u => u.id === user.id);
                            return (
                                <div 
                                    key={user.id}
                                    onClick={() => toggleMember(user)}
                                    className={`cursor-pointer rounded-full p-1 border-2 transition-all ${selected ? 'border-neon-purple' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
                                </div>
                            );
                        })}
                    </div>
                 </div>

                 <div className="pt-4">
                    <button type="submit" className="w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors">
                        Criar Projeto
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
