import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { classifyViolation } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET / — List violations with optional filters
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { facilityId, severity, status } = req.query;

    const where: Record<string, unknown> = {};

    if (facilityId && typeof facilityId === 'string') {
      where.facilityId = facilityId;
    }

    if (severity && typeof severity === 'string') {
      where.severity = severity;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const violations = await prisma.violation.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        facility: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
          },
        },
      },
    });

    res.json(violations);
  } catch (error) {
    console.error('[Violations] GET / error:', error);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// ---------------------------------------------------------------------------
// POST /classify — AI-powered violation classification
// ---------------------------------------------------------------------------

router.post('/classify', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      res
        .status(400)
        .json({ error: 'Missing or invalid "description" in request body' });
      return;
    }

    const classification = await classifyViolation(description);

    res.json(classification);
  } catch (error) {
    console.error('[Violations] POST /classify error:', error);
    res.status(500).json({ error: 'Failed to classify violation' });
  }
});

export default router;
