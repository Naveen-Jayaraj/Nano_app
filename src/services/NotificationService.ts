import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';

export class NotificationService {
  static async displayLocalNotification(title: string, body: string) {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Defaults to ic_launcher
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  static async scheduleHydrationReminder(hour: number, minute: number) {
    const date = new Date(Date.now());
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    // If the time has already passed today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: 1, // Repeat daily
    };

    await notifee.createTriggerNotification(
      {
        title: 'Time to Hydrate!',
        body: 'Stay refreshed. Have a glass of water now.',
        android: {
          channelId: 'default',
        },
      },
      trigger,
    );
  }
}
