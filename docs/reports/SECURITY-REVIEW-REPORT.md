# Security Review Report — NexTech Computer Store

**Date:** 2026-05-06
**Scope:** `server/src/` (Express.js backend)
**Auditor:** Security Review Skill

---

## Summary

Server có **7 Critical/High vulnerabilities** và **4 Medium/Low issues**. Mức độ nghiêm trọng: **KHÔNG AN TOÀN ĐỂ DEPLOY**. Cần fix tất cả Critical/High trước khi đưa lên production.

---

## 🔴 Critical Issues (3)

### C-1: Hardcoded JWT Secret

**File:** `server/src/routes/auth.js:14`

```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'computer-store-secret-key-2024';
```

**Risk:** Bất kỳ ai biết secret này đều có thể **forge JWT token** và impersonate bất kỳ user, kể cả admin. Token có thể tạo thủ công mà không cần đăng ký/login.

**Fix:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
```

---

### C-2: Không có Authentication Middleware

**File:** `server/src/middleware/` — thư mục trống

**Risk:** Tất cả endpoints (bao gồm admin-only) đều **không yêu cầu JWT verification**:
- `POST /api/products` — ai cũng tạo sản phẩm
- `PUT /api/products/:id` — ai cũng sửa sản phẩm
- `DELETE /api/products/:id` — ai cũng xóa sản phẩm
- `PATCH /api/orders/:id/status` — ai cũng cập nhật trạng thái đơn hàng
- `GET /api/users` — ai cũng xem danh sách users

Client gửi `Authorization: Bearer ${token}` nhưng **server không bao giờ đọc/verify token này**.

**Fix:** Tạo `server/src/middleware/auth.js`:
```javascript
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
};
```

Áp dụng lên routes: `router.post('/', authenticate, requireAdmin, handler)`

---

### C-3: Mass Assignment — Unsanitized Input

**File:** `server/src/routes/products.js:62`

```javascript
const newProduct = { id: Date.now().toString(), ...req.body, rating: 0, reviews: 0 };
```

**Risk:** `...req.body` cho phép attacker inject **bất kỳ field nào** vào product object: `role`, `isAdmin`, `price: 0`, v.v. Tương tự ở `products.js:72` (PUT).

**Fix:** Whitelist fields:
```javascript
const { name, brand, category, price, description, image, specs, stock } = req.body;
const newProduct = { id: Date.now().toString(), name, brand, category, price, description, image, specs, stock, rating: 0, reviews: 0 };
```

---

## 🟡 High Priority Issues (4)

### H-1: Synchronous File I/O — Race Condition & Blocking

**Files:** Tất cả routes (`products.js:12-13`, `auth.js:16-20`, `orders.js:12-16`, `reviews.js:12-16`)

```javascript
const readProducts = () => JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
const writeProducts = (data) => fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
```

**Risk:**
1. **Event loop blocking** — `readFileSync`/`writeFileSync` chặn toàn bộ Node.js event loop, làm chờ tất cả requests khác
2. **Race condition** — Hai requests concurrent đọc/ghi cùng file → **data loss**. Không có locking mechanism.

**Fix:** Dùng async I/O + file locking, hoặc chuyển sang database (PostgreSQL/MongoDB như đã plan).

---

### H-2: User Data & PII Committed to Git

**Files:**
- `server/src/data/users.json` — chứa name, email, bcrypt password hash
- `server/src/data/orders.json` — chứa customer name, phone, address (PII)

**Risk:** Thông tin cá nhân người dùng trong git history. Dù password đã hash, email/PII vẫn nhạy cảm.

**Fix:**
1. Add `server/src/data/users.json` và `orders.json` vào `.gitignore`
2. Tạo `users.example.json` với dummy data
3. `git filter-branch` hoặc BFG để xoá khỏi history nếu đã push

---

### H-3: Không có Rate Limiting trên Auth Endpoints

**File:** `server/src/routes/auth.js:22-63`

**Risk:** `/api/auth/login` và `/api/auth/register` không có rate limiting → brute-force password attacks, account enumeration.

**Fix:**
```bash
npm install express-rate-limit
```
```javascript
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
router.post('/login', authLimiter, handler);
router.post('/register', authLimiter, handler);
```

---

### H-4: Order Status Không Validate Whitelist

**File:** `server/src/routes/orders.js:46`

```javascript
orders[idx].status = req.body.status; // Chấp nhận bất kỳ string nào
```

**Risk:** Attacker có thể set status thành bất kỳ giá trị: `"hacked"`, `"delivered"` (bỏ qua verification), v.v.

**Fix:**
```javascript
const VALID_STATUSES = ['pending', 'processing', 'shipping', 'delivered'];
if (!VALID_STATUSES.includes(req.body.status))
  return res.status(400).json({ message: 'Invalid status' });
```

---

## 🟢 Medium Priority Issues (3)

### M-1: CORS Hardcoded cho localhost

**File:** `server/src/index.js:12`

```javascript
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```

**Fix:** Dùng environment variable cho allowed origins:
```javascript
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
```

---

### M-2: Không có Security Headers

**File:** `server/src/index.js` — không sử dụng Helmet

**Fix:**
```bash
npm install helmet
```
```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

### M-3: bcrypt Rounds Quá Thấp

**File:** `server/src/routes/auth.js:29`

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

10 rounds là minimum. Khuyến nghị **12 rounds** cho production.

---

## ℹ️ Low / Informational (1)

### I-1: Error Messages Có Thể Leak Internal Info

Khi `JSON.parse` fail hoặc `fs.readFileSync` throw, Express default error handler trả về stack trace nếu `NODE_ENV !== 'production'`.

**Fix:** Thêm global error handler và set `NODE_ENV=production`.

---

## Recommendations (Prioritized)

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Tạo auth middleware + apply lên admin routes | Critical | Medium |
| 2 | Move JWT_SECRET sang env var bắt buộc | Critical | Low |
| 3 | Whitelist input fields cho POST/PUT routes | Critical | Low |
| 4 | Chuyển sang async file I/O hoặc database | High | High |
| 5 | Remove PII khỏi git, add `.gitignore` | High | Medium |
| 6 | Thêm rate limiting cho auth endpoints | High | Low |
| 7 | Validate order status whitelist | High | Low |
| 8 | Dùng Helmet cho security headers | Medium | Low |
| 9 | CORS config từ env var | Medium | Low |
| 10 | Tăng bcrypt rounds lên 12 | Low | Low |

---

## Verdict

**⛔ KHÔNG AN TOÀN ĐỂ DEPLOY** — Cần fix ít nhất 3 Critical issues trước khi expose ra internet.
