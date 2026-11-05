import {
  Backpack,
  Beaker,
  BookOpen,
  CalendarCheck,
  Clover,
  Compass,
  Eye,
  Flame,
  FlaskConical,
  Footprints,
  Gem,
  HeartHandshake,
  MessageCircle,
  Sprout,
  Users,
  type LucideIcon
} from 'lucide-react';

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  'first-steps': Footprints,
  trailblazer: Compass,
  'lucky-hands': Clover,
  gatherer: Sprout,
  hoarder: Backpack,
  'keen-eye': Eye,
  'rare-find': Gem,
  'first-brew': Beaker,
  brewmaster: FlaskConical,
  scholar: BookOpen,
  'new-friend': HeartHandshake,
  party: Users,
  regular: CalendarCheck,
  devoted: Flame
};

export const QUEST_ICONS: Record<string, LucideIcon> = {
  forage: Compass,
  collect: Sprout,
  brew: FlaskConical,
  social: MessageCircle
};
