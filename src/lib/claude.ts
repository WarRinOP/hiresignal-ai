import Anthropic from '@anthropic-ai/sdk'
import type { BulletRewrite, Recommendation } from './supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface AnalysisResult {
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  keyword_gaps: string[]
  strengths: string[]
  weaknesses: string[]
  bullet_rewrites: BulletRewrite[]
  recommendation: Recommendation
  recommendation_reason: string
}

const SYSTEM_PROMPT = `You are an expert recruitment analyst and career coach. Analyze resume-job description pairs and return precise, actionable intelligence to help hiring teams make better decisions faster.
Respond with a single valid JSON object only. No markdown. No backticks. No explanation.`

export async function analyzeMatch(
  resumeText: string,
  jobDescription: string,
  roleTitle: string,
  companyName?: string
): Promise<AnalysisResult> {
  const company = companyName || 'the company'

  const userMessage = `Analyze this resume against the job description for the role of "${roleTitle}" at "${company}".

Return ONLY this JSON:
{
  "match_score": <integer 0-100, overall fit>,
  "matched_skills": [
    "<skill present in both resume and JD>",
    ...up to 10 skills
  ],
  "missing_skills": [
    "<important skill in JD not found in resume>",
    ...up to 8 skills
  ],
  "keyword_gaps": [
    "<important keyword/technology in JD missing from resume>",
    ...up to 6 keywords
  ],
  "strengths": [
    "<specific strength based on resume content>",
    ...4 strengths
  ],
  "weaknesses": [
    "<specific gap or weakness for this role>",
    ...4 weaknesses
  ],
  "bullet_rewrites": [
    {
      "original": "<exact bullet from resume>",
      "rewritten": "<improved version with JD keywords and stronger action verbs>",
      "reason": "<1 sentence explaining improvement>"
    },
    ...3 rewrites of the weakest bullets
  ],
  "recommendation": "<Hire | Consider | Pass>",
  "recommendation_reason": "<2-3 sentences explaining the hiring recommendation based on overall fit>"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    system: SYSTEM_PROMPT,
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Clean the response — strip any accidental markdown
  let jsonText = content.text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  let result: AnalysisResult
  try {
    result = JSON.parse(jsonText)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonText.slice(0, 200)}`)
  }

  // Validate required fields
  if (typeof result.match_score !== 'number') {
    throw new Error('Invalid analysis: missing match_score')
  }
  if (!['Hire', 'Consider', 'Pass'].includes(result.recommendation)) {
    result.recommendation = 'Consider'
  }

  // Ensure arrays exist
  result.matched_skills = result.matched_skills || []
  result.missing_skills = result.missing_skills || []
  result.keyword_gaps = result.keyword_gaps || []
  result.strengths = result.strengths || []
  result.weaknesses = result.weaknesses || []
  result.bullet_rewrites = result.bullet_rewrites || []

  return result
}
