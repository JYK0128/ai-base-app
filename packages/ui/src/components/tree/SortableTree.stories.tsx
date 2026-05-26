import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import type { TreeNode } from '@/lib/tree';
import { cn } from '@/lib/utils';

import { SortableTree } from './SortableTree';
import type { SortableTreeMove,
              SortableTreeRenderDropIndicatorArgs,
              SortableTreeRenderNodeArgs } from './SortableTree.types';

interface WorkspaceNode {
  readonly label: string
  readonly disabled?: boolean
}

const initialTree: TreeNode<WorkspaceNode> = {
  id: 'root',
  value: { label: 'Workspace' },
  children: [
    {
      id: 'marketing',
      value: { label: 'Marketing' },
      children: [
        { id: 'campaigns', value: { label: 'Campaigns' } },
        { id: 'calendar', value: { label: 'Calendar' } },
      ],
    },
    {
      id: 'product',
      value: { label: 'Product' },
      children: [
        { id: 'roadmap', value: { label: 'Roadmap' } },
        { id: 'research', value: { label: 'Research' } },
      ],
    },
    {
      id: 'operations',
      value: { label: 'Operations' },
      children: [
        { id: 'planning', value: { label: 'Planning' } },
      ],
    },
    {
      id: 'archive',
      value: { label: 'Archive', disabled: true },
      children: [],
    },
  ],
};

const meta: Meta<typeof SortableTree<WorkspaceNode>> = {
  title: 'Components/SortableTree',
  component: SortableTree<WorkspaceNode>,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SortableTree<WorkspaceNode>>;

export default meta;

type Story = StoryObj<typeof SortableTree<WorkspaceNode>>;

export const Standard: Story = {
  render: () => <WorkspaceTreeStory mode="controlled" />,
};

export const DefaultValue: Story = {
  render: () => <WorkspaceTreeStory mode="uncontrolled" />,
};

interface WorkspaceTreeStoryProps {
  readonly mode: 'controlled' | 'uncontrolled'
}

function WorkspaceTreeStory({ mode }: WorkspaceTreeStoryProps) {
  const isControlled = mode === 'controlled';
  const [controlledTree, setControlledTree] = React.useState(initialTree);
  const [treeSnapshot, setTreeSnapshot] = React.useState(initialTree);
  const [uncontrolledKey, setUncontrolledKey] = React.useState(0);
  const [lastMove, setLastMove] = React.useState('Ready');

  const handleChange = React.useCallback((
    nextTree: TreeNode<WorkspaceNode>,
    move: SortableTreeMove<WorkspaceNode>,
  ) => {
    if (isControlled) {
      setControlledTree(nextTree);
    }

    setTreeSnapshot(nextTree);
    setLastMove(`${move.source.node.value.label} ${move.position} ${move.target.node.value.label}`);
  }, [isControlled]);

  const handleReset = React.useCallback(() => {
    setTreeSnapshot(initialTree);
    setLastMove('Ready');

    if (isControlled) {
      setControlledTree(initialTree);
      return;
    }

    setUncontrolledKey((currentKey) => currentKey + 1);
  }, [isControlled]);

  return (
    <main
      className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground"
      data-tree-serialized={serializeTree(treeSnapshot)}
      data-tree-last-move={lastMove}
    >
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-base font-semibold">Workspace</h1>
          <p className="text-sm text-muted-foreground">{lastMove}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          data-tree-reset
          onClick={handleReset}
        >
          Reset
        </Button>
      </header>

      <section className="grid grid-cols-[minmax(320px,520px)_1fr] gap-6 p-6">
        <div className="min-w-0">
          {isControlled
            ? (
              <SortableTree
                value={controlledTree}
                onChange={handleChange}
                aria-label="Workspace tree"
                getNodeDisabled={(node) => node.value.disabled ?? false}
                className="grid gap-0.5 rounded-md border bg-background p-3"
                renderNode={renderWorkspaceNode}
                renderDropIndicator={renderWorkspaceDropIndicator}
              />
            )
            : (
              <SortableTree
                key={uncontrolledKey}
                defaultValue={initialTree}
                onChange={handleChange}
                aria-label="Workspace tree"
                getNodeDisabled={(node) => node.value.disabled ?? false}
                className="grid gap-0.5 rounded-md border bg-background p-3"
                renderNode={renderWorkspaceNode}
                renderDropIndicator={renderWorkspaceDropIndicator}
              />
            )}
        </div>

        <div className="min-w-0 border-l pl-6">
          <h2 className="text-sm font-medium">Structure</h2>
          <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs leading-5">
            {serializeTree(treeSnapshot)}
          </pre>
        </div>
      </section>
    </main>
  );
}

function renderWorkspaceNode({
  node,
  state,
}: SortableTreeRenderNodeArgs<WorkspaceNode>) {
  const childrenCount = node.children?.length ?? 0;

  return (
    <>
      <span className="truncate font-medium">{node.value.label}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {state.isDisabled ? 'Locked' : childrenCount}
      </span>
    </>
  );
}

function renderWorkspaceDropIndicator({
  state,
}: SortableTreeRenderDropIndicatorArgs) {
  return (
    <div
      className={cn(
        'h-0.5 w-full rounded-full transition-colors',
        state.isOver && state.isDragging && state.isDropAllowed && 'bg-primary',
        state.isOver && state.isDragging && !state.isDropAllowed && 'bg-destructive',
      )}
    />
  );
}

function serializeTree(tree: TreeNode<WorkspaceNode>): string {
  return tree.children?.map(serializeNode).join('|') ?? '';
}

function serializeNode(node: TreeNode<WorkspaceNode>): string {
  const children = node.children ?? [];

  if (children.length === 0) {
    return node.id;
  }

  return `${node.id}[${children.map(serializeNode).join(',')}]`;
}
