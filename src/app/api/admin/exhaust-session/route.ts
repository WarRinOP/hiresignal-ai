import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_ANALYSES = 5

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key') || ''
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { session_id, action } = await req.json()
  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const newCount = action === 'reset' ? 0 : MAX_ANALYSES

  await supabaseAdmin
    .from('hs_sessions')
    .upsert({ session_id, usage_count: newCount }, { onConflict: 'session_id' })

  return NextResponse.json({ ok: true, usage_count: newCount })
}
