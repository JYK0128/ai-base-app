import type { Meta, StoryObj } from '@storybook/react-vite';
import { GripVertical } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { SortableList } from './SortableList';
import type { ListNode } from './SortableList.types';

interface NavigationItem extends ListNode {
  label: string
  description: string
}

const initialItems: NavigationItem[] = [
  {
    id: 'content',
    label: 'Content',
    description: 'Publishable pages and collections',
  },
  {
    id: 'posts',
    label: 'Posts',
    description: 'Blog and editorial articles',
  },
  {
    id: 'pages',
    label: 'Pages',
    description: 'Static marketing pages',
  },
];

const meta: Meta<typeof SortableList<NavigationItem>> = {
  title: 'Components/SortableList',
  component: SortableList<NavigationItem>,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SortableList<NavigationItem>>;

export default meta;

type Story = StoryObj<typeof SortableList<NavigationItem>>;

function NavigationListStory() {
  const [items, setItems] = React.useState<NavigationItem[]>(initialItems);

  return (
    <main className="
      flex min-h-screen items-center justify-center bg-background p-8
      text-foreground
    "
    >
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Navigation Sections</h1>
          <p className="text-sm text-muted-foreground">Drag and reorder your active site sections.</p>
        </div>

        <SortableList
          value={items}
          onChange={setItems}
          className="space-y-2 rounded-lg border bg-muted/40 p-4"
          renderNode={({ node, state, dragHandleProps, ref }) => (
            <div
              ref={ref}
              className={cn(
                `
                  flex items-center gap-3 rounded-md border bg-card p-3
                  shadow-sm transition-all duration-200
                  hover:border-accent-foreground/10 hover:shadow-md
                `,
                state.isDragging && 'border-primary opacity-40',
              )}
            >
              <button
                {...dragHandleProps}
                className="
                  inline-flex size-8 shrink-0 cursor-grab touch-none
                  items-center justify-center rounded-sm text-muted-foreground
                  transition-colors select-none
                  hover:bg-muted hover:text-foreground
                  active:cursor-grabbing active:text-primary
                "
              >
                <GripVertical className="size-4" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {node.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {node.description}
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </main>
  );
}

export const Default: Story = {
  render: () => <NavigationListStory />,
};
