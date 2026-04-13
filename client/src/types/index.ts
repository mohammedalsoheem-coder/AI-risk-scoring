export interface Facility {
  id: string;
  nameAr: string;
  nameEn: string;
  type: FacilityType;
  classification: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  licenseNumber: string;
  licenseExpiry: string;
  riskScore: number;
  riskLevel: RiskLevel;
  lastInspection: string | null;
  inspections?: Inspection[];
  violations?: Violation[];
  complaints?: Complaint[];
  createdAt: string;
  updatedAt: string;
}

export type FacilityType = 'hotel' | 'resort' | 'restaurant' | 'attraction';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ViolationSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Inspection {
  id: string;
  facilityId: string;
  date: string;
  inspectorId: string;
  status: 'completed' | 'pending' | 'in-progress';
  score: number;
  findings: Record<string, unknown>;
  aiSummary: string | null;
  createdAt: string;
}

export interface Violation {
  id: string;
  facilityId: string;
  date: string;
  type: string;
  severity: ViolationSeverity;
  description: string;
  descriptionAr: string | null;
  regulatoryArticle: string | null;
  penalty: number | null;
  status: 'open' | 'resolved' | 'appealed';
  aiClassification: Record<string, unknown> | null;
  createdAt: string;
  facility?: Facility;
}

export interface Complaint {
  id: string;
  facilityId: string;
  date: string;
  source: 'CRM' | 'OTA' | 'direct';
  category: string;
  severity: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface DashboardKPIs {
  totalFacilities: number;
  highRiskCount: number;
  pendingInspections: number;
  avgScore: number;
  riskDistribution: { level: RiskLevel; count: number }[];
  recentViolations: number;
  complianceRate: number;
}

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: RiskLevel;
  narrative: string;
  topRisks: string[];
  recommendations: string[];
  trend: 'improving' | 'declining' | 'stable';
  arabicSummary: string;
  scoreBreakdown: {
    safetyCompliance: number;
    serviceQuality: number;
    documentation: number;
    repeatBehavior: number;
  };
}

export interface ViolationClassification {
  category: string;
  severity: ViolationSeverity;
  regulatoryArticle: string;
  penaltyRecommendation: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  region: string;
  violationCount: number;
}

export interface GeoFacility {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskLevel: RiskLevel;
  type: FacilityType;
  city: string;
  region: string;
  violationCount: number;
}
