'use client'

interface SkillsBreakdownProps {
  matchedSkills: string[]
  missingSkills: string[]
}

function SkillPill({
  skill,
  type,
}: {
  skill: string
  type: 'matched' | 'missing'
}) {
  const isMatched = type === 'matched'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isMatched
          ? 'bg-hire/10 text-hire border border-hire/20'
          : 'bg-pass/10 text-pass border border-pass/20'
      }`}
    >
      <span className="text-[10px] font-bold">{isMatched ? '✓' : '✕'}</span>
      {skill}
    </span>
  )
}

export default function SkillsBreakdown({
  matchedSkills,
  missingSkills,
}: SkillsBreakdownProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Matched */}
      <div>
        <p className="label-caps mb-3">Matched Skills</p>
        {matchedSkills.length === 0 ? (
          <p className="text-xs text-text-muted">None identified</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <SkillPill key={skill} skill={skill} type="matched" />
            ))}
          </div>
        )}
      </div>

      {/* Missing */}
      <div>
        <p className="label-caps mb-3">Missing Skills</p>
        {missingSkills.length === 0 ? (
          <p className="text-xs text-text-muted">None identified</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <SkillPill key={skill} skill={skill} type="missing" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
