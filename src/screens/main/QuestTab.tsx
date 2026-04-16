import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ProgressBar, Surface } from 'react-native-paper';
import { getQuestForHour, isSleepTime, completeQuest, checkQuestCompleted } from '../../analytics/QuestManager';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { SyncService } from '../../services/SyncService';

const { height } = Dimensions.get('window');

export const QuestTab = () => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Animation state
  const xpAnim = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;

  const quest = getQuestForHour(currentHour);
  const sleepMode = isSleepTime(currentHour);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() !== currentHour) {
        setCurrentHour(now.getHours());
      }
    }, 60000); // Check every minute

    // Check if current quest is already completed
    if (!sleepMode) {
      checkQuestCompleted(quest.id).then(setIsCompleted);
    }

    return () => clearInterval(timer);
  }, [currentHour, quest.id, sleepMode]);

  const triggerXpAnimation = () => {
    xpAnim.setValue(0);
    xpOpacity.setValue(1);
    
    Animated.parallel([
      Animated.timing(xpAnim, {
        toValue: -150,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(xpOpacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleComplete = async () => {
    if (isCompleted) return;
    
    const success = await completeQuest(quest);
    if (success) {
      setIsCompleted(true);
      triggerXpAnimation();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await SyncService.syncAll();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  if (sleepMode) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={GRADIENTS.accent} style={styles.sleepCircle}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={60} color="white" />
        </LinearGradient>
        <Title style={styles.title}>Sleep Mode</Title>
        <Paragraph style={styles.subtitle}>No quests between 9:00 PM and 7:00 AM. Rest well!</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.xpAnimation, 
        { transform: [{ translateY: xpAnim }], opacity: xpOpacity }
      ]}>
        <Text style={styles.xpAnimText}>+{quest.xpReward} XP</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.mainTitle}>Today's Journey</Title>
          <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
            <Surface style={styles.syncButton} elevation={2}>
                <MaterialCommunityIcons 
                  name={isSyncing ? "sync" : "refresh"} 
                  size={20} 
                  color={COLORS.primary} 
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
              onPress={handleComplete}
              disabled={isCompleted}
            >
              <Text style={[styles.buttonText, isCompleted && { color: 'white' }]}>
                {isCompleted ? 'QUEST COMPLETE' : 'I DID THIS'}
              </Text>
              {isCompleted && <MaterialCommunityIcons name="check-circle" size={20} color="white" style={{marginLeft: 10}} />}
            </TouchableOpacity>
          </LinearGradient>
        </Card>

        <Surface style={styles.progressSurface} elevation={1}>
          <View style={styles.progressHeader}>
             <Title style={styles.progressTitle}>Daily Engagement</Title>
             <Text style={styles.progressCount}>{isCompleted ? '100%' : '0%'}</Text>
          </View>
          <ProgressBar progress={isCompleted ? 1 : 0.2} color={COLORS.primary} style={styles.progressBar} />
          <View style={styles.progressFooter}>
            <Text style={styles.footerText}>{isCompleted ? '1 / 1' : '0 / 1'} Hourly Quests</Text>
            <Text style={styles.footerText}>Next Refresh: {(currentHour + 1) % 24}:00</Text>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  syncButton: { padding: 10, borderRadius: 12, backgroundColor: 'white' },
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
  xpAnimation: {
    position: 'absolute',
    top: height / 2,
    alignSelf: 'center',
    zIndex: 1000,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 10,
  },
  xpAnimText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
