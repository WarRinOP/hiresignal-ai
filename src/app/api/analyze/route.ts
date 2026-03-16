import { NextRequest, NextResponse } from 'next/server'
import { analyzeMatch } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase'
import type { CreateAnalysisPayload } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────────
  let body: {
    resumeText?: string
    jobDescription?: string
    roleTitle?: string
    companyName?: string
    candidateName?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { resumeText, jobDescription, roleTitle, companyName, candidateName } = body

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
  const payload: CreateAnalysisPayload = {
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

  return NextResponse.json(saved, { status: 200 })
}
