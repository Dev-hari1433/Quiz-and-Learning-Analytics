## Quiz & Learning Analytics

Modern React + Vite + Supabase app for generating AI-powered quizzes, tracking history, and viewing real‑time analytics.

### Tech Stack
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui, framer‑motion
- Supabase (Auth, Database, Edge Functions)
- React Router, TanStack Query

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project with anon and service keys

### Installation
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### Env Setup
Create a `.env` file in the project root:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If you use Supabase Edge Functions for quiz generation, also configure on the Supabase side and deploy the function `quiz-generator`.

### Development
```bash
npm run dev
```
The app runs on `http://localhost:5173` by default.

### Production Build
```bash
npm run build
npm run preview
```

---

## Routing Notes

Client‑side routing is handled by React Router. To avoid 404s on static hosts (Vercel/Netlify), ensure a SPA fallback is configured. In Vercel, this is automatic for Vite projects. Internal navigation should use React Router navigation instead of full page reloads.

Key routes:
- `/generate-quiz` – AI quiz generator
- `/quiz` – take quiz
- `/history` – quiz history
- `/analytics` – dashboards

---

## Supabase

Tables used (examples):
- `quiz_sessions` – stores sessions metadata
- `quiz_results` – per‑question results

Edge Function expected:
- `quiz-generator` – accepts `{ content, topic, difficulty, numQuestions }` and returns `{ success, data: { questions } }`.

Run migrations located in `supabase/migrations/` against your project.

---

## Performance

- Pages are lazy‑loaded via `React.lazy`.
- Heavy derived lists in history are memoized with `useMemo`.
- TanStack Query caching configured for fewer network calls.

---

## Deploy

### Vercel
1. Import the repo into Vercel.
2. Framework preset: Vite.
3. Environment variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

### Netlify (optional)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Enable SPA fallback (redirect `/*` to `/index.html`).

---

## Contributing
Pull requests welcome. Please keep code readable and consistent with the existing style.

## License
MIT
