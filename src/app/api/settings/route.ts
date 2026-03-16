import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('hs_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[settings GET] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return defaults if no row exists yet
  if (!data || data.length === 0) {
    return NextResponse.json(
      { default_role_title: '', company_name: '' },
      { status: 200 }
    )
  }

  return NextResponse.json(data[0], { status: 200 })
}

export async function PUT(req: NextRequest) {
  let body: { default_role_title?: string; company_name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { default_role_title = '', company_name = '' } = body

  // ── Fetch existing row id if any ─────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('hs_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  let result
  if (existing?.id) {
    // Update existing row
    const { data, error } = await supabaseAdmin
      .from('hs_settings')
      .update({
        default_role_title,
        company_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('[settings PUT] Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data
  } else {
    // Insert first row
    const { data, error } = await supabaseAdmin
      .from('hs_settings')
      .insert({ default_role_title, company_name })
      .select()
      .single()

    if (error) {
      console.error('[settings PUT] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data
  }

  return NextResponse.json(result, { status: 200 })
}
