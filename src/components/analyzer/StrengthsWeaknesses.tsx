'use client'

interface StrengthsWeaknessesProps {
  strengths: string[]
  weaknesses: string[]
}

function ListItem({
  text,
  color,
}: {
  text: string
  color: 'green' | 'red'
}) {
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span
        className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full"
        style={{
          background: color === 'green' ? '#22c55e' : '#ef4444',
          boxShadow: color === 'green'
            ? '0 0 6px rgba(34,197,94,0.4)'
            : '0 0 6px rgba(239,68,68,0.4)',
        }}
      />
      <span className="text-sm text-text-secondary leading-relaxed">{text}</span>
    </li>
  )
}

export default function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: StrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Strengths */}
      <div>
        <p className="label-caps mb-2">Strengths</p>
        <ul className="space-y-0.5">
          {strengths.map((s, i) => (
            <ListItem key={i} text={s} color="green" />
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div>
        <p className="label-caps mb-2">Areas to Improve</p>
        <ul className="space-y-0.5">
          {weaknesses.map((w, i) => (
            <ListItem key={i} text={w} color="red" />
          ))}
        </ul>
      </div>
    </div>
  )
}
