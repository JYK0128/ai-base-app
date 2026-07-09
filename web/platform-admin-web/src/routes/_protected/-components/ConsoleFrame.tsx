import { cn } from '@pkg/ui';
import type { ReactNode } from 'react';

interface ConsoleFrameProps {
  readonly actions?: ReadonlyArray<ReactNode>
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}

export function ConsoleFrame({
  actions,
  children,
  description,
  title,
}: Readonly<ConsoleFrameProps>) {
  const actionContent = actions && (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {actions}
    </div>
  );

  return (
    <div className={cn(
      'size-full min-h-0 overflow-auto',
      'grid grid-rows-[auto_auto_minmax(0,1fr)] gap-3',
      'pb-3',
    )}
    >

      <header className={cn(
        'flex flex-row flex-wrap items-start justify-between',
        'p-3 pb-0',
      )}
      >
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-slate-500">{description}</p>
        </div>

        {actionContent}
      </header>

      <hr />

      {children}
    </div>
  );
}
