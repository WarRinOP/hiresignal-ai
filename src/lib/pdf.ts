// PDF parsing utility using pdf-parse
// This utility runs only on the server (API routes)

type PdfParseModule = (buffer: Buffer) => Promise<{ text: string; numpages: number }>

export async function parsePDF(buffer: Buffer): Promise<string> {
  // Use dynamic import to work with both CJS and ESM
  const pdfParse: PdfParseModule = await import('pdf-parse').then((m) => m.default || m)

  const data = await pdfParse(buffer)
  const text = data.text?.trim()

  if (!text || text.length < 50) {
    throw new Error('Could not extract text from PDF. The file may be empty, scanned, or image-based.')
  }

  return text
}

export function validatePDFSize(bytes: number): void {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  if (bytes > MAX_SIZE) {
    throw new Error('PDF file exceeds 5MB limit. Please upload a smaller file.')
  }
}
