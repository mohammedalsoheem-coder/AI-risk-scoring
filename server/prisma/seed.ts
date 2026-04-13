import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic pseudo-random number generator (mulberry32) so seed data is
 *  reproducible across runs while still looking "random". */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240101);

function randomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
}

function cuid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'cl';
  for (let i = 0; i < 23; i++) {
    id += chars[Math.floor(rand() * chars.length)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

interface CityInfo {
  city: string;
  region: string;
  lat: number;
  lng: number;
  latRange: number;
  lngRange: number;
}

const CITIES: CityInfo[] = [
  { city: 'Riyadh', region: 'Riyadh', lat: 24.7136, lng: 46.6753, latRange: 0.08, lngRange: 0.08 },
  { city: 'Jeddah', region: 'Makkah', lat: 21.4858, lng: 39.1925, latRange: 0.06, lngRange: 0.06 },
  { city: 'Makkah', region: 'Makkah', lat: 21.3891, lng: 39.8579, latRange: 0.03, lngRange: 0.03 },
  { city: 'Madinah', region: 'Madinah', lat: 24.4539, lng: 39.6142, latRange: 0.04, lngRange: 0.04 },
  { city: 'AlUla', region: 'Madinah', lat: 26.6174, lng: 37.9157, latRange: 0.02, lngRange: 0.02 },
  { city: 'NEOM', region: 'Tabuk', lat: 27.9500, lng: 35.3000, latRange: 0.05, lngRange: 0.05 },
  { city: 'Abha', region: 'Asir', lat: 18.2164, lng: 42.5053, latRange: 0.03, lngRange: 0.03 },
  { city: 'Dammam', region: 'Eastern Province', lat: 26.3927, lng: 49.9777, latRange: 0.05, lngRange: 0.05 },
  { city: 'Tabuk', region: 'Tabuk', lat: 28.3838, lng: 36.5550, latRange: 0.04, lngRange: 0.04 },
  { city: 'Yanbu', region: 'Madinah', lat: 24.0895, lng: 38.0618, latRange: 0.03, lngRange: 0.03 },
];

const FACILITY_TYPES = ['hotel', 'resort', 'restaurant', 'attraction'] as const;

const CLASSIFICATIONS: Record<string, string[]> = {
  hotel: ['5-star', '4-star', '3-star', '2-star'],
  resort: ['5-star', '4-star', 'Premium', 'Standard'],
  restaurant: ['Premium', 'Standard', 'Fine Dining', 'Casual'],
  attraction: ['Premium', 'Standard', 'Heritage', 'Adventure'],
};

const VIOLATION_TYPES = [
  'fire_safety',
  'hygiene',
  'documentation',
  'service_quality',
  'capacity_violation',
  'unauthorized_modification',
  'noise_complaint',
  'pool_safety',
  'food_safety',
  'accessibility',
] as const;

const VIOLATION_SEVERITY = ['Critical', 'High', 'Medium', 'Low'] as const;

const COMPLAINT_SOURCES = ['CRM', 'OTA', 'direct'] as const;

const COMPLAINT_CATEGORIES = [
  'cleanliness',
  'staff_behavior',
  'safety_concern',
  'noise',
  'food_quality',
  'billing',
  'facility_condition',
] as const;

const COMPLAINT_STATUSES = ['open', 'in_review', 'resolved', 'closed'] as const;

// ---------------------------------------------------------------------------
// Facility definitions (50 facilities)
// ---------------------------------------------------------------------------

interface FacilityDef {
  nameAr: string;
  nameEn: string;
  type: string;
  classification: string;
  cityIndex: number;
  riskProfile: 'low' | 'medium' | 'high' | 'critical';
}

const FACILITIES: FacilityDef[] = [
  // ---- Riyadh (index 0) ----
  { nameAr: 'فندق الفيصلية', nameEn: 'Al Faisaliah Hotel', type: 'hotel', classification: '5-star', cityIndex: 0, riskProfile: 'low' },
  { nameAr: 'فندق المملكة', nameEn: 'Kingdom Hotel', type: 'hotel', classification: '5-star', cityIndex: 0, riskProfile: 'low' },
  { nameAr: 'فندق النخيل بلازا', nameEn: 'Al Nakheel Plaza Hotel', type: 'hotel', classification: '4-star', cityIndex: 0, riskProfile: 'medium' },
  { nameAr: 'منتجع الدرعية', nameEn: 'Diriyah Resort', type: 'resort', classification: 'Premium', cityIndex: 0, riskProfile: 'low' },
  { nameAr: 'مطعم نجد الأصيل', nameEn: 'Najd Heritage Restaurant', type: 'restaurant', classification: 'Fine Dining', cityIndex: 0, riskProfile: 'medium' },
  { nameAr: 'بوليفارد الرياض', nameEn: 'Riyadh Boulevard', type: 'attraction', classification: 'Premium', cityIndex: 0, riskProfile: 'low' },
  { nameAr: 'فندق الواحة', nameEn: 'Al Waha Hotel', type: 'hotel', classification: '3-star', cityIndex: 0, riskProfile: 'high' },

  // ---- Jeddah (index 1) ----
  { nameAr: 'فندق بارك حياة جدة', nameEn: 'Park Hyatt Jeddah', type: 'hotel', classification: '5-star', cityIndex: 1, riskProfile: 'low' },
  { nameAr: 'فندق جدة هيلتون', nameEn: 'Jeddah Hilton Hotel', type: 'hotel', classification: '5-star', cityIndex: 1, riskProfile: 'low' },
  { nameAr: 'منتجع شاطئ الحمراء', nameEn: 'Al Hamra Beach Resort', type: 'resort', classification: '5-star', cityIndex: 1, riskProfile: 'medium' },
  { nameAr: 'مطعم البيك الكورنيش', nameEn: 'Al Baik Corniche', type: 'restaurant', classification: 'Standard', cityIndex: 1, riskProfile: 'low' },
  { nameAr: 'نافورة الملك فهد', nameEn: 'King Fahd Fountain', type: 'attraction', classification: 'Heritage', cityIndex: 1, riskProfile: 'low' },
  { nameAr: 'فندق الأندلس', nameEn: 'Al Andalus Hotel', type: 'hotel', classification: '3-star', cityIndex: 1, riskProfile: 'high' },
  { nameAr: 'مطعم السلطان', nameEn: 'Al Sultan Restaurant', type: 'restaurant', classification: 'Casual', cityIndex: 1, riskProfile: 'critical' },

  // ---- Makkah (index 2) ----
  { nameAr: 'فندق ساعة مكة', nameEn: 'Makkah Clock Tower Hotel', type: 'hotel', classification: '5-star', cityIndex: 2, riskProfile: 'low' },
  { nameAr: 'فندق الصفوة أبراج', nameEn: 'Al Safwah Towers Hotel', type: 'hotel', classification: '5-star', cityIndex: 2, riskProfile: 'low' },
  { nameAr: 'فندق دار الإيمان', nameEn: 'Dar Al Eiman Hotel', type: 'hotel', classification: '4-star', cityIndex: 2, riskProfile: 'medium' },
  { nameAr: 'مطعم البخاري', nameEn: 'Al Bukhari Restaurant', type: 'restaurant', classification: 'Standard', cityIndex: 2, riskProfile: 'medium' },
  { nameAr: 'فندق الحرم بلازا', nameEn: 'Haram Plaza Hotel', type: 'hotel', classification: '3-star', cityIndex: 2, riskProfile: 'high' },

  // ---- Madinah (index 3) ----
  { nameAr: 'فندق المدينة أوبروي', nameEn: 'Madinah Oberoi Hotel', type: 'hotel', classification: '5-star', cityIndex: 3, riskProfile: 'low' },
  { nameAr: 'فندق دار الهجرة', nameEn: 'Dar Al Hijra Hotel', type: 'hotel', classification: '4-star', cityIndex: 3, riskProfile: 'medium' },
  { nameAr: 'فندق الأنوار', nameEn: 'Al Anwar Hotel', type: 'hotel', classification: '4-star', cityIndex: 3, riskProfile: 'low' },
  { nameAr: 'مطعم طيبة المنورة', nameEn: 'Taiba Al Munawara Restaurant', type: 'restaurant', classification: 'Premium', cityIndex: 3, riskProfile: 'low' },
  { nameAr: 'فندق الروضة', nameEn: 'Al Rawdah Hotel', type: 'hotel', classification: '2-star', cityIndex: 3, riskProfile: 'critical' },

  // ---- AlUla (index 4) ----
  { nameAr: 'منتجع حبيتاس العلا', nameEn: 'Habitas AlUla Resort', type: 'resort', classification: '5-star', cityIndex: 4, riskProfile: 'low' },
  { nameAr: 'منتجع بانيان تري العلا', nameEn: 'Banyan Tree AlUla', type: 'resort', classification: '5-star', cityIndex: 4, riskProfile: 'low' },
  { nameAr: 'مدائن صالح', nameEn: 'Hegra Heritage Site', type: 'attraction', classification: 'Heritage', cityIndex: 4, riskProfile: 'low' },
  { nameAr: 'مطعم العلا التراثي', nameEn: 'AlUla Heritage Kitchen', type: 'restaurant', classification: 'Premium', cityIndex: 4, riskProfile: 'medium' },

  // ---- NEOM (index 5) ----
  { nameAr: 'منتجع ذا لاين نيوم', nameEn: 'The Line NEOM Resort', type: 'resort', classification: 'Premium', cityIndex: 5, riskProfile: 'low' },
  { nameAr: 'فندق سندالة نيوم', nameEn: 'Sindalah NEOM Hotel', type: 'hotel', classification: '5-star', cityIndex: 5, riskProfile: 'low' },
  { nameAr: 'مطعم تروجينا', nameEn: 'Trojena Restaurant', type: 'restaurant', classification: 'Fine Dining', cityIndex: 5, riskProfile: 'medium' },
  { nameAr: 'مغامرات نيوم', nameEn: 'NEOM Adventures', type: 'attraction', classification: 'Adventure', cityIndex: 5, riskProfile: 'low' },

  // ---- Abha (index 6) ----
  { nameAr: 'منتجع أبها بالاس', nameEn: 'Abha Palace Resort', type: 'resort', classification: '4-star', cityIndex: 6, riskProfile: 'medium' },
  { nameAr: 'فندق قصر أبها', nameEn: 'Abha Castle Hotel', type: 'hotel', classification: '4-star', cityIndex: 6, riskProfile: 'medium' },
  { nameAr: 'مطعم السودة', nameEn: 'Al Soudah Restaurant', type: 'restaurant', classification: 'Standard', cityIndex: 6, riskProfile: 'high' },
  { nameAr: 'قرية المفتاحة', nameEn: 'Al Muftaha Village', type: 'attraction', classification: 'Heritage', cityIndex: 6, riskProfile: 'low' },
  { nameAr: 'فندق الجبل الأخضر', nameEn: 'Green Mountain Hotel', type: 'hotel', classification: '3-star', cityIndex: 6, riskProfile: 'critical' },

  // ---- Dammam (index 7) ----
  { nameAr: 'فندق شيراتون الدمام', nameEn: 'Sheraton Dammam Hotel', type: 'hotel', classification: '5-star', cityIndex: 7, riskProfile: 'low' },
  { nameAr: 'منتجع الخبر على البحر', nameEn: 'Khobar Seaside Resort', type: 'resort', classification: '4-star', cityIndex: 7, riskProfile: 'medium' },
  { nameAr: 'مطعم الكورنيش', nameEn: 'Corniche Restaurant', type: 'restaurant', classification: 'Casual', cityIndex: 7, riskProfile: 'high' },
  { nameAr: 'جزيرة المرجان', nameEn: 'Coral Island Park', type: 'attraction', classification: 'Standard', cityIndex: 7, riskProfile: 'low' },
  { nameAr: 'فندق القصر الشرقي', nameEn: 'Eastern Palace Hotel', type: 'hotel', classification: '3-star', cityIndex: 7, riskProfile: 'high' },

  // ---- Tabuk (index 8) ----
  { nameAr: 'فندق تبوك هيلتون', nameEn: 'Tabuk Hilton Hotel', type: 'hotel', classification: '4-star', cityIndex: 8, riskProfile: 'medium' },
  { nameAr: 'منتجع شرم تبوك', nameEn: 'Sharma Tabuk Resort', type: 'resort', classification: 'Standard', cityIndex: 8, riskProfile: 'medium' },
  { nameAr: 'مطعم الوادي', nameEn: 'Al Wadi Restaurant', type: 'restaurant', classification: 'Standard', cityIndex: 8, riskProfile: 'critical' },
  { nameAr: 'قلعة تبوك', nameEn: 'Tabuk Castle', type: 'attraction', classification: 'Heritage', cityIndex: 8, riskProfile: 'low' },

  // ---- Yanbu (index 9) ----
  { nameAr: 'فندق موفنبيك ينبع', nameEn: 'Movenpick Yanbu Hotel', type: 'hotel', classification: '5-star', cityIndex: 9, riskProfile: 'low' },
  { nameAr: 'منتجع ينبع البحري', nameEn: 'Yanbu Marine Resort', type: 'resort', classification: '4-star', cityIndex: 9, riskProfile: 'medium' },
  { nameAr: 'مطعم صيد البحر', nameEn: 'Sea Catch Restaurant', type: 'restaurant', classification: 'Casual', cityIndex: 9, riskProfile: 'high' },
  { nameAr: 'ينبع الصناعية بارك', nameEn: 'Yanbu Industrial Park Tour', type: 'attraction', classification: 'Standard', cityIndex: 9, riskProfile: 'low' },
];

// ---------------------------------------------------------------------------
// Risk-profile-dependent configuration
// ---------------------------------------------------------------------------

interface RiskConfig {
  scoreMin: number;
  scoreMax: number;
  riskLevel: string;
  inspections: [number, number]; // min, max count
  violations: [number, number];
  complaints: [number, number];
  inspectionScoreMin: number;
  inspectionScoreMax: number;
}

const RISK_PROFILES: Record<string, RiskConfig> = {
  low: {
    scoreMin: 5, scoreMax: 28,
    riskLevel: 'Low',
    inspections: [3, 6],
    violations: [0, 2],
    complaints: [0, 2],
    inspectionScoreMin: 82,
    inspectionScoreMax: 99,
  },
  medium: {
    scoreMin: 31, scoreMax: 58,
    riskLevel: 'Medium',
    inspections: [4, 7],
    violations: [2, 5],
    complaints: [2, 4],
    inspectionScoreMin: 60,
    inspectionScoreMax: 85,
  },
  high: {
    scoreMin: 62, scoreMax: 78,
    riskLevel: 'High',
    inspections: [5, 8],
    violations: [4, 8],
    complaints: [3, 6],
    inspectionScoreMin: 40,
    inspectionScoreMax: 65,
  },
  critical: {
    scoreMin: 82, scoreMax: 97,
    riskLevel: 'Critical',
    inspections: [6, 10],
    violations: [6, 12],
    complaints: [5, 8],
    inspectionScoreMin: 20,
    inspectionScoreMax: 50,
  },
};

// ---------------------------------------------------------------------------
// Generators for related records
// ---------------------------------------------------------------------------

const INSPECTOR_IDS = [
  'insp_abdulrahman_01',
  'insp_mohammed_02',
  'insp_fatimah_03',
  'insp_noura_04',
  'insp_khalid_05',
  'insp_sara_06',
  'insp_ahmad_07',
  'insp_layla_08',
];

const DATE_START = new Date('2024-01-01');
const DATE_END = new Date('2026-04-13');

function generateFindings(score: number, facilityType: string): object {
  const findingTemplates: Record<string, { positive: string[]; negative: string[] }> = {
    hotel: {
      positive: [
        'Guest rooms well maintained and clean',
        'Front desk staff courteous and efficient',
        'Emergency exits clearly marked',
        'Fire extinguishers inspected and up to date',
        'Elevator maintenance records current',
        'HVAC systems functioning properly',
      ],
      negative: [
        'Some guest rooms show signs of wear and tear',
        'Insufficient staff training documentation',
        'Fire alarm system requires maintenance',
        'Emergency lighting needs replacement in corridor B',
        'Swimming pool pH levels not within acceptable range',
        'Kitchen ventilation system below standard',
        'Pest control records outdated by 3 months',
        'Expired fire extinguisher found on 4th floor',
      ],
    },
    resort: {
      positive: [
        'Beach area clean and well maintained',
        'Water sports equipment properly stored',
        'Spa facilities meet hygiene standards',
        'Landscaping well maintained',
        'Pool water quality excellent',
      ],
      negative: [
        'Lifeguard coverage insufficient during peak hours',
        'Pool area missing required safety signage',
        'Beach equipment showing wear and damage',
        'Outdoor lighting inadequate in garden area',
        'Water filtration system due for replacement',
        'First aid station understocked',
      ],
    },
    restaurant: {
      positive: [
        'Kitchen hygiene standards met',
        'Food storage temperature correctly maintained',
        'Staff health certificates current',
        'Dining area clean and well arranged',
        'Waste disposal procedures followed',
      ],
      negative: [
        'Cold storage temperature 2 degrees above standard',
        'Staff missing updated health certificates',
        'Grease trap requires immediate cleaning',
        'Cross-contamination risk in prep area',
        'Pest control measures inadequate',
        'Expired items found in dry storage',
        'Handwashing station missing soap dispenser',
      ],
    },
    attraction: {
      positive: [
        'Safety barriers in good condition',
        'Signage clear and multilingual',
        'First aid facilities accessible',
        'Crowd management plan in place',
        'Accessibility requirements met',
      ],
      negative: [
        'Safety barrier damaged in section C',
        'Emergency evacuation plan outdated',
        'Accessibility ramp gradient exceeds standard',
        'Lighting insufficient in walkway areas',
        'Crowd capacity monitoring not enforced',
        'Signage faded and difficult to read',
      ],
    },
  };

  const templates = findingTemplates[facilityType] || findingTemplates.hotel;
  const positiveCount = score >= 80 ? randomInt(3, 5) : score >= 60 ? randomInt(2, 3) : randomInt(1, 2);
  const negativeCount = score >= 80 ? randomInt(0, 1) : score >= 60 ? randomInt(1, 3) : randomInt(3, 6);

  return {
    positive: pickN(templates.positive, Math.min(positiveCount, templates.positive.length)),
    negative: pickN(templates.negative, Math.min(negativeCount, templates.negative.length)),
    overallAssessment: score >= 80
      ? 'Facility meets or exceeds standards'
      : score >= 60
        ? 'Facility requires attention in specific areas'
        : score >= 40
          ? 'Facility has significant compliance gaps'
          : 'Facility requires urgent corrective action',
  };
}

function generateViolationDescription(type: string, severity: string): { en: string; ar: string } {
  const descriptions: Record<string, { en: string; ar: string }[]> = {
    fire_safety: [
      { en: 'Fire extinguisher expired or missing in required location', ar: 'طفاية حريق منتهية الصلاحية أو مفقودة في الموقع المطلوب' },
      { en: 'Emergency exit blocked or improperly marked', ar: 'مخرج الطوارئ مسدود أو غير مُعلَّم بشكل صحيح' },
      { en: 'Fire alarm system non-functional', ar: 'نظام إنذار الحريق لا يعمل' },
      { en: 'Missing fire evacuation plan display', ar: 'خطة إخلاء الحريق غير معروضة' },
    ],
    hygiene: [
      { en: 'Unsanitary conditions in food preparation area', ar: 'ظروف غير صحية في منطقة إعداد الطعام' },
      { en: 'Pest evidence found in storage areas', ar: 'وجود آثار آفات في مناطق التخزين' },
      { en: 'Insufficient cleaning protocols documented', ar: 'بروتوكولات التنظيف الموثقة غير كافية' },
      { en: 'Bathroom facilities not meeting hygiene standards', ar: 'مرافق الحمامات لا تستوفي معايير النظافة' },
    ],
    documentation: [
      { en: 'Operating license not displayed in visible location', ar: 'رخصة التشغيل غير معروضة في مكان ظاهر' },
      { en: 'Staff training records incomplete or missing', ar: 'سجلات تدريب الموظفين غير مكتملة أو مفقودة' },
      { en: 'Safety inspection certificates expired', ar: 'شهادات فحص السلامة منتهية الصلاحية' },
      { en: 'Guest register not properly maintained', ar: 'سجل النزلاء غير محدث بشكل صحيح' },
    ],
    service_quality: [
      { en: 'Service standards below classification requirements', ar: 'معايير الخدمة أقل من متطلبات التصنيف' },
      { en: 'Insufficient trained staff during peak hours', ar: 'عدم كفاية الموظفين المدربين خلال ساعات الذروة' },
      { en: 'Guest amenities not matching advertised services', ar: 'وسائل الراحة لا تتطابق مع الخدمات المعلنة' },
    ],
    capacity_violation: [
      { en: 'Facility operating beyond maximum capacity', ar: 'المنشأة تعمل بما يتجاوز السعة القصوى' },
      { en: 'Overcrowding in dining area exceeding safety limits', ar: 'اكتظاظ في منطقة الطعام يتجاوز حدود السلامة' },
      { en: 'Event capacity exceeded without authorization', ar: 'تجاوز سعة الحدث بدون ترخيص' },
    ],
    unauthorized_modification: [
      { en: 'Structural changes made without approval', ar: 'تغييرات هيكلية بدون موافقة' },
      { en: 'Electrical system modified without licensed contractor', ar: 'تعديل النظام الكهربائي بدون مقاول مرخص' },
      { en: 'Room configuration altered from approved plans', ar: 'تغيير تكوين الغرف عن المخططات المعتمدة' },
    ],
    noise_complaint: [
      { en: 'Noise levels exceeding permitted decibel limits', ar: 'مستويات الضوضاء تتجاوز حدود الديسيبل المسموح بها' },
      { en: 'Entertainment activities violating quiet hours', ar: 'أنشطة ترفيهية تنتهك ساعات الهدوء' },
    ],
    pool_safety: [
      { en: 'Swimming pool missing required safety equipment', ar: 'حوض السباحة يفتقر إلى معدات السلامة المطلوبة' },
      { en: 'Pool water quality below acceptable standards', ar: 'جودة مياه المسبح أقل من المعايير المقبولة' },
      { en: 'No certified lifeguard on duty during operating hours', ar: 'عدم وجود منقذ معتمد أثناء ساعات العمل' },
    ],
    food_safety: [
      { en: 'Food stored at improper temperatures', ar: 'تخزين الطعام في درجات حرارة غير مناسبة' },
      { en: 'Cross-contamination risk in food preparation', ar: 'خطر التلوث المتبادل في إعداد الطعام' },
      { en: 'Expired food items found in kitchen storage', ar: 'مواد غذائية منتهية الصلاحية في مخزن المطبخ' },
      { en: 'Staff handling food without proper protective equipment', ar: 'تداول الطعام بدون معدات الحماية المناسبة' },
    ],
    accessibility: [
      { en: 'Wheelchair ramp gradient exceeds allowed maximum', ar: 'انحدار منحدر الكرسي المتحرك يتجاوز الحد المسموح' },
      { en: 'Accessible bathroom facilities non-compliant', ar: 'مرافق الحمامات لذوي الإعاقة غير مطابقة' },
      { en: 'Missing tactile indicators for visually impaired', ar: 'مؤشرات لمسية مفقودة لضعاف البصر' },
    ],
  };

  const options = descriptions[type] || descriptions.documentation;
  return pick(options);
}

function getRegulatoryArticle(type: string): string {
  const articles: Record<string, string[]> = {
    fire_safety: ['Article 14.2 - Fire Safety Standards', 'Article 14.5 - Emergency Equipment', 'Article 14.8 - Evacuation Plans'],
    hygiene: ['Article 22.1 - Hygiene Requirements', 'Article 22.3 - Sanitation Standards', 'Article 22.7 - Pest Control'],
    documentation: ['Article 5.1 - Operating Documentation', 'Article 5.4 - Record Keeping', 'Article 5.9 - License Display'],
    service_quality: ['Article 31.2 - Service Standards', 'Article 31.5 - Staff Qualifications', 'Article 31.8 - Classification Compliance'],
    capacity_violation: ['Article 18.1 - Maximum Capacity', 'Article 18.3 - Crowd Management'],
    unauthorized_modification: ['Article 9.2 - Structural Modifications', 'Article 9.5 - Approved Plans Compliance'],
    noise_complaint: ['Article 27.1 - Noise Limits', 'Article 27.4 - Quiet Hours'],
    pool_safety: ['Article 16.1 - Pool Safety', 'Article 16.3 - Water Quality Standards', 'Article 16.6 - Lifeguard Requirements'],
    food_safety: ['Article 24.1 - Food Safety Standards', 'Article 24.4 - Temperature Controls', 'Article 24.7 - Food Handling'],
    accessibility: ['Article 12.1 - Accessibility Requirements', 'Article 12.3 - Disability Access'],
  };
  return pick(articles[type] || articles.documentation);
}

function getPenalty(severity: string): number {
  switch (severity) {
    case 'Critical': return pick([50000, 75000, 100000, 150000]);
    case 'High': return pick([20000, 30000, 40000, 50000]);
    case 'Medium': return pick([5000, 10000, 15000, 20000]);
    case 'Low': return pick([1000, 2000, 3000, 5000]);
    default: return 5000;
  }
}

function generateComplaintDescription(category: string, source: string): string {
  const templates: Record<string, string[]> = {
    cleanliness: [
      'Room was not properly cleaned upon arrival, found hair and dust in the bathroom.',
      'The lobby area had visible stains on the carpet and unpleasant odor.',
      'Bedsheets appeared to not have been changed between guests.',
      'Restaurant tables were sticky and not properly sanitized.',
      'Common areas had overflowing trash bins and debris on the floor.',
    ],
    staff_behavior: [
      'Front desk staff was rude and unhelpful when addressing room issue.',
      'Concierge refused to assist with transportation arrangement.',
      'Wait staff was dismissive and took over 45 minutes for basic order.',
      'Security personnel was unnecessarily aggressive with guests.',
      'Housekeeping staff entered room without knocking or permission.',
    ],
    safety_concern: [
      'Exposed electrical wiring observed in guest room near the bathroom.',
      'Fire exit was blocked by storage equipment on the 3rd floor.',
      'Swimming pool area lacked any visible safety equipment or signage.',
      'Broken glass in the playground area posing risk to children.',
      'Elevator malfunctioned with guests inside, took 30 minutes to resolve.',
    ],
    noise: [
      'Construction noise starting at 6 AM despite hotel promising quiet hours.',
      'Adjacent nightclub noise made it impossible to sleep before 2 AM.',
      'Air conditioning unit producing loud rattling noise throughout the night.',
      'Wedding event noise levels were excessive well past midnight.',
    ],
    food_quality: [
      'Found a foreign object in the served meal at the restaurant.',
      'Food appeared undercooked and potentially unsafe to consume.',
      'Breakfast buffet items appeared to be reused from previous day.',
      'Allergenic ingredients not properly labeled in the menu.',
      'Room service food arrived cold and presentation was poor.',
    ],
    billing: [
      'Charged for services not received including minibar items never consumed.',
      'Double-charged for room rate, refund not processed after multiple requests.',
      'Hidden fees not disclosed at time of booking appeared on final bill.',
      'Deposit not returned within promised timeframe after checkout.',
    ],
    facility_condition: [
      'Air conditioning not working in guest room during peak summer.',
      'Hot water not available for two consecutive days during the stay.',
      'Bathroom plumbing leak causing water damage and mold growth.',
      'Television and WiFi not functional in multiple guest rooms.',
      'Gym equipment broken and out of service for an extended period.',
    ],
  };
  return pick(templates[category] || templates.cleanliness);
}

// ---------------------------------------------------------------------------
// AI classification data for violations
// ---------------------------------------------------------------------------

function generateAiClassification(type: string, severity: string): object {
  const confidenceBase = severity === 'Critical' ? 0.92 : severity === 'High' ? 0.87 : severity === 'Medium' ? 0.78 : 0.72;
  const confidence = Math.round((confidenceBase + (rand() * 0.08)) * 100) / 100;

  const relatedTypes: Record<string, string[]> = {
    fire_safety: ['building_safety', 'emergency_preparedness'],
    hygiene: ['food_safety', 'public_health'],
    documentation: ['regulatory_compliance', 'licensing'],
    service_quality: ['guest_satisfaction', 'classification_compliance'],
    capacity_violation: ['fire_safety', 'crowd_management'],
    unauthorized_modification: ['building_safety', 'documentation'],
    noise_complaint: ['community_impact', 'service_quality'],
    pool_safety: ['guest_safety', 'hygiene'],
    food_safety: ['hygiene', 'public_health'],
    accessibility: ['regulatory_compliance', 'guest_services'],
  };

  return {
    primaryCategory: type,
    relatedCategories: relatedTypes[type] || ['general_compliance'],
    confidence,
    suggestedAction: severity === 'Critical'
      ? 'immediate_closure_review'
      : severity === 'High'
        ? 'corrective_action_required_7_days'
        : severity === 'Medium'
          ? 'corrective_action_required_30_days'
          : 'advisory_notice',
    modelVersion: 'mumtathil-iq-v2.1',
  };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding Mumtathil IQ database...\n');

  // Clear existing data in dependency order
  await prisma.complaint.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  // ---- Create admin user ----
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      id: cuid(),
      email: 'admin@mt.gov.sa',
      password: hashedPassword,
      nameEn: 'System Administrator',
      nameAr: 'مدير النظام',
      role: 'admin',
    },
  });
  console.log(`  Created admin user: ${adminUser.email}`);

  // ---- Create inspector users ----
  const inspectorNames = [
    { en: 'Abdulrahman Al-Qahtani', ar: 'عبدالرحمن القحطاني' },
    { en: 'Mohammed Al-Harbi', ar: 'محمد الحربي' },
    { en: 'Fatimah Al-Zahrani', ar: 'فاطمة الزهراني' },
    { en: 'Noura Al-Otaibi', ar: 'نورة العتيبي' },
    { en: 'Khalid Al-Ghamdi', ar: 'خالد الغامدي' },
    { en: 'Sara Al-Mutairi', ar: 'سارة المطيري' },
    { en: 'Ahmad Al-Shehri', ar: 'أحمد الشهري' },
    { en: 'Layla Al-Dosari', ar: 'ليلى الدوسري' },
  ];

  for (let i = 0; i < inspectorNames.length; i++) {
    const inspPwd = await bcrypt.hash('inspector123', 12);
    await prisma.user.create({
      data: {
        id: INSPECTOR_IDS[i],
        email: `${inspectorNames[i].en.split(' ')[0].toLowerCase()}@mt.gov.sa`,
        password: inspPwd,
        nameEn: inspectorNames[i].en,
        nameAr: inspectorNames[i].ar,
        role: 'inspector',
      },
    });
  }
  console.log(`  Created ${inspectorNames.length} inspector users`);

  // ---- Create manager user ----
  const mgrPwd = await bcrypt.hash('manager123', 12);
  await prisma.user.create({
    data: {
      id: cuid(),
      email: 'manager@mt.gov.sa',
      password: mgrPwd,
      nameEn: 'Fahad Al-Tamimi',
      nameAr: 'فهد التميمي',
      role: 'manager',
    },
  });
  console.log('  Created manager user');

  // ---- Track totals ----
  let totalInspections = 0;
  let totalViolations = 0;
  let totalComplaints = 0;

  // ---- Create facilities with related data ----
  for (let i = 0; i < FACILITIES.length; i++) {
    const f = FACILITIES[i];
    const cityInfo = CITIES[f.cityIndex];
    const riskConfig = RISK_PROFILES[f.riskProfile];

    const facilityId = cuid();
    const riskScore = randomInt(riskConfig.scoreMin, riskConfig.scoreMax);
    const licenseYear = randomInt(2020, 2024);
    const licenseSeq = String(1000 + i).padStart(4, '0');
    const licenseNumber = `MT-${licenseYear}-${licenseSeq}`;

    // Jitter GPS coordinates within city bounds
    const lat = cityInfo.lat + (rand() - 0.5) * 2 * cityInfo.latRange;
    const lng = cityInfo.lng + (rand() - 0.5) * 2 * cityInfo.lngRange;

    // License expiry: spread across 2025-2027
    const licenseExpiry = new Date(`${randomInt(2025, 2027)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`);

    // ---- Generate inspections ----
    const inspectionCount = randomInt(riskConfig.inspections[0], riskConfig.inspections[1]);
    const inspectionData: Array<{
      id: string;
      date: Date;
      inspectorId: string;
      status: string;
      score: number;
      findings: object;
      aiSummary: string | null;
    }> = [];

    for (let j = 0; j < inspectionCount; j++) {
      const inspDate = randomDate(DATE_START, DATE_END);
      const inspScore = randomInt(riskConfig.inspectionScoreMin, riskConfig.inspectionScoreMax);
      const isFuture = inspDate > new Date();
      const status = isFuture
        ? pick(['pending', 'in-progress'])
        : rand() < 0.9
          ? 'completed'
          : pick(['pending', 'in-progress']);

      const findings = generateFindings(inspScore, f.type);
      const aiSummary = status === 'completed'
        ? `Inspection scored ${inspScore}/100. ${inspScore >= 80
          ? 'Facility demonstrates strong compliance with regulations.'
          : inspScore >= 60
            ? 'Several areas require improvement to meet full compliance.'
            : inspScore >= 40
              ? 'Significant compliance gaps identified requiring corrective action within 30 days.'
              : 'Critical deficiencies found. Immediate corrective action required.'
        } ${(findings as any).negative.length > 0 ? `${(findings as any).negative.length} finding(s) require attention.` : 'No negative findings.'}`
        : null;

      inspectionData.push({
        id: cuid(),
        date: inspDate,
        inspectorId: pick(INSPECTOR_IDS),
        status,
        score: inspScore,
        findings,
        aiSummary,
      });
    }

    // Sort inspections by date descending to find last inspection
    inspectionData.sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastCompletedInspection = inspectionData.find((ins) => ins.status === 'completed');

    // ---- Generate violations ----
    const violationCount = randomInt(riskConfig.violations[0], riskConfig.violations[1]);
    const violationData: Array<{
      id: string;
      date: Date;
      type: string;
      severity: string;
      description: string;
      descriptionAr: string;
      regulatoryArticle: string;
      penalty: number;
      status: string;
      aiClassification: object;
    }> = [];

    // Bias violation types based on facility type
    const typeBias: Record<string, string[]> = {
      hotel: ['fire_safety', 'hygiene', 'documentation', 'service_quality', 'noise_complaint', 'accessibility'],
      resort: ['pool_safety', 'fire_safety', 'hygiene', 'capacity_violation', 'noise_complaint', 'accessibility'],
      restaurant: ['food_safety', 'hygiene', 'documentation', 'capacity_violation', 'fire_safety'],
      attraction: ['capacity_violation', 'accessibility', 'fire_safety', 'documentation', 'noise_complaint'],
    };
    const relevantTypes = typeBias[f.type] || [...VIOLATION_TYPES];

    for (let j = 0; j < violationCount; j++) {
      const violType = pick(relevantTypes);
      // Higher-risk facilities get more severe violations
      const severityWeights = f.riskProfile === 'critical'
        ? ['Critical', 'Critical', 'High', 'High', 'Medium']
        : f.riskProfile === 'high'
          ? ['Critical', 'High', 'High', 'Medium', 'Medium']
          : f.riskProfile === 'medium'
            ? ['High', 'Medium', 'Medium', 'Low', 'Low']
            : ['Medium', 'Low', 'Low', 'Low', 'Low'];
      const severity = pick(severityWeights);

      const desc = generateViolationDescription(violType, severity);
      const violDate = randomDate(DATE_START, DATE_END);
      const daysSince = (DATE_END.getTime() - violDate.getTime()) / (1000 * 60 * 60 * 24);
      const status = severity === 'Critical' && daysSince < 30
        ? 'open'
        : rand() < 0.3
          ? 'open'
          : rand() < 0.1
            ? 'appealed'
            : 'resolved';

      violationData.push({
        id: cuid(),
        date: violDate,
        type: violType,
        severity,
        description: desc.en,
        descriptionAr: desc.ar,
        regulatoryArticle: getRegulatoryArticle(violType),
        penalty: getPenalty(severity),
        status,
        aiClassification: generateAiClassification(violType, severity),
      });
    }

    // ---- Generate complaints ----
    const complaintCount = randomInt(riskConfig.complaints[0], riskConfig.complaints[1]);
    const complaintData: Array<{
      id: string;
      date: Date;
      source: string;
      category: string;
      severity: string;
      description: string;
      status: string;
    }> = [];

    // Bias complaint categories based on facility type
    const categoryBias: Record<string, string[]> = {
      hotel: ['cleanliness', 'staff_behavior', 'noise', 'facility_condition', 'billing', 'safety_concern'],
      resort: ['facility_condition', 'safety_concern', 'cleanliness', 'noise', 'staff_behavior', 'billing'],
      restaurant: ['food_quality', 'cleanliness', 'staff_behavior', 'billing', 'noise'],
      attraction: ['safety_concern', 'facility_condition', 'staff_behavior', 'noise', 'billing'],
    };
    const relevantCategories = categoryBias[f.type] || [...COMPLAINT_CATEGORIES];

    for (let j = 0; j < complaintCount; j++) {
      const category = pick(relevantCategories);
      const source = pick([...COMPLAINT_SOURCES]);
      const compSeverity = f.riskProfile === 'critical'
        ? pick(['Critical', 'High', 'High', 'Medium'])
        : f.riskProfile === 'high'
          ? pick(['High', 'Medium', 'Medium', 'Low'])
          : pick(['Medium', 'Low', 'Low', 'Low']);
      const compDate = randomDate(DATE_START, DATE_END);
      const daysSinceComp = (DATE_END.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24);
      const compStatus = daysSinceComp < 14 ? pick(['open', 'in_review']) : pick([...COMPLAINT_STATUSES]);

      complaintData.push({
        id: cuid(),
        date: compDate,
        source,
        category,
        severity: compSeverity,
        description: generateComplaintDescription(category, source),
        status: compStatus,
      });
    }

    // ---- Persist facility + related data ----
    await prisma.facility.create({
      data: {
        id: facilityId,
        nameAr: f.nameAr,
        nameEn: f.nameEn,
        type: f.type,
        classification: f.classification,
        region: cityInfo.region,
        city: cityInfo.city,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        licenseNumber,
        licenseExpiry,
        riskScore,
        riskLevel: riskConfig.riskLevel,
        lastInspection: lastCompletedInspection?.date ?? null,
        inspections: {
          createMany: {
            data: inspectionData.map((ins) => ({
              id: ins.id,
              date: ins.date,
              inspectorId: ins.inspectorId,
              status: ins.status,
              score: ins.score,
              findings: ins.findings as any,
              aiSummary: ins.aiSummary,
            })),
          },
        },
        violations: {
          createMany: {
            data: violationData.map((v) => ({
              id: v.id,
              date: v.date,
              type: v.type,
              severity: v.severity,
              description: v.description,
              descriptionAr: v.descriptionAr,
              regulatoryArticle: v.regulatoryArticle,
              penalty: v.penalty,
              status: v.status,
              aiClassification: v.aiClassification as any,
            })),
          },
        },
        complaints: {
          createMany: {
            data: complaintData.map((c) => ({
              id: c.id,
              date: c.date,
              source: c.source,
              category: c.category,
              severity: c.severity,
              description: c.description,
              status: c.status,
            })),
          },
        },
      },
    });

    totalInspections += inspectionData.length;
    totalViolations += violationData.length;
    totalComplaints += complaintData.length;

    const riskIndicator = f.riskProfile === 'critical' ? '[!!]' : f.riskProfile === 'high' ? '[! ]' : '    ';
    console.log(
      `  ${riskIndicator} ${String(i + 1).padStart(2, '0')}. ${f.nameEn.padEnd(35)} | ${cityInfo.city.padEnd(10)} | ${f.type.padEnd(12)} | Risk: ${riskConfig.riskLevel.padEnd(8)} | I:${inspectionData.length} V:${violationData.length} C:${complaintData.length}`,
    );
  }

  // ---- Summary ----
  console.log('\n--- Seed Summary ---');
  console.log(`  Users:        ${inspectorNames.length + 2} (1 admin, 1 manager, ${inspectorNames.length} inspectors)`);
  console.log(`  Facilities:   ${FACILITIES.length}`);
  console.log(`  Inspections:  ${totalInspections}`);
  console.log(`  Violations:   ${totalViolations}`);
  console.log(`  Complaints:   ${totalComplaints}`);
  console.log(`  Total records: ${FACILITIES.length + totalInspections + totalViolations + totalComplaints + inspectorNames.length + 2}`);

  // ---- Breakdown by risk level ----
  const riskBreakdown = FACILITIES.reduce(
    (acc, f) => {
      acc[f.riskProfile] = (acc[f.riskProfile] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('\n--- Risk Distribution ---');
  Object.entries(riskBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([level, count]) => {
      console.log(`  ${level.padEnd(10)}: ${count} facilities`);
    });

  // ---- Breakdown by city ----
  const cityBreakdown = FACILITIES.reduce(
    (acc, f) => {
      const city = CITIES[f.cityIndex].city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('\n--- City Distribution ---');
  Object.entries(cityBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([city, count]) => {
      console.log(`  ${city.padEnd(12)}: ${count} facilities`);
    });

  console.log('\nSeed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
