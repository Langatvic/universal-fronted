# Universal POS – Frontend (standalone React app)

Runs on its own and talks to the Django backend only through its REST API.

## Run

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

The backend address comes from `VITE_API_URL`:

| File | Used by | Default |
|---|---|---|
| `.env.development` | `npm run dev` | `http://127.0.0.1:8000` |
| `.env.production`  | `npm run build` | `https://your-backend-domain.com` (edit this) |

If your backend runs on another address/port, change `VITE_API_URL` and restart `npm run dev`.

## Build for deployment

```bash
npm run build        # output in dist/ — upload to Netlify, Vercel, Nginx, etc.
```
Single-page app: configure the host to serve `index.html` for all routes
(Netlify: `/* /index.html 200`). Then add the frontend's URL to the backend's `CORS_ALLOWED_ORIGINS`.

## Sign in

Use a backend user that has a Membership (business + role). Roles: owner, admin, manager, cashier,
stock_manager, accountant — each sees only the pages its role allows.

## Structure
- `src/services/api.js` – API client (token header, errors, 401 sign-out)
- `src/context/AuthContext.jsx` – login, active business/branch, role
- `src/utils/permissions.js` – role → page access
- `src/pages/*` – Dashboard, Sales (POS), Inventory, Purchasing, Reports, Employees, Settings
