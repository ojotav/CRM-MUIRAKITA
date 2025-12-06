
import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Trash2, Calendar, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface TasksModuleProps {
  tasks: Task[];
  onAddTask: (t: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
}

const TasksModule: React.FC<TasksModuleProps> = ({ tasks, onAddTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState({ title: '', type: 'Follow-up', dueDate: new Date().toISOString().split('T')[0], priority: 'Média' });
  const [showModal, setShowModal] = useState(false);

  const toggleComplete = async (task: Task) => {
     // Optimistic UI update handled by parent usually, but simple reload here:
     await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id);
     window.location.reload(); 
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddTask({
          title: newTask.title,
          type: newTask.type as any,
          priority: newTask.priority as any,
          dueDate: newTask.dueDate,
          completed: false
      });
      setShowModal(false);
      setNewTask({ title: '', type: 'Follow-up', dueDate: new Date().toISOString().split('T')[0], priority: 'Média' });
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-charcoal-950">
       <div className="flex justify-between items-center mb-8">
         <h2 className="text-2xl font-bold text-white">Tarefas Gerais</h2>
         <button onClick={() => setShowModal(true)} className="bg-neon-purple hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Tarefa
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending */}
          <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-neon-blue" /> A Fazer ({pendingTasks.length})
              </h3>
              <div className="space-y-3">
                  {pendingTasks.map(task => (
                      <div key={task.id} className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-xl flex items-center gap-4 hover:border-charcoal-600 transition-colors">
                          <button onClick={() => toggleComplete(task)} className="text-slate-500 hover:text-neon-cyan">
                              <Square className="w-6 h-6" />
                          </button>
                          <div className="flex-1">
                              <h4 className="text-white font-medium">{task.title}</h4>
                              <div className="flex gap-2 text-xs mt-1">
                                  <span className="text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded">{task.type}</span>
                                  <span className="text-slate-500">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                          </div>
                          <button onClick={() => onDeleteTask(task.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                  ))}
                  {pendingTasks.length === 0 && <p className="text-slate-600 text-sm">Nenhuma tarefa pendente.</p>}
              </div>
          </div>

          {/* Completed */}
          <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                 <CheckSquare className="w-5 h-5 text-green-500" /> Concluídas ({completedTasks.length})
              </h3>
              <div className="space-y-3 opacity-60">
                  {completedTasks.map(task => (
                      <div key={task.id} className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-xl flex items-center gap-4">
                          <button onClick={() => toggleComplete(task)} className="text-green-500">
                              <CheckSquare className="w-6 h-6" />
                          </button>
                          <div className="flex-1">
                              <h4 className="text-slate-400 font-medium line-through">{task.title}</h4>
                          </div>
                          <button onClick={() => onDeleteTask(task.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                  ))}
              </div>
          </div>
       </div>

       {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-md p-6">
               <h3 className="text-xl font-bold text-white mb-4">Nova Tarefa</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                   <input type="text" placeholder="Título" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" required />
                   <div className="grid grid-cols-2 gap-4">
                       <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white">
                           <option>Follow-up</option>
                           <option>Reunião</option>
                           <option>Cobrança</option>
                           <option>Configuração</option>
                       </select>
                       <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" />
                   </div>
                   <button className="w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-3 rounded-xl mt-4">Adicionar</button>
                   <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 text-sm mt-2">Cancelar</button>
               </form>
           </div>
        </div>
       )}
    </div>
  );
};

export default TasksModule;
