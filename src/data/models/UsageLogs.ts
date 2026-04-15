import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class StressLog extends Model {
  static table = 'stress_logs';
  @field('date') date!: string;
  @field('timestamp') timestamp!: number;
  @field('stress_score') stressScore!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class ActivityLog extends Model {
  static table = 'activity_logs';
  @field('date') date!: string;
  @field('steps') steps!: number;
  @field('active_minutes') activeMinutes!: number;
  @field('sedentary_minutes') sedentaryMinutes!: number;
  @field('calories_burned') caloriesBurned!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class ScreenLog extends Model {
  static table = 'screen_logs';
  @field('date') date!: string;
  @field('total_screen_time_mins') totalScreenTimeMins!: number;
  @field('unlocks') unlocks!: number;
  @field('app_usage') appUsage!: string; // JSON
  @field('night_usage_mins') nightUsageMins!: number;
  @readonly @date('created_at') createdAt!: number;
}

export class LocationLog extends Model {
  static table = 'location_logs';
  @field('date') date!: string;
  @field('primary_location_hash') primaryLocationHash!: string;
  @field('locations_visited_count') locationsVisitedCount!: number;
  @field('time_outside_mins') timeOutsideMins!: number;
  @readonly @date('created_at') createdAt!: number;
}
