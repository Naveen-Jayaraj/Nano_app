import { Platform, PermissionsAndroid } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  requestPermission as requestHealthPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

export class PermissionService {
  static async requestAll() {
    console.log('[PermissionService] Requesting all permissions...');
    
    // 1. Connectivity & Basic
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      ]);
    }

    // 2. Health Connect
    try {
      const healthAvailable =
        (await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE;
      if (healthAvailable) {
        await initialize();
        await requestHealthPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'ExerciseSession' },
        ]);
      }
    } catch (e) {
      console.warn('[PermissionService] Health Connect error:', e);
    }
  }

  static async checkStatus() {
    if (Platform.OS === 'android') {
      const activity = await check(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION);
      const location = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      let healthSteps = false;

      try {
        if ((await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE) {
          await initialize();
          const grantedPermissions = await getGrantedPermissions();
          // Health Connect v3+ returns an array of strings like 'android.permission.health.READ_STEPS'
          healthSteps = grantedPermissions.includes('android.permission.health.READ_STEPS') || 
                        grantedPermissions.includes('read:Steps'); // Fallback for some wrappers
        }
      } catch (e) {
        console.warn('[PermissionService] Health Connect status check failed:', e);
      }

      return {
        activity: activity === RESULTS.GRANTED,
        location: location === RESULTS.GRANTED,
        healthSteps,
      };
    }
    return { activity: true, location: true, healthSteps: false };
  }

  static async openUsageAccessSettings() {
    if (Platform.OS === 'android') {
      const { Linking } = require('react-native');
      Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
    }
  }

  static async openNotificationListenerSettings() {
    if (Platform.OS === 'android') {
      const { Linking } = require('react-native');
      Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
    }
  }
}
