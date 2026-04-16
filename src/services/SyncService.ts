import { Platform, NativeModules, AppState, AppStateStatus } from 'react-native';
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
import { Q } from '@nozbe/watermelondb';

const { HardwareSignalModule } = NativeModules;

export type SyncStatus = 'idle' | 'syncing' | 'failed' | 'success';

export class SyncService {
  static lastError: string | null = null;
  static isSyncing = false;
  static status: SyncStatus = 'idle';
  private static listeners: ((status: SyncStatus, error: string | null) => void)[] = [];

  static init() {
    // Sync on app startup
    this.syncAll();

    // Sync whenever the app comes to foreground (Historical Pull strategy)
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[SyncService] App resumed - triggering historical sync...');
        this.syncAll();
      }
    });
  }

  static subscribe(callback: (status: SyncStatus, error: string | null) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static emitChange() {
    this.listeners.forEach(l => l(this.status, this.lastError));
  }

  static async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.lastError = null;
    this.status = 'syncing';
    this.emitChange();

    console.log('[SyncService] Starting full historical data sync...');
    
    try {
      const status = await PermissionService.checkStatus();
      
      const syncTasks = [
        this.syncDeviceStats(),
        this.syncDeviceHealth(),
        this.syncLocation(),
      ];

      // Pull historical data from system logs
      if (HardwareSignalModule) {
        syncTasks.push(this.syncHistoricalHardwareSignals(status.usageStats, status.notificationAccess));
      }

      if (status.healthSteps) {
        syncTasks.push(this.syncSteps());
      }

      await Promise.all(syncTasks);
      this.status = 'success';
    } catch (error: any) {
      this.status = 'failed';
      this.lastError = error.message || 'Unknown sync error';
      console.error('[SyncService] Global sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.emitChange();
    }
  }

  static async syncHistoricalHardwareSignals(hasUsage: boolean, hasNotify: boolean) {
    if (Platform.OS !== 'android' || !HardwareSignalModule) return;

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      
      // 1. App Usage & Screen Time (Historical Pull)
      let usage = [];
      let totalScreenTimeMins = 0;
      if (hasUsage) {
          usage = await HardwareSignalModule.getAppUsageStats() || [];
          const totalScreenTimeMs = usage.reduce((sum: number, app: any) => sum + (app.totalTime || 0), 0);
          totalScreenTimeMins = Math.round(totalScreenTimeMs / 60000);
      }

      // 2. Unlocks (Historical Count from UsageEvents)
      const unlocks = await HardwareSignalModule.getHistoricalUnlockCount();

      // 3. Notifications (Accumulated count from listener)
      let notifications = 0;
      if (hasNotify) {
          notifications = await HardwareSignalModule.getNotificationCount();
      }

      // Save to WatermelonDB
      await database.write(async () => {
        if (hasUsage) {
            await database.get('health_logs').create((log: any) => {
              log.type = 'screen_time';
              log.value = totalScreenTimeMins;
              log.unit = 'mins';
              log.timestamp = Date.now();
            });

            // Also log top 5 apps specifically so it shows on the UI
            if (usage && usage.length > 0) {
              const topApps = usage.slice(0, 5);
              for (const app of topApps) {
                await database.get('health_logs').create((log: any) => {
                  log.type = `app: ${(app.packageName || 'unknown').split('.').pop()}`;
                  log.value = Math.round((app.totalTime || 0) / 60000); 
                  log.unit = 'mins';
                  log.timestamp = Date.now();
                });
              }
            }
        }

        await database.get('health_logs').create((log: any) => {
          log.type = 'unlocks';
          log.value = unlocks;
          log.unit = 'count';
          log.timestamp = Date.now();
        });

        if (hasNotify) {
            await database.get('health_logs').create((log: any) => {
              log.type = 'notifications';
              log.value = notifications;
              log.unit = 'count';
              log.timestamp = Date.now();
            });
        }

        // Aggregate into the daily screen_logs table
        const existingLogs = await database.get('screen_logs').query(
          Q.where('date', dateStr)
        ).fetch();

        if (existingLogs.length > 0) {
          await (existingLogs[0] as any).update((rec: any) => {
            if (hasUsage) {
                rec.totalScreenTimeMins = totalScreenTimeMins;
                rec.appUsage = JSON.stringify(usage.slice(0, 5));
            }
            rec.unlocks = unlocks;
          });
        } else {
          await database.get('screen_logs').create((rec: any) => {
            rec.date = dateStr;
            rec.totalScreenTimeMins = totalScreenTimeMins;
            rec.unlocks = unlocks;
            rec.appUsage = JSON.stringify(usage.slice(0, 5));
          });
        }
      });
    } catch (e) {
      console.warn('[SyncService] Hardware signals sync failed:', e);
    }
  }

  static async syncSteps() {
    try {
      const healthConnectAvailable =
        Platform.OS === 'android' &&
        (await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE;

      if (!healthConnectAvailable || !(await initialize())) return;

      const now = new Date();
      const pastHour = new Date(now.getTime() - 60 * 60 * 1000);
      
      const { records } = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: pastHour.toISOString(),
          endTime: now.toISOString(),
        },
      });

      const totalSteps = records.reduce((sum, r: any) => {
        const val = r.count !== undefined ? r.count : (r.value !== undefined ? r.value : 0);
        return sum + val;
      }, 0);
      
      await database.write(async () => {
        await database.get('health_logs').create((log: any) => {
          log.type = 'steps';
          log.value = totalSteps;
          log.unit = 'count';
          log.timestamp = now.getTime();
        });
      });
    } catch (e: any) {
      console.error('[SyncService] Steps sync error:', e);
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
    } catch (e: any) {
      console.warn('[SyncService] Device stats sync failed:', e);
    }
  }

  static async syncDeviceHealth() {
    try {
      let temp = 0;
      if (HardwareSignalModule) {
          temp = await HardwareSignalModule.getNativeTemperature();
      } else {
          temp = await DeviceInfo.getBatteryTemperature();
      }
      
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
          log.value = Math.round(uptime / 1000);
          log.unit = 'seconds';
          log.timestamp = Date.now();
        });
      });
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
            resolve();
          } catch (e) {
            resolve();
          }
        },
        (error) => resolve(),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }
}
