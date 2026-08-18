import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-key';
const mockUsers = [];

const createApp = () => {
  const app = express();
  app.use(express.json());
  let users = [];

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name, email,
      password: hashedPassword,
      role: users.length === 0 ? 'admin' : 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  });

  return app;
};

describe('Auth API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(res.status).toBe(201);
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.token).toBeDefined();
    });

    it('makes first user admin', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123'
      });
      expect(res.body.user.role).toBe('admin');
    });

    it('makes subsequent users customer', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Admin', email: 'admin@example.com', password: 'password123'
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Customer', email: 'customer@example.com', password: 'password123'
      });
      expect(res.body.user.role).toBe('customer');
    });

    it('rejects missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('All fields required');
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'First', email: 'dup@example.com', password: 'password123'
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Second', email: 'dup@example.com', password: 'password456'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Test User', email: 'test@example.com', password: 'password123'
      });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.token).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('rejects non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'noone@example.com', password: 'password123'
      });
      expect(res.status).toBe(401);
    });

    it('rejects missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });
  });
});
