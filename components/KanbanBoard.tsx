import React, { useState, DragEvent } from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  MessageSquare, 
  Paperclip, 
  CheckSquare,
  Calendar
} from 'lucide-react';
import { Column, Priority } from '../types';

interface KanbanBoardProps {
  initialColumns: Column[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialColumns }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingSourceCol, setDraggingSourceCol] = useState<string | null>(null);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Crítica': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Alta': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Média': return 'text-neon-blue bg-neon-blue/10 border-neon-blue/20';
      case 'Baixa': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, taskId: string, colId: string) => {
    setDraggingTaskId(taskId);
    setDraggingSourceCol(colId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        const el = document.getElementById(`task-${taskId}`);
        if(el) el.classList.add('opacity-40');
    }, 0);
  };

  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    if (draggingTaskId) {
        const el = document.getElementById(`task-${draggingTaskId}`);
        if(el) el.classList.remove('opacity-40');
    }
    setDraggingTaskId(null);
    setDraggingSourceCol(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, targetColId: string) => {
    e.preventDefault();
    if (!draggingTaskId || !draggingSourceCol || draggingSourceCol === targetColId) return;

    const sourceColIndex = columns.findIndex(c => c.id === draggingSourceCol);
    const targetColIndex = columns.findIndex(c => c.id === targetColId);
    
    if (sourceColIndex === -1 || targetColIndex === -1) return;

    const newColumns = [...columns];
    const sourceTasks = [...newColumns[sourceColIndex].tasks];
    const targetTasks = [...newColumns[targetColIndex].tasks];

    const taskIndex = sourceTasks.findIndex(t => t.id === draggingTaskId);
    if (taskIndex === -1) return;

    const [movedTask] = sourceTasks.splice(taskIndex, 1);
    targetTasks.push(movedTask);

    newColumns[sourceColIndex] = { ...newColumns[sourceColIndex], tasks: sourceTasks };
    newColumns[targetColIndex] = { ...newColumns[targetColIndex], tasks: targetTasks };

    setColumns(newColumns);
  };

  const filteredColumns = columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-charcoal-950">
      {/* Board Toolbar - Responsive Stack */}
      <div className="min-h-16 py-4 md:py-0 border-b border-charcoal-800 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 bg-charcoal-900/50 backdrop-blur-sm z-20 gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
             <h2 className="text-lg md:text-xl font-semibold text-white truncate">Quadro Sprint 42</h2>
             <div className="h-6 w-[1px] bg-charcoal-700 hidden md:block"></div>
          </div>
          
          <div className="flex -space-x-2 md:ml-0">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://picsum.photos/3${i}/3${i}`} className="w-8 h-8 rounded-full border-2 border-charcoal-900" alt="Membro" />
            ))}
            <div className="w-8 h-8 rounded-full bg-charcoal-800 border-2 border-charcoal-900 flex items-center justify-center text-xs text-slate-400">
              +4
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           {/* Simple Search */}
           <input 
              type="text" 
              placeholder="Pesquisar tarefas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-charcoal-800 border border-charcoal-700 text-sm rounded-lg px-4 py-2 w-full sm:w-64 text-slate-200 focus:outline-none focus:border-neon-blue/50 transition-colors"
           />
           <button className="bg-neon-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
             <Plus className="w-4 h-4" />
             Nova Tarefa
           </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 custom-scrollbar">
        <div className="flex gap-4 md:gap-6 h-full min-w-max">
          {filteredColumns.map(column => (
            <div 
              key={column.id}
              className="w-72 md:w-80 flex flex-col h-full rounded-2xl bg-charcoal-900/40 border border-charcoal-800/50 backdrop-blur-sm"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`p-3 md:p-4 border-b border-charcoal-800 flex justify-between items-center ${column.id === 'done' ? 'bg-green-500/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 ${column.color}`}></div>
                  <h3 className="font-semibold text-slate-200 text-sm md:text-base">{column.title}</h3>
                  <span className="text-xs bg-charcoal-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Tasks Area */}
              <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-3 custom-scrollbar">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id, column.id)}
                    onDragEnd={onDragEnd}
                    className="group bg-charcoal-800 hover:bg-charcoal-700 p-3 md:p-4 rounded-xl shadow-lg border border-transparent hover:border-charcoal-600 cursor-grab active:cursor-grabbing transition-all hover:translate-y-[-2px]"
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-charcoal-950 text-slate-400 px-2 py-0.5 rounded border border-charcoal-700">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-slate-200 font-medium text-sm mb-3 leading-snug">
                      {task.title}
                    </h4>

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-charcoal-700/50">
                      <div className="flex items-center gap-2 md:gap-3 text-slate-500">
                         {task.assignee && (
                            <img src={task.assignee.avatar} className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-charcoal-600" title={task.assignee.name} alt="Responsável" />
                         )}
                         {task.dueDate && (
                           <div className="flex items-center gap-1 text-[10px] md:text-[11px] group-hover:text-neon-cyan transition-colors">
                             <Calendar className="w-3 h-3" />
                             <span>15 Nov</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3 text-slate-500 text-xs">
                         {(task.commentsCount > 0) && (
                           <div className="flex items-center gap-1">
                             <MessageSquare className="w-3 h-3" /> {task.commentsCount}
                           </div>
                         )}
                         {(task.attachmentsCount > 0) && (
                           <div className="flex items-center gap-1">
                             <Paperclip className="w-3 h-3" /> {task.attachmentsCount}
                           </div>
                         )}
                         <div className="flex items-center gap-1">
                             <CheckSquare className="w-3 h-3" /> {task.subtasks.completed}/{task.subtasks.total}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Drop Area / Empty State visual hint */}
                <div className="h-2 w-full"></div>
              </div>

              {/* Add Task Quick Button */}
              <div className="p-3 border-t border-charcoal-800">
                <button className="w-full py-2 rounded-lg border border-dashed border-charcoal-700 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all text-sm flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Tarefa
                </button>
              </div>
            </div>
          ))}
          
          {/* Add Column Button */}
          <div className="w-72 md:w-80 h-16 flex items-center justify-center rounded-xl border border-dashed border-charcoal-700 text-slate-500 hover:text-white hover:border-slate-500 cursor-pointer transition-colors shrink-0">
             <div className="flex items-center gap-2 font-medium">
               <Plus className="w-5 h-5" /> Adicionar Coluna
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;