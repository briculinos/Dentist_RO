import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken, auditLog } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', auditLog('LOGIN'), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email și parolă sunt obligatorii' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        clinic: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Contul este inactiv' });
    }

    if (!user.clinic.isActive) {
      return res.status(403).json({ error: 'Clinica este inactivă' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken(user.id, user.clinicId);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinic: {
          id: user.clinic.id,
          name: user.clinic.name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      clinic: {
        id: req.user.clinic.id,
        name: req.user.clinic.name,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Eroare la obținerea datelor utilizatorului' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Ambele parole sunt obligatorii' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Parola nouă trebuie să aibă cel puțin 8 caractere',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Parola curentă este incorectă' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Eroare la schimbarea parolei' });
  }
});

export default router;
