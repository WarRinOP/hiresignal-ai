import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client (elevated access — use only in API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ─── TypeScript Types ──────────────────────────────────────────────────────

export interface BulletRewrite {
  original: string
  rewritten: string
  reason: string
}

export type Recommendation = 'Hire' | 'Consider' | 'Pass'

export interface HsAnalysis {
  id: string
  candidate_name: string | null
  role_title: string
  resume_text: string
  job_description: string
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  keyword_gaps: string[]
  strengths: string[]
  weaknesses: string[]
  bullet_rewrites: BulletRewrite[]
  recommendation: Recommendation
  recommendation_reason: string
  created_at: string
}

export interface HsSettings {
  id: string
  default_role_title: string | null
  company_name: string | null
  updated_at: string
}

// Analysis creation payload (no id or created_at)
export type CreateAnalysisPayload = Omit<HsAnalysis, 'id' | 'created_at'>
