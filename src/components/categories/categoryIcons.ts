import {
  BookOpen,
  Briefcase,
  Flag,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Music,
  ShoppingCart,
  Star,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS = {
  user: User,
  briefcase: Briefcase,
  "book-open": BookOpen,
  home: Home,
  heart: Heart,
  star: Star,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  flag: Flag,
  gift: Gift,
  "gamepad-2": Gamepad2,
  music: Music,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS) as CategoryIconName[];

export function isCategoryIconName(v: string | undefined): v is CategoryIconName {
  return v !== undefined && v in CATEGORY_ICONS;
}
