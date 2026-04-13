// Mock data service for static deployment (Vercel)
// Provides realistic Saudi MT compliance data without requiring a backend

import type {
  Facility,
  DashboardKPIs,
  RiskAnalysis,
  ViolationClassification,
  Violation,
  Inspection,
  HeatmapPoint,
  GeoFacility,
  RiskLevel,
  FacilityType,
} from '../types';

// ─── Facilities ─────────────────────────────────────────────────────────
const FACILITIES: Facility[] = [
  // Riyadh
  { id: 'f1', nameAr: 'فندق الفيصلية', nameEn: 'Al Faisaliah Hotel', type: 'hotel', classification: '5-star', region: 'Riyadh', city: 'Riyadh', lat: 24.6904, lng: 46.6854, licenseNumber: 'MT-1001-2024', licenseExpiry: '2027-06-15', riskScore: 12, riskLevel: 'Low', lastInspection: '2026-03-20', createdAt: '2024-01-10', updatedAt: '2026-03-20' },
  { id: 'f2', nameAr: 'فندق المملكة', nameEn: 'Kingdom Hotel', type: 'hotel', classification: '5-star', region: 'Riyadh', city: 'Riyadh', lat: 24.7116, lng: 46.6745, licenseNumber: 'MT-1002-2024', licenseExpiry: '2027-08-01', riskScore: 18, riskLevel: 'Low', lastInspection: '2026-02-14', createdAt: '2024-01-10', updatedAt: '2026-02-14' },
  { id: 'f3', nameAr: 'فندق النخيل بلازا', nameEn: 'Al Nakheel Plaza Hotel', type: 'hotel', classification: '4-star', region: 'Riyadh', city: 'Riyadh', lat: 24.7236, lng: 46.6953, licenseNumber: 'MT-1003-2024', licenseExpiry: '2026-12-30', riskScore: 45, riskLevel: 'Medium', lastInspection: '2026-01-18', createdAt: '2024-01-15', updatedAt: '2026-01-18' },
  { id: 'f4', nameAr: 'منتجع الدرعية', nameEn: 'Diriyah Resort', type: 'resort', classification: 'Premium', region: 'Riyadh', city: 'Riyadh', lat: 24.7344, lng: 46.5733, licenseNumber: 'MT-1004-2024', licenseExpiry: '2027-03-22', riskScore: 22, riskLevel: 'Low', lastInspection: '2026-03-05', createdAt: '2024-02-01', updatedAt: '2026-03-05' },
  { id: 'f5', nameAr: 'مطعم نجد الأصيل', nameEn: 'Najd Heritage Restaurant', type: 'restaurant', classification: 'Fine Dining', region: 'Riyadh', city: 'Riyadh', lat: 24.6980, lng: 46.7100, licenseNumber: 'MT-1005-2024', licenseExpiry: '2026-09-15', riskScore: 38, riskLevel: 'Medium', lastInspection: '2026-02-28', createdAt: '2024-02-10', updatedAt: '2026-02-28' },
  { id: 'f6', nameAr: 'بوليفارد الرياض', nameEn: 'Riyadh Boulevard', type: 'attraction', classification: 'Premium', region: 'Riyadh', city: 'Riyadh', lat: 24.7500, lng: 46.6500, licenseNumber: 'MT-1006-2024', licenseExpiry: '2027-11-30', riskScore: 15, riskLevel: 'Low', lastInspection: '2026-04-01', createdAt: '2024-01-20', updatedAt: '2026-04-01' },
  { id: 'f7', nameAr: 'فندق الواحة', nameEn: 'Al Waha Hotel', type: 'hotel', classification: '3-star', region: 'Riyadh', city: 'Riyadh', lat: 24.6800, lng: 46.7200, licenseNumber: 'MT-1007-2024', licenseExpiry: '2026-06-01', riskScore: 72, riskLevel: 'High', lastInspection: '2025-11-15', createdAt: '2024-03-01', updatedAt: '2025-11-15' },
  // Jeddah
  { id: 'f8', nameAr: 'فندق بارك حياة جدة', nameEn: 'Park Hyatt Jeddah', type: 'hotel', classification: '5-star', region: 'Makkah', city: 'Jeddah', lat: 21.5200, lng: 39.1700, licenseNumber: 'MT-2001-2024', licenseExpiry: '2028-01-15', riskScore: 8, riskLevel: 'Low', lastInspection: '2026-03-12', createdAt: '2024-01-05', updatedAt: '2026-03-12' },
  { id: 'f9', nameAr: 'فندق جدة هيلتون', nameEn: 'Jeddah Hilton Hotel', type: 'hotel', classification: '5-star', region: 'Makkah', city: 'Jeddah', lat: 21.4900, lng: 39.1850, licenseNumber: 'MT-2002-2024', licenseExpiry: '2027-07-20', riskScore: 14, riskLevel: 'Low', lastInspection: '2026-02-25', createdAt: '2024-01-12', updatedAt: '2026-02-25' },
  { id: 'f10', nameAr: 'منتجع شاطئ الحمراء', nameEn: 'Al Hamra Beach Resort', type: 'resort', classification: '5-star', region: 'Makkah', city: 'Jeddah', lat: 21.5400, lng: 39.1300, licenseNumber: 'MT-2003-2024', licenseExpiry: '2027-04-10', riskScore: 42, riskLevel: 'Medium', lastInspection: '2026-01-30', createdAt: '2024-02-15', updatedAt: '2026-01-30' },
  { id: 'f11', nameAr: 'مطعم البيك الكورنيش', nameEn: 'Al Baik Corniche', type: 'restaurant', classification: 'Standard', region: 'Makkah', city: 'Jeddah', lat: 21.4750, lng: 39.1600, licenseNumber: 'MT-2004-2024', licenseExpiry: '2027-02-28', riskScore: 20, riskLevel: 'Low', lastInspection: '2026-03-18', createdAt: '2024-03-01', updatedAt: '2026-03-18' },
  { id: 'f12', nameAr: 'فندق الأندلس', nameEn: 'Al Andalus Hotel', type: 'hotel', classification: '3-star', region: 'Makkah', city: 'Jeddah', lat: 21.5100, lng: 39.2000, licenseNumber: 'MT-2005-2024', licenseExpiry: '2026-08-15', riskScore: 68, riskLevel: 'High', lastInspection: '2025-12-10', createdAt: '2024-01-25', updatedAt: '2025-12-10' },
  { id: 'f13', nameAr: 'مطعم السلطان', nameEn: 'Al Sultan Restaurant', type: 'restaurant', classification: 'Casual', region: 'Makkah', city: 'Jeddah', lat: 21.4600, lng: 39.2100, licenseNumber: 'MT-2006-2024', licenseExpiry: '2026-05-01', riskScore: 88, riskLevel: 'Critical', lastInspection: '2025-10-22', createdAt: '2024-04-10', updatedAt: '2025-10-22' },
  // Makkah
  { id: 'f14', nameAr: 'فندق ساعة مكة', nameEn: 'Makkah Clock Tower Hotel', type: 'hotel', classification: '5-star', region: 'Makkah', city: 'Makkah', lat: 21.3891, lng: 39.8579, licenseNumber: 'MT-3001-2024', licenseExpiry: '2028-03-01', riskScore: 10, riskLevel: 'Low', lastInspection: '2026-04-05', createdAt: '2024-01-01', updatedAt: '2026-04-05' },
  { id: 'f15', nameAr: 'فندق دار الإيمان', nameEn: 'Dar Al Eiman Hotel', type: 'hotel', classification: '4-star', region: 'Makkah', city: 'Makkah', lat: 21.3920, lng: 39.8600, licenseNumber: 'MT-3002-2024', licenseExpiry: '2027-01-20', riskScore: 52, riskLevel: 'Medium', lastInspection: '2026-01-05', createdAt: '2024-02-20', updatedAt: '2026-01-05' },
  { id: 'f16', nameAr: 'فندق الحرم بلازا', nameEn: 'Haram Plaza Hotel', type: 'hotel', classification: '3-star', region: 'Makkah', city: 'Makkah', lat: 21.3860, lng: 39.8550, licenseNumber: 'MT-3003-2024', licenseExpiry: '2026-07-10', riskScore: 75, riskLevel: 'High', lastInspection: '2025-09-18', createdAt: '2024-03-15', updatedAt: '2025-09-18' },
  // Madinah
  { id: 'f17', nameAr: 'فندق المدينة أوبروي', nameEn: 'Madinah Oberoi Hotel', type: 'hotel', classification: '5-star', region: 'Madinah', city: 'Madinah', lat: 24.4539, lng: 39.6142, licenseNumber: 'MT-4001-2024', licenseExpiry: '2027-09-30', riskScore: 16, riskLevel: 'Low', lastInspection: '2026-03-28', createdAt: '2024-01-08', updatedAt: '2026-03-28' },
  { id: 'f18', nameAr: 'فندق الروضة', nameEn: 'Al Rawdah Hotel', type: 'hotel', classification: '2-star', region: 'Madinah', city: 'Madinah', lat: 24.4600, lng: 39.6200, licenseNumber: 'MT-4002-2024', licenseExpiry: '2026-04-20', riskScore: 85, riskLevel: 'Critical', lastInspection: '2025-08-30', createdAt: '2024-05-01', updatedAt: '2025-08-30' },
  // AlUla
  { id: 'f19', nameAr: 'منتجع العلا الأثري', nameEn: 'AlUla Heritage Resort', type: 'resort', classification: 'Premium', region: 'Madinah', city: 'AlUla', lat: 26.6174, lng: 37.9157, licenseNumber: 'MT-5001-2024', licenseExpiry: '2027-12-01', riskScore: 19, riskLevel: 'Low', lastInspection: '2026-03-15', createdAt: '2024-01-30', updatedAt: '2026-03-15' },
  { id: 'f20', nameAr: 'مخيم حبيتاس العلا', nameEn: 'Habitas AlUla Camp', type: 'resort', classification: 'Premium', region: 'Madinah', city: 'AlUla', lat: 26.6200, lng: 37.9200, licenseNumber: 'MT-5002-2024', licenseExpiry: '2027-05-15', riskScore: 25, riskLevel: 'Low', lastInspection: '2026-02-20', createdAt: '2024-02-18', updatedAt: '2026-02-20' },
  // NEOM
  { id: 'f21', nameAr: 'فندق ذا لاين', nameEn: 'The Line Hotel', type: 'hotel', classification: '5-star', region: 'Tabuk', city: 'NEOM', lat: 27.9500, lng: 35.3000, licenseNumber: 'MT-6001-2024', licenseExpiry: '2028-06-01', riskScore: 11, riskLevel: 'Low', lastInspection: '2026-04-08', createdAt: '2024-01-15', updatedAt: '2026-04-08' },
  { id: 'f22', nameAr: 'منتجع سندالة', nameEn: 'Sindalah Resort', type: 'resort', classification: '5-star', region: 'Tabuk', city: 'NEOM', lat: 27.9600, lng: 35.2800, licenseNumber: 'MT-6002-2024', licenseExpiry: '2028-01-20', riskScore: 28, riskLevel: 'Low', lastInspection: '2026-03-01', createdAt: '2024-03-10', updatedAt: '2026-03-01' },
  // Abha
  { id: 'f23', nameAr: 'فندق قصر أبها', nameEn: 'Abha Palace Hotel', type: 'hotel', classification: '4-star', region: 'Asir', city: 'Abha', lat: 18.2164, lng: 42.5053, licenseNumber: 'MT-7001-2024', licenseExpiry: '2027-04-15', riskScore: 35, riskLevel: 'Medium', lastInspection: '2026-02-10', createdAt: '2024-02-05', updatedAt: '2026-02-10' },
  { id: 'f24', nameAr: 'مطعم السودة', nameEn: 'Al Soudah Restaurant', type: 'restaurant', classification: 'Premium', region: 'Asir', city: 'Abha', lat: 18.2500, lng: 42.4800, licenseNumber: 'MT-7002-2024', licenseExpiry: '2026-10-30', riskScore: 55, riskLevel: 'Medium', lastInspection: '2025-12-20', createdAt: '2024-04-01', updatedAt: '2025-12-20' },
  // Dammam
  { id: 'f25', nameAr: 'فندق شيراتون الدمام', nameEn: 'Sheraton Dammam Hotel', type: 'hotel', classification: '5-star', region: 'Eastern Province', city: 'Dammam', lat: 26.3927, lng: 49.9777, licenseNumber: 'MT-8001-2024', licenseExpiry: '2027-10-15', riskScore: 21, riskLevel: 'Low', lastInspection: '2026-03-22', createdAt: '2024-01-18', updatedAt: '2026-03-22' },
  { id: 'f26', nameAr: 'فندق نجمة الشرق', nameEn: 'Star of the East Hotel', type: 'hotel', classification: '3-star', region: 'Eastern Province', city: 'Dammam', lat: 26.4000, lng: 50.0000, licenseNumber: 'MT-8002-2024', licenseExpiry: '2026-06-30', riskScore: 82, riskLevel: 'Critical', lastInspection: '2025-07-15', createdAt: '2024-05-20', updatedAt: '2025-07-15' },
  // Tabuk
  { id: 'f27', nameAr: 'منتجع أملج', nameEn: 'Umluj Beach Resort', type: 'resort', classification: 'Standard', region: 'Tabuk', city: 'Tabuk', lat: 28.3838, lng: 36.5550, licenseNumber: 'MT-9001-2024', licenseExpiry: '2027-03-01', riskScore: 48, riskLevel: 'Medium', lastInspection: '2026-01-25', createdAt: '2024-03-20', updatedAt: '2026-01-25' },
  // Yanbu
  { id: 'f28', nameAr: 'فندق ينبع الملكي', nameEn: 'Yanbu Royal Hotel', type: 'hotel', classification: '4-star', region: 'Madinah', city: 'Yanbu', lat: 24.0895, lng: 38.0618, licenseNumber: 'MT-1010-2024', licenseExpiry: '2027-08-15', riskScore: 33, riskLevel: 'Medium', lastInspection: '2026-02-05', createdAt: '2024-02-28', updatedAt: '2026-02-05' },
  // More across regions for 50 total
  { id: 'f29', nameAr: 'فندق الرياض ماريوت', nameEn: 'Riyadh Marriott Hotel', type: 'hotel', classification: '5-star', region: 'Riyadh', city: 'Riyadh', lat: 24.7300, lng: 46.6700, licenseNumber: 'MT-1008-2024', licenseExpiry: '2027-11-01', riskScore: 17, riskLevel: 'Low', lastInspection: '2026-03-30', createdAt: '2024-01-22', updatedAt: '2026-03-30' },
  { id: 'f30', nameAr: 'مطعم ميراس', nameEn: 'Meras Restaurant', type: 'restaurant', classification: 'Fine Dining', region: 'Riyadh', city: 'Riyadh', lat: 24.7050, lng: 46.6800, licenseNumber: 'MT-1009-2024', licenseExpiry: '2026-11-20', riskScore: 29, riskLevel: 'Low', lastInspection: '2026-03-10', createdAt: '2024-04-15', updatedAt: '2026-03-10' },
  { id: 'f31', nameAr: 'فندق كراون بلازا جدة', nameEn: 'Crowne Plaza Jeddah', type: 'hotel', classification: '4-star', region: 'Makkah', city: 'Jeddah', lat: 21.5050, lng: 39.1900, licenseNumber: 'MT-2007-2024', licenseExpiry: '2027-06-01', riskScore: 40, riskLevel: 'Medium', lastInspection: '2026-01-12', createdAt: '2024-02-08', updatedAt: '2026-01-12' },
  { id: 'f32', nameAr: 'فندق الصفوة أبراج', nameEn: 'Al Safwah Towers Hotel', type: 'hotel', classification: '5-star', region: 'Makkah', city: 'Makkah', lat: 21.3900, lng: 39.8590, licenseNumber: 'MT-3004-2024', licenseExpiry: '2027-12-15', riskScore: 13, riskLevel: 'Low', lastInspection: '2026-04-02', createdAt: '2024-01-03', updatedAt: '2026-04-02' },
  { id: 'f33', nameAr: 'مطعم البخاري', nameEn: 'Al Bukhari Restaurant', type: 'restaurant', classification: 'Standard', region: 'Makkah', city: 'Makkah', lat: 21.3870, lng: 39.8560, licenseNumber: 'MT-3005-2024', licenseExpiry: '2026-10-01', riskScore: 47, riskLevel: 'Medium', lastInspection: '2025-12-28', createdAt: '2024-03-22', updatedAt: '2025-12-28' },
  { id: 'f34', nameAr: 'فندق دار الهجرة', nameEn: 'Dar Al Hijra Hotel', type: 'hotel', classification: '4-star', region: 'Madinah', city: 'Madinah', lat: 24.4550, lng: 39.6180, licenseNumber: 'MT-4003-2024', licenseExpiry: '2027-05-10', riskScore: 41, riskLevel: 'Medium', lastInspection: '2026-02-18', createdAt: '2024-02-12', updatedAt: '2026-02-18' },
  { id: 'f35', nameAr: 'مطعم طيبة المنورة', nameEn: 'Taiba Al Munawara Restaurant', type: 'restaurant', classification: 'Premium', region: 'Madinah', city: 'Madinah', lat: 24.4580, lng: 39.6100, licenseNumber: 'MT-4004-2024', licenseExpiry: '2027-02-01', riskScore: 23, riskLevel: 'Low', lastInspection: '2026-03-08', createdAt: '2024-03-05', updatedAt: '2026-03-08' },
  { id: 'f36', nameAr: 'نافورة الملك فهد', nameEn: 'King Fahd Fountain', type: 'attraction', classification: 'Heritage', region: 'Makkah', city: 'Jeddah', lat: 21.4950, lng: 39.1500, licenseNumber: 'MT-2008-2024', licenseExpiry: '2028-02-01', riskScore: 10, riskLevel: 'Low', lastInspection: '2026-04-10', createdAt: '2024-01-28', updatedAt: '2026-04-10' },
  { id: 'f37', nameAr: 'فندق الأنوار المدينة', nameEn: 'Al Anwar Madinah Hotel', type: 'hotel', classification: '4-star', region: 'Madinah', city: 'Madinah', lat: 24.4520, lng: 39.6160, licenseNumber: 'MT-4005-2024', licenseExpiry: '2027-07-01', riskScore: 24, riskLevel: 'Low', lastInspection: '2026-03-02', createdAt: '2024-01-30', updatedAt: '2026-03-02' },
  { id: 'f38', nameAr: 'فندق قصر السلام', nameEn: 'Qasr Al Salam Hotel', type: 'hotel', classification: '3-star', region: 'Riyadh', city: 'Riyadh', lat: 24.6850, lng: 46.7150, licenseNumber: 'MT-1011-2024', licenseExpiry: '2026-09-01', riskScore: 63, riskLevel: 'High', lastInspection: '2025-11-28', createdAt: '2024-04-08', updatedAt: '2025-11-28' },
  { id: 'f39', nameAr: 'مطعم الساحل', nameEn: 'Al Sahel Restaurant', type: 'restaurant', classification: 'Casual', region: 'Eastern Province', city: 'Dammam', lat: 26.4100, lng: 49.9900, licenseNumber: 'MT-8003-2024', licenseExpiry: '2026-07-20', riskScore: 57, riskLevel: 'Medium', lastInspection: '2025-12-15', createdAt: '2024-05-10', updatedAt: '2025-12-15' },
  { id: 'f40', nameAr: 'متحف المستقبل', nameEn: 'Future Museum', type: 'attraction', classification: 'Premium', region: 'Riyadh', city: 'Riyadh', lat: 24.7400, lng: 46.6600, licenseNumber: 'MT-1012-2024', licenseExpiry: '2028-01-01', riskScore: 9, riskLevel: 'Low', lastInspection: '2026-04-12', createdAt: '2024-01-05', updatedAt: '2026-04-12' },
  { id: 'f41', nameAr: 'فندق الواجهة البحرية', nameEn: 'Waterfront Hotel', type: 'hotel', classification: '4-star', region: 'Eastern Province', city: 'Dammam', lat: 26.3800, lng: 50.0100, licenseNumber: 'MT-8004-2024', licenseExpiry: '2027-03-15', riskScore: 36, riskLevel: 'Medium', lastInspection: '2026-01-20', createdAt: '2024-03-12', updatedAt: '2026-01-20' },
  { id: 'f42', nameAr: 'منتجع أبها الجبلي', nameEn: 'Abha Mountain Resort', type: 'resort', classification: 'Standard', region: 'Asir', city: 'Abha', lat: 18.2300, lng: 42.4900, licenseNumber: 'MT-7003-2024', licenseExpiry: '2027-01-10', riskScore: 44, riskLevel: 'Medium', lastInspection: '2026-01-08', createdAt: '2024-04-20', updatedAt: '2026-01-08' },
  { id: 'f43', nameAr: 'فندق تبوك بلازا', nameEn: 'Tabuk Plaza Hotel', type: 'hotel', classification: '3-star', region: 'Tabuk', city: 'Tabuk', lat: 28.3900, lng: 36.5600, licenseNumber: 'MT-9002-2024', licenseExpiry: '2026-11-01', riskScore: 67, riskLevel: 'High', lastInspection: '2025-10-05', createdAt: '2024-05-15', updatedAt: '2025-10-05' },
  { id: 'f44', nameAr: 'مطعم ينبع البحري', nameEn: 'Yanbu Seafood Restaurant', type: 'restaurant', classification: 'Standard', region: 'Madinah', city: 'Yanbu', lat: 24.0850, lng: 38.0650, licenseNumber: 'MT-1013-2024', licenseExpiry: '2026-08-20', riskScore: 51, riskLevel: 'Medium', lastInspection: '2025-12-05', createdAt: '2024-06-01', updatedAt: '2025-12-05' },
  { id: 'f45', nameAr: 'منتجع البحر الأحمر', nameEn: 'Red Sea Resort', type: 'resort', classification: '5-star', region: 'Tabuk', city: 'NEOM', lat: 27.9400, lng: 35.3200, licenseNumber: 'MT-6003-2024', licenseExpiry: '2028-04-01', riskScore: 14, riskLevel: 'Low', lastInspection: '2026-04-06', createdAt: '2024-02-25', updatedAt: '2026-04-06' },
  { id: 'f46', nameAr: 'فندق السفير', nameEn: 'Ambassador Hotel', type: 'hotel', classification: '2-star', region: 'Makkah', city: 'Jeddah', lat: 21.4700, lng: 39.2200, licenseNumber: 'MT-2009-2024', licenseExpiry: '2026-04-15', riskScore: 91, riskLevel: 'Critical', lastInspection: '2025-06-20', createdAt: '2024-06-10', updatedAt: '2025-06-20' },
  { id: 'f47', nameAr: 'حديقة الملك عبدالله', nameEn: 'King Abdullah Park', type: 'attraction', classification: 'Heritage', region: 'Riyadh', city: 'Riyadh', lat: 24.7200, lng: 46.6400, licenseNumber: 'MT-1014-2024', licenseExpiry: '2027-10-01', riskScore: 19, riskLevel: 'Low', lastInspection: '2026-03-25', createdAt: '2024-01-10', updatedAt: '2026-03-25' },
  { id: 'f48', nameAr: 'فندق قمم أبها', nameEn: 'Abha Peaks Hotel', type: 'hotel', classification: '3-star', region: 'Asir', city: 'Abha', lat: 18.2200, lng: 42.5100, licenseNumber: 'MT-7004-2024', licenseExpiry: '2026-08-01', riskScore: 71, riskLevel: 'High', lastInspection: '2025-11-02', createdAt: '2024-05-05', updatedAt: '2025-11-02' },
  { id: 'f49', nameAr: 'مطعم الشرقية', nameEn: 'Eastern Province Grill', type: 'restaurant', classification: 'Casual', region: 'Eastern Province', city: 'Dammam', lat: 26.4200, lng: 49.9800, licenseNumber: 'MT-8005-2024', licenseExpiry: '2026-05-15', riskScore: 84, riskLevel: 'Critical', lastInspection: '2025-08-12', createdAt: '2024-06-20', updatedAt: '2025-08-12' },
  { id: 'f50', nameAr: 'واحة العلا السياحية', nameEn: 'AlUla Tourism Oasis', type: 'attraction', classification: 'Adventure', region: 'Madinah', city: 'AlUla', lat: 26.6250, lng: 37.9100, licenseNumber: 'MT-5003-2024', licenseExpiry: '2027-09-01', riskScore: 26, riskLevel: 'Low', lastInspection: '2026-03-18', createdAt: '2024-03-15', updatedAt: '2026-03-18' },
];

// ─── Violations ─────────────────────────────────────────────────────────
function generateViolations(): Violation[] {
  const types = ['fire_safety', 'hygiene', 'documentation', 'service_quality', 'capacity_violation', 'unauthorized_modification', 'noise_complaint', 'pool_safety', 'food_safety', 'accessibility'];
  const descriptions: Record<string, string> = {
    fire_safety: 'Fire extinguishers expired; emergency exit signage missing in multiple floors',
    hygiene: 'Kitchen sanitation below required standards; improper food storage observed',
    documentation: 'Operating license renewal documentation not submitted on time',
    service_quality: 'Guest complaint ratio exceeds acceptable threshold for classification',
    capacity_violation: 'Event hall exceeded maximum occupancy by 30%',
    unauthorized_modification: 'Structural modifications made without prior MT approval',
    noise_complaint: 'Noise levels exceed permitted limits after 11 PM',
    pool_safety: 'Swimming pool chemical levels outside safe parameters',
    food_safety: 'Food handling certification expired for 3 kitchen staff members',
    accessibility: 'Required wheelchair ramps and accessibility features not installed',
  };
  const violations: Violation[] = [];
  let id = 1;

  for (const f of FACILITIES) {
    const count = f.riskLevel === 'Critical' ? 8 : f.riskLevel === 'High' ? 5 : f.riskLevel === 'Medium' ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const type = types[(id + i) % types.length];
      const severity = f.riskLevel === 'Critical' ? (['Critical', 'High'] as const)[i % 2] :
                       f.riskLevel === 'High' ? (['High', 'Medium'] as const)[i % 2] :
                       f.riskLevel === 'Medium' ? (['Medium', 'Low'] as const)[i % 2] : 'Low' as const;
      violations.push({
        id: `v${id}`,
        facilityId: f.id,
        date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        type,
        severity,
        description: descriptions[type],
        descriptionAr: null,
        regulatoryArticle: `Article ${Math.floor(id / 3) + 1}.${(id % 5) + 1}`,
        penalty: severity === 'Critical' ? 50000 : severity === 'High' ? 25000 : severity === 'Medium' ? 10000 : 5000,
        status: i === 0 && f.riskScore > 60 ? 'open' : 'resolved',
        aiClassification: null,
        createdAt: new Date().toISOString(),
        facility: { id: f.id, nameAr: f.nameAr, nameEn: f.nameEn } as any,
      });
      id++;
    }
  }
  return violations;
}

const VIOLATIONS = generateViolations();

// ─── Inspections per facility ───────────────────────────────────────────
function generateInspections(facilityId: string): Inspection[] {
  const inspections: Inspection[] = [];
  const f = FACILITIES.find((x) => x.id === facilityId);
  if (!f) return [];
  const count = f.riskLevel === 'Critical' ? 3 : f.riskLevel === 'High' ? 4 : 5;
  for (let i = 0; i < count; i++) {
    const baseScore = f.riskLevel === 'Low' ? 75 + Math.random() * 20 : f.riskLevel === 'Medium' ? 55 + Math.random() * 20 : f.riskLevel === 'High' ? 35 + Math.random() * 20 : 15 + Math.random() * 25;
    inspections.push({
      id: `insp-${facilityId}-${i}`,
      facilityId,
      date: new Date(2025, i * 2, Math.floor(Math.random() * 28) + 1).toISOString(),
      inspectorId: `INS-${1000 + Math.floor(Math.random() * 8)}`,
      status: i === 0 ? 'pending' : 'completed',
      score: Math.round(baseScore),
      findings: { areas_checked: 12, issues_found: Math.round((100 - baseScore) / 10) },
      aiSummary: null,
      createdAt: new Date().toISOString(),
    });
  }
  return inspections;
}

// ─── Public API ─────────────────────────────────────────────────────────

export function getMockKPIs(): DashboardKPIs {
  const total = FACILITIES.length;
  const highRisk = FACILITIES.filter((f) => f.riskLevel === 'High' || f.riskLevel === 'Critical').length;
  const avg = FACILITIES.reduce((s, f) => s + f.riskScore, 0) / total;
  const lowRisk = FACILITIES.filter((f) => f.riskLevel === 'Low').length;
  const levels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
  return {
    totalFacilities: total,
    highRiskCount: highRisk,
    pendingInspections: 23,
    avgScore: Math.round(avg * 10) / 10,
    riskDistribution: levels.map((level) => ({
      level,
      count: FACILITIES.filter((f) => f.riskLevel === level).length,
    })),
    recentViolations: VIOLATIONS.filter((v) => v.status === 'open').length,
    complianceRate: Math.round((lowRisk / total) * 100),
  };
}

export function getMockPriorityQueue(): Facility[] {
  return [...FACILITIES].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
}

export function getMockFacilities(params?: {
  search?: string;
  type?: string;
  region?: string;
  riskLevel?: string;
  sortBy?: string;
  order?: string;
}): Facility[] {
  let result = [...FACILITIES];
  if (params?.search) {
    const s = params.search.toLowerCase();
    result = result.filter((f) => f.nameEn.toLowerCase().includes(s) || f.nameAr.includes(s) || f.licenseNumber.toLowerCase().includes(s));
  }
  if (params?.type) result = result.filter((f) => f.type === params.type);
  if (params?.region) result = result.filter((f) => f.region === params.region || f.city === params.region);
  if (params?.riskLevel) result = result.filter((f) => f.riskLevel === params.riskLevel);
  const sortBy = (params?.sortBy || 'riskScore') as keyof Facility;
  const order = params?.order || 'desc';
  result.sort((a, b) => {
    const av = a[sortBy] ?? 0;
    const bv = b[sortBy] ?? 0;
    return order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
  return result;
}

export function getMockFacility(id: string): Facility | null {
  const f = FACILITIES.find((x) => x.id === id);
  if (!f) return null;
  return {
    ...f,
    inspections: generateInspections(id),
    violations: VIOLATIONS.filter((v) => v.facilityId === id),
    complaints: [],
  };
}

export function getMockTimeline(id: string): { month: string; avgScore: number }[] {
  const months = [];
  const f = FACILITIES.find((x) => x.id === id);
  const base = f ? (100 - f.riskScore) : 50;
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      avgScore: Math.max(10, Math.min(95, base + Math.round((Math.random() - 0.5) * 20))),
    });
  }
  return months;
}

export function getMockRiskAnalysis(id: string): RiskAnalysis {
  const f = FACILITIES.find((x) => x.id === id);
  const score = f?.riskScore ?? 50;
  const level = f?.riskLevel ?? 'Medium';
  const trend = score > 60 ? 'declining' : score < 30 ? 'improving' : 'stable';
  return {
    riskScore: score,
    riskLevel: level as RiskLevel,
    narrative: `This ${f?.type || 'facility'} (${f?.classification}) in ${f?.city}, ${f?.region} has a risk score of ${score}/100 classified as ${level}. ${
      score > 60
        ? 'Multiple compliance concerns require immediate attention including fire safety deficiencies, expired documentation, and recurring service quality issues. The facility shows a pattern of repeat violations over the past 12 months.'
        : score > 30
        ? 'The facility maintains moderate compliance levels with periodic issues in documentation renewal and minor service quality gaps. Regular monitoring is recommended.'
        : 'This facility demonstrates strong compliance across all assessment dimensions. The management team shows proactive engagement with inspection protocols.'
    }`,
    topRisks: score > 60
      ? ['Fire safety systems overdue for certification', 'Operating license documentation gaps', 'Recurring guest safety complaints', 'Staff training certifications expired']
      : score > 30
      ? ['Documentation renewal approaching deadline', 'Minor service quality inconsistencies', 'Periodic maintenance schedule adherence']
      : ['No critical risks identified', 'Maintain current compliance protocols'],
    recommendations: score > 60
      ? ['Schedule immediate fire safety system inspection', 'Submit all pending documentation within 7 days', 'Implement staff retraining program', 'Assign dedicated compliance officer']
      : score > 30
      ? ['Renew documentation 30 days before expiry', 'Enhance guest feedback monitoring system', 'Schedule quarterly self-assessment audits']
      : ['Continue current compliance practices', 'Consider applying for MT Excellence Award'],
    trend: trend as any,
    arabicSummary: score > 60
      ? `المنشأة تحتاج إلى اهتمام فوري. درجة المخاطر ${score} من 100 - مستوى ${level === 'Critical' ? 'حرج' : 'عالي'}. يجب معالجة مخالفات السلامة والتوثيق بشكل عاجل.`
      : score > 30
      ? `المنشأة بمستوى امتثال متوسط. درجة المخاطر ${score} من 100. يُنصح بالمتابعة المنتظمة وتحسين التوثيق.`
      : `المنشأة تُظهر التزاماً ممتازاً بمعايير الامتثال. درجة المخاطر ${score} من 100 - مستوى منخفض.`,
    scoreBreakdown: {
      safetyCompliance: Math.min(100, Math.max(5, 100 - score + Math.round((Math.random() - 0.3) * 20))),
      serviceQuality: Math.min(100, Math.max(5, 100 - score * 0.8 + Math.round((Math.random() - 0.3) * 15))),
      documentation: Math.min(100, Math.max(5, 100 - score * 0.9 + Math.round((Math.random() - 0.3) * 25))),
      repeatBehavior: Math.min(100, Math.max(5, 100 - score * 1.1 + Math.round((Math.random() - 0.3) * 18))),
    },
  };
}

export function getMockViolationClassification(description: string): ViolationClassification {
  const isArabic = /[\u0600-\u06FF]/.test(description);
  const lower = description.toLowerCase();
  const isFire = lower.includes('fire') || lower.includes('حريق') || lower.includes('نار');
  const isFood = lower.includes('food') || lower.includes('kitchen') || lower.includes('طعام') || lower.includes('مطبخ');
  const isHygiene = lower.includes('clean') || lower.includes('hygiene') || lower.includes('نظافة');

  const category = isFire ? 'Fire Safety' : isFood ? 'Food Safety' : isHygiene ? 'Hygiene' : 'General Compliance';
  const severity = isFire ? 'Critical' : isFood ? 'High' : isHygiene ? 'Medium' : 'Medium';

  return {
    category,
    severity: severity as any,
    regulatoryArticle: isFire ? 'Article 15.3' : isFood ? 'Article 22.1' : isHygiene ? 'Article 18.7' : 'Article 10.2',
    penaltyRecommendation: severity === 'Critical' ? 'SAR 50,000 - 100,000' : severity === 'High' ? 'SAR 25,000 - 50,000' : 'SAR 10,000 - 25,000',
    descriptionEn: isArabic ? `Violation classified as ${category}: ${description}` : description,
    descriptionAr: isArabic ? description : `مخالفة مصنفة كـ ${category === 'Fire Safety' ? 'سلامة الحريق' : category === 'Food Safety' ? 'سلامة الغذاء' : category === 'Hygiene' ? 'النظافة' : 'الامتثال العام'}`,
  };
}

export function getMockViolations(params?: { severity?: string; status?: string }): Violation[] {
  let result = [...VIOLATIONS];
  if (params?.severity) result = result.filter((v) => v.severity === params.severity);
  if (params?.status) result = result.filter((v) => v.status === params.status);
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMockHeatmapData(params?: { riskLevel?: string }): { heatmap: HeatmapPoint[]; facilities: GeoFacility[] } {
  let facs = [...FACILITIES];
  if (params?.riskLevel) facs = facs.filter((f) => f.riskLevel === params.riskLevel);

  const regionMap: Record<string, { lat: number; lng: number; count: number }> = {};
  for (const v of VIOLATIONS) {
    const f = FACILITIES.find((x) => x.id === v.facilityId);
    if (!f) continue;
    if (params?.riskLevel && f.riskLevel !== params.riskLevel) continue;
    if (!regionMap[f.region]) regionMap[f.region] = { lat: 0, lng: 0, count: 0 };
    regionMap[f.region].lat += f.lat;
    regionMap[f.region].lng += f.lng;
    regionMap[f.region].count++;
  }

  const heatmap: HeatmapPoint[] = Object.entries(regionMap).map(([region, d]) => ({
    lat: d.lat / d.count,
    lng: d.lng / d.count,
    intensity: d.count,
    region,
    violationCount: d.count,
  }));

  const facilities: GeoFacility[] = facs.map((f) => ({
    id: f.id,
    nameEn: f.nameEn,
    nameAr: f.nameAr,
    lat: f.lat,
    lng: f.lng,
    riskScore: f.riskScore,
    riskLevel: f.riskLevel,
    type: f.type,
    city: f.city,
    region: f.region,
    violationCount: VIOLATIONS.filter((v) => v.facilityId === f.id).length,
  }));

  return { heatmap, facilities };
}

export function getMockChecklist(facilityType: string, classification: string): { section: string; items: string[] }[] {
  const common = [
    { section: 'General Safety & Emergency Preparedness', items: ['Verify fire extinguisher locations and expiry dates', 'Test emergency lighting systems', 'Check emergency exit signage and accessibility', 'Review evacuation plan and posting locations', 'Inspect first aid kit contents and accessibility'] },
    { section: 'Documentation & Licensing', items: ['Verify valid MT operating license', 'Check staff certification validity', 'Review insurance documentation', 'Inspect health and safety certificates', 'Verify civil defense approval'] },
  ];

  const byType: Record<string, { section: string; items: string[] }[]> = {
    hotel: [
      { section: 'Guest Room Standards', items: ['Inspect room cleanliness and maintenance', 'Check bedding quality and replacement schedule', 'Verify minibar temperature and product expiry', 'Test room electronics (AC, TV, safe)', 'Inspect bathroom fixtures and hot water'] },
      { section: 'Front Desk & Lobby', items: ['Evaluate check-in/check-out procedures', 'Verify bilingual signage (Arabic/English)', 'Check ADA/accessibility compliance in lobby', 'Review guest complaint log and response times'] },
      { section: 'Food & Beverage', items: ['Inspect kitchen hygiene and food storage', 'Check food handler certifications', 'Review menu allergen information', 'Test dishwashing water temperature'] },
    ],
    resort: [
      { section: 'Pool & Recreation Safety', items: ['Check pool water chemical balance records', 'Verify lifeguard certification and schedule', 'Inspect pool fencing and signage', 'Check recreation equipment maintenance'] },
      { section: 'Guest Accommodation', items: ['Inspect villa/chalet condition and cleanliness', 'Verify AC and utility functionality', 'Check outdoor space maintenance', 'Review pest control schedule'] },
      { section: 'Beach & Outdoor Areas', items: ['Inspect beach cleanliness and safety flags', 'Check water sports equipment condition', 'Verify sun shelter availability', 'Review environmental compliance measures'] },
    ],
    restaurant: [
      { section: 'Kitchen & Food Safety', items: ['Check food storage temperatures (fridge: below 5°C)', 'Inspect cooking station cleanliness', 'Verify pest control records', 'Check handwashing facilities', 'Review food source traceability documents'] },
      { section: 'Dining Area', items: ['Inspect table and seating cleanliness', 'Check floor condition and slip hazards', 'Verify restroom cleanliness and supplies', 'Review menu pricing accuracy'] },
      { section: 'Staff Compliance', items: ['Verify food handler health certificates', 'Check uniform and hygiene standards', 'Review allergen awareness training records'] },
    ],
    attraction: [
      { section: 'Visitor Safety', items: ['Inspect ride/exhibit safety mechanisms', 'Check crowd control measures and signage', 'Verify maximum capacity compliance', 'Review incident response protocols'] },
      { section: 'Facilities & Maintenance', items: ['Inspect restroom facilities and cleanliness', 'Check accessibility ramps and pathways', 'Verify electrical installation safety', 'Review structural integrity certificates'] },
      { section: 'Visitor Experience', items: ['Check bilingual information displays', 'Verify ticketing system accuracy', 'Inspect visitor rest areas', 'Review queue management systems'] },
    ],
  };

  return [...common, ...(byType[facilityType] || byType.hotel)];
}
