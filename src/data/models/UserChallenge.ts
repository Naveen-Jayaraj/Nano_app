import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class UserChallenge extends Model {
  static table = 'user_challenges';

  @field('challenge_id') challengeId!: string;
  @field('status') status!: string; // 'active', 'completed', 'failed', 'not_started'
  @field('start_date') startDate!: number;
  @field('streak') streak!: number;
  @field('last_check_in') lastCheckIn!: number;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
