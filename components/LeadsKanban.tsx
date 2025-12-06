
import React, { useState, DragEvent, useEffect } from 'react';
import { Lead, LeadStatus, LeadColumn } from '../types';
import { 
  Plus, DollarSign, Edit2, Trash2, AlertTriangle, Calendar, 
  MapPin, Thermometer, Zap, MessageCircle, Clock, 
  Megaphone, User, Globe, MoreHorizontal,
  Mail, Phone, Eye, Star, Briefcase, X, Tag
} from 'lucide-react';
import ClientIntake from './ClientIntake';

interface LeadsKanbanProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  onAddLead: (lead: Omit<Lead, 'id'>) => void;
  onDeleteLead: (id: string) => void;
  onConvertToProject?: (lead: Lead) => void;
}

const STATUS_CONFIG: Record<LeadStatus, { title: string; color: string; bg: string; border: string; borderLeft: string; badge: string }> = {
  'Novo': { 
      title: 'Novos', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/5', 
      border: 'border-blue-500/10',
      borderLeft: 'border-l-blue-500',
      badge: 'bg-blue-500/10 text-blue-400'
  },
  'Qualificado': { 
      title: 'Qualificados', 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/5', 
      border: 'border-purple-500/10',
      borderLeft: 'border-l-purple-500',
      badge: 'bg-purple-500/10 text-purple-400'
  },
  'Proposta Enviada': { 
      title: 'Proposta', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/5', 
      border: 'border-yellow-500/10',
      borderLeft: 'border-l-yellow-500',
      badge: 'bg-yellow-500/10 text-yellow-400'
  },
  'Negociação': { 
      title: 'Negociação', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/5', 
      border: 'border-orange-500/10',
      borderLeft: 'border-l-orange-500',
      badge: 'bg-orange-500/10 text-orange-400'
  },
  'Fechado': { 
      title: 'Fechados', 
      color: 'text-green-400', 
      bg: 'bg-green-500/5', 
      border: 'border-green-500/10',
      borderLeft: 'border-l-green-500',
      badge: 'bg-green-500/10 text-green-400'
  },
  'Perdido': { 
      title: 'Perdidos', 
      color: 'text-red-400', 
      bg: 'bg-red-500/5', 
      border: 'border-red-500/10',
      borderLeft: 'border-l-red-500',
      badge: 'bg-red-500/10 text-red-400'
  },
};

const LeadsKanban: React.FC<LeadsKanbanProps> = ({ leads, onUpdateLead, onAddLead, onDeleteLead, onConvertToProject }) => {
  const [columns, setColumns] = useState<LeadColumn[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  useEffect(() => {
    const statusKeys = Object.keys(STATUS_CONFIG) as LeadStatus[];
    const newColumns = statusKeys.map(status => ({
      id: status,
      title: STATUS_CONFIG[status].title,
      color: STATUS_CONFIG[status].color,
      leads: leads.filter(l => l.status === status)
    }));
    setColumns(newColumns);
  }, [leads]);

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, targetStatus: LeadStatus) => {
    e.preventDefault();
    if (!draggingId) return;
    const lead = leads.find(l => l.id === draggingId);
    if (lead && lead.status !== targetStatus) {
      onUpdateLead({ 
          ...lead, 
          status: targetStatus,
          lastStatusUpdate: new Date().toISOString().split('T')[0]
      });
    }
    setDraggingId(null);
  };

  const getDaysInStage = (dateString?: string) => {
      if (!dateString) return 0;
      const start = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      return Math.floor(diff / (1000 * 3600 * 24));
  };

  const isAbandoned = (lead: Lead) => {
      if (!lead.nextActionDate) return true;
      const today = new Date().toISOString().split('T')[0];
      return lead.nextActionDate < today && lead.status !== 'Fechado' && lead.status !== 'Perdido';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este lead?')) {
        onDeleteLead(id);
    }
  };

  const openWhatsApp = (e: React.MouseEvent, phone: string) => {
      e.stopPropagation();
      const number = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${number}`, '_blank');
  };

  const makeCall = (e: React.MouseEvent, phone: string) => {
      e.stopPropagation();
      const number = phone.replace(/\D/g, '');
      window.location.href = `tel:${number}`;
  };

  const getOriginIcon = (origin: string) => {
      switch(origin) {
          case 'Instagram': return <Megaphone className="w-3 h-3" />;
          case 'Tráfego Pago': return <Zap className="w-3 h-3" />;
          case 'Indicação': return <User className="w-3 h-3" />;
          case 'Orgânico': return <Globe className="w-3 h-3" />;
          default: return <Tag className="w-3 h-3" />;
      }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-charcoal-950">
      <div className="min-h-16 py-4 border-b border-charcoal-800 flex items-center justify-between px-4 md:px-6 bg-charcoal-900/50 backdrop-blur-sm z-20">
         <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Pipeline</h2>
            <p className="text-xs md:text-sm text-slate-400">Gestão de vendas.</p>
         </div>
         <button onClick={() => { setEditingLead(undefined); setShowModal(true); }} className="bg-neon-blue hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 shadow-lg shadow-neon-blue/20 transition-all">
           <Plus className="w-4 h-4" /> <span className="hidden md:inline">Novo Lead</span><span className="md:hidden">Novo</span>
         </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 custom-scrollbar snap-x snap-mandatory">
        <div className="flex gap-4 md:gap-6 h-full min-w-max">
           {columns.map(column => {
             const style = STATUS_CONFIG[column.id];
             const totalValue = column.leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

             return (
               <div 
                 key={column.id} 
                 className="w-[85vw] md:w-[340px] flex flex-col h-full rounded-2xl bg-charcoal-900/40 border border-charcoal-800/50 backdrop-blur-sm transition-colors snap-center"
                 onDragOver={onDragOver} 
                 onDrop={(e) => onDrop(e, column.id)}
               >
                  {/* Header da Coluna */}
                  <div className={`p-3 md:p-4 border-b ${style.border} rounded-t-2xl ${style.bg} flex justify-between items-center`}>
                     <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${style.color.replace('text-', 'bg-')}`}></div>
                         <h3 className={`font-bold ${style.color} text-sm uppercase tracking-wider`}>{style.title}</h3>
                         <span className="text-xs bg-charcoal-950/40 px-2 py-0.5 rounded text-slate-300 border border-white/5 font-mono">
                            {column.leads.length}
                         </span>
                     </div>
                     <span className="text-xs font-mono text-slate-400 font-medium">R$ {totalValue.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                  </div>

                  {/* Lista de Leads */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar">
                     {column.leads.map(lead => {
                       const daysInStage = getDaysInStage(lead.lastStatusUpdate || lead.dateAdded);
                       const isLate = isAbandoned(lead);
                       const statusConfig = STATUS_CONFIG[lead.status];

                       return (
                         <div 
                           key={lead.id} 
                           draggable 
                           onDragStart={(e) => onDragStart(e, lead.id)} 
                           className={`
                             bg-charcoal-800 rounded-xl shadow-lg border-l-[4px] md:border-l-[6px] border-t border-r border-b border-charcoal-700 
                             ${statusConfig.borderLeft} 
                             p-3 md:p-5 cursor-grab relative group active:cursor-grabbing hover:-translate-y-1 hover:shadow-2xl transition-all duration-200
                           `}
                           onClick={() => { setEditingLead(lead); setShowModal(true); }}
                         >
                            {/* 1. Cabeçalho */}
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-charcoal-700 to-charcoal-600 border border-charcoal-500 flex items-center justify-center text-xs md:text-sm font-bold text-slate-200 shadow-inner shrink-0 relative">
                                        {getInitials(lead.clientName)}
                                        {lead.warmth === 'Quente' && (
                                            <div className="absolute -top-1 -right-1 bg-charcoal-900 rounded-full p-0.5 border border-charcoal-600">
                                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-slate-100 font-bold text-sm md:text-base truncate leading-tight group-hover:text-white transition-colors">
                                            {lead.clientName}
                                        </h4>
                                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                                            <Briefcase className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            <span className="truncate">{lead.companyName || 'Cliente Particular'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md flex items-center gap-1 ${daysInStage > 7 ? 'bg-red-500/10 text-red-400' : 'bg-charcoal-900 text-slate-500 border border-charcoal-700'}`}>
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {daysInStage}d
                                </div>
                            </div>

                            {/* 2. Seção de Contato - Compacta no Mobile */}
                            <div className="flex flex-col gap-1 mb-3 md:mb-4 pl-1 border-l-2 border-charcoal-700">
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 hover:text-slate-200 truncate ml-2">
                                    <Phone className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                                    <span className="truncate">{lead.phone}</span>
                                </div>
                            </div>

                            {/* 3. Seção Principal (Metrics) */}
                            <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4 bg-charcoal-900/50 p-2 md:p-3 rounded-lg border border-charcoal-700/50">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Potencial</span>
                                    <div className="flex items-center gap-1 text-green-400 font-mono font-bold text-xs md:text-sm">
                                        <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        {lead.value?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Status</span>
                                    <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium ${
                                        lead.warmth === 'Quente' ? 'text-red-400' : lead.warmth === 'Morno' ? 'text-orange-400' : 'text-blue-400'
                                    }`}>
                                        <Thermometer className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        {lead.warmth}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Histórico / Status */}
                            {lead.nextActionDate && (
                                <div className={`mb-3 md:mb-4 p-2 md:p-2.5 rounded-lg text-xs border flex items-start gap-2 ${
                                    isLate ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-charcoal-900 border-charcoal-700 text-slate-300'
                                }`}>
                                    {isLate ? <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-red-400 mt-0.5" /> : <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-slate-400 mt-0.5" />}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`font-bold uppercase text-[10px] tracking-wide ${isLate ? 'text-red-400' : 'text-slate-500'}`}>
                                                {isLate ? 'Atrasado' : 'Próximo'}
                                            </span>
                                            <span className="text-[10px] opacity-70 whitespace-nowrap ml-1">
                                                {new Date(lead.nextActionDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                            </span>
                                        </div>
                                        <span className="truncate block font-medium leading-tight text-[10px] md:text-xs">{lead.nextActionDescription || 'Fazer follow-up'}</span>
                                    </div>
                                </div>
                            )}

                            {/* 5. Tags & Origem */}
                            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                <span className="text-[10px] bg-charcoal-900 text-slate-400 px-2 py-0.5 rounded border border-charcoal-600 flex items-center gap-1">
                                   {getOriginIcon(lead.origin)} {lead.origin}
                                </span>
                                {lead.serviceInterest && (
                                    <span className="text-[10px] bg-neon-purple/5 text-neon-purple px-2 py-0.5 rounded border border-neon-purple/20 truncate max-w-[100px] md:max-w-[120px]">
                                       {lead.serviceInterest}
                                    </span>
                                )}
                            </div>

                            {/* 6. Rodapé com Ações */}
                            <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-charcoal-700/50">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingLead(lead); setShowModal(true); }}
                                    className="text-slate-500 hover:text-white text-[10px] md:text-xs flex items-center gap-1 group/btn transition-colors"
                                >
                                    <Eye className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:text-neon-cyan" />
                                    Detalhes
                                </button>

                                <div className="flex gap-1.5">
                                    {/* Botão Ligar */}
                                    <button 
                                        onClick={(e) => makeCall(e, lead.phone)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors tooltip-trigger relative group/btn"
                                        title="Ligar"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>

                                    {/* Botão WhatsApp */}
                                    <button 
                                        onClick={(e) => openWhatsApp(e, lead.phone)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-400/10 transition-colors tooltip-trigger relative group/btn"
                                        title="WhatsApp"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>

                                    {onConvertToProject && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onConvertToProject(lead); }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors group/btn relative"
                                            title="Converter em Projeto"
                                        >
                                            <Zap className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button 
                                        onClick={(e) => handleDelete(e, lead.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors group/btn relative"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
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
             <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl custom-scrollbar">
                 <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                 <ClientIntake onSave={(data) => { if(editingLead) onUpdateLead(data as Lead); else onAddLead(data); setShowModal(false); }} initialData={editingLead} />
             </div>
         </div>
      )}
    </div>
  );
};
export default LeadsKanban;
