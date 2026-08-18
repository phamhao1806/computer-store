# NexTech — Computer Store: Kế hoạch triển khai

## Tổng quan dự án

**Tên:** NexTech — Premium Computer Store
**Mô tả:** Website bán máy tính & thiết bị công nghệ cao cấp, bao gồm frontend React và backend Node.js/Express.
**Cấu trúc:** Monorepo 2 thư mục `client/` + `server/`

---

## Kiến trúc hệ thống

```
computer-store/
├── client/                  # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/      # UI Components (Navbar, ProductCard, Footer)
│   │   ├── pages/           # Trang (Home, Products, Cart, Login, Register, Admin)
│   │   ├── context/         # AuthContext, CartContext (State management)
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # Router config
│   │   └── main.jsx         # Entry point
│   ├── tailwind.config.js
│   └── vite.config.js       # Proxy /api → localhost:5001
│
├── server/                  # Express.js REST API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── products.js  # CRUD sản phẩm + filter/sort/search
│   │   │   ├── auth.js      # Đăng ký, đăng nhập (JWT)
│   │   │   ├── orders.js    # Tạo đơn, cập nhật trạng thái
│   │   │   └── users.js     # Danh sách users
│   │   ├── data/            # JSON file storage
│   │   │   └── products.json # 12 sản phẩm mẫu
│   │   └── index.js         # Express entry point
│   └── package.json
│
└── PLAN.md                  # File này
```

---

## Tech Stack

| Layer       | Công nghệ                                     |
|-------------|-----------------------------------------------|
| Frontend    | React 18, Vite 5, TailwindCSS 3, React Router 6 |
| Backend     | Express 4, JWT (jsonwebtoken), bcryptjs       |
| Storage     | JSON file (server/src/data/) — dễ nâng cấp lên DB |
| Font        | Plus Jakarta Sans (body), Space Grotesk (display) |
| Design      | Dark theme OLED, glass morphism, premium UI   |

---

## Tính năng đã triển khai

### 1. Trang chủ (`/`)
- Hero section với gradient glow, animation fade-up
- Danh sách sản phẩm nổi bật (4 sản phẩm)
- Stats section (số lượng, thương hiệu, khách hàng)
- CTA banner đăng ký thành viên

### 2. Danh sách sản phẩm (`/products`)
- Hiển thị tất cả sản phẩm dạng grid responsive
- Filter theo danh mục: Laptop, Desktop, Màn hình, Phụ kiện
- Sort: giá tăng/giảm, đánh giá
- Search theo tên, thương hiệu, mô tả
- Skeleton loading state

### 3. Chi tiết sản phẩm (`/products/:id`)
- Hình ảnh lớn + thông tin chi tiết
- Bảng thông số kỹ thuật (specs)
- Đánh giá + tồn kho
- Chọn số lượng + thêm vào giỏ hàng
- Nút quay lại

### 4. Giỏ hàng (`/cart`)
- Danh sách sản phẩm trong giỏ
- Tăng/giảm số lượng, xóa sản phẩm
- Form checkout: họ tên, SĐT, địa chỉ
- Tính tổng tiền, phí ship miễn phí
- Xác nhận đặt hàng thành công

### 5. Đăng nhập (`/login`)
- Form email + mật khẩu
- JWT authentication
- Error handling
- Link sang đăng ký

### 6. Đăng ký (`/register`)
- Form họ tên + email + mật khẩu + xác nhận
- Validation: mật khẩu khớp, >= 6 ký tự
- Tự động đăng nhập sau khi đăng ký
- User đầu tiên tự động là admin

### 7. Quản trị (`/admin`) — Chỉ admin
- Dashboard: thống kê sản phẩm, đơn hàng, doanh thu
- **Quản lý sản phẩm:** Thêm/Sửa/Xóa sản phẩm
- **Quản lý đơn hàng:** Xem danh sách, cập nhật trạng thái (Chờ xử lý → Đang xử lý → Đang giao → Đã giao)

---

## API Endpoints

| Method | Endpoint              | Mô tả                          |
|--------|-----------------------|--------------------------------|
| GET    | `/api/products`       | Danh sách sản phẩm (filter/sort/search) |
| GET    | `/api/products/:id`   | Chi tiết sản phẩm              |
| POST   | `/api/products`       | Tạo sản phẩm mới               |
| PUT    | `/api/products/:id`   | Cập nhật sản phẩm              |
| DELETE | `/api/products/:id`   | Xóa sản phẩm                   |
| POST   | `/api/auth/register`  | Đăng ký tài khoản              |
| POST   | `/api/auth/login`     | Đăng nhập                      |
| GET    | `/api/orders`         | Danh sách đơn hàng             |
| POST   | `/api/orders`         | Tạo đơn hàng                   |
| GET    | `/api/orders/my`      | Danh sách đơn hàng của user hiện tại |
| PATCH  | `/api/orders/:id/status` | Cập nhật trạng thái đơn hàng |
| GET    | `/api/users`          | Danh sách người dùng           |
| GET    | `/api/health`         | Health check                   |

**Query params cho `/api/products`:**
- `category` — lọc theo danh mục (laptop, desktop, monitor, accessory)
- `brand` — lọc theo thương hiệu
- `search` — tìm kiếm theo tên/brand/mô tả
- `sort` — sắp xếp (price-asc, price-desc, rating, newest)
- `minPrice`, `maxPrice` — lọc theo khoảng giá
- `featured` — lọc sản phẩm nổi bật (true/false)

---

## Cách chạy dự án

### 1. Khởi động Server (Backend)
```bash
cd server
npm install
npm run dev
# Server chạy tại http://localhost:5001
```

### 2. Khởi động Client (Frontend)
```bash
cd client
npm install
npm run dev
# Client chạy tại http://localhost:5173
```

### 3. Truy cập
- Mở trình duyệt: **http://localhost:5173**
- Tài khoản admin đầu tiên: đăng ký tài khoản đầu tiên sẽ tự động có role `admin`

---

## Thiết kế UI/UX

### Design System
- **Color palette:** OLED dark (#0a0a0a) với accent indigo (#6366f1), mint (#34d399), coral (#f87171)
- **Typography:** Plus Jakarta Sans (body), Space Grotesk (headings)
- **Cards:** Double-bezel (vỏ ngoài + lõi trong), rounded-[1.5rem]
- **Buttons:** Pill shape (rounded-full), button-in-button icon pattern
- **Animation:** Custom cubic-bezier (0.32,0.72,0,1), fade-up entry animations
- **Responsive:** Mobile-first, single column < 768px

### Anti-patterns đã tuân thủ
- Không dùng font Inter, Roboto, Arial
- Không dùng border xám 1px đơn giản
- Không dùng shadow-md mặc định
- Không dùng linear/ease-in-out transition
- Không layout Bootstrap 3-column nhàm chán

---

## Dữ liệu mẫu

12 sản phẩm đã được seed sẵn trong `server/src/data/products.json`:

| ID | Tên | Danh mục | Giá |
|----|-----|----------|-----|
| 1  | MacBook Pro 16" M4 Max | Laptop | 69,990,000 |
| 2  | ASUS ROG Strix G18 | Laptop | 52,990,000 |
| 3  | Dell XPS 15 OLED | Laptop | 42,990,000 |
| 4  | Custom PC RTX 4090 Creator | Desktop | 89,990,000 |
| 5  | Lenovo Legion Tower 7i | Desktop | 55,990,000 |
| 6  | Samsung Odyssey OLED G8 34" | Monitor | 24,990,000 |
| 7  | Logitech MX Master 3S | Accessory | 2,490,000 |
| 8  | Razer BlackWidow V4 Pro | Accessory | 5,490,000 |
| 9  | MacBook Air 15" M3 | Laptop | 35,990,000 |
| 10 | LG UltraGear 27" 4K | Monitor | 15,990,000 |
| 11 | Custom PC RTX 4070 Super | Desktop | 42,990,000 |
| 12 | Sony WH-1000XM5 | Accessory | 7,990,000 |

---

## Trạng thái triển khai

| Tính năng              | Trạng thái | Ghi chú                    |
|------------------------|------------|----------------------------|
| Project structure      | ✅ Hoàn thành | Monorepo client + server |
| Backend API            | ✅ Hoàn thành | Express + JSON storage   |
| Authentication (JWT)   | ✅ Hoàn thành | Register/Login/Logout    |
| Danh sách sản phẩm     | ✅ Hoàn thành | Filter/Sort/Search/Pagination |
| Chi tiết sản phẩm      | ✅ Hoàn thành | Specs, rating, stock, reviews |
| Giỏ hàng               | ✅ Hoàn thành | Add/Remove/Update/Checkout |
| Đăng nhập/Đăng ký      | ✅ Hoàn thành | Form validation           |
| Admin Dashboard        | ✅ Hoàn thành | Stats, CRUD, Orders      |
| Premium UI/UX          | ✅ Hoàn thành | Dark theme, animations, glassmorphism |
| Responsive mobile      | ✅ Hoàn thành | Tailwind responsive      |
| Build production       | ✅ Hoàn thành | Vite build passed        |
| Wishlist               | ✅ Hoàn thành | Context + localStorage + /wishlist page |
| Pagination             | ✅ Hoàn thành | 8 sản phẩm/trang, client-side |
| Product Reviews        | ✅ Hoàn thành | Backend API + frontend form + display |
| User Profile           | ✅ Hoàn thành | /profile route, info + order history của user hiện tại |
| 404 Page               | ✅ Hoàn thành | Custom NotFound component |
| Dark/Light Mode        | ✅ Hoàn thành | ThemeContext + CSS variables + toggle |
| Brand Marquee          | ✅ Hoàn thành | Scrolling brand strip on homepage |
| Category Showcase      | ✅ Hoàn thành | 4 category cards on homepage |
| Core flow stabilization | ✅ Hoàn thành | Admin order status fix, user-owned orders, /api/orders/my |
| Unit/Integration tests  | ✅ Hoàn thành | Client context/API tests + server route/integration tests |

---

## Ghi chú kỹ thuật hiện tại

- Backend port thực tế: **5001** (`server/.env.example`, `client/vite.config.js`, `start.sh`).
- Guest checkout vẫn hoạt động; nếu user đã đăng nhập, order sẽ được gắn `userId` để hiển thị trong `/profile`.
- Admin vẫn xem toàn bộ đơn qua `GET /api/orders`; customer chỉ xem đơn của mình qua `GET /api/orders/my`.
- Storage hiện vẫn là JSON file, phù hợp demo/dev nhưng chưa phù hợp production có ghi đồng thời cao.

---

## Nâng cấp tiếp theo (Future)

- [ ] Thay JSON storage bằng MongoDB hoặc PostgreSQL
- [ ] Thêm upload ảnh sản phẩm (Cloudinary/S3)
- [ ] Tích hợp thanh toán (VNPay, MoMo, Stripe)
- [ ] Email xác nhận đơn hàng
- [ ] PWA support (offline, push notifications)
- [ ] Deploy: Vercel (client) + Railway/Render (server)
- [x] Unit tests (Vitest + React Testing Library)
- [ ] E2E tests (Playwright)
