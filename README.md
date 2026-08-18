# NexTech — Premium Computer Store

Website bán máy tính và thiết bị công nghệ cao cấp, được xây dựng dưới dạng **monorepo** gồm frontend React và backend Node.js/Express.

- **Frontend:** React 18 + Vite 5 + Tailwind CSS v3 + React Router 6
- **Backend:** Express 4 + JWT (jsonwebtoken) + bcryptjs
- **Storage:** JSON files (`server/src/data/`) — seed data (`products.json`) được commit; `users.json`/`orders.json`/`reviews.json` là runtime data (đã gitignore). Truy cập tập trung qua `server/src/utils/db.js` — dễ nâng cấp lên database
- **Design:** OLED dark theme, glassmorphism, premium UI với animations tùy chỉnh

---

## Tính năng chính

| Khu vực | Mô tả |
|---------|-------|
| 🏠 **Trang chủ** | Hero section gradient, brand marquee, category showcase, thống kê, features, CTA đăng ký |
| 📦 **Danh sách sản phẩm** | Search, filter theo danh mục/thương hiệu/khoảng giá, sort, phân trang (9 sản phẩm/trang), skeleton loading |
| 🔍 **Chi tiết sản phẩm** | Gallery nhiều ảnh, bảng thông số kỹ thuật, rating & tồn kho, chọn số lượng, wishlist, "Sản phẩm đã xem" |
| 🛒 **Giỏ hàng & thanh toán** | Thêm/sửa/xóa sản phẩm, form checkout, tính tổng tiền, phí ship miễn phí, đặt hàng dạng khách hoặc đã đăng nhập |
| ❤️ **Wishlist** | Lưu sản phẩm yêu thích, đồng bộ qua localStorage |
| 🔐 **Đăng nhập / Đăng ký** | JWT authentication, validation form, tự động đăng nhập sau đăng ký |
| 👤 **Trang cá nhân** | Thông tin tài khoản + lịch sử đơn hàng của user hiện tại (`/profile`) |
| 🛠 **Quản trị** | Dashboard thống kê, CRUD sản phẩm, quản lý trạng thái đơn hàng (Chờ xử lý → Đang xử lý → Đang giao → Đã giao / Đã hủy) |
| ⭐ **Đánh giá sản phẩm** | Viết đánh giá (yêu cầu đăng nhập), hiển thị rating trung bình |
| 🌗 **Dark / Light mode** | Toggle chủ đề, lưu lựa chọn qua localStorage |
| ⚡ **Quick View** | Xem nhanh sản phẩm trong modal, thêm vào giỏ không cần đổi trang |
| 📞 **Widget nổi** | Hotline, Zalo, Messenger, nút cuộn lên đầu trang |

**Bảo mật:** password hash bằng bcryptjs (12 rounds), JWT (7 ngày), rate limiting cho endpoints auth, sanitize HTML đầu vào, middleware `adminOnly`, helmet + CORS.

---

## Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS v3, React Router 6 |
| Backend | Express 4, JWT (jsonwebtoken), bcryptjs |
| Storage | JSON files (`server/src/data/`) |
| Font | Plus Jakarta Sans (body), Space Grotesk (headings) |
| State | React Context (Auth, Cart, Wishlist, Theme, QuickView, RecentlyViewed) |
| Tests | Vitest + React Testing Library (client), Vitest + Supertest (server) |

---

## Cấu trúc thư mục

```
computer-store/
├── client/                  # Frontend React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard, Footer, QuickViewModal, FloatingWidgets
│   │   ├── pages/           # Home, Products, ProductDetail, Cart, Wishlist,
│   │   │                    # Login, Register, Profile, Admin, NotFound
│   │   ├── context/         # Auth, Cart, Wishlist, Theme, QuickView, RecentlyViewed
│   │   ├── services/        # api.js (lớp gọi API)
│   │   ├── utils/           # format.js (formatPrice dùng chung)
│   │   ├── constants.js     # status labels/colors, categories dùng chung
│   │   ├── __tests__/       # Unit test (Vitest + React Testing Library)
│   │   ├── App.jsx          # Router config
│   │   └── main.jsx         # Entry point
│   ├── tailwind.config.js
│   └── vite.config.js       # Proxy /api → http://localhost:5001
│
├── server/                  # Backend Express REST API
│   ├── src/
│   │   ├── routes/          # products.js, auth.js, orders.js, users.js, reviews.js
│   │   ├── middleware/      # auth.js (authMiddleware, adminOnly, optionalAuth)
│   │   ├── utils/           # db.js (đọc/ghi JSON tập trung — điểm duy nhất để migrate DB)
│   │   ├── constants.js     # VALID_CATEGORIES, VALID_STATUSES, ALLOWED_FIELDS
│   │   ├── data/            # products.json (seed data), *.example.json (format mẫu)
│   │   ├── __tests__/       # Unit + integration test (Vitest + Supertest)
│   │   └── index.js         # Express entry point
│   └── .env.example
│
├── docs/
│   └── reports/             # Code & security review reports
├── start.sh                 # Khởi động đồng thời client + server
└── README.md
```

---

## Hướng dẫn cài đặt & chạy

### Yêu cầu
- **Node.js** ≥ 18

### 1. Cài đặt dependencies

```bash
# Cài đặt backend
cd server
npm install

# Cài đặt frontend
cd ../client
npm install
```

### 2. Cấu hình môi trường (Server)

Sao chép file `.env.example` thành `.env` và điền giá trị:

```bash
cd server
cp .env.example .env
```

```env
PORT=5001
JWT_SECRET=chuoi-bi-mat-cua-ban
CLIENT_URL=http://localhost:5173
```

> **Lưu ý:** Không bao giờ commit file `.env` chứa secret lên GitHub (đã có trong `.gitignore`).

### 3. Khởi động

**Cách 1 — Chạy từng phần:**

```bash
# Terminal 1 — Backend (port 5001)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

**Cách 2 — Chạy cả hai bằng script:**

```bash
bash start.sh
```

### 4. Truy cập

- Mở trình duyệt tại: **http://localhost:5173**

---

## Tài khoản Admin

**Tài khoản đầu tiên đăng ký sẽ tự động có vai trò `admin`.**

Sau đó đăng nhập tại `/login` và truy cập `/admin` để quản lý sản phẩm và đơn hàng.

---

## API Endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/products` | Danh sách sản phẩm (filter/sort/search/pagination) | Công khai |
| GET | `/api/products/:id` | Chi tiết sản phẩm | Công khai |
| POST | `/api/products` | Tạo sản phẩm mới | Admin |
| PUT | `/api/products/:id` | Cập nhật sản phẩm | Admin |
| DELETE | `/api/products/:id` | Xóa sản phẩm | Admin |
| POST | `/api/auth/register` | Đăng ký tài khoản | Công khai |
| POST | `/api/auth/login` | Đăng nhập | Công khai |
| GET | `/api/orders` | Danh sách tất cả đơn hàng | Admin |
| GET | `/api/orders/my` | Đơn hàng của user hiện tại | Đăng nhập |
| POST | `/api/orders` | Tạo đơn hàng (khách hoặc đã đăng nhập) | Công khai |
| PATCH | `/api/orders/:id/status` | Cập nhật trạng thái đơn hàng | Admin |
| GET | `/api/users` | Danh sách người dùng | Admin |
| GET | `/api/products/:id/reviews` | Danh sách đánh giá sản phẩm | Công khai |
| POST | `/api/products/:id/reviews` | Viết đánh giá sản phẩm | Đăng nhập |
| GET | `/api/health` | Health check | Công khai |

### Query params cho `GET /api/products`

| Tham số | Mô tả |
|---------|-------|
| `category` | Lọc theo danh mục (`laptop`, `desktop`, `monitor`, `accessory`) |
| `brand` | Lọc theo thương hiệu |
| `search` | Tìm kiếm theo tên / thương hiệu / mô tả |
| `sort` | Sắp xếp: `price-asc`, `price-desc`, `rating`, `newest` |
| `minPrice`, `maxPrice` | Lọc theo khoảng giá |
| `featured` | Chỉ lấy sản phẩm nổi bật (`true`) |
| `page`, `limit` | Phân trang |

---

## Chạy test

```bash
# Backend tests (routes + integration)
cd server
npm test

# Frontend tests (contexts + api layer)
cd client
npm test
```

---

## Build production

```bash
cd client
npm run build
# Kết quả tại client/dist/
```

---

## Roadmap

- [ ] Thay JSON storage bằng PostgreSQL / MongoDB
- [ ] Upload ảnh sản phẩm (Cloudinary / S3)
- [ ] Tích hợp thanh toán (VNPay, MoMo, Stripe)
- [ ] Email xác nhận đơn hàng
- [ ] PWA (offline, push notifications)
- [ ] E2E tests (Playwright)
- [ ] Deploy: Vercel (client) + Railway/Render (server)

---

## Giấy phép

Dự án phục vụ mục đích demo/học tập.
