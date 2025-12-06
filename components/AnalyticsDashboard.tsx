import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  Zap,
  Target,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Transaction, Project, Lead } from '../types';

interface AnalyticsDashboardProps {
  projects: Project[];
  leads: Lead[];
  transactions: Transaction[];
}

const COLORS = {
  primary: '#32b8c6',
  secondary: '#8855f7',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
  unit = '',
}: any) => (
  <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl hover:border-charcoal-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg} ${color.text}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
          trend > 0
            ? 'bg-green-500/10 text-green-400'
            : trend < 0
            ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-slate-400'
        }`}
      >
        <TrendingUp className="w-3 h-3" />
        {trend > 0 ? '+' : ''}
        {trend}%
      </span>
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">
      {value}
      {unit && <span className="text-lg text-slate-400 ml-1">{unit}</span>}
    </h3>
    <p className="text-slate-500 text-sm">{label}</p>
  </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projects = [],
  leads = [],
  transactions = [],
}) => {
  console.log('Dashboard recebeu:', { projects, leads, transactions });

  // Calcular todas as métricas
  const metrics = useMemo(() => {
    // === PROJETOS ===
    const totalProjects = projects.length;
    const completedProjects = projects.filter(
      (p) => p.status === 'Finalizado'
    ).length;
    const activeProjects = projects.filter(
      (p) => p.status === 'Em andamento'
    ).length;
    const pausedProjects = projects.filter(
      (p) => p.status === 'Pausado'
    ).length;

    const totalProjectValue = projects.reduce((acc, p) => acc + (p.value || 0), 0);
    const completedProjectValue = projects
      .filter((p) => p.status === 'Finalizado')
      .reduce((acc, p) => acc + (p.value || 0), 0);

    // === LEADS ===
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'Novo').length;
    const qualifiedLeads = leads.filter(
      (l) => l.status === 'Qualificado'
    ).length;
    const proposalLeads = leads.filter(
      (l) => l.status === 'Proposta Enviada'
    ).length;
    const negotiationLeads = leads.filter(
      (l) => l.status === 'Negociação'
    ).length;
    const closedLeads = leads.filter(
      (l) => l.status === 'Fechado'
    ).length;
    const lostLeads = leads.filter((l) => l.status === 'Perdido').length;

    const totalLeadsValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
    const qualifiedLeadsValue = leads
      .filter((l) => l.status === 'Qualificado')
      .reduce((acc, l) => acc + (l.value || 0), 0);

    const hotLeads = leads.filter((l) => l.warmth === 'Quente').length;
    const warmLeads = leads.filter((l) => l.warmth === 'Morno').length;
    const coldLeads = leads.filter((l) => l.warmth === 'Frio').length;

    // === FINANCEIRO ===
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

    const paidTransactions = transactions.filter(
      (t) => t.status === 'Pago'
    );
    const totalPaid = paidTransactions.reduce(
      (acc, t) => acc + (t.amount || 0),
      0
    );

    const openTransactions = transactions.filter(
      (t) => t.status !== 'Pago'
    );
    const totalOpen = openTransactions.reduce(
      (acc, t) => acc + (t.amount || 0),
      0
    );

    const overdue = transactions.filter(
      (t) => t.status === 'Atrasado'
    );
    const totalOverdue = overdue.reduce((acc, t) => acc + (t.amount || 0), 0);

    const upcoming = transactions.filter(
      (t) => t.status === 'A vencer'
    );
    const totalUpcoming = upcoming.reduce(
      (acc, t) => acc + (t.amount || 0),
      0
    );

    // Métodos de pagamento
    const pixTransactions = transactions.filter((t) => t.method === 'PIX').length;
    const cardTransactions = transactions.filter((t) => t.method === 'Cartão').length;
    const boletoTransactions = transactions.filter(
      (t) => t.method === 'Boleto'
    ).length;
    const recurringTransactions = transactions.filter(
      (t) => t.method === 'Recorrência'
    ).length;

    // === CÁLCULOS DERIVADOS ===
    const conversionRate =
      totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0';

    const projectCompletionRate =
      totalProjects > 0
        ? ((completedProjects / totalProjects) * 100).toFixed(1)
        : '0';

    const leadQualificationRate =
      totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : '0';

    const paymentReceiptRate =
      totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : '0';

    // Tendências
    const projectTrend = completedProjects > 0 ? 12 : -5;
    const leadTrend = newLeads > 0 ? 18 : -3;
    const revenueTrend = totalPaid > 0 ? 22 : -8;
    const conversionTrend = parseFloat(conversionRate) > 30 ? 15 : -5;

    return {
      // Projetos
      totalProjects,
      completedProjects,
      activeProjects,
      pausedProjects,
      totalProjectValue,
      completedProjectValue,
      projectCompletionRate,
      projectTrend,

      // Leads
      totalLeads,
      newLeads,
      qualifiedLeads,
      proposalLeads,
      negotiationLeads,
      closedLeads,
      lostLeads,
      totalLeadsValue,
      qualifiedLeadsValue,
      hotLeads,
      warmLeads,
      coldLeads,
      leadQualificationRate,
      leadTrend,

      // Financeiro
      totalTransactions,
      totalRevenue,
      totalPaid,
      totalOpen,
      totalOverdue,
      totalUpcoming,
      pixTransactions,
      cardTransactions,
      boletoTransactions,
      recurringTransactions,
      paymentReceiptRate,
      revenueTrend,
      conversionRate,
      conversionTrend,
    };
  }, [projects, leads, transactions]);

  // Dados para gráfico de atividade semanal
  const weeklyActivityData = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const today = new Date();

    return days.map((day, idx) => {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - (6 - idx));
      targetDate.setHours(0, 0, 0, 0);

      const dayProjects = projects.filter((p) => {
        const createdDate = new Date(p.startDate);
        createdDate.setHours(0, 0, 0, 0);
        return (
          createdDate.getTime() === targetDate.getTime() &&
          p.status === 'Finalizado'
        );
      }).length;

      const dayLeads = leads.filter((l) => {
        const createdDate = new Date(l.dateAdded);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === targetDate.getTime();
      }).length;

      return {
        name: day,
        projetos: dayProjects,
        leads: dayLeads,
      };
    });
  }, [projects, leads]);

  // Dados para pipeline de receita
  const revenuePipelineData = useMemo(() => {
    const statusMap: Record<string, number> = {
      'Em dia': 0,
      'A vencer': 0,
      'Atrasado': 0,
      'Pago': 0,
    };

    transactions.forEach((t) => {
      if (statusMap.hasOwnProperty(t.status)) {
        statusMap[t.status] += t.amount || 0;
      }
    });

    return Object.entries(statusMap).map(([status, valor]) => ({
      status,
      valor: Math.round(valor),
    }));
  }, [transactions]);

  // Distribuição por método
  const methodDistribution = useMemo(() => {
    const methods: Record<string, number> = {
      PIX: 0,
      Cartão: 0,
      Boleto: 0,
      Recorrência: 0,
    };

    transactions.forEach((t) => {
      if (methods.hasOwnProperty(t.method)) {
        methods[t.method] += t.amount || 0;
      }
    });

    return Object.entries(methods)
      .filter(([_, value]) => value > 0)
      .map(([method, value]) => ({
        name: method,
        value: Math.round(value),
      }));
  }, [transactions]);

  // Distribuição de leads por status
  const leadStatusData = useMemo(() => {
    const statuses = [
      'Novo',
      'Qualificado',
      'Proposta Enviada',
      'Negociação',
      'Fechado',
      'Perdido',
    ];

    return statuses.map((status) => {
      const count = leads.filter((l) => l.status === status).length;
      return {
        name: status,
        count,
      };
    });
  }, [leads]);

  // Histórico de receita
  const revenueHistoryData = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayRevenue = transactions
        .filter((t) => {
          const txDate = new Date(t.dueDate);
          txDate.setHours(0, 0, 0, 0);
          return txDate.getTime() === date.getTime();
        })
        .reduce((acc, t) => acc + (t.amount || 0), 0);

      const dayPaid = transactions
        .filter(
          (t) =>
            t.status === 'Pago' &&
            new Date(t.paidDate || '').getTime() !== 0 &&
            new Date(t.paidDate || '').toDateString() === date.toDateString()
        )
        .reduce((acc, t) => acc + (t.amount || 0), 0);

      days.push({
        date: date.toLocaleDateString('pt-BR', {
          month: '2-digit',
          day: '2-digit',
        }),
        receita: Math.round(dayRevenue),
        pago: Math.round(dayPaid),
      });
    }

    return days;
  }, [transactions]);

  // Status dos projetos
  const projectStatusData = useMemo(() => {
    return [
      {
        name: 'Em andamento',
        count: metrics.activeProjects,
      },
      {
        name: 'Finalizado',
        count: metrics.completedProjects,
      },
      {
        name: 'Pausado',
        count: metrics.pausedProjects,
      },
    ];
  }, [metrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-charcoal-950">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          📊 Dashboard Executivo
        </h1>
        <p className="text-slate-400">
          Visão consolidada de projetos, leads e receita - {projects.length} projetos | {leads.length} leads | {transactions.length} transações
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={Target}
          label="Receita Total"
          value={formatCurrency(metrics.totalRevenue)}
          trend={metrics.revenueTrend}
          color={{ bg: 'bg-green-500', text: 'text-green-500' }}
        />
        <StatCard
          icon={DollarSign}
          label="Já Recebido"
          value={formatCurrency(metrics.totalPaid)}
          trend={metrics.revenueTrend}
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
        />
        <StatCard
          icon={AlertCircle}
          label="Pendente de Recebimento"
          value={formatCurrency(metrics.totalOpen)}
          trend={-5}
          color={{ bg: 'bg-yellow-500', text: 'text-yellow-500' }}
        />
        <StatCard
          icon={AlertCircle}
          label="Em Atraso"
          value={formatCurrency(metrics.totalOverdue)}
          trend={-15}
          color={{ bg: 'bg-red-500', text: 'text-red-500' }}
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={CheckCircle}
          label="Projetos Concluídos"
          value={metrics.completedProjects}
          trend={metrics.projectTrend}
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }}
          unit={`de ${metrics.totalProjects}`}
        />
        <StatCard
          icon={Zap}
          label="Projetos em Andamento"
          value={metrics.activeProjects}
          trend={8}
          color={{ bg: 'bg-cyan-500', text: 'text-cyan-500' }}
        />
        <StatCard
          icon={Users}
          label="Leads Qualificados"
          value={metrics.qualifiedLeads}
          trend={metrics.leadTrend}
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }}
          unit={`de ${metrics.totalLeads}`}
        />
        <StatCard
          icon={Target}
          label="Taxa de Conversão"
          value={metrics.conversionRate}
          trend={metrics.conversionTrend}
          color={{ bg: 'bg-orange-500', text: 'text-orange-500' }}
          unit="%"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Pipeline */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Pipeline de Receita por Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenuePipelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2e"
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c1f',
                    border: '1px solid #2a2a2e',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar
                  dataKey="valor"
                  name="Valor"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Distribuição por Método
          </h3>
          <div className="h-80">
            {methodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodDistribution}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {methodDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            COLORS.primary,
                            COLORS.secondary,
                            COLORS.success,
                            COLORS.warning,
                          ][index % 4]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1c1f',
                      border: '1px solid #2a2a2e',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>
          {methodDistribution.length > 0 && (
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {methodDistribution.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: [
                        COLORS.primary,
                        COLORS.secondary,
                        COLORS.success,
                        COLORS.warning,
                      ][index % 4],
                    }}
                  ></div>
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue History */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Histórico de Receita (7 Dias)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistoryData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPago" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2e"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c1f',
                    border: '1px solid #2a2a2e',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                  name="Receita Total"
                />
                <Area
                  type="monotone"
                  dataKey="pago"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorPago)"
                  name="Já Recebido"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Atividade Semanal
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2e"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c1f',
                    border: '1px solid #2a2a2e',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar
                  dataKey="projetos"
                  name="Projetos Finalizados"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="leads"
                  name="Novos Leads"
                  fill={COLORS.secondary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Distribuição de Leads por Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadStatusData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2e"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c1f',
                    border: '1px solid #2a2a2e',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar
                  dataKey="count"
                  name="Quantidade"
                  fill={COLORS.secondary}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">📈 Insights Principais</h3>
          <div className="space-y-4">
            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-slate-400">Receita em Aberto</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(metrics.totalOpen)}
              </p>
              <p className="text-xs text-green-400/70 mt-1">
                {metrics.totalTransactions - metrics.totalPaid?.length} transações pendentes
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-slate-400">Valor em Atraso</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatCurrency(metrics.totalOverdue)}
              </p>
              <p className="text-xs text-red-400/70 mt-1">
                ⚠️ {metrics.totalOverdue > 0 ? 'Ação necessária' : 'Nenhum atraso'}
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-slate-400">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {metrics.conversionRate}%
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {metrics.closedLeads} de {metrics.totalLeads} leads convertidos
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-slate-400">Taxa de Conclusão de Projetos</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {metrics.projectCompletionRate}%
              </p>
              <p className="text-xs text-purple-400/70 mt-1">
                {metrics.completedProjects} de {metrics.totalProjects} finalizados
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-cyan-500">
              <p className="text-sm text-slate-400">Leads Quentes</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {metrics.hotLeads}
              </p>
              <p className="text-xs text-cyan-400/70 mt-1">
                {metrics.warmLeads} mornos + {metrics.coldLeads} frios
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
