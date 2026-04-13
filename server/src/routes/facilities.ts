import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeRisk } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET / — List facilities with filtering, sorting, and counts
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      region,
      riskLevel,
      sortBy = 'riskScore',
      order = 'desc',
    } = req.query;

    // Build dynamic where clause
    const where: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (region && typeof region === 'string') {
      where.region = region;
    }

    if (riskLevel && typeof riskLevel === 'string') {
      where.riskLevel = riskLevel;
    }

    // Validate sortBy to prevent injection
    const allowedSortFields = [
      'riskScore',
      'nameEn',
      'nameAr',
      'type',
      'region',
      'lastInspection',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'riskScore';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const facilities = await prisma.facility.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      include: {
        _count: {
          select: {
            violations: true,
            complaints: true,
          },
        },
      },
    });

    res.json(facilities);
  } catch (error) {
    console.error('[Facilities] GET / error:', error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Single facility with recent inspections, violations, complaints
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        inspections: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        violations: {
          orderBy: { date: 'desc' },
        },
        complaints: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    res.json(facility);
  } catch (error) {
    console.error('[Facilities] GET /:id error:', error);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/risk — AI-powered risk analysis
// ---------------------------------------------------------------------------

router.get('/:id/risk', async (req: Request, res: Response) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        inspections: { orderBy: { date: 'desc' }, take: 10 },
        violations: { orderBy: { date: 'desc' } },
        complaints: { orderBy: { date: 'desc' } },
      },
    });

    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const analysis = await analyzeRisk({
      name: facility.nameEn,
      type: facility.type,
      classification: facility.classification,
      region: facility.region,
      currentScore: facility.riskScore,
      inspections: facility.inspections,
      violations: facility.violations,
      complaints: facility.complaints,
    });

    res.json(analysis);
  } catch (error) {
    console.error('[Facilities] GET /:id/risk error:', error);
    res.status(500).json({ error: 'Failed to generate risk analysis' });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/score — Recalculate & persist risk score
// ---------------------------------------------------------------------------

router.post('/:id/score', async (req: Request, res: Response) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        inspections: { orderBy: { date: 'desc' }, take: 10 },
        violations: { orderBy: { date: 'desc' } },
        complaints: { orderBy: { date: 'desc' } },
      },
    });

    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const analysis = await analyzeRisk({
      name: facility.nameEn,
      type: facility.type,
      classification: facility.classification,
      region: facility.region,
      currentScore: facility.riskScore,
      inspections: facility.inspections,
      violations: facility.violations,
      complaints: facility.complaints,
    });

    const updated = await prisma.facility.update({
      where: { id: req.params.id },
      data: {
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
      },
    });

    res.json({ facility: updated, analysis });
  } catch (error) {
    console.error('[Facilities] POST /:id/score error:', error);
    res.status(500).json({ error: 'Failed to recalculate risk score' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/timeline — Monthly inspection scores for the last 12 months
// ---------------------------------------------------------------------------

router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const facilityExists = await prisma.facility.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!facilityExists) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const inspections = await prisma.inspection.findMany({
      where: {
        facilityId: req.params.id,
        date: { gte: twelveMonthsAgo },
      },
      orderBy: { date: 'asc' },
      select: { date: true, score: true },
    });

    // Group by month
    const monthlyData: Record<string, { total: number; count: number }> = {};

    for (const inspection of inspections) {
      const key = `${inspection.date.getFullYear()}-${String(inspection.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { total: 0, count: 0 };
      }
      monthlyData[key].total += inspection.score;
      monthlyData[key].count += 1;
    }

    const timeline = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgScore: Math.round((data.total / data.count) * 100) / 100,
      inspectionCount: data.count,
    }));

    res.json(timeline);
  } catch (error) {
    console.error('[Facilities] GET /:id/timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

export default router;
