import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateReportText, getReportFilename } from '@/lib/report'
import type { HsAnalysis } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
  }

  // ── Fetch analysis ────────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('hs_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
  }

  const analysis = data as HsAnalysis

  // ── Generate text report ─────────────────────────────────────────────────
  const reportText = generateReportText(analysis)
  const filename = getReportFilename(analysis)

  return new NextResponse(reportText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
