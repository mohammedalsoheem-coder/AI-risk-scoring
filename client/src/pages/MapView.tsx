import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getHeatmapData } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { GeoFacility, RiskLevel } from '../types';

// Dynamically import Leaflet to avoid SSR issues
let L: any = null;

export default function MapView() {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<GeoFacility | null>(null);

  const { data, loading, error, refetch } = useApi(
    () => getHeatmapData({ riskLevel: riskFilter }),
    [riskFilter]
  );

  useEffect(() => {
    // Dynamic import of Leaflet
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      L = await import('leaflet');

      // Saudi Arabia center
      const map = L.map(mapRef.current).setView([24.7136, 46.6753], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !data || !L) return;

    const map = mapInstanceRef.current;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer: any) => {
      if (!layer._url) map.removeLayer(layer);
    });

    // Re-add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const riskColors: Record<string, string> = {
      Low: '#32d2a0',
      Medium: '#f59e0b',
      High: '#f97316',
      Critical: '#ef4444',
    };

    // Add facility markers
    data.facilities.forEach((facility: GeoFacility) => {
      const color = riskColors[facility.riskLevel] || '#556478';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 10px; font-weight: bold;
        ">${facility.riskScore.toFixed(0)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([facility.lat, facility.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 4px; font-size: 14px; color: #003232;">${facility.nameEn}</h3>
          <p style="margin: 0 0 8px; font-size: 12px; color: #556478;" dir="rtl">${facility.nameAr}</p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: ${color}20; color: ${color}; font-weight: bold;">
              ${facility.riskLevel} (${facility.riskScore.toFixed(0)})
            </span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #f3f4f6; color: #556478;">
              ${facility.type}
            </span>
          </div>
          <p style="margin: 0; font-size: 11px; color: #556478;">
            ${facility.city}, ${facility.region} | Violations: ${facility.violationCount}
          </p>
          <a href="/facilities/${facility.id}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #009696; font-weight: bold; text-decoration: none;">
            View Details →
          </a>
        </div>
      `);

      marker.on('click', () => setSelectedFacility(facility));
    });

    // Add heatmap circles for violation density
    data.heatmap.forEach((point) => {
      L.circle([point.lat, point.lng], {
        radius: point.intensity * 5000,
        color: 'transparent',
        fillColor: '#ef4444',
        fillOpacity: 0.15 + (point.intensity / 100) * 0.3,
      }).addTo(map);
    });
  }, [data]);

  const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mt-dark-green">{t('map.title')}</h1>
        <div className="flex gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mt-aqua"
          >
            <option value="">{t('common.all')} Risk Levels</option>
            {riskLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner message={t('common.loading')} />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div ref={mapRef} className="h-[600px] w-full" />
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-bold text-mt-dark-green mb-3">Facilities ({data?.facilities.length || 0})</h3>
          <div className="space-y-2">
            {(data?.facilities || []).map((f) => (
              <Link
                key={f.id}
                to={`/facilities/${f.id}`}
                className={`block p-3 rounded-lg border transition-colors ${
                  selectedFacility?.id === f.id
                    ? 'border-mt-aqua bg-mt-aqua/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="text-sm font-bold text-mt-dark-green truncate">{f.nameEn}</p>
                <p className="text-xs text-mt-grey">{f.city}</p>
                <div className="flex items-center justify-between mt-1">
                  <RiskBadge level={f.riskLevel} />
                  <span className="text-xs text-mt-grey">{f.violationCount} violations</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-6">
        <span className="text-sm font-bold text-mt-grey">Legend:</span>
        {[
          { level: 'Low', color: '#32d2a0' },
          { level: 'Medium', color: '#f59e0b' },
          { level: 'High', color: '#f97316' },
          { level: 'Critical', color: '#ef4444' },
        ].map((item) => (
          <div key={item.level} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: item.color, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
            />
            <span className="text-xs">{item.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
