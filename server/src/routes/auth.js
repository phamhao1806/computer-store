import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { JWT_SECRET } from '../middleware/auth.js';

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
const writeUsers = (data) => fs.writeFile(usersPath, JSON.stringify(data, null, 2));

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const users = await readUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: users.length === 0 ? 'admin' : 'customer',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeUsers(users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({ user: userWithoutPassword, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const users = await readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;

  res.json({ user: userWithoutPassword, token });
});

export default router;
