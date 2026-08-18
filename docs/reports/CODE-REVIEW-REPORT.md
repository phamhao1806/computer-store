# Code Review Report — NexTech Computer Store

**Reviewer:** Code Reviewer Agent  
**Date:** 2026-05-06  
**Scope:** Full project (client + server)

---

## Review Summary

**Verdict:** REQUEST CHANGES

**Overview:** Dự án có UI/UX premium, architecture đơn giản dễ hiểu, nhưng có nhiều lỗi security nghiêm trọng (không có auth middleware trên server, hardcoded JWT secret) và một số vấn đề performance (synchronous file I/O, race conditions). Cần fix Critical issues trước khi đưa vào production.

---

### Critical Issues

- **[server/src/routes/products.js:60-66] Không có auth middleware cho admin endpoints**  
  `POST`, `PUT`, `DELETE /api/products` không verify JWT token. Bất kỳ ai cũng có thể tạo/sửa/xóa sản phẩm. Tương tự cho `GET/PATCH /api/orders/:id/status` và `GET /api/users`.  
  **Fix:** Tạo `authMiddleware` verify JWT + check role `admin`, áp dụng cho tất cả protected routes.

- **[server/src/routes/auth.js:14] Hardcoded JWT secret fallback**  
  ```js
  const JWT_SECRET = process.env.JWT_SECRET || 'computer-store-secret-key-2024';
  ```
  Nếu không set env var, secret nằm sẵn trong source code. Attacker có thể forge token.  
  **Fix:** Throw error nếu `process.env.JWT_SECRET` không tồn tại. Không bao giờ fallback.

- **[server/src/routes/orders.js:42-49] Order status update không có auth/authorization**  
  `PATCH /api/orders/:id/status` không verify ai đang gọi. Bất kỳ ai cũng có thể đổi trạng thái đơn hàng.  
  **Fix:** Require admin JWT token.

- **[server/src/routes/users.js:17-21] GET /api/users expose toàn bộ user data**  
  Endpoint không có auth. Dù đã strip password, bất kỳ ai cũng có thể lấy danh sách users (name, email, role).  
  **Fix:** Require admin JWT token.

---

### Important Issues

- **[server/src/routes/products.js:62] Mass assignment — spread `req.body` trực tiếp**  
  ```js
  const newProduct = { id: Date.now().toString(), ...req.body, rating: 0, reviews: 0 };
  ```
  Attacker có thể inject `id`, `role`, `isAdmin`, v.v.  
  **Fix:** Whitelist fields: chỉ accept `{ name, brand, category, price, originalPrice, image, description, stock, featured, badge, specs }`.

- **[server/src/routes/reviews.js:24-27] `userId` từ client body — impersonation risk**  
  ```js
  const { userId, userName, rating, comment } = req.body;
  ```
  User A có thể gửi review với `userId` của user B.  
  **Fix:** Lấy `userId` từ JWT token đã verify, không trust client body.

- **[server/src/routes/products.js:12-13] Synchronous file I/O block event loop**  
  `fs.readFileSync` / `fs.writeFileSync` trong tất cả routes. Dưới load, mỗi request block toàn bộ Node.js event loop.  
  **Fix:** Chuyển sang `fs.promises.readFile` / `fs.promises.writeFile` (hoặc migration sang DB).

- **[server/src/routes/products.js:12-13] Race condition — concurrent writes corrupt data**  
  Hai requests đọc cùng lúc, modify, ghi đè lẫn nhau. Không có file lock mechanism.  
  **Fix:** Migration sang DB với proper transactions, hoặc implement file lock / queue.

- **[server/src/index.js:12] CORS chỉ restrict origin, nhưng không có rate limiting**  
  Login/Register không giới hạn attempts. Brute-force password dễ dàng.  
  **Fix:** Thêm `express-rate-limit` cho `/api/auth/login` và `/api/auth/register` (max 10 requests/15 phút).

- **[server/src/routes/reviews.js:29-31] Rating validation dùng Number() nhưng thiếu type check**  
  `rating < 1` — nếu gửi `rating: "abc"`, `Number("abc")` = `NaN`, và `NaN < 1` = false, pass qua validation.  
  **Fix:** Validate `typeof rating === 'number'` và dùng `Number.isFinite(rating)`.

- **[client/src/pages/ProductDetail.jsx:52-67] useEffect thiếu dependency**  
  `addRecentlyViewed` không nằm trong dependency array của `useEffect`. React strict mode có thể gây stale closure.  
  **Fix:** Thêm `addRecentlyViewed` vào deps hoặc wrap bằng `useCallback` ở context.

- **[client/src/pages/Admin.jsx:39] Native `confirm()` dialog**  
  Không consistent với design system premium của dự án.  
  **Fix:** Tạo custom confirm modal component.

- **[client/src/pages/Admin.jsx:70-73] `updateOrderStatus` import thiếu**  
  `handleOrderStatus` gọi `updateOrderStatus` nhưng function này không được import từ `api.js` (đã có nhưng phải verify).  
  **Fix:** Kiểm tra lại import.

---

### Suggestions

- **[client/src] `formatPrice` lặp ở 6 files** — `Home.jsx`, `Products.jsx`, `ProductDetail.jsx`, `Cart.jsx`, `Admin.jsx`, `ProductCard.jsx`.  
  **Fix:** Extract sang `utils/format.js`, import ở mọi nơi.

- **[client/src/App.jsx] Không có React ErrorBoundary**  
  Nếu một component crash, toàn bộ app trắng trang.  
  **Fix:** Wrap Routes trong ErrorBoundary component.

- **[client/src/components/Footer.jsx:34-36,44-46] `<span>` thay vì `<a>` cho links**  
  "Liên hệ", "Bảo hành", "Facebook"... dùng `<span>` không accessible, không SEO-friendly.  
  **Fix:** Dùng `<a href="...">` hoặc `<Link>`.

- **[server/src/routes/products.js:62] `Date.now()` làm ID**  
  Collision risk khi 2 products tạo cùng millisecond.  
  **Fix:** Dùng `uuid` (đã có dependency từ auth.js).

- **[client/src/pages/Cart.jsx:29] `alert()` cho error**  
  Không consistent với design system.  
  **Fix:** Dùng toast notification component.

- **[client/src/pages/Home.jsx:303-312] Brand marquee dùng duplicate array thủ công**  
  ```js
  const brands = ['ASUS', 'MSI', ..., 'ASUS', 'MSI', ...];
  ```
  **Fix:** Dùng CSS `animation: marquee` với 1 array duy nhất.

- **[client/src] Quantity không giới hạn upper bound**  
  `ProductDetail.jsx:261` `setQty(qty + 1)` không giới hạn, user có thể add qty > stock.  
  **Fix:** `setQty(Math.min(qty + 1, product.stock))`.

- **[client/src] Không có loading/error states cho `fetchOrders` trong Admin**  
  `Admin.jsx:25` gọi `fetchOrders` nhưng không có loading indicator khi data đang fetch.  
  **Fix:** Thêm `ordersLoading` state.

---

### What's Done Well

- **Design system nhất quán** — OLED dark theme, glassmorphism, custom cubic-bezier animations, double-bezel cards được áp dụng đồng đều trên toàn bộ UI
- **Test coverage tốt** — 80 tests covering API, Auth, Cart, Products, Orders, Reviews với cả happy path và error cases
- **Context architecture sạch** — 6 contexts rõ ràng, mỗi context single responsibility, localStorage persistence đúng cách
- **Pagination implemented** — Server-side pagination với page/limit validation, clamping
- **Password handling đúng** — bcrypt hash, exclude password từ API responses
- **CORS configured** — Restrict origin thay vì `*`, credentials enabled

---

### Verification Story

- **Tests reviewed:** Yes — 7 test files, 80 tests, patterns consistent (supertest cho server, mock fetch cho client)
- **Build verified:** Yes — client build passes (Vite), server runs trên port 5001
- **Security checked:** Yes — npm audit: server 0 vulnerabilities, client 2 moderate (esbuild/vite dev-only)
- **Design checked:** Yes — follows design system trong AGENTS.md, no anti-patterns detected
