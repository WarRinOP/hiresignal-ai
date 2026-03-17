import { NextRequest, NextResponse } from 'next/server'
import { analyzeMatch } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase'
import type { CreateAnalysisPayload } from '@/lib/supabase'

const MAX_ANALYSES = 5

export async function POST(req: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────────
  let body: {
    resumeText?: string
    jobDescription?: string
    roleTitle?: string
    companyName?: string
    candidateName?: string
    session_id?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { resumeText, jobDescription, roleTitle, companyName, candidateName, session_id } = body

  // ── Validate required fields ─────────────────────────────────────────────
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    return NextResponse.json({ error: 'resumeText is required and must not be empty' }, { status: 400 })
  }
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
    return NextResponse.json({ error: 'jobDescription is required and must not be empty' }, { status: 400 })
  }
  if (!roleTitle || typeof roleTitle !== 'string' || roleTitle.trim().length === 0) {
    return NextResponse.json({ error: 'roleTitle is required and must not be empty' }, { status: 400 })
  }
  if (!session_id || typeof session_id !== 'string') {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  // ── Rate limiting ───────────────────────────────────────────────────────
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  // Admin bypass
  const adminKey = req.headers.get('x-admin-key') || ''
  const isAdmin = adminKey && adminKey === process.env.ADMIN_SECRET

  // Upsert session row
  const { data: session } = await supabaseAdmin
    .from('hs_sessions')
    .upsert(
      { session_id: session_id.trim(), ip_address: clientIp },
      { onConflict: 'session_id' }
    )
    .select()
    .single()

  const currentCount = session?.usage_count ?? 0

  if (!isAdmin && currentCount >= MAX_ANALYSES) {
    return NextResponse.json(
      {
        error: `You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out for unlimited access!`,
        code: 'RATE_LIMIT',
        remaining: 0,
      },
      { status: 429 }
    )
  }

  // Secondary IP check
  const { data: ipSessions } = await supabaseAdmin
    .from('hs_sessions')
    .select('usage_count')
    .eq('ip_address', clientIp)

  const totalIpUsage =
    ipSessions?.reduce((sum, s) => sum + (s.usage_count ?? 0), 0) ?? 0

  if (!isAdmin && totalIpUsage >= MAX_ANALYSES) {
    return NextResponse.json(
      {
        error: `You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out for unlimited access!`,
        code: 'RATE_LIMIT',
        remaining: 0,
      },
      { status: 429 }
    )
  }

  // ── Call Claude ──────────────────────────────────────────────────────────
  let analysis
  try {
    analysis = await analyzeMatch(
      resumeText.trim(),
      jobDescription.trim(),
      roleTitle.trim(),
      companyName?.trim()
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error from Claude'
    console.error('[analyze] Claude error:', message)
    return NextResponse.json(
      { error: `Failed to analyze with Claude: ${message}` },
      { status: 500 }
    )
  }

  // ── Save to Supabase ─────────────────────────────────────────────────────
  const payload: CreateAnalysisPayload & { session_id: string } = {
    session_id: session_id.trim(),
    candidate_name: candidateName?.trim() || null,
    role_title: roleTitle.trim(),
    resume_text: resumeText.trim(),
    job_description: jobDescription.trim(),
    match_score: analysis.match_score,
    matched_skills: analysis.matched_skills,
    missing_skills: analysis.missing_skills,
    keyword_gaps: analysis.keyword_gaps,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    bullet_rewrites: analysis.bullet_rewrites,
    recommendation: analysis.recommendation,
    recommendation_reason: analysis.recommendation_reason,
  }

  const { data: saved, error: saveError } = await supabaseAdmin
    .from('hs_analyses')
    .insert(payload)
    .select()
    .single()

  if (saveError) {
    console.error('[analyze] Supabase save error:', saveError)
    return NextResponse.json(
      { error: `Failed to save analysis: ${saveError.message}` },
      { status: 500 }
    )
  }

  // ── Increment usage count ────────────────────────────────────────────────
  const newRemaining = MAX_ANALYSES - currentCount - 1
  await supabaseAdmin
    .from('hs_sessions')
    .update({ usage_count: currentCount + 1 })
    .eq('session_id', session_id.trim())

  return NextResponse.json({ ...saved, remaining: isAdmin ? 999 : newRemaining }, { status: 200 })
}
