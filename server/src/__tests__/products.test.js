import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

let app;
let originalReadFile;
let originalWriteFile;

const mockProducts = [
  { id: '1', name: 'Laptop A', brand: 'BrandA', category: 'laptop', price: 30000000, rating: 4.5, featured: true, description: 'Good laptop' },
  { id: '2', name: 'Desktop B', brand: 'BrandB', category: 'desktop', price: 50000000, rating: 4.0, featured: false, description: 'Good desktop' },
  { id: '3', name: 'Monitor C', brand: 'BrandA', category: 'monitor', price: 15000000, rating: 4.8, featured: true, description: 'Good monitor' },
];

const createApp = () => {
  const app = express();
  app.use(express.json());

  let products = JSON.parse(JSON.stringify(mockProducts));

  app.get('/api/products', (req, res) => {
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
  });

  app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const newProduct = { id: Date.now().toString(), ...req.body, rating: 0, reviews: 0 };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Product not found' });
    products[idx] = { ...products[idx], ...req.body };
    res.json(products[idx]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const before = products.length;
    products = products.filter(p => p.id !== req.params.id);
    if (products.length === before) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  });

  return app;
};

describe('Products API', () => {
  beforeEach(() => {
    app = createApp();
  });

  describe('GET /api/products', () => {
    it('returns all products when no filters', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.page).toBe(1);
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/products?category=laptop');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe('laptop');
    });

    it('filters by brand', async () => {
      const res = await request(app).get('/api/products?brand=BrandA');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every(p => p.brand === 'BrandA')).toBe(true);
    });

    it('filters by featured=true', async () => {
      const res = await request(app).get('/api/products?featured=true');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every(p => p.featured)).toBe(true);
    });

    it('searches by name', async () => {
      const res = await request(app).get('/api/products?search=laptop');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Laptop A');
    });

    it('searches by brand', async () => {
      const res = await request(app).get('/api/products?search=brandb');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('searches by description', async () => {
      const res = await request(app).get('/api/products?search=monitor');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('filters by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=20000000&maxPrice=40000000');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].price).toBe(30000000);
    });

    it('sorts by price ascending', async () => {
      const res = await request(app).get('/api/products?sort=price-asc');
      expect(res.status).toBe(200);
      expect(res.body.data[0].price).toBe(15000000);
      expect(res.body.data[2].price).toBe(50000000);
    });

    it('sorts by price descending', async () => {
      const res = await request(app).get('/api/products?sort=price-desc');
      expect(res.status).toBe(200);
      expect(res.body.data[0].price).toBe(50000000);
      expect(res.body.data[2].price).toBe(15000000);
    });

    it('sorts by rating', async () => {
      const res = await request(app).get('/api/products?sort=rating');
      expect(res.status).toBe(200);
      expect(res.body.data[0].rating).toBe(4.8);
      expect(res.body.data[2].rating).toBe(4.0);
    });

    it('returns empty array when no match', async () => {
      const res = await request(app).get('/api/products?search=nonexistent');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('combines multiple filters', async () => {
      const res = await request(app).get('/api/products?category=laptop&minPrice=20000000&maxPrice=40000000');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Laptop A');
    });

    it('paginates results with default limit', async () => {
      const res = await request(app).get('/api/products');
      expect(res.body.pagination).toEqual({ page: 1, limit: 12, total: 3, totalPages: 1 });
    });

    it('paginates with custom page and limit', async () => {
      const res = await request(app).get('/api/products?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it('returns second page correctly', async () => {
      const res = await request(app).get('/api/products?page=2&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.page).toBe(2);
    });

    it('clamps limit to max 100', async () => {
      const res = await request(app).get('/api/products?limit=500');
      expect(res.body.pagination.limit).toBe(100);
    });

    it('clamps page to minimum 1', async () => {
      const res = await request(app).get('/api/products?page=-1');
      expect(res.body.pagination.page).toBe(1);
    });

    it('returns empty data for page beyond results', async () => {
      const res = await request(app).get('/api/products?page=99');
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.total).toBe(3);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
      expect(res.body.name).toBe('Laptop A');
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product', async () => {
      const newProduct = { name: 'New Laptop', brand: 'BrandC', category: 'laptop', price: 25000000 };
      const res = await request(app).post('/api/products').send(newProduct);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Laptop');
      expect(res.body.rating).toBe(0);
      expect(res.body.reviews).toBe(0);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates an existing product', async () => {
      const res = await request(app).put('/api/products/1').send({ price: 28000000 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(28000000);
      expect(res.body.name).toBe('Laptop A');
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).put('/api/products/999').send({ price: 1000 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes an existing product', async () => {
      const res = await request(app).delete('/api/products/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Deleted');

      const all = await request(app).get('/api/products');
      expect(all.body.data).toHaveLength(2);
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).delete('/api/products/999');
      expect(res.status).toBe(404);
    });
  });
});
