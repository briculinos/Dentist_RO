import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, auditLog } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Advanced search for patients and evaluations
router.get('/', auditLog('READ'), async (req, res) => {
  try {
    const { query, type = 'all', limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Interogarea trebuie să conțină cel puțin 2 caractere',
      });
    }

    const results = {
      patients: [],
      evaluations: [],
    };

    // Search patients
    if (type === 'all' || type === 'patients') {
      results.patients = await prisma.patient.findMany({
        where: {
          clinicId: req.clinicId,
          isArchived: false,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { cnp: { contains: query } },
            { phone: { contains: query } },
          ],
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { evaluations: true },
          },
        },
      });
    }

    // Search evaluations
    if (type === 'all' || type === 'evaluations') {
      results.evaluations = await prisma.medicalEvaluation.findMany({
        where: {
          clinicId: req.clinicId,
          isArchived: false,
          patient: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { cnp: { contains: query } },
            ],
          },
        },
        take: parseInt(limit),
        orderBy: { evaluationDate: 'desc' },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              cnp: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Eroare la căutare' });
  }
});

export default router;
