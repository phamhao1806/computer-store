import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = (data, ok = true, status = 200) => {
  return vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  );
};

describe('API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchProducts', () => {
    it('fetches all products', async () => {
      const products = [{ id: '1', name: 'Laptop' }, { id: '2', name: 'Desktop' }];
      globalThis.fetch = mockFetch(products);

      const { fetchProducts } = await import('../services/api');
      const result = await fetchProducts();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Laptop');
    });

    it('fetches products with query params', async () => {
      globalThis.fetch = mockFetch([{ id: '1', name: 'Laptop' }]);

      const { fetchProducts } = await import('../services/api');
      await fetchProducts({ category: 'laptop', sort: 'price-asc' });

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/products?category=laptop&sort=price-asc');
    });

    it('throws on failed request', async () => {
      globalThis.fetch = mockFetch({}, false, 500);

      const { fetchProducts } = await import('../services/api');
      await expect(fetchProducts()).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('fetchProductById', () => {
    it('fetches a single product', async () => {
      const product = { id: '1', name: 'Laptop' };
      globalThis.fetch = mockFetch(product);

      const { fetchProductById } = await import('../services/api');
      const result = await fetchProductById('1');

      expect(result.name).toBe('Laptop');
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/products/1');
    });

    it('throws on 404', async () => {
      globalThis.fetch = mockFetch({}, false, 404);

      const { fetchProductById } = await import('../services/api');
      await expect(fetchProductById('999')).rejects.toThrow('Product not found');
    });
  });

  describe('registerUser', () => {
    it('registers successfully', async () => {
      const response = { user: { name: 'Test' }, token: 'jwt' };
      globalThis.fetch = mockFetch(response, true, 201);

      const { registerUser } = await import('../services/api');
      const result = await registerUser({ name: 'Test', email: 't@t.com', password: '123456' });

      expect(result.token).toBe('jwt');
    });

    it('throws with server message on failure', async () => {
      globalThis.fetch = mockFetch({ message: 'Email already exists' }, false, 400);

      const { registerUser } = await import('../services/api');
      await expect(registerUser({ name: 'Test' })).rejects.toThrow('Email already exists');
    });
  });

  describe('loginUser', () => {
    it('logs in successfully', async () => {
      const response = { user: { email: 't@t.com' }, token: 'jwt' };
      globalThis.fetch = mockFetch(response);

      const { loginUser } = await import('../services/api');
      const result = await loginUser({ email: 't@t.com', password: '123456' });

      expect(result.token).toBe('jwt');
    });

    it('throws with server message on invalid credentials', async () => {
      globalThis.fetch = mockFetch({ message: 'Invalid credentials' }, false, 401);

      const { loginUser } = await import('../services/api');
      await expect(loginUser({ email: 't@t.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('createOrder', () => {
    it('creates an order', async () => {
      const order = { id: 'ORD-1', status: 'pending' };
      globalThis.fetch = mockFetch(order, true, 201);

      const { createOrder } = await import('../services/api');
      const result = await createOrder({ customer: {}, items: [], total: 0 });

      expect(result.id).toBe('ORD-1');
    });

    it('passes bearer token when creating an authenticated order', async () => {
      const order = { id: 'ORD-1', userId: 'user-1', status: 'pending' };
      globalThis.fetch = mockFetch(order, true, 201);

      const { createOrder } = await import('../services/api');
      await createOrder({ customer: {}, items: [{ id: '1' }], total: 1 }, 'jwt-token');

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jwt-token' },
        body: JSON.stringify({ customer: {}, items: [{ id: '1' }], total: 1 }),
      });
    });
  });

  describe('fetchMyOrders', () => {
    it('fetches current user orders with bearer token', async () => {
      const orders = [{ id: 'ORD-1', status: 'pending' }];
      globalThis.fetch = mockFetch(orders);

      const { fetchMyOrders } = await import('../services/api');
      const result = await fetchMyOrders('jwt-token');

      expect(result).toEqual(orders);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders/my', {
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jwt-token' },
      });
    });

    it('throws when current user orders fail to load', async () => {
      globalThis.fetch = mockFetch({ message: 'Unauthorized' }, false, 401);

      const { fetchMyOrders } = await import('../services/api');
      await expect(fetchMyOrders('bad-token')).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateOrderStatus', () => {
    it('updates an order status with bearer token', async () => {
      const order = { id: 'ORD-1', status: 'processing' };
      globalThis.fetch = mockFetch(order);

      const { updateOrderStatus } = await import('../services/api');
      const result = await updateOrderStatus('ORD-1', 'processing', 'jwt-token');

      expect(result.status).toBe('processing');
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders/ORD-1/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jwt-token' },
        body: JSON.stringify({ status: 'processing' }),
      });
    });
  });

  describe('createReview', () => {
    it('creates a review', async () => {
      const review = { id: 'r1', rating: 5, comment: 'Great!' };
      globalThis.fetch = mockFetch(review, true, 201);

      const { createReview } = await import('../services/api');
      const result = await createReview('1', { rating: 5, comment: 'Great!' });

      expect(result.rating).toBe(5);
    });

    it('throws with server message on duplicate review', async () => {
      globalThis.fetch = mockFetch({ message: 'You already reviewed this product' }, false, 400);

      const { createReview } = await import('../services/api');
      await expect(createReview('1', {})).rejects.toThrow('You already reviewed this product');
    });
  });
});
