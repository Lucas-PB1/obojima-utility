import type { TabType } from '@/hooks/useApp';
import {
  ClipboardList,
  FlaskConical,
  History,
  Leaf,
  ScrollText,
  Users,
  Backpack,
  type LucideIcon
} from 'lucide-react';

export interface AppShellTab {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export const APP_SHELL_TAB_ICONS: Record<TabType, LucideIcon> = {
  forage: Leaf,
  collection: Backpack,
  potions: FlaskConical,
  'created-potions': ClipboardList,
  recipes: ScrollText,
  social: Users,
  log: History
};
