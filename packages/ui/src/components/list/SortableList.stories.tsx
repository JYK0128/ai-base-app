import type { Meta, StoryObj } from '@storybook/react-vite';
import { GripVertical } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { SortableList, type SortableListItem } from './SortableList';

interface NavigationItem extends SortableListItem {
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
  component: SortableList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SortableList<NavigationItem>>;

export default meta;

type Story = StoryObj<typeof SortableList<NavigationItem>>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = React.useState<NavigationItem[]>(initialItems);

    return (
      <main className="min-h-screen bg-background p-8 text-foreground flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">Navigation Sections</h1>
            <p className="text-sm text-muted-foreground">Drag and reorder your active site sections.</p>
          </div>

          <SortableList
            value={items}
            onChange={setItems}
            className="space-y-2 rounded-lg border bg-muted/40 p-4"
            renderItem={({ item, state, dragHandleProps }) => (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm hover:shadow-md hover:border-accent-foreground/10 transition-all duration-200",
                  state.isDragging && "opacity-40 border-primary",
                )}
              >
                <button
                  {...dragHandleProps}
                  className="inline-flex size-8 shrink-0 items-center justify-center cursor-grab select-none touch-none active:cursor-grabbing text-muted-foreground hover:text-foreground active:text-primary transition-colors hover:bg-muted rounded"
                >
                  <GripVertical className="size-4" />
                </button>
                
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </main>
    );
  },
};
