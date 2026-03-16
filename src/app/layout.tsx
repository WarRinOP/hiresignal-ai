import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HireSignal — AI Recruitment Intelligence',
  description: 'Upload a resume and job description. Claude analyzes the match, identifies skill gaps, rewrites bullet points, and generates a full candidate report.',
  keywords: ['AI recruitment', 'resume analyzer', 'job match', 'candidate screening', 'hiring intelligence'],
  authors: [{ name: 'Abrar Tajwar Khan' }],
  openGraph: {
    title: 'HireSignal — AI Recruitment Intelligence',
    description: 'AI-powered résumé-to-job match scoring and candidate intelligence.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
