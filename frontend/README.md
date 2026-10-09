# CampusLink Frontend

This project wraps the supplied CampusLink React/TypeScript UI in a Next.js app and adds a central API client for backend integration.

## Structure

```text
CampusLink-Frontend/
├── app/
│   ├── globals.css       # Tailwind + global styles
│   ├── layout.tsx        # Next.js root layout and page metadata
│   └── page.tsx          # Existing CampusLink UI (student, placement, recruiter portals)
├── lib/
│   └── api.ts            # Shared GET/POST/PUT/PATCH/DELETE API client
├── types/
│   └── api.ts            # Example backend response types
├── .env.local.example    # Backend base URL template
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Run the frontend

1. Install Node.js 18 or later.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to your backend API root.
5. Run `npm run dev` and open `http://localhost:3000`.

## Connect to your backend

Use the shared API client from any client component:

```tsx
import { api } from "@/lib/api";
import type { ApiJob } from "@/types/api";

// Example inside an event handler or useEffect:
const jobs = await api.get<ApiJob[]>("/jobs");
// Create example:
// const result = await api.post("/auth/login", { email, password });
```

Agree the endpoint paths and JSON field names with the backend developer. Typical endpoints to plan are:

- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- `GET /students/me`, `PUT /students/me`, `GET /students`
- `GET /jobs`, `POST /jobs`, `GET /jobs/:id`
- `GET /drives`, `POST /drives`, `POST /applications`
- `GET /placement/shortlists`, `GET /placement/analytics`
- `GET /recruiter/candidates`, `PATCH /applications/:id/status`

These are suggested routes, not routes guaranteed to exist in your backend.

## Important integration note

The supplied UI has demo/sample data in several views. Adding `lib/api.ts` gives you a shared connection layer, but it does not automatically replace every demo array or wire every form to real endpoints. Replace each sample data source and form submit handler with calls to your backend, matching your actual API contract. If the backend is on a different origin, configure CORS on the backend. Do not store passwords or long-lived secrets in frontend code.
