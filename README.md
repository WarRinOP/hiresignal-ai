# HireSignal — AI Recruitment Intelligence

> **Built by [Abrar Tajwar Khan](https://www.fiverr.com) — available for custom AI development on Fiverr**

HireSignal is an AI-powered recruitment intelligence tool. Upload a candidate's resume + paste a job description → Claude analyzes the match → returns a percentage score, matched skills, missing skills, keyword gaps, bullet point rewrites, and a full candidate report. Every analysis is saved to a history dashboard for comparing candidates across roles.

---

## Features

- **Resume Upload** — drag-and-drop PDF or paste text directly
- **AI Match Analysis** — Claude scores the fit 0–100% with detailed breakdown
- **Skills Breakdown** — matched skills (✓) and missing skills (✗) side by side
- **Keyword Gaps** — important JD keywords absent from the resume
- **Bullet Rewriter** — before/after rewrites of the weakest resume bullets
- **Hire / Consider / Pass** — clear recommendation with reasoning
- **Report Download** — clean text report for sharing
- **History Dashboard** — all past analyses, filterable by role and recommendation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI | Claude 3.5 Haiku (Anthropic) |
| PDF Parsing | pdf-parse |
| Deployment | Vercel |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/hiresignal-ai.git
cd hiresignal-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Anthropic keys

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## Architecture

```mermaid
graph TD
    A[User] -->|Upload PDF / Paste Resume| B[ResumeUpload Component]
    A -->|Paste Job Description| C[JobDescInput Component]
    B --> D[/api/analyze]
    C --> D
    D -->|pdf-parse| E[Extract Resume Text]
    E -->|Claude 3.5 Haiku| F[AI Analysis]
    F -->|Save| G[(Supabase hs_analyses)]
    F --> H[ResultsPanel]
    H --> I[MatchRing Score]
    H --> J[Skills Breakdown]
    H --> K[Bullet Rewriter]
    H --> L[Download Report]
    G --> M[/history Dashboard]
```

## Database Schema

All tables use the `hs_` prefix on the shared Supabase project.

### `hs_analyses`
Stores every resume–JD analysis with full Claude output.

### `hs_settings`
Single-row settings table for default role/company configuration.

## Demo Scenario

1. Upload a Software Engineer resume PDF
2. Paste a Google SWE job description
3. Click **Analyze Match →**
4. See: 74% match ring animate → skills gap → bullet rewrites → download report
5. Switch to History to compare across candidates

---

*HireSignal is a portfolio project demonstrating AI-powered recruitment tooling. Built with Next.js, Supabase, and Claude API.*
