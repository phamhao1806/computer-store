import { Router } from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authMiddleware, optionalAuthMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ordersPath = join(__dirname, '..', 'data', 'orders.json');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const readOrders = async () => {
  try {
    const data = await fs.readFile(ordersPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};
const writeOrders = (data) => fs.writeFile(ordersPath, JSON.stringify(data, null, 2));

router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    if (!customer || !items || !items.length) return res.status(400).json({ message: 'Invalid order data' });
    if (!customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ message: 'Customer name, phone, and address are required' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ message: 'Invalid order total' });
    }

    const orders = await readOrders();
    const order = {
      id: `ORD-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      customer: {
        name: customer.name.replace(/<[^>]*>/g, '').trim(),
        phone: customer.phone.replace(/<[^>]*>/g, '').trim(),
        address: customer.address.replace(/<[^>]*>/g, '').trim(),
      },
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    await writeOrders(orders);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order' });
  }
});

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await readOrders();
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await readOrders();
    const myOrders = orders
      .filter(o => o.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(myOrders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const orders = await readOrders();
    const idx = orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Order not found' });
    orders[idx].status = status;
    await writeOrders(orders);
    res.json(orders[idx]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

export default router;
