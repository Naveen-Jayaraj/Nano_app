import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class QuestLog extends Model {
  static table = 'quest_logs';
  @field('date') date!: string;
  @field('quest_id') questId!: string;
  @field('quest_type') questType!: string;
  @field('completed') completed!: boolean;
  @field('xp_earned') xpEarned!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class DailyScore extends Model {
  static table = 'daily_scores';
  @field('date') date!: string;
  @field('sleep_score') sleepScore!: number;
  @field('hydration_score') hydrationScore!: number;
  @field('activity_score') activityScore!: number;
  @field('screen_score') screenScore!: number;
  @field('social_score') socialScore!: number;
  @field('mood_score') moodScore!: number;
  @field('stress_score') stressScore!: number;
  @field('overall_wellness_score') overallWellnessScore!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class XpLedger extends Model {
  static table = 'xp_ledger';
  @field('date') date!: string;
  @field('source') source!: string;
  @field('xp_amount') xpAmount!: number;
  @field('running_total') runningTotal!: number;
  @readonly @date('created_at') createdAt!: number;
}
