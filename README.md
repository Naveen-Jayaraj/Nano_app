<div align="center">
  <img src="./android/app/src/main/logo.png" alt="LifeForge Logo" width="150"/>
  <h1>🛡️ LifeForge</h1>
  <p><b>Transforming Wellness Tracking into an Epic Quest</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
    <img src="https://img.shields.io/badge/Framework-React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
    <img src="https://img.shields.io/badge/Database-WatermelonDB-E34F26?style=for-the-badge&logo=database" alt="WatermelonDB" />
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  </p>
</div>

<br/>

## 📜 About The Project

LifeForge (formerly *Nano Wellness*) is a next-generation, gamified health tracking application that turns your daily habits into an RPG adventure. Built natively for Android using React Native, LifeForge captures real-time biometric and hardware sensor data without relying on invasive cloud architectures.

Featuring a gorgeous **Dark RPG** aesthetic, LifeForge translates mundane activities—like a 15-minute walk or reducing screen time—into Experience Points (XP), Badges, and unbreakable Streaks.

## 🚀 Key Features

### ⚔️ The Gamification Engine (RPG Dashboard)
* **Dynamic Leveling System**: Your XP is tracked persistently in local databases. Walk, hydrate, and limit screen time to climb from *Novice Forger* to *Void Master*.
* **Daily Quests & Check-ins**: An evolving set of daily challenges (e.g., *Digital Detox*, *Hydration Streak*). Missing a check-in penalizes your XP!
* **Aura Visualizer**: Watch your emotional state translated into a glowing, animated visual ring on the dashboard.

### 🧠 Advanced Contextual Intelligence
* **Contextual Wellness Nudges**: LifeForge constantly analyzes background data. If it detects over 45 minutes of screen time with less than 100 steps taken, it triggers an instant native notification to encourage stretching.
* **Adaptive Sensor Sampling**: Power-conscious architecture automatically throttles intense background sensors (like fetching device states) from 1-hour intervals to 3-hour intervals when your battery drops below 20%.

### 🔐 Uncompromised Privacy
* **Zero-Cloud Architecture**: Not a single byte of your data leaves your phone. Everything operates on the local `WatermelonDB` engine.
* **The Data Vault**: A secure export protocol that aggregates and encrypts your wellness history into a lightweight obfuscated string using a custom Cipher-Base64 pipeline, allowing you to securely share/export it via the OS Share Sheet.

### 🔌 Deep Hardware Integrations
LifeForge leverages custom-built native Kotlin modules to tap into low-level Android metrics:
* **Digital Wellbeing Pulls**: Extracts precise `UsageStatsManager` data for robust screen-time parsing natively.
* **Notification Metrics**: Securely assesses your notification velocity over time.
* **Health Connect Bridging**: Directly interfaces with Google's physical step metrics via `react-native-health-connect`.
* **Live Environmental Conditions**: Polls precise `Open-Meteo` weather using live geolocation APIs.

---

## 🛠️ Technology Stack

| Architecture / Domain | Technologies Used |
|---|---|
| **Frontend UI** | React Native, React Native Paper, React Native SVG, Gifted Charts |
| **Styling** | Custom Dark RPG Theme system |
| **Local Database** | WatermelonDB (SQLite Adapter) |
| **Background Processing** | React Native Background Fetch |
| **Native Integrations** | Custom Kotlin Native Modules (`HardwareSignalPackage`) |

---

## 📱 Quick Start

### Prerequisites
- Node.js (v18+)
- Android Studio & SDK
- Python, JDK 17

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the Android app and deploy to emulator:
   ```bash
   npx react-native run-android
   ```
*(Note: To test native background fetches perfectly, it is recommended to compile the Release APK using `.\gradlew assembleRelease`)*

---

## 🤝 The Authors

This project was forged by:

* **Naveen Jayaraj**
* **Shreya Ravi K**
* **Aswin S**

<p align="center">
  <i>May your streaks be long and your battery high!</i>
</p>
