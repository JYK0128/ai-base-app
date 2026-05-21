import { type ReactNode } from 'react';

interface ResourcePanelProps {
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly description: string
  readonly icon: ReactNode
  readonly title: string
}

export function ResourcePanel({ actions, children, description, icon, title }: ResourcePanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>

      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

interface ResourceSectionProps {
  readonly badge?: string
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}

export function ResourceSection({ badge, children, description, title }: ResourceSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {badge && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            {badge}
          </span>
        )}
      </div>

      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
        {children}
      </div>
    </section>
  );
}
