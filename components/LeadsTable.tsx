import React from 'react';
import { Lead } from '../types';
import { Phone, Mail, ExternalLink, MoreHorizontal } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'Novo': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Qualificado': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'Negociação': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'Fechado': return 'bg-green-500/10 text-green-400 border-green-500/20';
        default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-charcoal-900 border border-charcoal-800 rounded-2xl shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-charcoal-800 bg-charcoal-950/50">
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente / Empresa</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Est.</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="group hover:bg-charcoal-800/50 transition-colors">
              <td className="p-4">
                <div className="font-medium text-slate-200">{lead.clientName}</div>
                <div className="text-sm text-slate-500">{lead.companyName}</div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1 text-sm text-slate-400">
                    <div className="flex items-center gap-2 hover:text-white cursor-pointer"><Phone className="w-3 h-3" /> {lead.phone}</div>
                    {lead.email && <div className="flex items-center gap-2 hover:text-white cursor-pointer"><Mail className="w-3 h-3" /> {lead.email}</div>}
                </div>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                </span>
              </td>
              <td className="p-4 text-slate-300 font-medium">
                {lead.value > 0 ? `R$${lead.value.toLocaleString('pt-BR')}` : '-'}
              </td>
              <td className="p-4 text-sm text-slate-500">
                {new Date(lead.dateAdded).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-4 text-right">
                <button className="text-slate-500 hover:text-white p-2 rounded hover:bg-charcoal-700 transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
          <div className="p-8 text-center text-slate-500">
              Nenhum lead encontrado. Use o formulário acima para adicionar um novo cliente.
          </div>
      )}
    </div>
  );
};

export default LeadsTable;