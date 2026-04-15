import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Title, Card, Text, ProgressBar, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';

const CHALLENGES = [
  { id: 'c1', title: 'Hydration Streak', description: 'Drink 2L daily for 7 days', progress: 0.7, daysRemaining: 2, icon: 'water', gradient: GRADIENTS.primary },
  { id: 'c2', title: 'Digital Detox', description: 'Under 2h screen time for 5 days', progress: 0.4, daysRemaining: 3, icon: 'cellphone-off', gradient: GRADIENTS.secondary },
  { id: 'c3', title: 'Step Master', description: '10,000 steps daily for 14 days', progress: 0.2, daysRemaining: 11, icon: 'walk', gradient: GRADIENTS.accent },
];

export const ChallengesTab = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.headerSubtitle}>Personal Quests</Title>
      
      {CHALLENGES.map(challenge => (
        <Surface key={challenge.id} style={styles.challengeCard} elevation={2}>
          <View style={styles.cardTop}>
            <LinearGradient colors={challenge.gradient} style={styles.iconBox} start={{x:0, y:0}} end={{x:1, y:1}}>
               <MaterialCommunityIcons name={challenge.icon} size={28} color="white" />
            </LinearGradient>
            <View style={styles.titleArea}>
               <Title style={styles.title}>{challenge.title}</Title>
               <Text style={styles.desc}>{challenge.description}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
             <View style={styles.progressLabelRow}>
                <Text style={styles.progressPct}>{Math.round(challenge.progress * 100)}% COMPLETE</Text>
                <Text style={styles.timeLabel}>{challenge.daysRemaining} days left</Text>
             </View>
             <ProgressBar 
                progress={challenge.progress} 
                color={challenge.gradient[1]} 
                style={styles.progressBar} 
              />
          </View>

          <TouchableOpacity style={styles.viewBtn}>
             <Text style={styles.btnText}>RESUME CHALLENGE</Text>
             <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </Surface>
      ))}

      <TouchableOpacity style={styles.addChallengeBtn}>
         <LinearGradient colors={GRADIENTS.primary} style={styles.addBtnInner} start={{x:0, y:0}} end={{x:1, y:1}}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color="white" />
            <Text style={styles.addBtnText}>JOIN NEW CHALLENGE</Text>
         </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  headerSubtitle: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: COLORS.text },
  challengeCard: { backgroundColor: 'white', borderRadius: 28, padding: 20, marginBottom: 20, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  titleArea: { marginLeft: 16, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, lineHeight: 22 },
  desc: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  progressContainer: { marginBottom: 20 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressPct: { fontSize: 11, fontWeight: 'bold', color: COLORS.text, letterSpacing: 0.5 },
  timeLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.muted },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: '#f1f5f9' },
  viewBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  btnText: { fontWeight: 'bold', color: COLORS.primary, fontSize: 13 },
  addChallengeBtn: { marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  addBtnInner: { padding: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});
