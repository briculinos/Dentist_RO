import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { logger } from '../index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de autentificare lipsă' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with clinic information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        clinic: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Utilizator invalid sau inactiv' });
    }

    if (!user.clinic.isActive) {
      return res.status(403).json({ error: 'Clinica este inactivă' });
    }

    req.user = user;
    req.clinicId = user.clinicId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirat' });
    }
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Eroare de autentificare' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificare necesară' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Nu aveți permisiunile necesare pentru această acțiune',
      });
    }

    next();
  };
};

// Audit logging middleware
export const auditLog = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await prisma.auditLog.create({
            data: {
              clinicId: req.clinicId,
              userId: req.user?.id,
              action: action,
              entityType: req.params.entityType || 'UNKNOWN',
              entityId: req.params.id || 'UNKNOWN',
              changes: JSON.stringify({
                path: req.path,
                method: req.method,
                body: req.body,
              }),
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
            },
          });
        } catch (error) {
          logger.error('Audit log error:', error);
        }
      }

      return originalJson(data);
    };

    next();
  };
};
