# 🏥 Nano Wellness Tracker (Developer Edition)

Welcome to **Nano Wellness**, a high-fidelity, high-performance wellness application designed for the modern Android ecosystem. This app transforms raw sensor data into a vibrant, insightful health journey with a premium "Vibrant Night" aesthetic.

## ✨ Core Pillars

### 1. Vibrant UI & UX
- **Neon Glassmorphism**: A sleek, modern design using indigo and pink neon tokens.
- **Dynamic Progression**: Animated XP bars and glowing goal-selection graphics.
- **Premium Analytics**: Stable, SVG-rendered charts using `react-native-gifted-charts`.

### 2. Privacy-First "Data Mastery"
- **Offline-First**: All data is stored locally using **WatermelonDB**. No cloud, no tracking.
- **Real-Time Integration**: Deep integration with **Android Health Connect** and hardware sensors.
- **Universal Sync**: Automated background pulsing every hour (approximate) to keep your stats fresh.

### 3. Developer Transparency
- **Live Raw Data Tab**: A dedicated "Data" tab providing a live scrolling feed of sensor logs.
- **Failsafe Logic**: Built-in defensive coding ensures the app handles missing sensor data gracefully without crashing.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native** | Cross-platform framework (Android Optimized) |
| **WatermelonDB** | High-performance, reactive SQLite database |
| **Health Connect** | Google's unified health data API |
| **Gifted Charts** | SVG-based, stable data visualization |
| **Notifee** | Advanced, rich background notifications |
| **Background Fetch** | Automated hourly sync heartbeat |

---

## 🚀 Getting Started (Developer Edition)

### 1. Permissions
The app targets **API 34 (Android 14)**. To ensure full functionality:
- Grant **Health Connect** access when prompted.
- Grant **Physical Activity** and **Location** for sensor accuracy.
- **Important**: Disable "Battery Optimization" in Android settings to ensure the **Hourly Pulse** sync works while the app is closed.

### 2. Manual Sync
In the **Quest Tab**, use the "Refresh" button (Top-Right) to force an immediate hardware check across all sensors.

### 3. Auditing Data
Navigate to the **Data Tab** to view the raw JSON stream of logs. Each entry lists:
- `STEPS`: Aggregated from Health Connect.
- `BATTERY`: Percentage and charging state.
- `SYNC`: System heartbeats (Foreground vs. Headless).

---

## 🏗️ Architecture
For a deep dive into the technical implementation (Database schema, Sync workers, and Build fixes), see the **[Architecture Docs](src/docs/ARCHITECTURE.md)**.

## 📄 License
Private Repository - Developed by Antigravity for Nano Wellness.
