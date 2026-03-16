interface Props {
  score: number;
  size?: number;
}

export function MatchScoreArc({ score, size = 48 }: Props) {
  const radius = (size - 6) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size / 2 + 4} viewBox={`0 0 ${size} ${size / 2 + 4}`}>
        <path
          d={`M 3 ${size / 2 + 1} A ${radius} ${radius} 0 0 1 ${size - 3} ${size / 2 + 1}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d={`M 3 ${size / 2 + 1} A ${radius} ${radius} 0 0 1 ${size - 3} ${size / 2 + 1}`}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}
