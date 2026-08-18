# AGENTS.md — NexTech Computer Store

## Project Overview

**NexTech** is a premium computer store web application built as a monorepo:

- **client/** — React 18 + Vite 5 + Tailwind CSS v3 + React Router 6
- **server/** — Express 4 + JWT + bcryptjs (JSON file storage, future: PostgreSQL/MongoDB)
- **Design:** OLED dark theme, glassmorphism, premium UI with custom animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS **v3** (NOT v4 syntax), React Router 6 |
| Backend | Express 4, JWT (jsonwebtoken), bcryptjs |
| Storage | JSON files (server/src/data/) — planned migration to DB |
| Fonts | Plus Jakarta Sans (body), Space Grotesk (headings) |
| State | React Context (AuthContext, CartContext) |

## OpenCode Integration

### Core Rules

- If a task matches a skill, you MUST invoke it
- Skills are in `.opencode/skills/` (21 workflow skills) and `.agents/skills/` (9 premium UI skills)
- Never implement directly if a skill applies
- Always follow the skill instructions exactly

### Intent → Skill Mapping

- New feature / new page → `spec-driven-development`, then `planning-and-task-breakdown`, `incremental-implementation`, `test-driven-development`
- UI work / page redesign → `frontend-ui-engineering` + `design-taste-frontend`
- Bug / error / 500 → `debugging-and-error-recovery`
- Code review → `code-review-and-quality`
- Security (auth, payment) → `security-and-hardening`
- Performance (load time, Core Web Vitals) → `performance-optimization`
- API endpoint design → `api-and-interface-design`
- Deploy / go live → `shipping-and-launch`
- Refactor / simplify → `code-simplification`

### Lifecycle Mapping

- DEFINE → `spec-driven-development`
- PLAN → `planning-and-task-breakdown`
- BUILD → `incremental-implementation` + `test-driven-development`
- VERIFY → `debugging-and-error-recovery`
- REVIEW → `code-review-and-quality`
- SHIP → `shipping-and-launch`

### Execution Model

For every request:

1. Determine if any skill applies (even 1% chance)
2. Invoke the appropriate skill using the `skill` tool
3. Follow the skill workflow strictly
4. Only proceed to implementation after required steps (spec, plan, etc.) are complete

## Project Commands

```bash
# Client
cd client && npm run dev          # Start dev server (port 5173)
cd client && npm run build        # Production build

# Server
cd server && npm run dev          # Start API server (port 5001)

# Both
bash start.sh                     # Start both client + server
```

## Project Structure

```
computer-store/
├── client/src/
│   ├── components/    # Navbar, ProductCard, Footer
│   ├── pages/         # Home, Products, ProductDetail, Cart, Login, Register, Admin
│   ├── context/       # AuthContext, CartContext
│   ├── services/      # api.js (axios layer)
│   ├── App.jsx        # Router config
│   └── main.jsx       # Entry point
├── server/src/
│   ├── routes/        # products.js, auth.js, orders.js, users.js
│   ├── data/          # products.json (12 sample products)
│   └── index.js       # Express entry point
└── PLAN.md            # Project plan & feature status
```

## Boundaries

### Always
- Run existing code checks before committing
- Validate user input at API boundaries
- Use parameterized queries when migrating to DB
- Test authentication flows after changes
- Keep Tailwind v3 syntax (not v4)

### Ask First
- Database schema changes
- Adding new npm dependencies
- Changing API endpoint contracts
- Modifying JWT token structure
- Changing the design system (colors, fonts, spacing)

### Never
- Commit secrets, JWT secrets, or .env files
- Remove failing tests instead of fixing them
- Change pricing data without explicit approval
- Use `h-screen` (use `min-h-[100dvh]` for iOS Safari)
- Use font Inter, Roboto, or Arial
- Skip verification steps

## Design System

- **Colors:** OLED dark (#0a0a0a), accent indigo (#6366f1), mint (#34d399), coral (#f87171)
- **Cards:** Double-bezel architecture, rounded-[1.5rem]
- **Buttons:** Pill shape (rounded-full), button-in-button icon pattern
- **Animation:** Custom cubic-bezier (0.32,0.72,0,1), fade-up entries
- **Typography:** Plus Jakarta Sans (body), Space Grotesk (headings)
- **Anti-patterns:** No Inter/Roboto, no generic gray borders, no shadow-md, no linear/ease-in-out

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (filter/sort/search) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/orders` | List orders (admin) |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/users` | List users (admin) |
| GET | `/api/health` | Health check |

## Planned Upgrades (see PLAN.md)

- [ ] JSON → PostgreSQL/MongoDB
- [ ] Image upload (Cloudinary/S3)
- [ ] Payment integration (VNPay, MoMo, Stripe)
- [ ] Pagination
- [ ] Wishlist
- [ ] Product reviews
- [ ] Dark/Light mode toggle
- [ ] Unit tests (Vitest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Deploy: Vercel (client) + Railway/Render (server)
