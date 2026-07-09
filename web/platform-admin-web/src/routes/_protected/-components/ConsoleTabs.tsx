import { Tabs, TabsContent, TabsList, TabsTrigger } from '@pkg/ui';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface ConsoleTabsProps {
  readonly defaultValue?: string
  readonly items: ReadonlyArray<{
    readonly label: ReactNode
    readonly value: string
    readonly content: (args: { readonly isActive: boolean }) => ReactNode
  }>
}

export function ConsoleTabs({
  defaultValue,
  items,
}: Readonly<ConsoleTabsProps>) {
  const [activeTab, setActiveTab] = useState(defaultValue ?? items[0]?.value ?? '');

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex min-h-0 flex-col gap-4 overflow-hidden px-2"
    >
      <TabsList className="scroll-x w-full justify-start" variant="line">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="flex-none px-4"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {item.content({ isActive: activeTab === item.value })}
        </TabsContent>
      ))}
    </Tabs>
  );
}
