import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getFacilities } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { RiskLevel, FacilityType } from '../types';

export default function Facilities() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState('riskScore');
  const [order, setOrder] = useState('desc');

  const { data: facilities, loading, error, refetch } = useApi(
    () => getFacilities({ search, type: typeFilter, region: regionFilter, riskLevel: riskFilter, sortBy, order }),
    [search, typeFilter, regionFilter, riskFilter, sortBy, order]
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const regions = ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'AlUla', 'NEOM', 'Abha', 'Dammam', 'Tabuk', 'Yanbu'];
  const types: FacilityType[] = ['hotel', 'resort', 'restaurant', 'attraction'];
  const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-mt-dark-green">{t('facilities.title')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('facilities.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-mt-aqua"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
          >
            <option value="">{t('common.all')} {t('facilities.type')}</option>
            {types.map((type) => (
              <option key={type} value={type}>{t(`facilities.${type}`)}</option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
          >
            <option value="">{t('common.all')} {t('facilities.region')}</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
          >
            <option value="">{t('common.all')} {t('facilities.riskLevel')}</option>
            {riskLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message={t('common.loading')} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header cursor-pointer" onClick={() => handleSort('nameEn')}>
                  <span className="flex items-center gap-1">
                    {t('facilities.name')} <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="table-header">{t('facilities.type')}</th>
                <th className="table-header">{t('facilities.region')}</th>
                <th className="table-header cursor-pointer" onClick={() => handleSort('riskScore')}>
                  <span className="flex items-center gap-1">
                    {t('facilities.riskScore')} <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="table-header">{t('facilities.riskLevel')}</th>
                <th className="table-header cursor-pointer" onClick={() => handleSort('lastInspection')}>
                  <span className="flex items-center gap-1">
                    {t('facilities.lastInspection')} <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="table-header">{t('facilities.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(facilities || []).map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <p className="font-bold text-mt-dark-green">{f.nameEn}</p>
                      <p className="text-xs text-mt-grey">{f.nameAr}</p>
                    </div>
                  </td>
                  <td className="table-cell capitalize">{t(`facilities.${f.type}`)}</td>
                  <td className="table-cell">{f.region}, {f.city}</td>
                  <td className="table-cell font-bold">{f.riskScore.toFixed(0)}</td>
                  <td className="table-cell"><RiskBadge level={f.riskLevel} /></td>
                  <td className="table-cell text-xs">
                    {f.lastInspection ? new Date(f.lastInspection).toLocaleDateString() : '—'}
                  </td>
                  <td className="table-cell">
                    <Link
                      to={`/facilities/${f.id}`}
                      className="text-mt-aqua hover:text-mt-mid-green text-sm font-bold"
                    >
                      {t('facilities.viewDetails')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!facilities || facilities.length === 0) && (
            <p className="text-center text-mt-grey py-8">{t('common.noData')}</p>
          )}
        </div>
      )}
    </div>
  );
}
