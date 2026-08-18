import { Router } from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const usersPath = join(__dirname, '..', 'data', 'users.json');

const readUsers = async () => {
  try {
    const data = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await readUsers();
    const safe = users.map(({ password, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;
