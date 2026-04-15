import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import UserProfile from './models/UserProfile';
import { SleepLog, HydrationLog, MoodLog, HealthLog } from './models/Logs';
import { StressLog, ActivityLog, ScreenLog, LocationLog } from './models/UsageLogs';
import { QuestLog, DailyScore, XpLedger } from './models/Scores';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'NanoWellnessDB',
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database failed to set up', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    HealthLog,
    UserProfile,
    SleepLog,
    HydrationLog,
    MoodLog,
    StressLog,
    ActivityLog,
    ScreenLog,
    LocationLog,
    QuestLog,
    DailyScore,
    XpLedger,
  ],
});
