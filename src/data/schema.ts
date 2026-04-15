import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'health_logs',
      columns: [
        { name: 'type', type: 'string', isIndexed: true },
        { name: 'value', type: 'number' },
        { name: 'unit', type: 'string' },
        { name: 'timestamp', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'user_profile',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'gender', type: 'string' },
        { name: 'bmi', type: 'number' },
        { name: 'goals', type: 'string' }, // JSON stringified array
        { name: 'baselines', type: 'string' }, // JSON stringified object
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sleep_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'sleep_start', type: 'number' },
        { name: 'wake_time', type: 'number' },
        { name: 'duration_minutes', type: 'number' },
        { name: 'quality_score', type: 'number' },
        { name: 'disturbance_score', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'hydration_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'amount_ml', type: 'number' },
        { name: 'cumulative_ml', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'mood_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'mood_score', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'stress_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'stress_score', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'activity_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'steps', type: 'number' },
        { name: 'active_minutes', type: 'number' },
        { name: 'sedentary_minutes', type: 'number' },
        { name: 'calories_burned', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'screen_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'total_screen_time_mins', type: 'number' },
        { name: 'unlocks', type: 'number' },
        { name: 'app_usage', type: 'string' }, // JSON string
        { name: 'night_usage_mins', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'location_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'primary_location_hash', type: 'string' },
        { name: 'locations_visited_count', type: 'number' },
        { name: 'time_outside_mins', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'quest_logs',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'quest_id', type: 'string' },
        { name: 'quest_type', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'xp_earned', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'daily_scores',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'sleep_score', type: 'number' },
        { name: 'hydration_score', type: 'number' },
        { name: 'activity_score', type: 'number' },
        { name: 'screen_score', type: 'number' },
        { name: 'social_score', type: 'number' },
        { name: 'mood_score', type: 'number' },
        { name: 'stress_score', type: 'number' },
        { name: 'overall_wellness_score', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'xp_ledger',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'source', type: 'string' },
        { name: 'xp_amount', type: 'number' },
        { name: 'running_total', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
