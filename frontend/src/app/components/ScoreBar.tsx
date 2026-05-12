import { cn } from '../lib/utils';

interface ScoreBarProps {
  score: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ScoreBar({
  score,
  label,
  showPercentage = true,
  variant = 'primary',
  className
}: ScoreBarProps) {
  const colors = {
    primary: 'bg-primary',
    success: 'bg-[#10b981]',
    warning: 'bg-[#f59e0b]',
    danger: 'bg-[#ef4444]',
  };

  const getVariant = () => {
    if (variant !== 'primary') return variant;
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const finalVariant = getVariant();

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">{label}</span>
          {showPercentage && (
            <span className="font-medium text-foreground">{score}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colors[finalVariant])}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
