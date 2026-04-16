import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Title, Text, ProgressBar, Surface, Portal, Modal, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';

const CHALLENGES_DB = [
  { id: 'c1', title: 'Hydration Streak', desc: 'Drink 2L daily for 7 days', days: 7, xp: 500, icon: 'water', gradient: GRADIENTS.primary },
  { id: 'c2', title: 'Digital Detox', desc: 'Under 2h screen time for 5 days', days: 5, xp: 400, icon: 'cellphone-off', gradient: GRADIENTS.secondary },
  { id: 'c3', title: 'Step Master', desc: '10,000 steps daily for 14 days', days: 14, xp: 800, icon: 'walk', gradient: GRADIENTS.accent },
];

const ChallengesTabBase = ({ activeChallenges, database }: { activeChallenges: any[], database: any }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);

  const startChallenge = async (challenge: any) => {
    try {
      await database.write(async () => {
        await database.get('user_challenges').create((record: any) => {
          record.challengeId = challenge.id;
          record.status = 'active';
          record.startDate = Date.now();
          record.streak = 1;
          record.lastCheckIn = Date.now();
        });
      });
      setRulesModalVisible(false);
    } catch (e) {
      console.warn("Error starting challenge", e);
    }
  };

  const handleCheckIn = async (activeRecord: any, template: any) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeSinceLast = now - activeRecord.lastCheckIn;

    await database.write(async () => {
      if (activeRecord.lastCheckIn > 0 && timeSinceLast > oneDay * 2) {
        // Streak Broken
        Alert.alert("Streak Broken!", "You missed a day. -15 XP applied.");
        
        // Negative XP penalty
        const lastXpEntry = await database.get('xp_ledger').query(Q.sortBy('created_at', Q.desc), Q.take(1)).fetch();
        const currentTotal = lastXpEntry.length > 0 ? (lastXpEntry[0] as any).runningTotal : 0;
        await database.get('xp_ledger').create((xpLog: any) => {
           xpLog.date = new Date().toISOString().split('T')[0];
           xpLog.source = `Penalty: Broken ${template.title}`;
           xpLog.xpAmount = -15;
           xpLog.runningTotal = currentTotal - 15;
        });

        // Delete or mark failed
        await activeRecord.destroyPermanently();
        return;
      }

      await activeRecord.update((record: any) => {
        record.streak += 1;
        record.lastCheckIn = now;
        if (record.streak >= template.days) {
          record.status = 'completed';
        }
      });

      // Issue XP if completed
      if (activeRecord.streak + 1 >= template.days) {
        Alert.alert("Challenge Mastered!", `You earned +${template.xp} XP!`);
        const lastXpEntry = await database.get('xp_ledger').query(Q.sortBy('created_at', Q.desc), Q.take(1)).fetch();
        const currentTotal = lastXpEntry.length > 0 ? (lastXpEntry[0] as any).runningTotal : 0;
        await database.get('xp_ledger').create((xpLog: any) => {
           xpLog.date = new Date().toISOString().split('T')[0];
           xpLog.source = `Challenge: ${template.title}`;
           xpLog.xpAmount = template.xp;
           xpLog.runningTotal = currentTotal + template.xp;
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.headerSubtitle}>Legendary Quests</Title>
        
        {CHALLENGES_DB.map(challenge => {
          const activeRecord = activeChallenges.find(ac => ac.challengeId === challenge.id);
          const isActive = !!activeRecord;
          const isCompleted = activeRecord?.status === 'completed';

          const streak = activeRecord ? activeRecord.streak : 0;
          const progress = streak / challenge.days;
          
          // Check if already checked in today (within last 12 hrs logic simplifed for demo)
          const checkedInToday = activeRecord && (Date.now() - activeRecord.lastCheckIn) < (12 * 60 * 60 * 1000);

          return (
            <Surface key={challenge.id} style={styles.challengeCard} elevation={2}>
              <View style={styles.cardTop}>
                <LinearGradient colors={challenge.gradient} style={styles.iconBox}>
                  <MaterialCommunityIcons name={challenge.icon} size={28} color="white" />
                </LinearGradient>
                <View style={styles.titleArea}>
                  <Title style={styles.title}>{challenge.title}</Title>
                  <Text style={styles.desc}>{challenge.desc}</Text>
                </View>
              </View>

              {isActive ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressPct}>{Math.round(progress * 100)}% COMPLETE</Text>
                    <Text style={styles.timeLabel}>{challenge.days - streak} days left</Text>
                  </View>
                  <ProgressBar progress={progress} color={challenge.gradient[1]} style={styles.progressBar} />
                  
                  {isCompleted ? (
                    <View style={styles.completedBox}>
                       <MaterialCommunityIcons name="trophy" color={COLORS.warning} size={20} />
                       <Text style={styles.completedText}> Mastered</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                       style={[styles.checkInBtn, checkedInToday && {backgroundColor: COLORS.surface}]} 
                       onPress={() => handleCheckIn(activeRecord, challenge)}
                       disabled={checkedInToday}
                    >
                      <Text style={[styles.btnText, checkedInToday && {color: COLORS.muted}]}>
                         {checkedInToday ? "Checked in Today" : "Daily Check-in"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity 
                   style={styles.startBtn} 
                   onPress={() => { setSelectedChallenge(challenge); setRulesModalVisible(true); }}
                >
                  <Text style={styles.btnText}>View Rules</Text>
                  <MaterialCommunityIcons name="shield-half-full" size={16} color={COLORS.primary} style={{marginLeft: 5}}/>
                </TouchableOpacity>
              )}
            </Surface>
          );
        })}
      </ScrollView>

      <Portal>
        <Modal visible={rulesModalVisible} onDismiss={() => setRulesModalVisible(false)} contentContainerStyle={styles.modalContent}>
          {selectedChallenge && (
            <View>
               <Title style={styles.modalTitle}>{selectedChallenge.title} Rules</Title>
               <Text style={styles.modalText}>You must check in every day for {selectedChallenge.days} days.</Text>
               <Text style={styles.modalText}>Missing a day will break your streak, removing the challenge and deducting 15 XP.</Text>
               <Text style={styles.modalReward}>Reward: +{selectedChallenge.xp} XP</Text>
               <Button mode="contained" onPress={() => startChallenge(selectedChallenge)} style={styles.modalBtn}>
                 Accept Challenge
               </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const enhance = withObservables([], ({ database }: any) => ({
  activeChallenges: database.get('user_challenges').query().observe(),
}));

export const ChallengesTab = withDatabase(enhance(ChallengesTabBase));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  headerSubtitle: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: COLORS.text },
  challengeCard: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#200b3b' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  titleArea: { marginLeft: 16, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, lineHeight: 22 },
  desc: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  progressContainer: { marginTop: 10 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressPct: { fontSize: 11, fontWeight: 'bold', color: COLORS.text },
  timeLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.muted },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: '#0f172a' },
  
  startBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 16 },
  checkInBtn: { marginTop: 15, padding: 15, backgroundColor: COLORS.primary, borderRadius: 16, alignItems: 'center' },
  btnText: { fontWeight: 'bold', color: COLORS.primary, fontSize: 14 },
  
  completedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 15, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 16 },
  completedText: { color: COLORS.warning, fontWeight: 'bold', fontSize: 14 },

  modalContent: { backgroundColor: COLORS.surface, padding: 25, margin: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.accent },
  modalTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  modalText: { color: COLORS.muted, fontSize: 16, marginBottom: 10, lineHeight: 24 },
  modalReward: { color: COLORS.warning, fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  modalBtn: { backgroundColor: COLORS.primary, borderRadius: 12, marginTop: 10 }
});
