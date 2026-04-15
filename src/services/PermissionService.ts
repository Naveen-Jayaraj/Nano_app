import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { requestPermission as requestHealthPermission, isAvailable } from 'react-native-health-connect';

export class PermissionService {
  static async requestAll() {
    console.log('[PermissionService] Requesting all permissions...');
    
    // 1. Connectivity & Basic
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      ]);
    }

    // 2. Health Connect
    try {
      const healthAvailable = await isAvailable();
      if (healthAvailable) {
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
      return {
        activity: activity === RESULTS.GRANTED,
        location: location === RESULTS.GRANTED,
      };
    }
    return { activity: true, location: true };
  }
}
