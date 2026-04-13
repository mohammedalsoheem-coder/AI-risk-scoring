import axios from 'axios';
import type {
  Facility,
  DashboardKPIs,
  RiskAnalysis,
  ViolationClassification,
  Violation,
  HeatmapPoint,
  GeoFacility,
  Inspection,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard
export const getDashboardKPIs = () =>
  api.get<DashboardKPIs>('/dashboard/kpis').then((r) => r.data);

export const getPriorityQueue = () =>
  api.get<Facility[]>('/dashboard/priority-queue').then((r) => r.data);

// Facilities
export const getFacilities = (params?: {
  search?: string;
  type?: string;
  region?: string;
  riskLevel?: string;
  sortBy?: string;
  order?: string;
}) => api.get<Facility[]>('/facilities', { params }).then((r) => r.data);

export const getFacility = (id: string) =>
  api.get<Facility>(`/facilities/${id}`).then((r) => r.data);

export const getFacilityRisk = (id: string) =>
  api.get<RiskAnalysis>(`/facilities/${id}/risk`).then((r) => r.data);

export const triggerRiskScore = (id: string) =>
  api.post<{ analysis: RiskAnalysis }>(`/facilities/${id}/score`).then((r) => r.data.analysis);

export const getFacilityTimeline = (id: string) =>
  api.get<{ month: string; avgScore: number }[]>(`/facilities/${id}/timeline`).then((r) => r.data);

// Geo
export const getHeatmapData = (params?: {
  riskLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  violationType?: string;
}) =>
  api
    .get<{ heatmap: HeatmapPoint[]; facilities: GeoFacility[] }>('/geo/heatmap', { params })
    .then((r) => r.data);

// Violations
export const getViolations = (params?: {
  facilityId?: string;
  severity?: string;
  status?: string;
}) => api.get<Violation[]>('/violations', { params }).then((r) => r.data);

export const classifyViolation = (description: string) =>
  api
    .post<ViolationClassification>('/violations/classify', { description })
    .then((r) => r.data);

// Inspections
export const getInspections = (facilityId?: string) =>
  api
    .get<Inspection[]>('/inspections', { params: { facilityId } })
    .then((r) => r.data);

export const generateChecklist = (facilityType: string, classification: string) =>
  api
    .post<{ checklist: { section: string; items: string[] }[] }>(
      '/inspections/checklist',
      { facilityType, classification }
    )
    .then((r) => r.data);

export default api;
