import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { SortableList, type SortableListItem } from './SortableList';

const initialItems: SortableListItem[] = [
  {
    id: 'content',
  },
  {
    id: 'posts',
  },
  {
    id: 'pages',
  },
];

const itemDetails = {
  content: {
    label: 'Content',
    description: 'Publishable pages and collections',
  },
  posts: {
    label: 'Posts',
    description: 'Blog and editorial articles',
  },
  pages: {
    label: 'Pages',
    description: 'Static marketing pages',
  },
} as const;

const meta: Meta<typeof SortableList> = {
  title: 'Components/SortableList',
  component: SortableList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SortableList>;

export default meta;

type Story = StoryObj<typeof SortableList>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = React.useState<SortableListItem[]>(initialItems);

    return (
      <SortableList value={items} onChange={setItems}>
        {items.map((item) => (
          <SortableList.Item key={item.id} id={item.id}>
            <div>
              {itemDetails[item.id as keyof typeof itemDetails].label}
            </div>
            <div>
              {itemDetails[item.id as keyof typeof itemDetails].description}
            </div>
          </SortableList.Item>
        ))}
      </SortableList>
    );
  },
};
