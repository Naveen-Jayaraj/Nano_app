import { Platform } from 'react-native';
import {
  getSdkStatus,
  initialize,
  readRecords,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import { database } from '../data/database';
import { PermissionService } from './PermissionService';

export type SyncStatus = 'idle' | 'syncing' | 'failed' | 'success';

export class SyncService {
  static lastError: string | null = null;
  static isSyncing = false;
  static status: SyncStatus = 'idle';
  private static listeners: ((status: SyncStatus, error: string | null) => void)[] = [];

  static subscribe(callback: (status: SyncStatus, error: string | null) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static emitChange() {
    this.listeners.forEach(l => l(this.status, this.lastError));
  }

  /**
   * Main sync entry point - called periodically or on app open
   */
  static async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.lastError = null;
    this.status = 'syncing';
    this.emitChange();

    console.log('[SyncService] Starting full data sync...');
    
    try {
      // Check permissions first
      const status = await PermissionService.checkStatus();
      
      const syncTasks = [
        this.syncDeviceStats(),
        this.syncDeviceHealth(),
        this.syncLocation(),
      ];

      if (status.healthSteps) {
        syncTasks.push(this.syncSteps());
      } else {
        console.log('[SyncService] Missing Health Connect Steps permission, skipping steps sync.');
      }

      await Promise.all(syncTasks);
      this.status = 'success';
      console.log('[SyncService] Sync complete.');
    } catch (error: any) {
      this.status = 'failed';
      this.lastError = error.message || 'Unknown sync error';
      console.error('[SyncService] Global sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.emitChange();
    }
  }

  static async syncSteps() {
    try {
      const healthConnectAvailable =
        Platform.OS === 'android' &&
        (await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE;

      if (!healthConnectAvailable || !(await initialize())) {
        console.log('[SyncService] Health Connect unavailable, skipping steps sync.');
        return;
      }

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const { records } = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: yesterday.toISOString(),
          endTime: now.toISOString(),
        },
      });

      // FIX: Health Connect records use 'value' (or similar top-level property) depending on version
      // The user specified it's NOT .count but at the top level.
      const totalSteps = records.reduce((sum, r: any) => {
        const val = r.count !== undefined ? r.count : (r.value !== undefined ? r.value : 0);
        return sum + val;
      }, 0);
      
      console.log(`[SyncService] Found ${records.length} step records. Total steps: ${totalSteps}`);

      // Save to WatermelonDB
      await database.write(async () => {
        await database.get('health_logs').create((log: any) => {
          log.type = 'steps';
          log.value = totalSteps;
          log.unit = 'count';
          log.timestamp = now.getTime();
        });
      });
    } catch (e: any) {
      this.lastError = `Steps: ${e.message}`;
      console.error('[SyncService] Steps sync error:', e);
      throw e; // Re-throw to be caught by syncAll
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

        await database.get('health_logs').create((log: any) => {
          log.type = 'charging';
          log.value = isCharging ? 1 : 0;
          log.unit = 'boolean';
          log.timestamp = Date.now();
        });
      });

      console.log(
        `[SyncService] Battery logged: ${Math.round(batteryLevel * 100)}%, charging=${isCharging}`,
      );
    } catch (e: any) {
      this.lastError = `Device sync: ${e.message}`;
      console.warn('[SyncService] Device stats sync failed:', e);
    }
  }

  static async syncDeviceHealth() {
    try {
      const temp = await DeviceInfo.getBatteryTemperature();
      const uptime = await DeviceInfo.getUpTime();

      await database.write(async () => {
        await database.get('health_logs').create((log: any) => {
          log.type = 'temperature';
          log.value = temp;
          log.unit = 'celsius';
          log.timestamp = Date.now();
        });

        await database.get('health_logs').create((log: any) => {
          log.type = 'uptime';
          log.value = Math.round(uptime / 1000); // seconds
          log.unit = 'seconds';
          log.timestamp = Date.now();
        });
      });

      console.log(`[SyncService] Health metrics logged: temp=${temp}°C, uptime=${Math.round(uptime/1000)}s`);
    } catch (e: any) {
      console.warn('[SyncService] Device health sync failed:', e);
    }
  }

  static async syncLocation() {
    return new Promise<void>((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await database.write(async () => {
              await database.get('health_logs').create((log: any) => {
                log.type = 'location_lat';
                log.value = latitude;
                log.unit = 'degrees';
                log.timestamp = Date.now();
              });
              await database.get('health_logs').create((log: any) => {
                log.type = 'location_lon';
                log.value = longitude;
                log.unit = 'degrees';
                log.timestamp = Date.now();
              });
            });
            console.log(`[SyncService] Location logged: ${latitude}, ${longitude}`);
            resolve();
          } catch (e) {
            console.warn('[SyncService] Location storage failed:', e);
            resolve();
          }
        },
        (error) => {
          console.warn('[SyncService] Location fetch failed:', error.message);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }
}
