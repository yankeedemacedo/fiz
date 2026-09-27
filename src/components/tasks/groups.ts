export const GROUP_DROP_PREFIX = "group:";
export const UNCATEGORIZED_ID = "__none__";

export function groupDropId(categoryId: string | undefined): string {
  return `${GROUP_DROP_PREFIX}${categoryId ?? UNCATEGORIZED_ID}`;
}

/**
 * Parses a droppable id: `null` = not a group target,
 * `undefined` = uncategorized group, string = category id.
 */
export function parseGroupDropId(id: string): string | undefined | null {
  if (!id.startsWith(GROUP_DROP_PREFIX)) return null;
  const raw = id.slice(GROUP_DROP_PREFIX.length);
  return raw === UNCATEGORIZED_ID ? undefined : raw;
}
