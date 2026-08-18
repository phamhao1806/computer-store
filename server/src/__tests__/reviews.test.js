import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const createApp = () => {
  const app = express();
  app.use(express.json());
  let reviews = [];
  let products = [
    { id: '1', name: 'Laptop', rating: 0, reviews: 0 },
    { id: '2', name: 'Desktop', rating: 4.0, reviews: 5 }
  ];

  app.get('/api/products/:id/reviews', (req, res) => {
    const productReviews = reviews.filter(r => r.productId === req.params.id);
    res.json(productReviews);
  });

  app.post('/api/products/:id/reviews', (req, res) => {
    const { userId, userName, rating, comment } = req.body;
    if (!rating || !comment || !userId || !userName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const existing = reviews.find(r => r.productId === req.params.id && r.userId === userId);
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = {
      id: Date.now().toString(),
      productId: req.params.id,
      userId, userName,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    reviews.push(review);

    const productReviews = reviews.filter(r => r.productId === req.params.id);
    const avgRating = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      products[idx].rating = Math.round(avgRating * 10) / 10;
      products[idx].reviews = productReviews.length;
    }

    res.status(201).json(review);
  });

  return app;
};

describe('Reviews API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /api/products/:id/reviews', () => {
    it('returns empty array when no reviews', async () => {
      const res = await request(app).get('/api/products/1/reviews');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns reviews for a product', async () => {
      await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 5, comment: 'Great!'
      });
      const res = await request(app).get('/api/products/1/reviews');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].comment).toBe('Great!');
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('creates a review successfully', async () => {
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 5, comment: 'Excellent product!'
      });
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
      expect(res.body.comment).toBe('Excellent product!');
      expect(res.body.productId).toBe('1');
    });

    it('rejects missing fields', async () => {
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', rating: 5
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('rejects rating below 1', async () => {
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 0, comment: 'Bad'
      });
      expect(res.status).toBe(400);
    });

    it('rejects rating above 5', async () => {
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 6, comment: 'Too high'
      });
      expect(res.status).toBe(400);
    });

    it('rejects duplicate review from same user', async () => {
      await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 5, comment: 'First review'
      });
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 4, comment: 'Second review'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('You already reviewed this product');
    });

    it('allows different users to review same product', async () => {
      await request(app).post('/api/products/1/reviews').send({
        userId: 'u1', userName: 'Alice', rating: 5, comment: 'Alice review'
      });
      const res = await request(app).post('/api/products/1/reviews').send({
        userId: 'u2', userName: 'Bob', rating: 4, comment: 'Bob review'
      });
      expect(res.status).toBe(201);
    });
  });
});
