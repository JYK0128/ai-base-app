export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter((part): part is string => !!part)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function upsertById<T extends { id: string }>(
  items: readonly T[] | undefined,
  nextItem: T,
): T[] {
  const current = items ?? [];
  const index = current.findIndex((item) => item.id === nextItem.id);

  if (index === -1) {
    return [nextItem, ...current];
  }

  const next = [...current];
  next[index] = nextItem;
  return next;
}
