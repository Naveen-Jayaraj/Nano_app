import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'health_logs',
          columns: [
            { name: 'type', type: 'string', isIndexed: true },
            { name: 'value', type: 'number' },
            { name: 'unit', type: 'string' },
            { name: 'timestamp', type: 'number', isIndexed: true },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'user_challenges',
          columns: [
            { name: 'challenge_id', type: 'string', isIndexed: true },
            { name: 'status', type: 'string' },
            { name: 'start_date', type: 'number' },
            { name: 'streak', type: 'number' },
            { name: 'last_check_in', type: 'number' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
