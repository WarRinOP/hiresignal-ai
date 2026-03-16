# HireSignal — AI Recruitment Intelligence

> Match resumes to job descriptions instantly.  
> Get scores, skills gaps, and improvements powered by Claude AI.

## Live Demo

[Deploy to Vercel to get your URL]

## Screenshots

<!-- Add after deployment -->

## Features

- **Match Score** — 0–100% compatibility ring with animated count-up
- **Skills Breakdown** — matched vs missing skills with green/red pills
- **Keyword Gaps** — ATS optimisation suggestions (or green success state)
- **Bullet Rewriter** — AI-improved resume bullet points with reasoning
- **Hire / Consider / Pass** recommendation with confidence rationale
- **Analysis History** — full dashboard with filters, search, and pagination
- **Report Download** — formatted `.txt` report for every analysis

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Model | Claude 3.5 Haiku |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Fonts | Plus Jakarta Sans + JetBrains Mono |
| Deploy | Vercel |

## Architecture

```
User uploads resume + JD
        ↓
   /api/analyze  (POST)
        ↓
Claude 3.5 Haiku → structured JSON response
        ↓
Parsed + saved to hs_analyses (Supabase)
        ↓
ResultsPanel renders match score + breakdown
        ↓
History dashboard updates with new record
```

## Setup

1. **Clone** — `git clone https://github.com/WarRinOP/hiresignal-ai`
2. **Install** — `npm install`
3. **Environment** — copy `.env.local.example` to `.env.local` and fill in values
4. **Run** — `npm run dev` → open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## Supabase Tables

- `hs_analyses` — all analysis records (score, skills, rewrites, recommendation)
- `hs_settings` — user preferences (default role, company name)

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Run analysis via Claude, save to DB |
| `/api/analyses` | GET | Fetch all analyses with optional filters |
| `/api/analyses` | DELETE | Delete an analysis by ID |
| `/api/report` | GET | Generate `.txt` report download |
| `/api/parse-pdf` | POST | Extract text from uploaded PDF |
| `/api/settings` | GET / PUT | Read or update user settings |

---

Built by **Abrar Tajwar Khan**  
Available for custom AI development on [Fiverr](https://www.fiverr.com)
