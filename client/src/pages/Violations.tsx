import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Send } from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { getViolations, classifyViolation } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import AIBadge from '../components/common/AIBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { ViolationClassification, ViolationSeverity } from '../types';

export default function Violations() {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classifyText, setClassifyText] = useState('');
  const [classification, setClassification] = useState<ViolationClassification | null>(null);

  const { data: violations, loading, error, refetch } = useApi(
    () => getViolations({ severity: severityFilter, status: statusFilter }),
    [severityFilter, statusFilter]
  );

  const { loading: classifying, mutate: doClassify } = useMutation(classifyViolation);

  const handleClassify = async () => {
    if (!classifyText.trim()) return;
    try {
      const result = await doClassify(classifyText);
      setClassification(result);
    } catch {
      // error handled by useMutation
    }
  };

  const severities: ViolationSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-mt-dark-green">{t('violations.title')}</h1>

      {/* AI Classification Tool */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Sparkles size={20} className="text-mt-purple" />
          <div>
            <h2 className="font-bold text-mt-dark-green">{t('violations.classify')}</h2>
            <p className="text-sm text-mt-grey">{t('violations.classifyDesc')}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <textarea
              value={classifyText}
              onChange={(e) => setClassifyText(e.target.value)}
              placeholder={t('violations.description')}
              rows={3}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-mt-aqua resize-none"
              dir="auto"
            />
            <button
              onClick={handleClassify}
              disabled={classifying || !classifyText.trim()}
              className="btn-primary self-end flex items-center gap-2"
            >
              {classifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('violations.classifying')}
                </>
              ) : (
                <>
                  <Send size={14} />
                  {t('violations.classifyBtn')}
                </>
              )}
            </button>
          </div>

          {classification && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <AIBadge />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-mt-grey">{t('violations.category')}</p>
                  <p className="font-bold capitalize">{classification.category}</p>
                </div>
                <div>
                  <p className="text-xs text-mt-grey">{t('violations.severity')}</p>
                  <RiskBadge level={classification.severity} />
                </div>
                <div>
                  <p className="text-xs text-mt-grey">{t('violations.article')}</p>
                  <p className="font-bold">{classification.regulatoryArticle}</p>
                </div>
                <div>
                  <p className="text-xs text-mt-grey">{t('violations.penalty')}</p>
                  <p className="font-bold">{classification.penaltyRecommendation}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-mt-grey mb-1">English Description</p>
                  <p className="text-sm">{classification.descriptionEn}</p>
                </div>
                <div>
                  <p className="text-xs text-mt-grey mb-1">الوصف بالعربية</p>
                  <p className="text-sm" dir="rtl">{classification.descriptionAr}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
        >
          <option value="">{t('common.all')} {t('violations.severity')}</option>
          {severities.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="appealed">Appealed</option>
        </select>
      </div>

      {/* Violations Table */}
      {loading ? (
        <LoadingSpinner message={t('common.loading')} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">{t('violations.date')}</th>
                <th className="table-header">{t('violations.facility')}</th>
                <th className="table-header">{t('violations.category')}</th>
                <th className="table-header">{t('violations.severity')}</th>
                <th className="table-header">Description</th>
                <th className="table-header">Status</th>
                <th className="table-header">{t('violations.penalty')}</th>
              </tr>
            </thead>
            <tbody>
              {(violations || []).map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="table-cell text-xs">{new Date(v.date).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className="text-sm font-bold text-mt-dark-green">
                      {v.facility?.nameEn || v.facilityId}
                    </span>
                  </td>
                  <td className="table-cell capitalize">{v.type.replace(/_/g, ' ')}</td>
                  <td className="table-cell"><RiskBadge level={v.severity} /></td>
                  <td className="table-cell max-w-xs truncate text-sm">{v.description}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      v.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      v.status === 'appealed' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {v.penalty ? `SAR ${v.penalty.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!violations || violations.length === 0) && (
            <p className="text-center text-mt-grey py-8">{t('common.noData')}</p>
          )}
        </div>
      )}
    </div>
  );
}
