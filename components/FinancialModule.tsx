import React, { useState, useCallback, useMemo } from 'react';
import { Transaction, PaymentStatus } from '../types';
import { Plus, Trash2, AlertCircle, CheckCircle, Clock, Search, Filter, Download, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FinancialModuleProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
}

interface ToastNotification {
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface FilterState {
  status: PaymentStatus | 'Todos';
  searchTerm: string;
  method: string;
  dateRange: 'todos' | 'vencidos' | 'proximos7' | 'proximos30';
}

const FinancialModule: React.FC<FinancialModuleProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
}) => {
  // State Management
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<FilterState>({
    status: 'Todos',
    searchTerm: '',
    method: 'Todos',
    dateRange: 'todos',
  });

  const [newTrans, setNewTrans] = useState({
    clientName: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    method: 'PIX' as const,
    status: 'A vencer' as PaymentStatus,
  });

  // Toast notification handler
  const showToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Validação de formulário
  const validateForm = useCallback((): boolean => {
    if (!newTrans.clientName.trim()) {
      showToast('warning', 'Cliente é obrigatório');
      return false;
    }
    if (!newTrans.description.trim()) {
      showToast('warning', 'Descrição é obrigatória');
      return false;
    }
    const amount = parseFloat(newTrans.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('warning', 'Valor deve ser maior que 0');
      return false;
    }
    if (!newTrans.dueDate) {
      showToast('warning', 'Data de vencimento é obrigatória');
      return false;
    }
    return true;
  }, [newTrans, showToast]);

  // Submit form
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const transactionData = {
          clientName: newTrans.clientName.trim(),
          description: newTrans.description.trim(),
          amount: parseFloat(newTrans.amount),
          dueDate: newTrans.dueDate,
          method: newTrans.method,
          status: newTrans.status,
          clientId: '',
        };

        onAddTransaction(transactionData);

        // Reset form
        setNewTrans({
          clientName: '',
          description: '',
          amount: '',
          dueDate: new Date().toISOString().split('T')[0],
          method: 'PIX',
          status: 'A vencer',
        });

        setShowModal(false);
        showToast('success', 'Transação adicionada com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        showToast('error', 'Erro ao adicionar transação. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, onAddTransaction, showToast]
  );

  // Mark as paid
  const handleMarkAsPaid = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        if (onUpdateTransaction) {
          await onUpdateTransaction(id, {
            status: 'Pago',
            paidDate: new Date().toISOString(),
          });
        }

        showToast('success', 'Transação marcada como paga!');
      } catch (error) {
        console.error('Erro ao marcar como pago:', error);
        showToast('error', 'Erro ao atualizar status. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [onUpdateTransaction, showToast]
  );

  // Delete transaction
  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Tem certeza que deseja deletar esta transação?')) {
        return;
      }

      setIsLoading(true);
      try {
        onDeleteTransaction(id);
        showToast('success', 'Transação deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
        showToast('error', 'Erro ao deletar transação. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [onDeleteTransaction, showToast]
  );

  // Filtering & Calculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Status filter
      if (filters.status !== 'Todos' && t.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (
          !t.clientName.toLowerCase().includes(searchLower) &&
          !t.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Method filter
      if (filters.method !== 'Todos' && t.method !== filters.method) {
        return false;
      }

      // Date range filter
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.dateRange === 'vencidos') {
        if (dueDate >= today) return false;
      } else if (filters.dateRange === 'proximos7') {
        const next7Days = new Date(today);
        next7Days.setDate(next7Days.getDate() + 7);
        if (dueDate < today || dueDate > next7Days) return false;
      } else if (filters.dateRange === 'proximos30') {
        const next30Days = new Date(today);
        next30Days.setDate(next30Days.getDate() + 30);
        if (dueDate < today || dueDate > next30Days) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Financial calculations
  const metrics = useMemo(() => {
    const open = filteredTransactions.filter((t) => t.status !== 'Pago');
    const paid = filteredTransactions.filter((t) => t.status === 'Pago');
    const overdue = filteredTransactions.filter(
      (t) => t.status !== 'Pago' && new Date(t.dueDate) < new Date()
    );

    return {
      totalOpen: open.reduce((acc, t) => acc + t.amount, 0),
      totalPaid: paid.reduce((acc, t) => acc + t.amount, 0),
      totalOverdue: overdue.reduce((acc, t) => acc + t.amount, 0),
      countOpen: open.length,
      countPaid: paid.length,
      countOverdue: overdue.length,
    };
  }, [filteredTransactions]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Atrasado':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'A vencer':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Em dia':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pago':
        return <CheckCircle className="w-4 h-4" />;
      case 'Atrasado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // ✅ CORRIGIDO: Retorna status para transações pagas
  const getDaysUntilDue = (dueDate: string, status: PaymentStatus): number | string => {
    // Se já foi pago, não calcular dias
    if (status === 'Pago') {
      return 'Pago';
    }

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = [
      'Cliente',
      'Descrição',
      'Valor',
      'Vencimento',
      'Método',
      'Status',
    ];
    const rows = filteredTransactions.map((t) => [
      t.clientName,
      t.description,
      t.amount,
      formatDate(t.dueDate),
      t.method,
      t.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Arquivo exportado com sucesso!');
  }, [filteredTransactions, showToast]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-charcoal-950">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl font-medium text-white animate-in fade-in slide-in-from-right-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-yellow-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
            💰 Financeiro{' '}
            <span className="hidden md:inline text-sm font-normal text-slate-400 bg-charcoal-800 px-3 py-1 rounded-full">
              Gestão de Pagamentos
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-2">
            Controle completo de transações e fluxo de caixa
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/30 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowModal(true)}
            disabled={isLoading}
            className="bg-neon-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 md:px-6 rounded-xl font-medium shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2 transition-all text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 px-4 py-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-red-400 uppercase font-bold tracking-wider">
              Total em Aberto
            </span>
            <TrendingUp className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-400 font-mono">
            {formatCurrency(metrics.totalOpen)}
          </div>
          <p className="text-xs text-red-400/60 mt-2">{metrics.countOpen} transações</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 px-4 py-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-yellow-400 uppercase font-bold tracking-wider">
              Vencidos
            </span>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">
            {formatCurrency(metrics.totalOverdue)}
          </div>
          <p className="text-xs text-yellow-400/60 mt-2">{metrics.countOverdue} transações</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 px-4 py-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-green-400 uppercase font-bold tracking-wider">
              Pagos
            </span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-400 font-mono">
            {formatCurrency(metrics.totalPaid)}
          </div>
          <p className="text-xs text-green-400/60 mt-2">{metrics.countPaid} transações</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
            <Search className="w-3 h-3 inline mr-1" /> Buscar
          </label>
          <input
            type="text"
            placeholder="Cliente, descrição..."
            value={filters.searchTerm}
            onChange={(e) => {
              setFilters((f) => ({ ...f, searchTerm: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-blue focus:outline-none"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value as any }));
              setCurrentPage(1);
            }}
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-blue focus:outline-none"
          >
            <option>Todos</option>
            <option>Pago</option>
            <option>A vencer</option>
            <option>Em dia</option>
            <option>Atrasado</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Método</label>
          <select
            value={filters.method}
            onChange={(e) => {
              setFilters((f) => ({ ...f, method: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-blue focus:outline-none"
          >
            <option>Todos</option>
            <option>PIX</option>
            <option>Cartão</option>
            <option>Boleto</option>
            <option>Recorrência</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
            <Filter className="w-3 h-3 inline mr-1" /> Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => {
              setFilters((f) => ({ ...f, dateRange: e.target.value as any }));
              setCurrentPage(1);
            }}
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-blue focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="vencidos">Vencidos</option>
            <option value="proximos7">Próximos 7 dias</option>
            <option value="proximos30">Próximos 30 dias</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-charcoal-950/50 text-slate-500 text-xs uppercase tracking-wider border-b border-charcoal-800">
                <th className="p-4">Cliente</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Método</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => {
                  const daysUntil = getDaysUntilDue(t.dueDate, t.status);
                  const isPaid = t.status === 'Pago';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-charcoal-800/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="text-white font-medium text-sm">{t.clientName}</div>
                      </td>
                      <td className="p-4 text-slate-400 text-xs md:text-sm max-w-[200px] truncate">
                        {t.description}
                      </td>
                      <td className="p-4 text-white font-bold text-sm font-mono">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300 text-sm font-mono">
                          {formatDate(t.dueDate)}
                        </div>
                        {isPaid ? (
                          <div className="text-xs mt-1 text-green-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Pago
                          </div>
                        ) : (
                          <div
                            className={`text-xs mt-1 font-bold ${
                              typeof daysUntil === 'number' && daysUntil < 0
                                ? 'text-red-400'
                                : typeof daysUntil === 'number' && daysUntil <= 7
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`}
                          >
                            {typeof daysUntil === 'number' ? (
                              daysUntil < 0
                                ? `Vencido há ${Math.abs(daysUntil)}d`
                                : daysUntil === 0
                                ? 'Vence hoje'
                                : `Vence em ${daysUntil}d`
                            ) : (
                              daysUntil
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-xs md:text-sm">{t.method}</td>
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-1.5 w-fit px-2.5 py-1.5 rounded-lg border text-xs font-bold uppercase ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {getStatusIcon(t.status)} {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.status !== 'Pago' && (
                            <button
                              onClick={() => handleMarkAsPaid(t.id)}
                              disabled={isLoading}
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Marcar como pago"
                            >
                              ✓ Pagar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={isLoading}
                            className="text-slate-500 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Deletar transação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-slate-500 font-medium">
                      {filteredTransactions.length === 0 && transactions.length > 0
                        ? '📋 Nenhuma transação encontrada com esses filtros'
                        : '📭 Nenhuma transação registrada ainda'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-charcoal-800 px-4 py-4 flex items-center justify-between bg-charcoal-950/50">
            <span className="text-xs text-slate-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de{' '}
              {filteredTransactions.length} transações
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-slate-400 text-sm py-1.5 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Nova Transação</h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Plus className="rotate-45 w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cliente <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTrans.clientName}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, clientName: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                  placeholder="Ex: Empresa XYZ"
                  disabled={isLoading}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTrans.description}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, description: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                  placeholder="Ex: Mensalidade Automação"
                  disabled={isLoading}
                />
              </div>

              {/* Valor e Vencimento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valor (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTrans.amount}
                    onChange={(e) =>
                      setNewTrans({ ...newTrans, amount: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                    placeholder="0,00"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Vencimento <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTrans.dueDate}
                    onChange={(e) =>
                      setNewTrans({ ...newTrans, dueDate: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Método e Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Método <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newTrans.method}
                    onChange={(e) =>
                      setNewTrans({
                        ...newTrans,
                        method: e.target.value as any,
                      })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                    disabled={isLoading}
                  >
                    <option>PIX</option>
                    <option>Cartão</option>
                    <option>Boleto</option>
                    <option>Recorrência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newTrans.status}
                    onChange={(e) =>
                      setNewTrans({
                        ...newTrans,
                        status: e.target.value as PaymentStatus,
                      })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                    disabled={isLoading}
                  >
                    <option>A vencer</option>
                    <option>Em dia</option>
                    <option>Atrasado</option>
                    <option>Pago</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                {isLoading ? 'Salvando...' : 'Salvar Transação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialModule;
