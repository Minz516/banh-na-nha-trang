import type { LucideIcon } from 'lucide-react';

type Tone = 'primary' | 'accent' | 'success' | 'warning';

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

type Props = {
  label: string;
  value: number | null;
  icon: LucideIcon;
  tone?: Tone;
  format?: (n: number) => string;
  onClick?: () => void;
  active?: boolean;
};

// Section 3.9 — admin data viz stays inside the same semantic palette (never
// an ad hoc chart-library color); Section 4.5 — real skeleton, not a spinner.
export function StatCard({ label, value, icon: Icon, tone = 'primary', format, onClick, active }: Props) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`bg-card rounded-md shadow-sm p-5 flex items-start gap-4 text-left w-full transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${active ? 'ring-2 ring-primary' : ''}`}
    >
      <div className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-text-secondary">{label}</p>
        {value === null ? (
          <div className="mt-1.5 h-7 w-16 rounded-sm bg-[color:var(--color-skeleton-base)] animate-pulse" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold text-text-primary">{format ? format(value) : value}</p>
        )}
      </div>
    </Wrapper>
  );
}
