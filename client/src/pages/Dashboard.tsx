import { useTranslation } from 'react-i18next';
import {
  Building2,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDashboardKPIs, getPriorityQueue } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { Facility } from '../types';

const RISK_COLORS: Record<string, string> = {
  Low: '#32d2a0',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: kpis, loading: kpisLoading, error: kpisError, refetch: refetchKpis } = useApi(getDashboardKPIs);
  const { data: queue, loading: queueLoading } = useApi(getPriorityQueue);

  if (kpisLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (kpisError) return <ErrorMessage message={kpisError} onRetry={refetchKpis} />;
  if (!kpis) return null;

  const kpiCards = [
    {
      title: t('dashboard.totalFacilities'),
      value: kpis.totalFacilities,
      icon: Building2,
      color: 'text-mt-dark-green',
      bg: 'bg-mt-light-aqua/10',
    },
    {
      title: t('dashboard.highRisk'),
      value: kpis.highRiskCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: t('dashboard.pendingInspections'),
      value: kpis.pendingInspections,
      icon: ClipboardList,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: t('dashboard.avgScore'),
      value: kpis.avgScore.toFixed(1),
      icon: TrendingUp,
      color: 'text-mt-aqua',
      bg: 'bg-mt-aqua/10',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-mt-dark-green">{t('dashboard.title')}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="kpi-card flex items-center gap-4">
            <div className={`p-3 rounded-lg ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm text-mt-grey">{kpi.title}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-mt-dark-green mb-4">
            {t('dashboard.riskDistribution')}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={kpis.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="count"
                nameKey="level"
                label={({ level, count }) => `${level}: ${count}`}
              >
                {kpis.riskDistribution.map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Score Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-mt-dark-green mb-4">
            Score Distribution by Risk Level
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={kpis.riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {kpis.riskDistribution.map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Queue */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-mt-dark-green">
            {t('dashboard.priorityQueue')}
          </h2>
          <p className="text-sm text-mt-grey mt-1">{t('dashboard.priorityDesc')}</p>
        </div>
        {queueLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">{t('facilities.name')}</th>
                  <th className="table-header">{t('facilities.type')}</th>
                  <th className="table-header">{t('facilities.region')}</th>
                  <th className="table-header">{t('facilities.riskScore')}</th>
                  <th className="table-header">{t('facilities.riskLevel')}</th>
                  <th className="table-header">{t('facilities.lastInspection')}</th>
                  <th className="table-header">{t('facilities.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {(queue || []).map((facility: Facility, idx: number) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="table-cell font-bold">{idx + 1}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-bold text-mt-dark-green">{facility.nameEn}</p>
                        <p className="text-xs text-mt-grey">{facility.nameAr}</p>
                      </div>
                    </td>
                    <td className="table-cell capitalize">{facility.type}</td>
                    <td className="table-cell">{facility.region}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{facility.riskScore.toFixed(0)}</span>
                        {facility.riskScore > 60 ? (
                          <ArrowUpRight size={14} className="text-red-500" />
                        ) : (
                          <ArrowDownRight size={14} className="text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <RiskBadge level={facility.riskLevel} />
                    </td>
                    <td className="table-cell text-xs">
                      {facility.lastInspection
                        ? new Date(facility.lastInspection).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/facilities/${facility.id}`}
                        className="text-mt-aqua hover:text-mt-mid-green text-sm font-bold"
                      >
                        {t('facilities.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
