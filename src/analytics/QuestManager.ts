import { database } from '../data/database';
import { Q } from '@nozbe/watermelondb';

export type QuestType = 'Hydration' | 'Digital Control' | 'Activity' | 'Sleep Prep' | 'Mood Check-in' | 'Social';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  xpReward: number;
  inputType?: 'emotion' | 'water' | 'boolean' | 'timer';
}

const QUESTS: Quest[] = [
  { id: 'h1', type: 'Hydration', title: 'Drink Water', description: 'Log the amount of water you just drank.', xpReward: 50, inputType: 'water' },
  { id: 'a1', type: 'Activity', title: 'Power Walk', description: 'Walk 500 steps in the next 15 minutes.', xpReward: 100, inputType: 'boolean' },
  { id: 'd1', type: 'Digital Control', title: 'Screen Break', description: 'Put your phone away for 20 minutes', xpReward: 80, inputType: 'boolean' },
  { id: 's1', type: 'Social', title: 'Reach Out', description: 'Send a message or call a friend', xpReward: 120, inputType: 'boolean' },
  { id: 'm1', type: 'Mood Check-in', title: 'How are you?', description: 'Log your current emotion so we can track balance.', xpReward: 40, inputType: 'emotion' },
];

export const getQuestForHour = (hour: number) => {
  const index = hour % QUESTS.length;
  return QUESTS[index];
};

export const isSleepTime = (hour: number) => {
  return hour >= 21 || hour < 7;
};

export const completeQuest = async (quest: Quest, value?: string | number) => {
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

      // Log specific data if available
      if (quest.inputType === 'water' && value) {
         await database.get('hydration_logs').create((log: any) => {
             log.date = dateStr;
             log.timestamp = Date.now();
             log.amountMl = Number(value);
         });
      }
      if (quest.inputType === 'emotion' && value) {
         await database.get('mood_logs').create((log: any) => {
             log.date = dateStr;
             log.timestamp = Date.now();
             log.moodScore = value === 'happy' ? 100 : value === 'neutral' ? 50 : 20; // Simplified scale
             log.notes = String(value);
         });
      }

      // 2. Add to XP Ledger
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
  
  const logs = await database.get('quest_logs').query(
    Q.where('quest_id', questId),
    Q.where('date', dateStr),
    Q.sortBy('created_at', Q.desc),
    Q.take(1)
  ).fetch();

  if (logs.length === 0) return false;
  
  const lastLog = logs[0] as any;
  const lastLogDate = new Date(lastLog.createdAt);
  return lastLogDate.getHours() === hour;
};
