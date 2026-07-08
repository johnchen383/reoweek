# reoweek

A modern **MERN** starter — **M**ongoDB, **E**xpress-style API, **R**eact, **N**ode — built with:

- ⚡️ **Vite** + **React 19** + **TypeScript** frontend
- 🎨 **Sass (SCSS)** for styling
- 🗄️ **MongoDB** via **Mongoose**
- ☁️ **Vercel serverless functions** (`/api`) for the backend — one platform, one deploy

The scaffold ships with a single example resource (`items`) wired end to end with full CRUD, so you have a working reference to build on.

## Project structure

```
.
├── api/                    # Vercel serverless functions (the "backend")
│   ├── health.ts           # GET /api/health  — checks DB connectivity
│   └── items/
│       ├── index.ts        # GET/POST  /api/items
│       └── [id].ts         # GET/PUT/DELETE  /api/items/:id
├── lib/                    # Shared backend code
│   ├── mongodb.ts          # Cached Mongoose connection (serverless-safe)
│   └── models/Item.ts      # Mongoose model + types
├── src/                    # React frontend
│   ├── api/client.ts       # Typed fetch wrapper
│   ├── components/
│   ├── styles/             # SCSS
│   ├── App.tsx
│   └── main.tsx
├── vercel.json
└── vite.config.ts
```

## Getting started

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up MongoDB

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), then:

```bash
cp .env.example .env
# edit .env and paste your connection string into MONGODB_URI
```

### 3. Run locally

There are two ways to develop:

**Option A — full stack (recommended):** runs the frontend *and* the serverless
functions together, exactly like production. Requires the
[Vercel CLI](https://vercel.com/docs/cli) (`yarn global add vercel`).

```bash
yarn dev:full        # vercel dev — serves everything on http://localhost:3000
```

**Option B — frontend only:** runs the Vite dev server. API calls to `/api` are
proxied to a `vercel dev` instance on port 3000 (start that separately), or you
can point the proxy in `vite.config.ts` at any other backend.

```bash
yarn dev             # http://localhost:5173
```

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in the [Vercel dashboard](https://vercel.com/new).
3. Add an environment variable **`MONGODB_URI`** in the project settings.
4. Deploy. Vercel auto-detects Vite for the frontend and turns everything in
   `/api` into serverless functions.

> **Atlas tip:** allow Vercel's outbound IPs by adding `0.0.0.0/0` to your
> Atlas Network Access list (or configure specific IPs for tighter security).

## Scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `yarn dev`         | Vite dev server (frontend only)                |
| `yarn dev:full`    | `vercel dev` — frontend + serverless functions |
| `yarn build`       | Type-check and build for production            |
| `yarn preview`     | Preview the production build locally            |
| `yarn lint`        | Run ESLint                                      |
| `yarn typecheck`   | Type-check without emitting                     |

## Adding a new resource

1. Create a Mongoose model in `lib/models/`.
2. Add serverless functions under `api/<resource>/` (`index.ts` for the
   collection, `[id].ts` for a single document).
3. Add typed methods to `src/api/client.ts` and build your UI.
