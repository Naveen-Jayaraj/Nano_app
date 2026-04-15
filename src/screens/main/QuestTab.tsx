import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, ProgressBar, Surface, List } from 'react-native-paper';
import { getQuestForHour, isSleepTime } from '../../analytics/QuestManager';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { SyncService } from '../../services/SyncService';

export const QuestTab = () => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await SyncService.syncAll();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const quest = getQuestForHour(currentHour);
  const sleepMode = isSleepTime(currentHour);

  if (sleepMode) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={GRADIENTS.accent} style={styles.sleepCircle}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={60} color="white" />
        </LinearGradient>
        <Title style={styles.title}>Sleep Mode</Title>
        <Paragraph style={styles.subtitle}>No quests during sleep hours. Rest well and recharge!</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Title style={styles.mainTitle}>Today's Journey</Title>
        <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
           <Surface style={styles.syncButton} elevation={2}>
              <MaterialCommunityIcons 
                name={isSyncing ? "sync" : "refresh"} 
                size={20} 
                color={COLORS.primary} 
                style={isSyncing ? styles.spinning : null}
              />
           </Surface>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <LinearGradient colors={GRADIENTS.primary} style={styles.cardGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
          <View style={styles.questHeader}>
            <Text style={styles.xpBadge}>+{quest.xpReward} XP</Text>
            <MaterialCommunityIcons name="timer-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Title style={styles.questName}>{quest.title}</Title>
          <Text style={styles.questDescription}>{quest.description}</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, isCompleted && styles.completedButton]}
            onPress={() => setIsCompleted(true)}
            disabled={isCompleted}
          >
            <Text style={styles.buttonText}>{isCompleted ? 'QUEST COMPLETE' : 'I DID THIS'}</Text>
            {isCompleted && <MaterialCommunityIcons name="check-circle" size={20} color="white" style={{marginLeft: 10}} />}
          </TouchableOpacity>
        </LinearGradient>
      </Card>

      <Surface style={styles.progressSurface} elevation={1}>
        <View style={styles.progressHeader}>
           <Title style={styles.progressTitle}>Daily Progress</Title>
           <Text style={styles.progressCount}>60%</Text>
        </View>
        <ProgressBar progress={0.6} color={COLORS.primary} style={styles.progressBar} />
        <View style={styles.progressFooter}>
          <Text style={styles.footerText}>3 / 5 Quests Completed</Text>
          <Text style={styles.footerText}>Next: 1:00 PM</Text>
        </View>
      </Surface>

      <View style={styles.historySection}>
         <Title style={styles.sectionTitle}>Upcoming Challenges</Title>
         <Card style={styles.upcomingCard}>
            <List.Item
              title="Social Fast"
              description="No social media for 2 hours today."
              left={() => <MaterialCommunityIcons name="account-off-outline" size={24} color={COLORS.secondary} style={styles.listIcon} />}
            />
         </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  syncButton: { padding: 10, borderRadius: 12, backgroundColor: 'white' },
  spinning: { /* Add rotate animation if needed */ },
  sleepCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', color: COLORS.muted, marginTop: 10 },
  card: { borderRadius: 30, overflow: 'hidden', elevation: 8, marginBottom: 25 },
  cardGradient: { padding: 25 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  xpBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, color: 'white', fontWeight: 'bold' },
  questName: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  questDescription: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 24, marginBottom: 25 },
  actionButton: { backgroundColor: 'white', padding: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  completedButton: { backgroundColor: COLORS.success },
  buttonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  progressSurface: { padding: 20, borderRadius: 24, backgroundColor: 'white', marginBottom: 25 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  progressTitle: { fontSize: 18, fontWeight: '700' },
  progressCount: { color: COLORS.primary, fontWeight: 'bold', fontSize: 18 },
  progressBar: { height: 12, borderRadius: 6, backgroundColor: '#f1f5f9' },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footerText: { fontSize: 12, color: COLORS.muted },
  historySection: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15 },
  upcomingCard: { borderRadius: 20, backgroundColor: 'white' },
  listIcon: { marginTop: 10, marginLeft: 10 }
});
