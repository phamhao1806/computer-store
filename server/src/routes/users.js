import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { readCollection } from '../utils/db.js';

const router = Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await readCollection('users');
    const safe = users.map(({ password, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;
