import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class UserProfile extends Model {
  static table = 'user_profile';

  @field('name') name!: string;
  @field('age') age!: number;
  @field('height') height!: number;
  @field('weight') weight!: number;
  @field('gender') gender!: string;
  @field('bmi') bmi!: number;
  @field('goals') goals!: string; // JSON
  @field('baselines') baselines!: string; // JSON

  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;
}
