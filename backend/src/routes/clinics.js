import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get current clinic info
router.get('/current', async (req, res) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.clinicId },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            evaluations: true,
          },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinica nu a fost găsită' });
    }

    res.json(clinic);
  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({ error: 'Eroare la obținerea informațiilor clinicii' });
  }
});

// Update clinic info (admin only)
router.put('/current', requireRole('ADMIN'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Don't allow changing these fields
    delete updateData.id;
    delete updateData.createdAt;

    const clinic = await prisma.clinic.update({
      where: { id: req.clinicId },
      data: updateData,
    });

    res.json(clinic);
  } catch (error) {
    console.error('Update clinic error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea clinicii' });
  }
});

export default router;
