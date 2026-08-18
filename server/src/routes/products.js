import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { readCollection, writeCollection } from '../utils/db.js';
import { VALID_CATEGORIES, ALLOWED_FIELDS } from '../constants.js';

const router = Router();

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

router.get('/', async (req, res) => {
  try {
    const products = await readCollection('products');
    const { category, brand, search, sort, minPrice, maxPrice, featured } = req.query;

    let filtered = [...products];

    if (category) filtered = filtered.filter(p => p.category === category);
    if (brand) filtered = filtered.filter(p => p.brand === brand);
    if (featured === 'true') filtered = filtered.filter(p => p.featured);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') filtered.sort((a, b) => Number(b.id) - Number(a.id));

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    res.json({
      data: items,
      pagination: { page, limit, total, totalPages }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const products = await readCollection('products');
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    if (!data.name || !data.brand || !data.category || data.price === undefined) {
      return res.status(400).json({ message: 'name, brand, category, price are required' });
    }
    if (!VALID_CATEGORIES.includes(data.category)) {
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      return res.status(400).json({ message: 'price must be a positive number' });
    }

    data.name = sanitizeString(data.name);
    data.brand = sanitizeString(data.brand);
    data.description = sanitizeString(data.description || '');
    if (data.badge) data.badge = sanitizeString(data.badge);

    const products = await readCollection('products');
    const newProduct = { id: uuidv4(), ...data, rating: 0, reviews: 0 };
    products.push(newProduct);
    await writeCollection('products', products);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
      return res.status(400).json({ message: 'price must be a positive number' });
    }

    if (data.name) data.name = sanitizeString(data.name);
    if (data.brand) data.brand = sanitizeString(data.brand);
    if (data.description) data.description = sanitizeString(data.description);
    if (data.badge) data.badge = sanitizeString(data.badge);

    const products = await readCollection('products');
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Product not found' });
    products[idx] = { ...products[idx], ...data };
    await writeCollection('products', products);
    res.json(products[idx]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const products = await readCollection('products');
    const filtered = products.filter(p => p.id !== req.params.id);
    if (filtered.length === products.length) return res.status(404).json({ message: 'Product not found' });
    await writeCollection('products', filtered);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
