import { database } from '../data/database';
import { Q } from '@nozbe/watermelondb';

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
  const index = hour % QUESTS.length;
  return QUESTS[index];
};

export const isSleepTime = (hour: number) => {
  // Sleep time: 9:00 PM (21) to 7:00 AM (7)
  return hour >= 21 || hour < 7;
};

export const completeQuest = async (quest: Quest) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  try {
    await database.write(async () => {
      // 1. Log the quest completion
      await database.get('quest_logs').create((log: any) => {
        log.date = dateStr;
        log.questId = quest.id;
        log.questType = quest.type;
        log.completed = true;
        log.xpEarned = quest.xpReward;
      });

      // 2. Add to XP Ledger
      // Get current running total first
      const lastXpEntry = await database.get('xp_ledger').query(
        Q.sortBy('created_at', Q.desc),
        Q.take(1)
      ).fetch();
      
      const currentTotal = lastXpEntry.length > 0 ? (lastXpEntry[0] as any).runningTotal : 0;

      await database.get('xp_ledger').create((xpLog: any) => {
        xpLog.date = dateStr;
        xpLog.source = `Quest: ${quest.title}`;
        xpLog.xpAmount = quest.xpReward;
        xpLog.runningTotal = currentTotal + quest.xpReward;
      });
    });
    return true;
  } catch (error) {
    console.error('Failed to complete quest', error);
    return false;
  }
};

export const checkQuestCompleted = async (questId: string) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hour = now.getHours();
  
  // Check if quest was completed within the current hour range
  // (Assuming quests are hourly)
  const logs = await database.get('quest_logs').query(
    Q.where('quest_id', questId),
    Q.where('date', dateStr),
    Q.sortBy('created_at', Q.desc),
    Q.take(1)
  ).fetch();

  if (logs.length === 0) return false;
  
  // Check if it was completed within the last hour
  const lastLog = logs[0] as any;
  const lastLogDate = new Date(lastLog.createdAt);
  return lastLogDate.getHours() === hour;
};
