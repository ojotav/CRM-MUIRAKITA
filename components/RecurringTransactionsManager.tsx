import React, { useState, useCallback, useMemo } from 'react';
import { RecurringTransaction, RecurrenceFrequency, PaymentMethod } from '../types';
import { Plus, Trash2, Pause, Play, Edit2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface RecurringTransactionsManagerProps {
  recurringTransactions: RecurringTransaction[];
  onAddRecurring: (t: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onUpdateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
}

const RecurringTransactionsManager: React.FC<RecurringTransactionsManagerProps> = ({
  recurringTransactions,
  onAddRecurring,
  onDeleteRecurring,
  onUpdateRecurring,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientName: '',
    description: '',
    amount: '',
    frequency: 'monthly' as RecurrenceFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dayOfMonth: new Date().getDate(),
    method: 'Recorrência' as PaymentMethod,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (
        !form.clientName.trim() ||
        !form.description.trim() ||
        !form.amount ||
        !form.startDate
      ) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      setIsLoading(true);
      try {
        const nextDueDate = calculateNextDueDate(
          form.startDate,
          form.frequency,
          form.dayOfMonth
        );

        const payload = {
          clientName: form.clientName.trim(),
          description: form.description.trim(),
          amount: Number(form.amount),
          frequency: form.frequency,
          startDate: form.startDate,
          endDate: form.endDate || null,
          dayOfMonth: form.frequency === 'monthly' ? form.dayOfMonth : null,
          method: form.method,
          status: 'Ativa' as const,
          nextDueDate,
          autoGenerate: true,
        };

        if (editingId) {
          onUpdateRecurring(editingId, payload);
          setEditingId(null);
        } else {
          onAddRecurring(payload);
        }

        // Reset form
        setForm({
          clientName: '',
          description: '',
          amount: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          dayOfMonth: new Date().getDate(),
          method: 'Recorrência',
        });

        setShowModal(false);
        alert(
          editingId
            ? '✅ Recorrência atualizada!'
            : '✅ Recorrência criada com sucesso!'
        );
      } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao salvar recorrência');
      } finally {
        setIsLoading(false);
      }
    },
    [form, onAddRecurring, onUpdateRecurring, editingId]
  );

  const calculateNextDueDate = (
    startDate: string,
    frequency: RecurrenceFrequency,
    dayOfMonth?: number
  ): string => {
    const start = new Date(startDate);
    const today = new Date();
    let nextDate = new Date(start);

    switch (frequency) {
      case 'daily':
        while (nextDate <= today) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
      case 'weekly':
        while (nextDate <= today) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
      case 'monthly':
        nextDate = new Date(today);
        nextDate.setDate(dayOfMonth || start.getDate());
        if (nextDate <= today) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;
      case 'yearly':
        nextDate = new Date(today);
        nextDate.setMonth(start.getMonth());
        nextDate.setDate(start.getDate());
        if (nextDate <= today) {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        break;
    }

    return nextDate.toISOString().split('T')[0];
  };

  const frequencyLabels = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente',
  };

  const activeRecurring = useMemo(
    () => recurringTransactions.filter((r) => r.status === 'Ativa'),
    [recurringTransactions]
  );

  const monthlyRevenue = useMemo(
    () =>
      activeRecurring
        .filter((r) => r.frequency === 'monthly' || r.frequency === 'yearly')
        .reduce((acc, r) => acc + r.amount, 0),
    [activeRecurring]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Receita Recorrente
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {activeRecurring.length} recorrências ativas
            </p>
          </div>
          <div className="text-right">
            <p className="text-purple-400 text-sm uppercase font-bold">
              Mensal
            </p>
            <p className="text-2xl font-bold text-white font-mono">
              {formatCurrency(monthlyRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              clientName: '',
              description: '',
              amount: '',
              frequency: 'monthly',
              startDate: new Date().toISOString().split('T')[0],
              endDate: '',
              dayOfMonth: new Date().getDate(),
              method: 'Recorrência',
            });
            setShowModal(true);
          }}
          className="bg-neon-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Recorrência
        </button>
      </div>

      {/* Recurring Transactions List */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal-950/50 text-slate-400 uppercase text-xs border-b border-charcoal-800">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Frequência</th>
                <th className="p-4">Próx. Cobrança</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {recurringTransactions.length > 0 ? (
                recurringTransactions.map((recurring) => (
                  <tr
                    key={recurring.id}
                    className="hover:bg-charcoal-800/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-white">
                      {recurring.clientName}
                    </td>
                    <td className="p-4 text-slate-400">
                      {recurring.description}
                    </td>
                    <td className="p-4 font-bold text-white font-mono">
                      {formatCurrency(recurring.amount)}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400">
                        {frequencyLabels[recurring.frequency]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300">
                        {formatDate(recurring.nextDueDate)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          recurring.status === 'Ativa'
                            ? 'bg-green-400/10 text-green-400'
                            : recurring.status === 'Pausada'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-slate-400/10 text-slate-400'
                        }`}
                      >
                        {recurring.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {recurring.status === 'Ativa' ? (
                          <button
                            onClick={() =>
                              onUpdateRecurring(recurring.id, {
                                status: 'Pausada',
                              })
                            }
                            className="text-yellow-400 hover:bg-yellow-400/10 p-2 rounded-lg transition-colors"
                            title="Pausar"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onUpdateRecurring(recurring.id, {
                                status: 'Ativa',
                              })
                            }
                            className="text-green-400 hover:bg-green-400/10 p-2 rounded-lg transition-colors"
                            title="Retomar"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(recurring.id);
                            setForm({
                              clientName: recurring.clientName,
                              description: recurring.description,
                              amount: recurring.amount.toString(),
                              frequency: recurring.frequency,
                              startDate: recurring.startDate,
                              endDate: recurring.endDate || '',
                              dayOfMonth: recurring.dayOfMonth || new Date().getDate(),
                              method: recurring.method,
                            });
                            setShowModal(true);
                          }}
                          className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Tem certeza que deseja deletar esta recorrência?'
                              )
                            ) {
                              onDeleteRecurring(recurring.id);
                            }
                          }}
                          className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    📭 Nenhuma recorrência criada ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="p-6 border-b border-charcoal-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Editar Recorrência' : 'Nova Recorrência'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    placeholder="Ex: Empresa XYZ"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    placeholder="Ex: Mensalidade Automação"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    placeholder="0,00"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Frequência *
                  </label>
                  <select
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frequency: e.target.value as RecurrenceFrequency,
                      })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    disabled={isLoading}
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                    <option value="yearly">Anualmente</option>
                  </select>
                </div>
              </div>

              {form.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dia do Mês
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dayOfMonth}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dayOfMonth: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Fim (Opcional)
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                {isLoading
                  ? 'Salvando...'
                  : editingId
                  ? 'Atualizar Recorrência'
                  : 'Criar Recorrência'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactionsManager;
