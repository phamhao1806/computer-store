# Security Audit Report — NexTech Computer Store

**Auditor:** Security Auditor Agent  
**Date:** 2026-05-06  
**Scope:** Full application (client + server)  
**Baseline:** OWASP Top 10 (2021)

---

## Summary

| Severity | Count |
|----------|-------|
| **Critical** | 3 |
| **High** | 4 |
| **Medium** | 4 |
| **Low** | 3 |
| **Info** | 3 |

**Overall Risk Level: CRITICAL** — Không nên deploy lên production cho đến khi fix tất cả Critical + High findings.

---

## Findings

### [CRITICAL-01] No Authentication Middleware on Admin API Endpoints

- **Location:** `server/src/routes/products.js:60-83`, `server/src/routes/orders.js:36-49`, `server/src/routes/users.js:17-21`
- **Description:** Tất cả admin-only endpoints (create/update/delete products, list/update orders, list users) không có bất kỳ authentication/authorization check nào. Bất kỳ HTTP client nào cũng có thể gọi trực tiếp.
- **Impact:** Attacker có thể xóa toàn bộ sản phẩm, thay đổi giá, xem danh sách users, thay đổi trạng thái đơn hàng, tạo sản phẩm giả.
- **Proof of Concept:**
  ```bash
  # Xóa sản phẩm — không cần token
  curl -X DELETE http://localhost:5001/api/products/1

  # Xem danh sách users
  curl http://localhost:5001/api/users

  # Thay đổi trạng thái đơn hàng
  curl -X PATCH http://localhost:5001/api/orders/ORD-123/status \
    -H "Content-Type: application/json" \
    -d '{"status":"delivered"}'
  ```
- **Recommendation:**
  ```js
  // server/src/middleware/auth.js
  import jwt from 'jsonwebtoken';

  export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      next();
    } catch { res.status(401).json({ message: 'Invalid token' }); }
  }

  export function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
  }
  ```
  Apply: `router.post('/', authMiddleware, adminOnly, handler)` cho tất cả protected routes.

---

### [CRITICAL-02] Hardcoded JWT Secret in Source Code

- **Location:** `server/src/routes/auth.js:14`
- **Description:**
  ```js
  const JWT_SECRET = process.env.JWT_SECRET || 'computer-store-secret-key-2024';
  ```
  Fallback secret nằm trực tiếp trong source code. Nếu env var không được set, toàn bộ authentication system sử dụng secret đã biết.
- **Impact:** Attacker có JWT secret → forge token cho bất kỳ user nào (bao gồm admin) → full system compromise.
- **Proof of Concept:**
  ```js
  // Forge admin token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: 'any', email: 'admin@test.com', role: 'admin' },
    'computer-store-secret-key-2024',
    { expiresIn: '7d' }
  );
  // Token này hợp lệ, có quyền admin
  ```
- **Recommendation:**
  ```js
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
    process.exit(1);
  }
  ```
  Tạo `.env` file: `JWT_SECRET=<random-64-char-string>`

---

### [CRITICAL-03] User Impersonation in Review Creation

- **Location:** `server/src/routes/reviews.js:24-27`
- **Description:** `userId` và `userName` lấy trực tiếp từ `req.body` mà không verify. User A có thể tạo review mạo danh user B.
- **Impact:** Fake reviews, manipulate product ratings, damage reputation.
- **Proof of Concept:**
  ```bash
  # User A gửi review mạo danh user B
  curl -X POST http://localhost:5001/api/products/1/reviews \
    -H "Content-Type: application/json" \
    -d '{"userId":"victim-user-id","userName":"Victim","rating":5,"comment":"Sản phẩm tuyệt vời!"}'
  ```
- **Recommendation:** Require JWT auth cho review creation, lấy `userId` từ decoded token:
  ```js
  router.post('/products/:id/reviews', authMiddleware, (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.name; // hoặc query từ DB
    // ...
  });
  ```

---

### [HIGH-01] No Rate Limiting on Authentication Endpoints

- **Location:** `server/src/routes/auth.js:22-63`, `server/src/index.js`
- **Description:** Login endpoint không có rate limiting. Attacker có thể brute-force password với tốc độ không giới hạn.
- **Impact:** Account takeover thông qua password guessing.
- **Recommendation:**
  ```js
  import rateLimit from 'express-rate-limit';

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10,
    message: { message: 'Too many attempts, please try again later' }
  });

  router.post('/login', authLimiter, handler);
  router.post('/register', authLimiter, handler);
  ```

---

### [HIGH-02] Mass Assignment in Product Creation

- **Location:** `server/src/routes/products.js:62`
- **Description:** `...req.body` spread tất cả client-sent fields vào product object. Không có whitelist.
  ```js
  const newProduct = { id: Date.now().toString(), ...req.body, rating: 0, reviews: 0 };
  ```
- **Impact:** Inject arbitrary fields, override `id`, `rating`, `reviews`, hoặc thêm malicious data.
- **Recommendation:** Whitelist fields:
  ```js
  const allowed = ['name', 'brand', 'category', 'price', 'originalPrice',
                   'image', 'description', 'stock', 'featured', 'badge', 'specs'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  const newProduct = { id: uuidv4(), ...data, rating: 0, reviews: 0 };
  ```

---

### [HIGH-03] No Security Headers

- **Location:** `server/src/index.js`
- **Description:** Không có `helmet` hoặc manual security headers. Missing: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`.
- **Impact:** Clickjacking, XSS escalation, MIME-type sniffing, downgrade attacks.
- **Recommendation:**
  ```js
  import helmet from 'helmet';
  app.use(helmet());
  ```

---

### [HIGH-04] Synchronous File I/O with Race Conditions

- **Location:** `server/src/routes/products.js:12-13`, `orders.js:12-16`, `reviews.js:12-16`, `auth.js:16-20`
- **Description:** Tất cả data operations dùng `fs.readFileSync` / `fs.writeFileSync` với JSON files. Không có locking mechanism.
- **Impact:** 
  1. Block event loop → denial of service under load
  2. Concurrent writes corrupt data (race condition: read-modify-write không atomic)
- **Recommendation:** Short-term: chuyển sang async I/O. Long-term: migration sang PostgreSQL/MongoDB.

---

### [MEDIUM-01] Review Comment Not Sanitized (Stored XSS Risk)

- **Location:** `server/src/routes/reviews.js:39-46`, `client/src/pages/ProductDetail.jsx:367`
- **Description:** Review `comment` từ user được lưu raw và render trực tiếp. React tự escape JSX, nhưng nếu dùng `dangerouslySetInnerHTML` trong tương lai hoặc render qua API khác → XSS.
- **Impact:** Stored XSS nếu render context thay đổi.
- **Recommendation:** Sanitize input server-side: strip HTML tags, limit length.

---

### [MEDIUM-02] No Input Validation for Product Fields

- **Location:** `server/src/routes/products.js:60-66`
- **Description:** Không validate type, range, hay format cho product fields. Có thể tạo product với `price: -100` hoặc `name: ""` hoặc `category: "../../../etc"`.
- **Impact:** Data integrity issues, potential path traversal nếu category dùng làm path.
- **Recommendation:** Validate input:
  ```js
  if (!name || !brand || !category || !price) return res.status(400).json({...});
  if (typeof price !== 'number' || price <= 0) return res.status(400).json({...});
  if (!['laptop', 'desktop', 'monitor', 'accessory'].includes(category)) return res.status(400).json({...});
  ```

---

### [MEDIUM-03] Order Status Allows Arbitrary Values

- **Location:** `server/src/routes/orders.js:46`
- **Description:** `req.body.status` được accept bất kỳ giá trị nào. Không validate enum.
- **Impact:** Data inconsistency, potential logic bugs.
- **Recommendation:**
  ```js
  const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  ```

---

### [MEDIUM-04] Token Stored in localStorage (XSS Extractable)

- **Location:** `client/src/context/AuthContext.jsx:23`
- **Description:** JWT token lưu trong `localStorage`. Bất kỳ XSS vulnerability nào cũng có thể đọc token.
- **Impact:** Token theft → account takeover.
- **Recommendation:** Prefer `httpOnly` cookies cho token storage. Nếu giữ localStorage, ensure CSP strict và sanitize tất cả user input.

---

### [LOW-01] bcrypt Rounds Only 10

- **Location:** `server/src/routes/auth.js:29`
- **Description:** `bcrypt.hash(password, 10)` — 10 rounds là minimum hiện đại. OWASP recommend 12+.
- **Recommendation:** Tăng lên `bcrypt.hash(password, 12)`.

---

### [LOW-02] No Password Strength Validation

- **Location:** `server/src/routes/auth.js:22-46`
- **Description:** Password chỉ check `!password` (empty). Không enforce minimum length, complexity.
- **Recommendation:** Minimum 8 chars, require mixed case + number.

---

### [LOW-03] No CORS for Production

- **Location:** `server/src/index.js:12`
- **Description:** `origin: 'http://localhost:5173'` — hardcoded cho development. Khi deploy, cần update.
- **Recommendation:** Dùng env var: `origin: process.env.CLIENT_URL`.

---

### [INFO-01] No `.env.example` File

- **Description:** Chưa có `.env.example` để document required environment variables.
- **Recommendation:** Tạo `.env.example`:
  ```
  PORT=5001
  JWT_SECRET=your-secret-here
  CLIENT_URL=http://localhost:5173
  ```

---

### [INFO-02] Dependency Audit Result

| Package | Severity | Note |
|---------|----------|------|
| **Server** | 0 vulnerabilities | Clean |
| **Client: esbuild** | Moderate | Dev-only, GHSA-67mh-4wv8-2f99 |
| **Client: vite** | Moderate | Dev-only, depends on vulnerable esbuild |

**Assessment:** Không có production vulnerabilities. Dev vulnerabilities chỉ ảnh hưởng development server.

---

### [INFO-03] No Error Logging/Monitoring

- **Description:** Server không có structured error logging. Errors chỉ `console.error`.
- **Recommendation:** Thêm logging library (winston/pino) với different levels cho development vs production.

---

## Positive Observations

- **Password hashing** done correctly with bcrypt, password excluded from API responses
- **CORS** properly configured (restrictive origin, credentials enabled)
- **JWT implementation** structure correct (sign, verify, expiry 7d)
- **No SQL injection risk** — using JSON file storage (no SQL queries)
- **First user = admin pattern** is clearly documented and intentional
- **Input validation** present on auth endpoints (required fields check, duplicate email check)
- **Review deduplication** prevents spam reviews from same user per product

---

## Priority Fix Order

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | CRITICAL-01: Add auth middleware | 2h |
| 2 | CRITICAL-02: Remove hardcoded JWT secret | 30min |
| 3 | CRITICAL-03: Fix review impersonation | 1h |
| 4 | HIGH-01: Add rate limiting | 30min |
| 5 | HIGH-02: Whitelist product fields | 30min |
| 6 | HIGH-03: Add security headers (helmet) | 15min |
| 7 | HIGH-04: Async file I/O | 2h |
| 8 | MEDIUM-01 to MEDIUM-04 | 2h |
| 9 | LOW + INFO | 1h |

**Estimated total:** ~10h để fix tất cả findings lên production-ready.
