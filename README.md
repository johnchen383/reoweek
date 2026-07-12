# reoweek

🔗 **Live:** [reoweek.vercel.app](https://reoweek.vercel.app/)

A modern **MERN** starter — **M**ongoDB, **E**xpress-style API, **R**eact, **N**ode — built with:

- ⚡️ **Vite** + **React 19** + **TypeScript** frontend
- 🎨 **Sass (SCSS)** for styling
- 🗄️ **MongoDB** via **Mongoose**
- ☁️ **Vercel serverless functions** (`/api`) for the backend — one platform, one deploy

The app is **"Which Is Better?"** — a card-swipe game where you pick between
pairs (edit them in `src/data/questions.json`), followed by an optional
Typeform-style survey. Both the game choices and the survey answers are
persisted to MongoDB via the `/api/responses` endpoints.

An unlinked analytics dashboard lives at **`/admin`** — head-to-head splits,
survey distributions, the raw response table, and a (confirmed) clear-all-data
action. It isn't linked from anywhere, and it's gated by the
**`ADMIN_PASSWORD`** env variable: the page prompts for the password and the
API checks it server-side on the admin endpoints (list + delete). If
`ADMIN_PASSWORD` is unset, those endpoints stay locked. Setting
**`ENABLE_DELETE=false`** removes the clear-all-data option entirely (hidden
in the UI and rejected by the API).

## Project structure

```
.
├── api/                    # Vercel serverless functions (the "backend")
│   ├── health.ts           # GET /api/health  — checks DB connectivity
│   └── responses/
│       ├── index.ts        # GET/POST  /api/responses
│       └── [id].ts         # GET/PUT   /api/responses/:id (attach survey answers)
├── lib/                    # Shared backend code
│   ├── mongodb.ts          # Cached Mongoose connection (serverless-safe)
│   └── models/Response.ts  # Mongoose model + types
├── src/                    # React frontend
│   ├── api/client.ts       # Typed fetch wrapper
│   ├── components/         # CardGame, Card, CardIcon, Interlude, Survey, Results
│   ├── data/questions.json # ✏️ Edit the card pairs + survey questions here
│   ├── styles/             # SCSS
│   ├── App.tsx             # game → interlude → survey → done stage machine
│   ├── Admin.tsx           # /admin analytics dashboard (unlinked)
│   └── main.tsx            # routes / → App, /admin → Admin
├── vercel.json             # SPA rewrite for /admin
└── vite.config.ts
```

## Editing the questions

Everything the app asks lives in [`src/data/questions.json`](src/data/questions.json):

- **`pairs`** — the card matchups. Each needs an `id`, `left`, and `right`
  label. Cards get a hand-drawn icon from `src/components/CardIcon.tsx` when
  the label has one; unknown labels fall back to a generic icon.
- **`survey`** — the post-game questions. Supported `type`s: `text`, `email`,
  `phone` (validated, with matching mobile keyboards), `longtext`, `choice`
  (with `options`), and `scale` (with `min`/`max` and optional
  `minLabel`/`maxLabel`). Mark any of them `"required": true`.
  A choice question can use `"optionsFrom": "pairs"` instead of `options` to
  offer one option per matchup — it stays in sync when you edit the pairs.

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
3. Add the environment variables **`MONGODB_URI`** and **`ADMIN_PASSWORD`**
   (and optionally **`ENABLE_DELETE`**) in the project settings.
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
