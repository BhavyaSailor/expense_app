# Trackspense frontend

React + Vite + Recharts. Talks to the existing Express API; the backend is unchanged.

```bash
npm install
cp .env.example .env   # set VITE_API_BASE, e.g. http://localhost:5000/api
npm run dev
```

On Vercel, set `VITE_API_BASE` in Project Settings, Environment Variables. `vercel.json` already rewrites all routes to `index.html`.
