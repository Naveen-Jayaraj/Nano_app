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
  ],
});
