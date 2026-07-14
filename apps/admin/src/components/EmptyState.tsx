import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

// Section 14.1/14.3 — illustration only where photography can't function;
// for an internal tool a calm line-icon + honest copy does the same job.
export function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="bg-card rounded-md shadow-sm py-16 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-background-alt flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
    </div>
  );
}
