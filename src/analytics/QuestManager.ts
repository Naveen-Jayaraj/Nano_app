export type QuestType = 'Hydration' | 'Digital Control' | 'Activity' | 'Sleep Prep' | 'Mood Check-in' | 'Social';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  xpReward: number;
}

const QUESTS: Quest[] = [
  { id: 'h1', type: 'Hydration', title: 'Drink Water', description: 'Drink a glass of water (250ml)', xpReward: 50 },
  { id: 'a1', type: 'Activity', title: 'Power Walk', description: 'Walk 500 steps in the next 15 minutes', xpReward: 100 },
  { id: 'd1', type: 'Digital Control', title: 'Screen Break', description: 'Put your phone away for 20 minutes', xpReward: 80 },
  { id: 's1', type: 'Social', title: 'Reach Out', description: 'Send a message or call a friend', xpReward: 120 },
  { id: 'm1', type: 'Mood Check-in', title: 'How are you?', description: 'Log your current mood and stress level', xpReward: 40 },
];

export const getQuestForHour = (hour: number) => {
  // Simple deterministic selection based on hour
  // In a real app, this would be more adaptive
  const index = hour % QUESTS.length;
  return QUESTS[index];
};

export const isSleepTime = (hour: number) => {
  return hour >= 23 || hour < 7;
};
