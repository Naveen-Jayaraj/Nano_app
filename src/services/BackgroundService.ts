import { SyncService } from './SyncService';

export const initBackgroundFetch = async () => {
  const status = await BackgroundFetch.configure({
    minimumFetchInterval: 60, // 60 minutes (Closest to hourly as Android allows)
    stopOnTerminate: false,
    enableHeadless: true,
    startOnBoot: true,
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
  }, async (taskId) => {
    console.log('[BackgroundFetch] Hourly Task Started:', taskId);
    
    await performBackgroundProcessing();

    BackgroundFetch.finish(taskId);
  }, (error) => {
    console.error('[BackgroundFetch] failed to configure:', error);
  });
};

const performBackgroundProcessing = async () => {
  // 1. Trigger the actual sensor sync
  await SyncService.syncAll();

  // 2. Log the background event to the DB for the Developer Tab
  await database.write(async () => {
    await database.get('health_logs').create((log: any) => {
      log.type = 'sync';
      log.value = 1;
      log.unit = 'system';
      log.timestamp = Date.now();
    });
  });

  // 3. Send the Hourly Notification
  const hour = new Date().getHours();
  const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  
  await NotificationService.displayLocalNotification(
    `Health Check: ${timeStr} 🕒`,
    'Automated wellness sync complete. All sensors are active and private.'
  );
};
