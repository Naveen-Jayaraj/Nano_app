import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class SleepLog extends Model {
  static table = 'sleep_logs';
  @field('date') date!: string;
  @field('sleep_start') sleepStart!: number;
  @field('wake_time') wakeTime!: number;
  @field('duration_minutes') durationMinutes!: number;
  @field('quality_score') qualityScore!: number;
  @field('disturbance_score') disturbanceScore!: number;
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: number;
}

export class HydrationLog extends Model {
  static table = 'hydration_logs';
  @field('date') date!: string;
  @field('timestamp') timestamp!: number;
  @field('amount_ml') amountMl!: number;
  @field('cumulative_ml') cumulativeMl!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class MoodLog extends Model {
  static table = 'mood_logs';
  @field('date') date!: string;
  @field('timestamp') timestamp!: number;
  @field('mood_score') moodScore!: number;
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: number;
}

export class HealthLog extends Model {
  static table = 'health_logs';
  @field('type') type!: string;
  @field('value') value!: number;
  @field('unit') unit!: string;
  @field('timestamp') timestamp!: number;
  @readonly @date('created_at') createdAt!: number;
}
