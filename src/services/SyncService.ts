import { readRecords } from 'react-native-health-connect';
import DeviceInfo from 'react-native-device-info';
import { database } from '../data/database';
import { PermissionService } from './PermissionService';

export class SyncService {
  /**
   * Main sync entry point - called periodically or on app open
   */
  static async syncAll() {
    console.log('[SyncService] Starting full data sync...');
    
    // Check permissions first
    const status = await PermissionService.checkStatus();
    if (!status.activity) {
      console.log('[SyncService] Missing activity permissions, skipping steps sync.');
    }

    await Promise.all([
      this.syncSteps(),
      this.syncDeviceStats(),
    ]);

    console.log('[SyncService] Sync complete.');
  }

  static async syncSteps() {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const records = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: yesterday.toISOString(),
          endTime: now.toISOString(),
        },
      });

      const totalSteps = records.reduce((sum, r) => sum + (r.count || 0), 0);
      console.log(`[SyncService] Synced ${totalSteps} steps from Health Connect.`);

      // Save to WatermelonDB
      await database.write(async () => {
        await database.get('health_logs').create((log: any) => {
          log.type = 'steps';
          log.value = totalSteps;
          log.unit = 'count';
          log.timestamp = now.getTime();
        });
      });
    } catch (e) {
      console.warn('[SyncService] Steps sync failed:', e);
    }
  }

  static async syncDeviceStats() {
    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();

      await database.write(async () => {
        await database.get('health_logs').create((log: any) => {
          log.type = 'battery';
          log.value = Math.round(batteryLevel * 100);
          log.unit = 'percent';
          log.timestamp = Date.now();
        });
      });

      console.log(`[SyncService] Battery logged: ${Math.round(batteryLevel * 100)}%`);
    } catch (e) {
      console.warn('[SyncService] Device stats sync failed:', e);
    }
  }
}
