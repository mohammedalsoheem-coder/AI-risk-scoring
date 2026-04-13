import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateChecklist } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET / — List inspections with optional facilityId filter
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.query;

    const where: Record<string, unknown> = {};

    if (facilityId && typeof facilityId === 'string') {
      where.facilityId = facilityId;
    }

    const inspections = await prisma.inspection.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        facility: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
      },
    });

    res.json(inspections);
  } catch (error) {
    console.error('[Inspections] GET / error:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// ---------------------------------------------------------------------------
// POST /checklist — AI-generated inspection checklist
// ---------------------------------------------------------------------------

router.post('/checklist', async (req: Request, res: Response) => {
  try {
    const { facilityType, classification } = req.body;

    if (!facilityType || typeof facilityType !== 'string') {
      res
        .status(400)
        .json({ error: 'Missing or invalid "facilityType" in request body' });
      return;
    }

    if (!classification || typeof classification !== 'string') {
      res
        .status(400)
        .json({
          error: 'Missing or invalid "classification" in request body',
        });
      return;
    }

    const checklist = await generateChecklist(facilityType, classification);

    res.json({ checklist });
  } catch (error) {
    console.error('[Inspections] POST /checklist error:', error);
    res.status(500).json({ error: 'Failed to generate checklist' });
  }
});

export default router;
