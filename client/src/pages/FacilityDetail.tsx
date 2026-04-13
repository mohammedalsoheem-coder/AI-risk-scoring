import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { getFacility, triggerRiskScore, getFacilityTimeline } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import AIBadge from '../components/common/AIBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { RiskAnalysis } from '../types';

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [aiAnalysis, setAiAnalysis] = useState<RiskAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inspections' | 'violations' | 'complaints'>('inspections');

  const { data: facility, loading, error, refetch } = useApi(() => getFacility(id!), [id]);
  const { data: timeline } = useApi(() => getFacilityTimeline(id!), [id]);

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await triggerRiskScore(id!);
      setAiAnalysis(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate analysis');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!facility) return null;

  const trendIcon = {
    improving: <TrendingUp size={16} className="text-green-500" />,
    declining: <TrendingDown size={16} className="text-red-500" />,
    stable: <Minus size={16} className="text-yellow-500" />,
  };

  const radarData = aiAnalysis
    ? [
        { metric: t('facility.safetyCompliance'), value: aiAnalysis.scoreBreakdown.safetyCompliance },
        { metric: t('facility.serviceQuality'), value: aiAnalysis.scoreBreakdown.serviceQuality },
        { metric: t('facility.documentation'), value: aiAnalysis.scoreBreakdown.documentation },
        { metric: t('facility.repeatBehavior'), value: aiAnalysis.scoreBreakdown.repeatBehavior },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/facilities" className="text-mt-grey hover:text-mt-dark-green">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-mt-dark-green">{facility.nameEn}</h1>
          <p className="text-mt-grey">{facility.nameAr}</p>
        </div>
        <RiskBadge level={facility.riskLevel} />
      </div>

      {/* Facility Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-xs text-mt-grey mb-1">{t('facilities.type')}</p>
          <p className="font-bold capitalize">{facility.type} — {facility.classification}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-mt-grey mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
          <p className="font-bold">{facility.city}, {facility.region}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-mt-grey mb-1 flex items-center gap-1"><FileText size={12} /> License</p>
          <p className="font-bold">{facility.licenseNumber}</p>
          <p className="text-xs text-mt-grey">Expires: {new Date(facility.licenseExpiry).toLocaleDateString()}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-mt-grey mb-1">{t('facilities.riskScore')}</p>
          <p className="text-3xl font-bold text-mt-dark-green">{facility.riskScore.toFixed(0)}</p>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-mt-purple" />
            <h2 className="text-lg font-bold text-mt-dark-green">{t('facility.aiAnalysis')}</h2>
          </div>
          <button
            onClick={handleAIAnalysis}
            disabled={aiLoading}
            className="btn-primary flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('facility.analyzing')}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {t('facility.generateAnalysis')}
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm">{aiError}</div>
        )}

        {aiAnalysis && (
          <div className="p-6 space-y-6">
            <AIBadge />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Narrative */}
              <div>
                <h3 className="font-bold text-mt-dark-green mb-2">Risk Assessment</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis.narrative}</p>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-mt-grey mb-1" dir="rtl">{aiAnalysis.arabicSummary}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-bold">{t('facility.trend')}:</span>
                  {trendIcon[aiAnalysis.trend]}
                  <span className="text-sm capitalize">{t(`facility.${aiAnalysis.trend}`)}</span>
                </div>
              </div>

              {/* Radar Chart */}
              <div>
                <h3 className="font-bold text-mt-dark-green mb-2">{t('facility.riskBreakdown')}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      dataKey="value"
                      stroke="#003232"
                      fill="#009696"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risks & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-mt-dark-green mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} /> {t('facility.topRisks')}
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.topRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-mt-dark-green mb-2">{t('facility.recommendations')}</h3>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Trend Chart */}
      {timeline && timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-mt-dark-green mb-4">{t('facility.timeline')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#009696"
                strokeWidth={2}
                dot={{ fill: '#003232', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs: Inspections / Violations / Complaints */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 flex">
          {(['inspections', 'violations', 'complaints'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-colors ${
                activeTab === tab
                  ? 'text-mt-dark-green border-b-2 border-mt-mid-green'
                  : 'text-mt-grey hover:text-mt-dark-green'
              }`}
            >
              {t(`facility.${tab === 'inspections' ? 'inspectionHistory' : tab === 'violations' ? 'violationHistory' : 'complaintHistory'}`)}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {facility[tab]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'inspections' && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Inspector</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {(facility.inspections || []).map((insp) => (
                  <tr key={insp.id} className="hover:bg-gray-50">
                    <td className="table-cell">{new Date(insp.date).toLocaleDateString()}</td>
                    <td className="table-cell">{insp.inspectorId}</td>
                    <td className="table-cell font-bold">{insp.score.toFixed(0)}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        insp.status === 'completed' ? 'bg-green-100 text-green-800' :
                        insp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'violations' && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Severity</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Penalty</th>
                </tr>
              </thead>
              <tbody>
                {(facility.violations || []).map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="table-cell">{new Date(v.date).toLocaleDateString()}</td>
                    <td className="table-cell capitalize">{v.type.replace(/_/g, ' ')}</td>
                    <td className="table-cell">
                      <RiskBadge level={v.severity as any} />
                    </td>
                    <td className="table-cell max-w-xs truncate">{v.description}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        v.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        v.status === 'appealed' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="table-cell">{v.penalty ? `SAR ${v.penalty.toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'complaints' && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Source</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Severity</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {(facility.complaints || []).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="table-cell">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="table-cell uppercase text-xs font-bold">{c.source}</td>
                    <td className="table-cell capitalize">{c.category.replace(/_/g, ' ')}</td>
                    <td className="table-cell"><RiskBadge level={c.severity as any} /></td>
                    <td className="table-cell max-w-xs truncate">{c.description}</td>
                    <td className="table-cell capitalize">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
