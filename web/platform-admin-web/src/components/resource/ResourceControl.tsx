import { cloneElement, type ReactElement, useMemo } from 'react';

import type { ResourceResponseDto } from '../../api/model';
import { Route } from '../../routes/_protected';

interface ResourceControlProps {
  readonly code: string
  readonly action?: string
  readonly fallback?: ReactElement | null
  readonly children: ReactElement<{ 'data-resource-code'?: string }>
}

function flattenResources(nodes: ResourceResponseDto[]): ResourceResponseDto[] {
  const result: ResourceResponseDto[] = [];
  const traverse = (items: ResourceResponseDto[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) {
        traverse(item.children);
      }
    }
  };

  traverse(nodes);
  return result;
}

export function ResourceControl({ code: resourceCode, action = 'READ', fallback = null, children }: ResourceControlProps) {
  const { resources } = Route.useRouteContext();
  const allowed = useMemo(() => {
    const flattenedResources = flattenResources(resources ?? []);
    const resource = flattenedResources.find((item) => item.code === resourceCode);

    if (!resource) {
      return false;
    }

    return resource.actions.includes(action);
  }, [action, resourceCode, resources]);

  if (!allowed) {
    return fallback;
  }

  return cloneElement(children, {
    'data-resource-code': resourceCode,
  });
}
