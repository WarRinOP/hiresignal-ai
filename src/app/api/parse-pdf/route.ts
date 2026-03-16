import { NextRequest, NextResponse } from 'next/server'
import { parsePDF, validatePDFSize } from '@/lib/pdf'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    // Validate size
    validatePDFSize(file.size)

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const text = await parsePDF(buffer)

    return NextResponse.json({ text, characters: text.length }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
