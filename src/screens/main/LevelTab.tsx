import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Alert } from 'react-native';
import { Title, Text, ProgressBar, Card, Surface, Button, Portal, Modal } from 'react-native-paper';
import { calculateLevel, getProgressToNextLevel, BADGES } from '../../utils/levelUtils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Geolocation from 'react-native-geolocation-service';
import { Q, Database } from '@nozbe/watermelondb';

interface LevelTabProps {
  xpEntries: any[];
  userProfile: any[];
  database: Database;
}

const LevelTabBase = ({ xpEntries, userProfile, database }: LevelTabProps) => {
  const [weatherConfig, setWeatherConfig] = useState<any>(null);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  
  // Animation for XP and Mood
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    // Fetch Weather
    Geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      (err) => fetchWeather(13.08, 80.27), // Fallback: Chennai
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,weather_code`;
      const response = await fetch(url);
      const json = await response.json();
      setWeatherConfig(json.current);
    } catch (e) {
      console.warn("Weather fetch failed", e);
    }
  };

  const submitWater = async (amount: number) => {
    try {
      await database.write(async () => {
        await database.get('hydration_logs').create((log: any) => {
          log.date = new Date().toISOString().split('T')[0];
          log.timestamp = Date.now();
          log.amountMl = amount;
        });
        const lastXpEntry = await database.get('xp_ledger').query(Q.sortBy('created_at', Q.desc), Q.take(1)).fetch();
        const currentTotal = lastXpEntry.length > 0 ? (lastXpEntry[0] as any).runningTotal : 0;
        await database.get('xp_ledger').create((xpLog: any) => {
           xpLog.date = new Date().toISOString().split('T')[0];
           xpLog.source = `Quick Log: +${amount}ml Water`;
           xpLog.xpAmount = 10;
           xpLog.runningTotal = currentTotal + 10;
        });
      });
      setWaterModalVisible(false);
      Alert.alert("Hydration Logged!", `Added ${amount}ml and +10 XP.`);
    } catch(e) {}
  };

  const submitMood = async (score: number, label: string) => {
    try {
      await database.write(async () => {
        await database.get('mood_logs').create((log: any) => {
          log.date = new Date().toISOString().split('T')[0];
          log.timestamp = Date.now();
          log.moodScore = score;
        });
        const lastXpEntry = await database.get('xp_ledger').query(Q.sortBy('created_at', Q.desc), Q.take(1)).fetch();
        const currentTotal = lastXpEntry.length > 0 ? (lastXpEntry[0] as any).runningTotal : 0;
        await database.get('xp_ledger').create((xpLog: any) => {
           xpLog.date = new Date().toISOString().split('T')[0];
           xpLog.source = `Quick Log: Mood (${label})`;
           xpLog.xpAmount = 10;
           xpLog.runningTotal = currentTotal + 10;
        });
      });
      setMoodModalVisible(false);
      Alert.alert("Aura Balanced!", `Mood logged as ${label} and +10 XP earned.`);
    } catch(e) {}
  };

  const totalXp = xpEntries.reduce((sum, entry) => sum + entry.xpAmount, 0);
  const level = calculateLevel(totalXp);
  const progress = getProgressToNextLevel(totalXp);
  const xpInLevel = totalXp % 500;

  const getRankTitle = (lvl: number) => {
    if (lvl < 5) return 'Novice Forger';
    if (lvl < 15) return 'Iron Forger';
    if (lvl < 30) return 'Shadow Ranger';
    if (lvl < 50) return 'Arcane Adept';
    return 'Void Master';
  };

  const displayedName = userProfile && userProfile.length > 0 && userProfile[0].name ? userProfile[0].name : 'Hero';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Dashboard Header */}
      <View style={styles.headerRow}>
         <View style={styles.avatarPlaceholder}>
             <MaterialCommunityIcons name="shield-sword" size={32} color={COLORS.primary} />
         </View>
         <View style={styles.headerText}>
             <Text style={styles.username}>{displayedName}</Text>
             <Text style={styles.rank}>Lv. {level} {getRankTitle(level)}</Text>
         </View>
      </View>

      {/* 2. XP Bar */}
      <Surface style={styles.xpCard} elevation={2}>
          <View style={styles.progressInfo}>
            <Text style={styles.nextLevelValue}>{xpInLevel} / 500 XP to next level</Text>
            <Text style={styles.streakText}>🔥 3 Day Streak</Text>
          </View>
          <ProgressBar progress={progress} color={COLORS.warning} style={styles.bigProgress} />
      </Surface>

      {/* 3. Live Weather Card */}
      <Surface style={styles.weatherCard} elevation={1}>
          <LinearGradient colors={['#1a103c', '#0f172a']} style={styles.weatherInner}>
             <View>
                <Title style={styles.weatherTitle}>Local Weather</Title>
                {weatherConfig ? (
                  <View>
                      <Text style={styles.weatherTemp}>{Math.round(weatherConfig.temperature_2m)}°C</Text>
                      <Text style={styles.weatherDetails}>Feels like {Math.round(weatherConfig.apparent_temperature)}° | Wind: {weatherConfig.wind_speed_10m} km/h</Text>
                  </View>
                ) : (
                  <Text style={styles.weatherDetails}>Scrying the skies...</Text>
                )}
             </View>
             <MaterialCommunityIcons name="weather-partly-cloudy" size={54} color={COLORS.accent} />
          </LinearGradient>
      </Surface>

      {/* 4. Mood Ring */}
      <Title style={styles.sectionTitle}>Aura & Balance</Title>
      <Surface style={styles.auraCard} elevation={2}>
          <Animated.View style={[styles.moodRing, { transform: [{ scale: pulseAnim }], shadowColor: COLORS.success }]}>
              <LinearGradient colors={[COLORS.success, '#10b981']} style={styles.moodInner} />
          </Animated.View>
          <View style={styles.auraText}>
              <Text style={styles.auraTitle}>Current Aura: Harmonious</Text>
              <Text style={styles.auraDesc}>Your mood is stable and positive.</Text>
          </View>
      </Surface>

      {/* 5. Quick Logs */}
      <View style={styles.quickLogGrid}>
          <Button mode="contained" icon="water" style={[styles.quickBtn, {backgroundColor: COLORS.primary}]} onPress={() => setWaterModalVisible(true)}>Log Water</Button>
          <Button mode="contained" icon="emoticon-outline" style={[styles.quickBtn, {backgroundColor: COLORS.secondary}]} onPress={() => setMoodModalVisible(true)}>Set Mood</Button>
      </View>

      <Portal>
        <Modal visible={waterModalVisible} onDismiss={() => setWaterModalVisible(false)} contentContainerStyle={styles.modalContent}>
           <Title style={styles.modalTitle}>Log Hydration</Title>
           <View style={styles.chipGrid}>
              {[100, 250, 500, 1000].map(amount => (
                 <Button key={amount} mode="contained" onPress={() => submitWater(amount)} style={styles.modalBtn}>{amount} ml</Button>
              ))}
           </View>
        </Modal>

        <Modal visible={moodModalVisible} onDismiss={() => setMoodModalVisible(false)} contentContainerStyle={styles.modalContent}>
           <Title style={styles.modalTitle}>Set Aura</Title>
           <View style={styles.chipGrid}>
              {[ {l:'Happy', v:100}, {l:'Calm', v:70}, {l:'Neutral', v:50}, {l:'Stressed', v:20} ].map(m => (
                 <Button key={m.v} mode="contained" onPress={() => submitMood(m.v, m.l)} style={[styles.modalBtn, {backgroundColor: COLORS.secondary}]}>{m.l}</Button>
              ))}
           </View>
        </Modal>
      </Portal>

    </ScrollView>
  );
};

const enhance = withObservables([], ({ database }: any) => ({
  xpEntries: database.get('xp_ledger').query().observe(),
  userProfile: database.get('user_profile').query().observe(),
}));

export const LevelTab = withDatabase(enhance(LevelTabBase));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.accent },
  headerText: { marginLeft: 15 },
  username: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  rank: { fontSize: 16, color: COLORS.warning, fontWeight: '600' },
  xpCard: { padding: 20, borderRadius: 24, backgroundColor: COLORS.surface, marginBottom: 20, borderWidth: 1, borderColor: '#200b3b' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  nextLevelValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  streakText: { fontSize: 14, fontWeight: 'bold', color: '#fb923c' },
  bigProgress: { height: 12, borderRadius: 6, backgroundColor: '#0f172a' },
  weatherCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.3)' },
  weatherInner: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTitle: { fontSize: 14, color: COLORS.accent, fontWeight: 'bold', marginBottom: 5 },
  weatherTemp: { fontSize: 36, color: 'white', fontWeight: 'bold' },
  weatherDetails: { fontSize: 13, color: COLORS.muted, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  auraCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 20, borderRadius: 24, marginBottom: 20 },
  moodRing: { width: 60, height: 60, borderRadius: 30, padding: 4, backgroundColor: 'rgba(34, 197, 94, 0.3)', marginRight: 15 },
  moodInner: { flex: 1, borderRadius: 30 },
  auraText: { flex: 1 },
  auraTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  auraDesc: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  quickLogGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  quickBtn: { flex: 0.48, borderRadius: 16 },
  modalContent: { backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 24, borderWidth: 1, borderColor: '#38bdf8' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  modalBtn: { margin: 5, borderRadius: 16 }
});
