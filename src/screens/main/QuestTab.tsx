import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ProgressBar, Surface } from 'react-native-paper';
import { getQuestForHour, isSleepTime, completeQuest, checkQuestCompleted } from '../../analytics/QuestManager';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import Svg, { Circle } from 'react-native-svg';

const { height } = Dimensions.get('window');

// Adaptive Target Simulator
const STEPS_TARGET = 8500;
const CURRENT_STEPS = 6430;

export const QuestTab = () => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isCompleted, setIsCompleted] = useState(false);
  const [waterInput, setWaterInput] = useState(250);
  
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
    }, 60000);

    if (!sleepMode) {
      checkQuestCompleted(quest.id).then(setIsCompleted);
    }
    return () => clearInterval(timer);
  }, [currentHour, quest.id, sleepMode]);

  const triggerXpAnimation = () => {
    xpAnim.setValue(0);
    xpOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(xpAnim, { toValue: -150, duration: 1500, useNativeDriver: true }),
      Animated.timing(xpOpacity, { toValue: 0, duration: 1500, useNativeDriver: true })
    ]).start();
  };

  const handleComplete = async (value?: any) => {
    if (isCompleted) return;
    const success = await completeQuest(quest, value);
    if (success) {
      setIsCompleted(true);
      triggerXpAnimation();
    }
  };

  const StepMeter = () => {
    const radius = 60;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const fillPct = Math.min((CURRENT_STEPS / STEPS_TARGET) * 100, 100);
    const strokeDashoffset = circumference - (circumference * fillPct) / 100;

    return (
      <Surface style={styles.stepMeterCard} elevation={2}>
        <View style={styles.stepMeterWrap}>
           <Svg height="150" width="150" viewBox="0 0 150 150">
              <Circle cx="75" cy="75" r={radius} stroke="#200b3b" strokeWidth={strokeWidth} fill="none" />
              <Circle
                cx="75" cy="75" r={radius}
                stroke={COLORS.primary} strokeWidth={strokeWidth} fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" transform="rotate(-90 75 75)"
              />
           </Svg>
           <View style={styles.stepInner}>
               <MaterialCommunityIcons name="shoe-sneaker" color={COLORS.primary} size={24} />
               <Text style={styles.stepCount}>{CURRENT_STEPS}</Text>
           </View>
        </View>
        <View style={styles.stepInfo}>
           <Text style={styles.stepLabel}>Daily Adaptive Target</Text>
           <Text style={styles.stepSub}>{STEPS_TARGET} steps (Up 10% from yesterday)</Text>
           <Text style={styles.stepStats}>~{Math.round(CURRENT_STEPS * 0.04)} kcal burnt</Text>
        </View>
      </Surface>
    );
  };

  const renderQuestInput = () => {
    if (isCompleted) {
        return (
          <View style={styles.completedBox}>
             <MaterialCommunityIcons name="check-decagram" size={30} color={COLORS.success} />
             <Text style={styles.completedText}>Quest Conquered</Text>
          </View>
        );
    }

    if (quest.inputType === 'emotion') {
       const emotions = [
          { emoji: '😰', label: 'Stressed', v: 'stressed' },
          { emoji: '😐', label: 'Neutral', v: 'neutral' },
          { emoji: '😊', label: 'Happy', v: 'happy' },
          { emoji: '😌', label: 'Calm', v: 'calm' },
       ];
       return (
          <View style={styles.emotionGrid}>
            {emotions.map(e => (
               <TouchableOpacity key={e.v} style={styles.emotionBtn} onPress={() => handleComplete(e.v)}>
                  <Text style={styles.emojiText}>{e.emoji}</Text>
                  <Text style={styles.emojiLabel}>{e.label}</Text>
               </TouchableOpacity>
            ))}
          </View>
       );
    }
    if (quest.inputType === 'water') {
       return (
         <View style={styles.waterBox}>
            <View style={styles.waterAdjust}>
              <TouchableOpacity onPress={() => setWaterInput(Math.max(50, waterInput - 50))} style={styles.valBtn}>
                  <Text style={styles.valBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.waterAmt}>{waterInput} ml</Text>
              <TouchableOpacity onPress={() => setWaterInput(waterInput + 50)} style={styles.valBtn}>
                  <Text style={styles.valBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleComplete(waterInput)}>
              <Text style={styles.actionBtnText}>Log Liquid</Text>
            </TouchableOpacity>
         </View>
       );
    }
    
    // Default Boolean
    return (
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleComplete()}>
        <Text style={styles.actionBtnText}>Mark as Done</Text>
      </TouchableOpacity>
    );
  };

  if (sleepMode) {
    return (
      <View style={styles.centered}>
        <Title style={{color: 'white'}}>Sleep Mode</Title>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.xpAnimation, { transform: [{ translateY: xpAnim }], opacity: xpOpacity }]}>
        <Text style={styles.xpAnimText}>+{quest.xpReward} XP</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.mainTitle}>Today's Target</Title>
        <StepMeter />

        <Title style={styles.sectionTitle}>Active Quest</Title>
        <Card style={styles.card}>
          <LinearGradient colors={GRADIENTS.surface || [COLORS.surface, '#140c21']} style={styles.cardGradient}>
            <View style={styles.questHeader}>
              <Text style={styles.xpBadge}>+{quest.xpReward} XP</Text>
              <MaterialCommunityIcons name="timer-sand" size={20} color={COLORS.primary} />
            </View>
            <Title style={styles.questName}>{quest.title}</Title>
            <Text style={styles.questDescription}>{quest.description}</Text>
            
            {renderQuestInput()}
          </LinearGradient>
        </Card>

        <Title style={styles.sectionTitle}>Daily Logs</Title>
        <View style={styles.logsRow}>
            <Surface style={styles.logCard} elevation={1}>
                <MaterialCommunityIcons name="chart-bubble" size={32} color={COLORS.secondary} />
                <Text style={styles.logLabel}>Mood Log</Text>
                <Text style={styles.logVal}>Mostly Calm</Text>
            </Surface>
            <Surface style={styles.logCard} elevation={1}>
                <MaterialCommunityIcons name="bottle-tonic-outline" size={32} color={COLORS.accent} />
                <Text style={styles.logLabel}>Hydration</Text>
                <Text style={styles.logVal}>1.2L / 2L</Text>
            </Surface>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 10, marginBottom: 15 },
  
  stepMeterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: 24, marginBottom: 25 },
  stepMeterWrap: { position: 'relative', width: 150, height: 150 },
  stepInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  stepCount: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: -5 },
  stepInfo: { flex: 1, marginLeft: 10 },
  stepLabel: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
  stepSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  stepStats: { color: COLORS.accent, fontSize: 12, marginTop: 10, fontWeight: '600' },

  card: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#270c47' },
  cardGradient: { padding: 25 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpBadge: { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: COLORS.warning, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontWeight: 'bold', fontSize: 13 },
  questName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  questDescription: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginBottom: 25 },
  
  emotionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  emotionBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  emojiText: { fontSize: 28 },
  emojiLabel: { fontSize: 11, color: COLORS.text, marginTop: 5 },

  waterBox: { alignItems: 'center' },
  waterAdjust: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  valBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  valBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  waterAmt: { fontSize: 22, color: 'white', fontWeight: 'bold', width: 100, textAlign: 'center' },

  actionBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 16, alignItems: 'center', width: '100%' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  completedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 16 },
  completedText: { marginLeft: 10, color: COLORS.success, fontWeight: 'bold', fontSize: 16 },

  logsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 },
  logCard: { flex: 0.48, backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#200b3b' },
  logLabel: { color: COLORS.text, fontWeight: 'bold', marginTop: 10 },
  logVal: { color: COLORS.muted, fontSize: 12, marginTop: 4 },

  xpAnimation: { position: 'absolute', top: height / 3, alignSelf: 'center', zIndex: 1000, backgroundColor: COLORS.warning, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30 },
  xpAnimText: { color: '#000', fontSize: 24, fontWeight: 'bold' }
});
