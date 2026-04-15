/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { initBackgroundFetch } from './src/services/BackgroundService';

import BackgroundFetch from 'react-native-background-fetch';
import { SyncService } from './src/services/SyncService';
import { database } from './src/data/database';

AppRegistry.registerComponent(appName, () => App);

// Headless task registration
BackgroundFetch.registerHeadlessTask(async (event) => {
  console.log('[BackgroundFetch Headless] task:', event.taskId);
  await SyncService.syncAll();
  
  await database.write(async () => {
    await database.get('health_logs').create((log: any) => {
      log.type = 'sync';
      log.value = 0; // Headless
      log.unit = 'system';
      log.timestamp = Date.now();
      log.createdAt = new Date();
    });
  });

  BackgroundFetch.finish(event.taskId);
});

// Initialize background tasks
initBackgroundFetch();
