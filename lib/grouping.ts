import type { Classification, ClassificationGroup, ExplorerGroup, ExplorerItem } from './types';

function findGroup(groups: ClassificationGroup[], id: string): ClassificationGroup | undefined {
  for (const group of groups) {
    if (group.id === id) return group;
    const found = group.groups && findGroup(group.groups, id);
    if (found) return found;
  }
  return undefined;
}

function leafIds(group: ClassificationGroup): string[] {
  return group.groups?.length ? group.groups.flatMap(leafIds) : [group.id];
}

export function groupItems(items: ExplorerItem[], classification: Classification, scopeId?: string): ExplorerGroup[] {
  const scope = scopeId ? findGroup(classification.groups, scopeId) : undefined;
  const groups = scope?.groups?.length ? scope.groups : scope ? [scope] : classification.groups;
  const result: ExplorerGroup[] = [];
  groups.forEach((group) => {
    const ids = leafIds(group);
    const matching = items.filter((item) => ids.some((id) => item.groupIds.includes(id) || item.groups[classification.id] === id));
    result.push({ index: result.length, id: group.id, items: matching, name: group.name, depth: scope ? 1 : 0 });
  });
  return result;
}

export const groupCittas = groupItems;
