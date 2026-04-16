import { Platform, PermissionsAndroid, NativeModules, Linking } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  requestPermission as requestHealthPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

const { HardwareSignalModule } = NativeModules;

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

      // Special Native Permissions
      let usageStats = false;
      let notificationAccess = false;

      try {
        if ((await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE) {
          await initialize();
          const grantedPermissions = await getGrantedPermissions();
          healthSteps = grantedPermissions.includes('android.permission.health.READ_STEPS') || 
                        grantedPermissions.includes('read:Steps');
        }
        
        if (HardwareSignalModule) {
            usageStats = await HardwareSignalModule.checkUsageStatsPermission();
            notificationAccess = await HardwareSignalModule.checkNotificationListenerPermission();
        }
      } catch (e) {
        console.warn('[PermissionService] Status check failed:', e);
      }

      return {
        activity: activity === RESULTS.GRANTED,
        location: location === RESULTS.GRANTED,
        healthSteps,
        usageStats,
        notificationAccess
      };
    }
    return { activity: true, location: true, healthSteps: false, usageStats: true, notificationAccess: true };
  }

  static openUsageAccessSettings() {
    if (Platform.OS === 'android' && HardwareSignalModule) {
      HardwareSignalModule.openUsageSettings();
    } else {
      Linking.openSettings(); // Fallback
    }
  }

  static openNotificationListenerSettings() {
    if (Platform.OS === 'android' && HardwareSignalModule) {
      HardwareSignalModule.openNotificationSettings();
    } else {
      Linking.openSettings(); // Fallback
    }
  }
}
