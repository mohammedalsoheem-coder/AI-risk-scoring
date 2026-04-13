import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /kpis — Key performance indicators for the dashboard
// ---------------------------------------------------------------------------

router.get('/kpis', async (_req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run independent queries in parallel
    const [
      totalFacilities,
      highRiskCount,
      pendingInspections,
      avgScoreResult,
      riskDistributionRaw,
      recentViolations,
      lowRiskFacilities,
    ] = await Promise.all([
      // Total number of facilities
      prisma.facility.count(),

      // High-risk count (High or Critical)
      prisma.facility.count({
        where: {
          riskLevel: { in: ['High', 'Critical'] },
        },
      }),

      // Pending inspections
      prisma.inspection.count({
        where: { status: 'pending' },
      }),

      // Average risk score
      prisma.facility.aggregate({
        _avg: { riskScore: true },
      }),

      // Risk distribution by level
      prisma.facility.groupBy({
        by: ['riskLevel'],
        _count: { _all: true },
      }),

      // Violations in the last 30 days
      prisma.violation.count({
        where: {
          date: { gte: thirtyDaysAgo },
        },
      }),

      // Facilities with score < 30 (compliant)
      prisma.facility.count({
        where: {
          riskScore: { lt: 30 },
        },
      }),
    ]);

    // Build risk distribution as array for frontend charts
    const riskDistribution = ['Low', 'Medium', 'High', 'Critical'].map((level) => {
      const found = riskDistributionRaw.find((e) => e.riskLevel === level);
      return { level, count: found ? found._count._all : 0 };
    });

    // Compliance rate
    const complianceRate =
      totalFacilities > 0
        ? Math.round((lowRiskFacilities / totalFacilities) * 10000) / 100
        : 0;

    res.json({
      totalFacilities,
      highRiskCount,
      pendingInspections,
      avgScore:
        Math.round((avgScoreResult._avg.riskScore ?? 0) * 100) / 100,
      riskDistribution,
      recentViolations,
      complianceRate,
    });
  } catch (error) {
    console.error('[Dashboard] GET /kpis error:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// ---------------------------------------------------------------------------
// GET /priority-queue — Top 10 highest-risk facilities
// ---------------------------------------------------------------------------

router.get('/priority-queue', async (_req: Request, res: Response) => {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { riskScore: 'desc' },
      take: 10,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        type: true,
        region: true,
        city: true,
        riskScore: true,
        riskLevel: true,
        lastInspection: true,
        _count: {
          select: { violations: true },
        },
      },
    });

    res.json(facilities);
  } catch (error) {
    console.error('[Dashboard] GET /priority-queue error:', error);
    res.status(500).json({ error: 'Failed to fetch priority queue' });
  }
});

export default router;
