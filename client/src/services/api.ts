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
import {
  getMockKPIs,
  getMockPriorityQueue,
  getMockFacilities,
  getMockFacility,
  getMockTimeline,
  getMockRiskAnalysis,
  getMockViolations,
  getMockViolationClassification,
  getMockHeatmapData,
  getMockChecklist,
} from './mockData';

// Use mock data when no backend is available (Vercel static deploy)
const USE_MOCK = !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simulate async delay for mock data
const mock = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 200 + Math.random() * 300));

// Dashboard
export const getDashboardKPIs = (): Promise<DashboardKPIs> =>
  USE_MOCK ? mock(getMockKPIs()) : api.get<DashboardKPIs>('/dashboard/kpis').then((r) => r.data);

export const getPriorityQueue = (): Promise<Facility[]> =>
  USE_MOCK ? mock(getMockPriorityQueue()) : api.get<Facility[]>('/dashboard/priority-queue').then((r) => r.data);

// Facilities
export const getFacilities = (params?: {
  search?: string;
  type?: string;
  region?: string;
  riskLevel?: string;
  sortBy?: string;
  order?: string;
}): Promise<Facility[]> =>
  USE_MOCK ? mock(getMockFacilities(params)) : api.get<Facility[]>('/facilities', { params }).then((r) => r.data);

export const getFacility = (id: string): Promise<Facility> =>
  USE_MOCK
    ? mock(getMockFacility(id)!).then((f) => { if (!f) throw new Error('Not found'); return f; })
    : api.get<Facility>(`/facilities/${id}`).then((r) => r.data);

export const getFacilityRisk = (id: string): Promise<RiskAnalysis> =>
  USE_MOCK ? mock(getMockRiskAnalysis(id)) : api.get<RiskAnalysis>(`/facilities/${id}/risk`).then((r) => r.data);

export const triggerRiskScore = (id: string): Promise<RiskAnalysis> =>
  USE_MOCK
    ? mock(getMockRiskAnalysis(id))
    : api.post<{ analysis: RiskAnalysis }>(`/facilities/${id}/score`).then((r) => r.data.analysis);

export const getFacilityTimeline = (id: string): Promise<{ month: string; avgScore: number }[]> =>
  USE_MOCK ? mock(getMockTimeline(id)) : api.get<{ month: string; avgScore: number }[]>(`/facilities/${id}/timeline`).then((r) => r.data);

// Geo
export const getHeatmapData = (params?: {
  riskLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  violationType?: string;
}): Promise<{ heatmap: HeatmapPoint[]; facilities: GeoFacility[] }> =>
  USE_MOCK ? mock(getMockHeatmapData(params)) : api.get<{ heatmap: HeatmapPoint[]; facilities: GeoFacility[] }>('/geo/heatmap', { params }).then((r) => r.data);

// Violations
export const getViolations = (params?: {
  facilityId?: string;
  severity?: string;
  status?: string;
}): Promise<Violation[]> =>
  USE_MOCK ? mock(getMockViolations(params)) : api.get<Violation[]>('/violations', { params }).then((r) => r.data);

export const classifyViolation = (description: string): Promise<ViolationClassification> =>
  USE_MOCK
    ? mock(getMockViolationClassification(description))
    : api.post<ViolationClassification>('/violations/classify', { description }).then((r) => r.data);

// Inspections
export const getInspections = (facilityId?: string): Promise<Inspection[]> =>
  USE_MOCK
    ? mock([])
    : api.get<Inspection[]>('/inspections', { params: { facilityId } }).then((r) => r.data);

export const generateChecklist = (facilityType: string, classification: string): Promise<{ checklist: { section: string; items: string[] }[] }> =>
  USE_MOCK
    ? mock({ checklist: getMockChecklist(facilityType, classification) })
    : api.post<{ checklist: { section: string; items: string[] }[] }>('/inspections/checklist', { facilityType, classification }).then((r) => r.data);

export default api;
