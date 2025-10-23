import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireRole, auditLog } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new evaluation
router.post('/', auditLog('CREATE'), async (req, res) => {
  try {
    const { patientId, ...evaluationData } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'ID-ul pacientului este obligatoriu' });
    }

    // Verify patient belongs to this clinic
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId: req.clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    const evaluation = await prisma.medicalEvaluation.create({
      data: {
        ...evaluationData,
        patientId,
        clinicId: req.clinicId,
        userId: req.user.id,
        evaluationDate: new Date(),
      },
      include: {
        patient: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Eroare la crearea evaluării medicale' });
  }
});

// Get all evaluations for clinic (with filtering)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      patientId,
      evaluationType,
      startDate,
      endDate,
      archived,
    } = req.query;

    const where = {
      clinicId: req.clinicId,
      isArchived: archived === 'true',
    };

    if (patientId) {
      where.patientId = patientId;
    }

    if (evaluationType) {
      where.evaluationType = evaluationType;
    }

    if (startDate || endDate) {
      where.evaluationDate = {};
      if (startDate) {
        where.evaluationDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.evaluationDate.lte = new Date(endDate);
      }
    }

    const [evaluations, total] = await Promise.all([
      prisma.medicalEvaluation.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
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
      }),
      prisma.medicalEvaluation.count({ where }),
    ]);

    res.json({
      evaluations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Eroare la obținerea evaluărilor' });
  }
});

// Get single evaluation
router.get('/:id', auditLog('READ'), async (req, res) => {
  try {
    const evaluation = await prisma.medicalEvaluation.findFirst({
      where: {
        id: req.params.id,
        clinicId: req.clinicId,
      },
      include: {
        patient: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluarea nu a fost găsită' });
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Eroare la obținerea evaluării' });
  }
});

// Update evaluation
router.put('/:id', requireRole('ADMIN', 'DOCTOR'), auditLog('UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow changing these fields
    delete updateData.id;
    delete updateData.clinicId;
    delete updateData.patientId;
    delete updateData.userId;
    delete updateData.createdAt;

    const evaluation = await prisma.medicalEvaluation.findFirst({
      where: {
        id,
        clinicId: req.clinicId,
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluarea nu a fost găsită' });
    }

    const updated = await prisma.medicalEvaluation.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update evaluation error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea evaluării' });
  }
});

// Archive evaluation
router.post('/:id/archive', requireRole('ADMIN', 'DOCTOR'), auditLog('UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.medicalEvaluation.findFirst({
      where: {
        id,
        clinicId: req.clinicId,
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluarea nu a fost găsită' });
    }

    const updated = await prisma.medicalEvaluation.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Archive evaluation error:', error);
    res.status(500).json({ error: 'Eroare la arhivarea evaluării' });
  }
});

export default router;
