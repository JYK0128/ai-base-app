import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { ReactNode } from 'react';

interface ConsolePanelProps {
  readonly actions?: ReadonlyArray<ReactNode>
  readonly children: ReactNode
  readonly description: string
  readonly icon?: IconName
  readonly title: string
}

export function ConsolePanel({
  actions,
  children,
  description,
  icon,
  title,
}: Readonly<ConsolePanelProps>) {
  return (
    <section className="
      grid h-full min-h-160 grid-rows-[auto_minmax(0,1fr)] overflow-hidden
      rounded-xl border border-slate-200 bg-white shadow-sm
    "
    >
      <header className="
        flex flex-col gap-3 border-b border-slate-200 p-4
        lg:flex-row lg:items-start lg:justify-between
      "
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-0.5 shrink-0 text-slate-500">
            {icon ? <DynamicIcon name={icon} className="size-4" /> : null}
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {actions
          ? (
            <div className="
              flex w-full flex-wrap items-center justify-end gap-2
              lg:ml-auto lg:w-auto lg:flex-none
            "
            >
              {actions}
            </div>
          )
          : null}
      </header>

      <div className="min-h-0 overflow-auto p-4">{children}</div>
    </section>
  );
}
