import type { ReactNode } from 'react';

interface ConsoleSectionsProps {
  readonly children: ReactNode
}

export function ConsoleSections({ children }: Readonly<ConsoleSectionsProps>) {
  return (
    <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-2">
      {children}
    </div>
  );
}
