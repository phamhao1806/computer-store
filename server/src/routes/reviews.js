import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readCollection, writeCollection } from '../utils/db.js';

const router = Router();

router.get('/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await readCollection('reviews');
    const productReviews = reviews.filter(r => r.productId === req.params.id);
    res.json(productReviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

router.post('/products/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.email;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields: rating and comment' });
    }
    const numRating = Number(rating);
    if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (typeof comment !== 'string' || comment.trim().length < 3) {
      return res.status(400).json({ message: 'Comment must be at least 3 characters' });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ message: 'Comment must not exceed 1000 characters' });
    }

    const sanitizedComment = comment.replace(/<[^>]*>/g, '').trim();

    const reviews = await readCollection('reviews');
    const existing = reviews.find(r => r.productId === req.params.id && r.userId === userId);
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = {
      id: Date.now().toString(),
      productId: req.params.id,
      userId,
      userName,
      rating: numRating,
      comment: sanitizedComment,
      createdAt: new Date().toISOString(),
    };

    reviews.push(review);
    await writeCollection('reviews', reviews);

    const productReviews = reviews.filter(r => r.productId === req.params.id);
    const avgRating = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;

    const products = await readCollection('products');
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      products[idx].rating = Math.round(avgRating * 10) / 10;
      products[idx].reviews = productReviews.length;
      await writeCollection('products', products);
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review' });
  }
});

export default router;
