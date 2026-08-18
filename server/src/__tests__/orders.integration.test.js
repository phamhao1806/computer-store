import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';

const mockState = vi.hoisted(() => ({
  orders: [],
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(async () => JSON.stringify(mockState.orders)),
    writeFile: vi.fn(async (_path, data) => {
      mockState.orders = JSON.parse(data);
    }),
  },
}));

const { default: orderRoutes } = await import('../routes/orders.js');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
  return app;
};

const customerToken = jwt.sign(
  { id: 'customer-1', email: 'customer@example.com', role: 'customer' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const otherCustomerToken = jwt.sign(
  { id: 'customer-2', email: 'other@example.com', role: 'customer' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const adminToken = jwt.sign(
  { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const validOrder = {
  customer: { name: 'Nguyen Van A', phone: '0901234567', address: '123 Le Loi' },
  items: [{ id: '1', name: 'Laptop', price: 30000000, quantity: 1 }],
  total: 30000000,
};

describe('Orders routes integration', () => {
  let app;

  beforeEach(() => {
    mockState.orders = [];
    app = createApp();
  });

  it('keeps guest checkout working without attaching a user owner', async () => {
    const res = await request(app).post('/api/orders').send(validOrder);

    expect(res.status).toBe(201);
    expect(res.body.userId).toBeNull();
    expect(res.body.userEmail).toBeNull();
  });

  it('attaches user owner when checkout includes a valid bearer token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validOrder);

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('customer-1');
    expect(res.body.userEmail).toBe('customer@example.com');
  });

  it('returns only current user orders from GET /api/orders/my', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validOrder);
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ ...validOrder, customer: { name: 'Other', phone: '0900000000', address: '456 Hai Ba Trung' } });

    const res = await request(app)
      .get('/api/orders/my')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe('customer-1');
  });

  it('requires authentication for current user orders', async () => {
    const res = await request(app).get('/api/orders/my');

    expect(res.status).toBe(401);
  });

  it('allows admin to update order status and rejects invalid statuses', async () => {
    const created = await request(app).post('/api/orders').send(validOrder);

    const invalid = await request(app)
      .patch(`/api/orders/${created.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'unknown' });
    expect(invalid.status).toBe(400);

    const valid = await request(app)
      .patch(`/api/orders/${created.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' });
    expect(valid.status).toBe(200);
    expect(valid.body.status).toBe('processing');
  });
});
