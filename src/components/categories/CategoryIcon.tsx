import { Tag } from "lucide-react";
import { CATEGORY_ICONS, isCategoryIconName } from "./categoryIcons";

export function CategoryIcon({
  name,
  size = 16,
}: {
  name: string | undefined;
  size?: number;
}) {
  if (!isCategoryIconName(name)) return <Tag size={size} aria-hidden />;
  const Icon = CATEGORY_ICONS[name];
  return <Icon size={size} aria-hidden />;
}
