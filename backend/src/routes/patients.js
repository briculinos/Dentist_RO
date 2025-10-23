import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireRole, auditLog } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new patient
router.post('/', auditLog('CREATE'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      cnp,
      address,
      city,
      county,
      idType,
      idSeries,
      idNumber,
      phone,
      email,
      gdprConsent,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !cnp || !address) {
      return res.status(400).json({
        error: 'Numele, prenumele, CNP și adresa sunt obligatorii',
      });
    }

    if (!gdprConsent) {
      return res.status(400).json({
        error: 'Consimțământul GDPR este obligatoriu',
      });
    }

    // Check if patient already exists in this clinic
    const existing = await prisma.patient.findUnique({
      where: {
        clinicId_cnp: {
          clinicId: req.clinicId,
          cnp: cnp,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Un pacient cu acest CNP există deja în această clinică',
      });
    }

    const patient = await prisma.patient.create({
      data: {
        clinicId: req.clinicId,
        firstName,
        lastName,
        cnp,
        address,
        city,
        county,
        idType,
        idSeries,
        idNumber,
        phone,
        email,
        gdprConsent,
        gdprConsentDate: gdprConsent ? new Date() : null,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Eroare la crearea pacientului' });
  }
});

// Get all patients for clinic (with pagination and search)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, archived } = req.query;

    const where = {
      clinicId: req.clinicId,
      isArchived: archived === 'true',
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { cnp: { contains: search } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { evaluations: true },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Eroare la obținerea pacienților' });
  }
});

// Get single patient
router.get('/:id', auditLog('READ'), async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: {
        id: req.params.id,
        clinicId: req.clinicId,
      },
      include: {
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Eroare la obținerea pacientului' });
  }
});

// Update patient
router.put('/:id', auditLog('UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow changing clinicId or CNP
    delete updateData.clinicId;
    delete updateData.cnp;
    delete updateData.id;

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId: req.clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea pacientului' });
  }
});

// Archive patient (soft delete)
router.post('/:id/archive', requireRole('ADMIN', 'DOCTOR'), auditLog('UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId: req.clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Archive patient error:', error);
    res.status(500).json({ error: 'Eroare la arhivarea pacientului' });
  }
});

// Unarchive patient
router.post('/:id/unarchive', requireRole('ADMIN', 'DOCTOR'), auditLog('UPDATE'), async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId: req.clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Unarchive patient error:', error);
    res.status(500).json({ error: 'Eroare la dezarhivarea pacientului' });
  }
});

export default router;
