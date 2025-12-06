import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  Zap,
} from 'lucide-react';
import { Project, Lead, Transaction } from '../types';
import AnalyticsDashboard from './AnalyticsDashboard';

interface DashboardHomeProps {
  projects: Project[];
  leads: Lead[];
  transactions: Transaction[];
}

const StatCard = ({ icon: Icon, label, value, subtext, color, trend }: any) => (
  <div className="bg-charcoal-900 border border-charcoal-800 p-4 md:p-6 rounded-2xl hover:border-charcoal-700 transition-colors group">
    <div className="flex justify-between items-start mb-3 md:mb-4">
      <div className={`p-2 md:p-3 rounded-lg bg-opacity-10 ${color.bg} ${color.text}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            trend > 0
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          {trend > 0 ? '+' : ''}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-xl md:text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-slate-500 text-xs md:text-sm">{label}</p>
    {subtext && (
      <p className="text-[10px] md:text-xs text-slate-600 mt-2">{subtext}</p>
    )}
  </div>
);

const DashboardHome: React.FC<DashboardHomeProps> = ({
  projects = [],
  leads = [],
  transactions = [],
}) => {
  // Calcular todas as métricas
  const metrics = useMemo(() => {
    // === RECEITA ===
    const realRevenue = transactions
      .filter((t) => t.status === 'Pago')
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const openDebt = transactions
      .filter((t) => t.status !== 'Pago')
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const totalRevenue = transactions.reduce(
      (acc, t) => acc + (t.amount || 0),
      0
    );

    const overdue = transactions
      .filter((t) => t.status === 'Atrasado')
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    // === LEADS ===
    const closedLeads = leads.filter((l) => l.status === 'Fechado');
    const conversionRate =
      leads.length > 0
        ? ((closedLeads.length / leads.length) * 100).toFixed(1)
        : '0';
    const avgTicket = closedLeads.length > 0 ? realRevenue / closedLeads.length : 0;

    const qualifiedLeads = leads.filter((l) => l.status === 'Qualificado').length;
    const hotLeads = leads.filter((l) => l.warmth === 'Quente').length;

    // === PROJETOS ===
    const activeProjects = projects.filter(
      (p) => p.status === 'Em andamento'
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === 'Finalizado'
    ).length;

    const projectCompletionRate =
      projects.length > 0
        ? ((completedProjects / projects.length) * 100).toFixed(0)
        : '0';

    const totalProjectValue = projects.reduce((acc, p) => acc + (p.value || 0), 0);

    // === TENDÊNCIAS ===
    const revenueTrend = realRevenue > 0 ? 18 : -5;
    const leadTrend = qualifiedLeads > 0 ? 12 : -3;
    const projectTrend = completedProjects > 0 ? 15 : -8;

    return {
      realRevenue,
      openDebt,
      totalRevenue,
      overdue,
      totalLeads: leads.length,
      closedLeads: closedLeads.length,
      conversionRate,
      avgTicket,
      qualifiedLeads,
      hotLeads,
      activeProjects,
      completedProjects,
      projectCompletionRate,
      totalProjectValue,
      revenueTrend,
      leadTrend,
      projectTrend,
    };
  }, [projects, leads, transactions]);

  // Dados para gráfico de origem de leads
  const originData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.origin || 'Outro'] = (counts[l.origin || 'Outro'] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // Dados para gráfico de status de leads
  const leadStatusData = useMemo(() => {
    const statuses = [
      'Novo',
      'Qualificado',
      'Proposta Enviada',
      'Negociação',
      'Fechado',
      'Perdido',
    ];
    return statuses
      .map((status) => ({
        name: status,
        count: leads.filter((l) => l.status === status).length,
      }))
      .filter((s) => s.count > 0);
  }, [leads]);

  // Dados para gráfico de receita semanal
  const weeklyRevenueData = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const today = new Date();

    return days.map((day, idx) => {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - (6 - idx));
      targetDate.setHours(0, 0, 0, 0);

      const dayRevenue = transactions
        .filter((t) => {
          const txDate = new Date(t.dueDate);
          txDate.setHours(0, 0, 0, 0);
          return txDate.getTime() === targetDate.getTime();
        })
        .reduce((acc, t) => acc + (t.amount || 0), 0);

      const dayPaid = transactions
        .filter(
          (t) =>
            t.status === 'Pago' &&
            t.paidDate &&
            new Date(t.paidDate).toDateString() === targetDate.toDateString()
        )
        .reduce((acc, t) => acc + (t.amount || 0), 0);

      return {
        date: day,
        receita: Math.round(dayRevenue),
        pago: Math.round(dayPaid),
      };
    });
  }, [transactions]);

  const COLORS = ['#32b8c6', '#8855f7', '#3b82f6', '#f472b6', '#22c55e', '#f59e0b'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-charcoal-950">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          📊 Dashboard Executivo
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Visão completa de receita, leads e projetos
        </p>
      </div>

      {/* KPI Stats - Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={DollarSign}
          label="Receita Recebida"
          value={formatCurrency(metrics.realRevenue)}
          subtext="Confirmadas"
          trend={metrics.revenueTrend}
          color={{ bg: 'bg-green-500', text: 'text-green-500' }}
        />
        <StatCard
          icon={AlertTriangle}
          label="Pendente"
          value={formatCurrency(metrics.openDebt)}
          subtext={`Atraso: ${formatCurrency(metrics.overdue)}`}
          trend={-8}
          color={{ bg: 'bg-red-500', text: 'text-red-500' }}
        />
        <StatCard
          icon={Users}
          label="Total de Leads"
          value={metrics.totalLeads}
          subtext={`Ticket: ${formatCurrency(metrics.avgTicket)}`}
          trend={metrics.leadTrend}
          color={{ bg: 'bg-cyan-500', text: 'text-cyan-500' }}
        />
        <StatCard
          icon={CheckCircle}
          label="Projetos Ativos"
          value={metrics.activeProjects}
          subtext={`${metrics.completedProjects} concluídos (${metrics.projectCompletionRate}%)`}
          trend={metrics.projectTrend}
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }}
        />
      </div>

      {/* KPI Stats - Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={Target}
          label="Taxa Conversão"
          value={`${metrics.conversionRate}%`}
          subtext={`${metrics.closedLeads} leads fechados`}
          color={{ bg: 'bg-orange-500', text: 'text-orange-500' }}
        />
        <StatCard
          icon={Zap}
          label="Leads Quentes"
          value={metrics.hotLeads}
          subtext={`${metrics.qualifiedLeads} qualificados`}
          color={{ bg: 'bg-amber-500', text: 'text-amber-500' }}
        />
        <StatCard
          icon={Calendar}
          label="Receita Total"
          value={formatCurrency(metrics.totalRevenue)}
          subtext={`Média: ${formatCurrency(metrics.totalRevenue / (transactions.length || 1))}`}
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
        />
        <StatCard
          icon={TrendingUp}
          label="Valor Projetos"
          value={formatCurrency(metrics.totalProjectValue)}
          subtext={`${projects.length} projetos`}
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }}
        />
      </div>

      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Origem dos Leads */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-4 md:p-6 rounded-2xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Origem dos Leads
          </h3>
          <div className="h-48 md:h-64">
            {originData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={originData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {originData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1c1f',
                      borderRadius: '8px',
                      border: '1px solid #2a2a2e',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {originData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-[10px] md:text-xs text-slate-400"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Receita Semanal */}
        <div className="lg:col-span-2 bg-charcoal-900 border border-charcoal-800 p-4 md:p-6 rounded-2xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            Receita Semanal
          </h3>
          <div className="h-48 md:h-72">
            {weeklyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenueData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#32b8c6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#32b8c6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPago" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#32b8c6"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita Esperada"
                  />
                  <Area
                    type="monotone"
                    dataKey="pago"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorPago)"
                    name="Já Recebido"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status dos Leads */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-4 md:p-6 rounded-2xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Pipeline de Leads
          </h3>
          <div className="h-64 md:h-80">
            {leadStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadStatusData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
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
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    width={95}
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
                    name="Leads"
                    fill="#8855f7"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-charcoal-900 border border-charcoal-800 p-4 md:p-6 rounded-2xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6">
            📈 Resumo Executivo
          </h3>
          <div className="space-y-4">
            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">
                Taxa de Conclusão
              </p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                {metrics.projectCompletionRate}%
              </p>
              <p className="text-xs text-green-400/70 mt-1">
                {metrics.completedProjects} de {projects.length} projetos
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">
                Conversão
              </p>
              <p className="text-2xl font-bold text-blue-400 mt-2">
                {metrics.conversionRate}%
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {metrics.closedLeads} conversões de {metrics.totalLeads} leads
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-cyan-500">
              <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">
                Ticket Médio
              </p>
              <p className="text-2xl font-bold text-cyan-400 mt-2">
                {formatCurrency(metrics.avgTicket)}
              </p>
              <p className="text-xs text-cyan-400/70 mt-1">
                Por lead convertido
              </p>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border-l-4 border-amber-500">
              <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">
                Taxa de Recebimento
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-2">
                {metrics.totalRevenue > 0
                  ? ((metrics.realRevenue / metrics.totalRevenue) * 100).toFixed(0)
                  : '0'}
                %
              </p>
              <p className="text-xs text-amber-400/70 mt-1">
                Receita recebida vs total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Analytics Dashboard */}
      <div className="mb-8">
        <AnalyticsDashboard
          projects={projects}
          leads={leads}
          transactions={transactions}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
