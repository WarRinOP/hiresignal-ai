import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const recommendation = searchParams.get('recommendation')
  const search = searchParams.get('search')
  const period = searchParams.get('period') // 'week' | 'month' | 'all'

  let query = supabaseAdmin
    .from('hs_analyses')
    .select('*')
    .order('created_at', { ascending: false })

  // ── Filter: recommendation ───────────────────────────────────────────────
  if (recommendation && ['Hire', 'Consider', 'Pass'].includes(recommendation)) {
    query = query.eq('recommendation', recommendation)
  }

  // ── Filter: date period ──────────────────────────────────────────────────
  if (period === 'week') {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    query = query.gte('created_at', since.toISOString())
  } else if (period === 'month') {
    const since = new Date()
    since.setMonth(since.getMonth() - 1)
    query = query.gte('created_at', since.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('[analyses GET] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ── Filter: text search (client-side after fetch) ────────────────────────
  // Supabase ilike can't search two columns easily without or() — doing it here
  let results = data ?? []
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase()
    results = results.filter(
      (row) =>
        row.candidate_name?.toLowerCase().includes(q) ||
        row.role_title?.toLowerCase().includes(q)
    )
  }

  return NextResponse.json(results, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  let body: { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  // Check exists first
  const { data: existing } = await supabaseAdmin
    .from('hs_analyses')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin.from('hs_analyses').delete().eq('id', id)

  if (error) {
    console.error('[analyses DELETE] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
