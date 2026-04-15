export const calculateLevel = (totalXp: number) => {
  return Math.floor(totalXp / 500) + 1;
};

export const getXpForCurrentLevel = (totalXp: number) => {
  return totalXp % 500;
};

export const getProgressToNextLevel = (totalXp: number) => {
  return (totalXp % 500) / 500;
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Early Bird', description: 'Log sleep before 11 PM for 3 days', icon: 'weather-sunset-up', unlocked: false },
  { id: 'b2', name: 'Hydro Hero', description: 'Meet water target for 7 days streak', icon: 'water', unlocked: true },
  { id: 'b3', name: 'Zen Master', description: 'Keep stress level below 4 for a week', icon: 'meditation', unlocked: false },
  { id: 'b4', name: 'Social Butterfly', description: 'Go out for 3 consecutive days', icon: 'account-group', unlocked: false },
];
