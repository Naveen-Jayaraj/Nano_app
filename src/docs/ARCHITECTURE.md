# 🏗️ Nano Wellness: Technical Architecture

This document describes the internal workings of the Nano Wellness tracker, specifically its sensor integration, data persistence, and background processing.

## 💾 Data Persistence: WatermelonDB
Nano Wellness is **Offline-First**. We use **WatermelonDB** for high-performance reactivity.

### Schema: `health_logs`
This is the primary append-only table for sensor data.
- `type`: String (steps, battery, heart_rate, sleep, sync).
- `value`: Float/Int.
- `unit`: String (count, percent, bpm).
- `timestamp`: Int (Epoch ms).

### Reactivity
Screens (like the **Data Tab**) use `withObservables` to create a live stream from the database. The `Data Tab` is optimized using `Q.sortBy` and `Q.take(50)` to ensure constant-time rendering regardless of database size.

## 🔄 Synchronization Engine: SyncService
The `SyncService` is the central hub for sensor data collection.

1.  **Permission Check**: Every sync starts by checking `PermissionService`.
2.  **Aggregation**:
    - **Steps**: Fetches the last 24 hours of data from Health Connect.
    - **Device**: Captures battery and charging state using `react-native-device-info`.
3.  **Failsafe Rendering**: Components like `RawDataTab` use defensive coding (null-checks and fallbacks) to ensure incomplete sensor data never crashes the UI thread.

## 💓 Background Pulse
Background tasks are managed by `react-native-background-fetch`.

- **Interval**: Set to 60 minutes (Periodic).
- **Headless Mode**: Registered in `index.js`, allowing the app to sync data even if force-closed by the user.
- **Notifications**: Triggered via `NotificationService` (Notifee) to provide the user with hourly visual feedback of the "Sensor Heartbeat."

## 📱 Android 14+ Integration
To comply with modern Android security, we implemented several native configurations:

1.  **Visibility**: Added a `<queries>` block in `AndroidManifest.xml` targeting the Health Connect package (`com.google.android.apps.healthdata`).
2.  **Security Alias**: Added an `activity-alias` for `ViewPermissionUsageActivity` to support the required "Privacy Rationale" link.
3.  **Font Assets**: Explicitly linked `react-native-vector-icons` in the Gradle build to ensure release APKs contain all checkmark and wellness icons.

---
*Document Version: 1.0 (Developer Edition)*
