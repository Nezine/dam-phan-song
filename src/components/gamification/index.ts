// Barrel export cho cụm gamification — import 1 dòng từ App hoặc màn hình khác:
// import { XpBar, StreakCounter, BadgeGrid, LevelRing, DailyGoalCard } from './src/components/gamification';
export { XpBar } from './XpBar';
export { StreakCounter } from './StreakCounter';
export { BadgeGrid } from './BadgeGrid';
export { LevelRing } from './LevelRing';
export { DailyGoalCard } from './DailyGoalCard';
export {
  type Badge,
  type GamificationStats,
  XP_REWARD,
  allBadges,
  levelFromXp,
  levelTitle,
  unlockedBadgeCount,
  xpForLevel,
  xpNeededForLevel,
} from '../../lib/gamification';
