import { type ReactNode } from 'react';

interface MembersPanelProps {
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly description: string
  readonly icon: ReactNode
  readonly title: string
}

export function MembersPanel({ actions, children, description, icon, title }: MembersPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-slate-500">
            {icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">{children}</div>
    </section>
  );
}
