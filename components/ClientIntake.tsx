
import React, { useState, useEffect } from 'react';
import { 
  User, Building, Phone, Mail, Globe, Save, CheckCircle2, Tag, Thermometer, Clock, Paperclip, X, FileText, Loader2
} from 'lucide-react';
import { Lead } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ClientIntakeProps {
  onSave: (lead: Omit<Lead, 'id'> | Lead) => void;
  initialData?: Lead;
}

const ClientIntake: React.FC<ClientIntakeProps> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    clientName: '',
    companyName: '',
    phone: '',
    email: '',
    origin: 'Outro',
    serviceInterest: '',
    warmth: 'Morno',
    status: 'Novo',
    value: 0,
    nextActionDate: '',
    nextActionDescription: '',
    notes: '',
    attachments: []
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
        onSave({ ...initialData, ...formData } as Lead);
    } else {
        onSave({ ...formData, dateAdded: new Date().toISOString() } as Omit<Lead, 'id'>);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), publicUrl]
      }));

    } catch (error) {
      alert('Erro ao fazer upload: Verifique se o bucket "documents" existe e é público.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (urlToRemove: string) => {
      setFormData(prev => ({
          ...prev,
          attachments: prev.attachments?.filter(url => url !== urlToRemove)
      }));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">{initialData ? 'Editar Lead' : 'Novo Lead'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm">Nome do Cliente *</label>
                 <input className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
             </div>
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm">Empresa</label>
                 <input className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
             </div>
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm">Telefone / WhatsApp *</label>
                 <input className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
             </div>
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm">Serviço de Interesse</label>
                 <input className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" placeholder="ex: Chatbot, Automação N8N" value={formData.serviceInterest} onChange={e => setFormData({...formData, serviceInterest: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                  <label className="text-slate-400 text-sm">Origem</label>
                  <select className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value as any})}>
                      <option>Instagram</option>
                      <option>Tráfego Pago</option>
                      <option>Indicação</option>
                      <option>Orgânico</option>
                      <option>Parceria</option>
                      <option>Outro</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-slate-400 text-sm">Temperatura</label>
                  <select className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" value={formData.warmth} onChange={e => setFormData({...formData, warmth: e.target.value as any})}>
                      <option>Frio</option>
                      <option>Morno</option>
                      <option>Quente</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-slate-400 text-sm">Ticket Estimado (R$)</label>
                  <input type="number" className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
              </div>
          </div>

          {/* Follow Up Section */}
          <div className="bg-charcoal-800/30 p-4 rounded-xl border border-charcoal-800">
              <h3 className="text-neon-cyan font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Próxima Ação (Follow-up)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-slate-400 text-sm block mb-1">Data *</label>
                      <input type="date" className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" required value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-slate-400 text-sm block mb-1">O que fazer?</label>
                      <input type="text" placeholder="ex: Ligar para cobrar proposta" className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white" value={formData.nextActionDescription} onChange={e => setFormData({...formData, nextActionDescription: e.target.value})} />
                  </div>
              </div>
          </div>

          <div className="space-y-2">
             <label className="text-slate-400 text-sm">Observações</label>
             <textarea className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          {/* Anexos */}
          <div className="space-y-3">
             <label className="text-slate-400 text-sm font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Anexos e Documentos
             </label>
             
             <div className="flex flex-wrap gap-2">
                {formData.attachments?.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-charcoal-800 px-3 py-2 rounded-lg border border-charcoal-700 text-xs text-slate-300">
                        <FileText className="w-3 h-3 text-neon-blue" />
                        <a href={url} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[150px]">
                            Documento {idx + 1}
                        </a>
                        <button type="button" onClick={() => removeAttachment(url)} className="text-slate-500 hover:text-red-400 ml-1">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
             </div>

             <div className="relative">
                 <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                 />
                 <button type="button" className={`w-full border border-dashed border-charcoal-600 bg-charcoal-900/50 hover:bg-charcoal-800 text-slate-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    {uploading ? 'Enviando...' : 'Clique para anexar arquivo'}
                 </button>
             </div>
          </div>

          <button type="submit" className="w-full bg-neon-blue hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all">
             Salvar Lead
          </button>
      </form>
    </div>
  );
};

export default ClientIntake;
