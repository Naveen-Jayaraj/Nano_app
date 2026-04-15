# 🏥 Nano Wellness (Developer Edition)

> **Transforming raw hardware signals into a vibrant, privacy-first wellness journey.**

**Nano Wellness** is a high-fidelity, high-performance health ecosystem built for the modern Android landscape. It leverages deep hardware integration and a "Vibrant Night" aesthetic to provide a premium self-tracking experience without compromising user privacy.

---

## ✨ Core Pillars

### 1. 🌌 Vibrant Night Aesthetic
Experience health tracking like never before. Nano Wellness uses a custom design system featuring **Neon Glassmorphism**, dynamic indigo-to-pink gradients, and fluid micro-animations that make data feel alive.

### 2. 🔐 Privacy-First "Data Mastery"
*   **Offline-First**: Powered by **WatermelonDB**, all data is stored locally in a reactive SQLite database.
*   **Zero-Cloud**: No external servers, no tracking, and no data leaks. Your body data stays on your hardware.
*   **Universal Sync**: An automated background heartbeat (Hourly Pulse) ensures your stats are fresh even when the app is closed.

### 3. 🛠️ Transparency & Precision
The app includes a dedicated **Real-Time Data Console**, allowing developers and power users to audit the raw JSON stream of incoming hardware logs directly from the source.

---

## 📊 Data Input Inventory

Nano Wellness aggregates data from a wide spectrum of sources to build a holistic picture of your wellness.

| Category | Source | Data Points Collected |
| :--- | :--- | :--- |
| **Biometrics** | Health Connect | Steps, Heart Rate (BPM), Sleep Stages, Exercise Sessions |
| **Hardware** | Device Sensors | Battery Level, Charging State, Device Temperature |
| **Environment** | GPS / OS | Real-time Latitude, Longitude, and Altitude context |
| **Behavioral** | Activity API | Physical State Recognition (Walking, Running, Still, In-Vehicle) |
| **System** | Usage Stats | App Screen Time, Notification presence, System Uptime |
| **Heartbeat** | Background Service | Sync Heartbeats, Latency logs, Foreground vs. Headless events |

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | React Native (v0.7x) | Optimized for Android 14+ (API 34) |
| **Database** | WatermelonDB | High-performance, reactive persistence |
| **Health API** | Health Connect v3 | Google's unified, high-security health data bridge |
| **Charts** | React Native Gifted Charts | Stable, SVG-based high-fidelity visualizations |
| **UI Kit** | Custom Glassmorphism | Indigo/Pink neon token system |
| **Background** | Notifee & Background Fetch | Reliable hourly pulses and rich system notifications |

---

## 🚀 Getting Started (Developer Setup)

### 1. Mandatory Permissions
To enable the full spectrum of data collection, the following must be granted:
- **Health Connect**: Full read access for Steps, Heart Rate, and Sleep.
- **Physical Activity**: For real-time state recognition.
- **Location**: For environmental context (High Accuracy).
- **Special Access**: `Usage Access` and `Notification Listener` (via Developer Tab).

### 2. Manual Synchronization
Navigate to the **Quest Tab** and use the "Refresh" heartbeat icon to trigger an immediate hardware sweep across all active sensors.

### 3. Auditing the Raw Stream
The **Data Tab** provides a live-scrolling feed of the internal `health_logs` table. This is the source of truth for all UI components and analytics.

---

## 🏗️ Architecture Detail

Nano Wellness follows a strictly decoupled architecture:
- **Services**: `SyncService` handles the orchestration of sensor sweeps.
- **Data**: `database.ts` manages the reactive schema for high-speed local writes.
- **Analytics**: `QuestManager` transforms raw logs into daily XP and challenges.

For deeper technical implementation details, see the **[Architecture Docs](src/docs/ARCHITECTURE.md)**.

---

## 📄 License & Legal
**Private Repository** - Developed by Antigravity for the Nano Wellness ecosystem.
*Proprietary designs and data synchronization logic included.*
