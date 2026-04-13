import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /heatmap — Heatmap data and facility markers
// ---------------------------------------------------------------------------

router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const { riskLevel, dateFrom, dateTo, violationType } = req.query;

    // ---- Facility markers (filtered by riskLevel if provided) ----

    const facilityWhere: Record<string, unknown> = {};
    if (riskLevel && typeof riskLevel === 'string') {
      facilityWhere.riskLevel = riskLevel;
    }

    const facilities = await prisma.facility.findMany({
      where: facilityWhere,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        type: true,
        region: true,
        city: true,
        lat: true,
        lng: true,
        riskScore: true,
        riskLevel: true,
      },
    });

    // ---- Heatmap points: aggregate violations per region ----

    const violationWhere: Record<string, unknown> = {};

    if (dateFrom && typeof dateFrom === 'string') {
      violationWhere.date = {
        ...(violationWhere.date as object),
        gte: new Date(dateFrom),
      };
    }

    if (dateTo && typeof dateTo === 'string') {
      violationWhere.date = {
        ...(violationWhere.date as object),
        lte: new Date(dateTo),
      };
    }

    if (violationType && typeof violationType === 'string') {
      violationWhere.type = violationType;
    }

    // If riskLevel filter is set, restrict violations to matching facilities
    if (riskLevel && typeof riskLevel === 'string') {
      violationWhere.facility = { riskLevel };
    }

    const violations = await prisma.violation.findMany({
      where: violationWhere,
      select: {
        facilityId: true,
        facility: {
          select: {
            region: true,
            lat: true,
            lng: true,
          },
        },
      },
    });

    // Group by region and compute average lat/lng + intensity (count)
    const regionMap: Record<
      string,
      { latSum: number; lngSum: number; count: number }
    > = {};

    for (const v of violations) {
      const region = v.facility.region;
      if (!regionMap[region]) {
        regionMap[region] = { latSum: 0, lngSum: 0, count: 0 };
      }
      regionMap[region].latSum += v.facility.lat;
      regionMap[region].lngSum += v.facility.lng;
      regionMap[region].count += 1;
    }

    const heatmapPoints = Object.entries(regionMap).map(
      ([region, data]) => ({
        region,
        lat: data.latSum / data.count,
        lng: data.lngSum / data.count,
        intensity: data.count,
      }),
    );

    // Add violation count per facility
    const facilityViolationCounts: Record<string, number> = {};
    for (const v of violations) {
      const fId = (v as any).facilityId;
      if (fId) facilityViolationCounts[fId] = (facilityViolationCounts[fId] || 0) + 1;
    }

    const facilitiesWithCount = facilities.map((f) => ({
      ...f,
      violationCount: facilityViolationCounts[f.id] || 0,
    }));

    res.json({
      heatmap: heatmapPoints.map((p) => ({ ...p, violationCount: p.intensity })),
      facilities: facilitiesWithCount,
    });
  } catch (error) {
    console.error('[Geo] GET /heatmap error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

export default router;
