import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const createApp = () => {
  const app = express();
  app.use(express.json());
  let orders = [];

  app.post('/api/orders', (req, res) => {
    const { customer, items, total } = req.body;
    if (!customer || !items || !items.length) return res.status(400).json({ message: 'Invalid order data' });

    const order = {
      id: `ORD-${Date.now()}`,
      customer, items, total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
  });

  app.get('/api/orders', (req, res) => {
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const idx = orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Order not found' });
    orders[idx].status = req.body.status;
    res.json(orders[idx]);
  });

  return app;
};

describe('Orders API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/orders', () => {
    it('creates an order successfully', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: { name: 'Nguyen Van A', phone: '0901234567', address: '123 Le Loi' },
        items: [{ id: '1', name: 'Laptop', price: 30000000, quantity: 1 }],
        total: 30000000
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^ORD-/);
      expect(res.body.status).toBe('pending');
      expect(res.body.customer.name).toBe('Nguyen Van A');
      expect(res.body.items).toHaveLength(1);
    });

    it('rejects empty items', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: { name: 'Test' },
        items: [],
        total: 0
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid order data');
    });

    it('rejects missing customer', async () => {
      const res = await request(app).post('/api/orders').send({
        items: [{ id: '1', name: 'Laptop', price: 30000000, quantity: 1 }],
        total: 30000000
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('returns empty array when no orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns orders sorted by date descending', async () => {
      await request(app).post('/api/orders').send({
        customer: { name: 'First' },
        items: [{ id: '1', name: 'Laptop', price: 30000000, quantity: 1 }],
        total: 30000000
      });
      await request(app).post('/api/orders').send({
        customer: { name: 'Second' },
        items: [{ id: '2', name: 'Desktop', price: 50000000, quantity: 1 }],
        total: 50000000
      });

      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].customer.name).toBe('Second');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('updates order status', async () => {
      const created = await request(app).post('/api/orders').send({
        customer: { name: 'Test' },
        items: [{ id: '1', name: 'Laptop', price: 30000000, quantity: 1 }],
        total: 30000000
      });

      const res = await request(app)
        .patch(`/api/orders/${created.body.id}/status`)
        .send({ status: 'processing' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('processing');
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/ORD-999/status')
        .send({ status: 'processing' });
      expect(res.status).toBe(404);
    });
  });
});
