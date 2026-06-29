import type { ReactNode } from 'react';

interface ManagementPanelProps {
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly description: string
  readonly icon: ReactNode
  readonly title: string
}

export function ManagementPanel({ actions, children, description, icon, title }: Readonly<ManagementPanelProps>) {
  return (
    <section className="
      flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200
      bg-white shadow-sm
    "
    >
      <header className="
        flex flex-col gap-3 border-b border-slate-200 p-4
        lg:flex-row lg:items-center lg:justify-between
      "
      >
        <div className="flex items-start gap-3">
          <div className="
            mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5
            text-slate-500
          "
          >
            {icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {actions
          ? (
            <div className="
              flex w-full items-center justify-end gap-2
              lg:w-auto
            "
            >
              {actions}
            </div>
          )
          : null}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-4">{children}</div>
    </section>
  );
}
