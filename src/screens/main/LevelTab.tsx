import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, ProgressBar, Card, Surface } from 'react-native-paper';
import { calculateLevel, getProgressToNextLevel, BADGES } from '../../utils/levelUtils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';

interface LevelTabProps {
  xpEntries: any[];
}

const LevelTabBase = ({ xpEntries }: LevelTabProps) => {
  // Calculate total XP from ledger
  const totalXp = xpEntries.reduce((sum, entry) => sum + entry.xpAmount, 0);
  const level = calculateLevel(totalXp);
  const progress = getProgressToNextLevel(totalXp);
  const xpInLevel = totalXp % 500;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.topCard} elevation={4}>
        <LinearGradient colors={GRADIENTS.accent} style={styles.badgeCircle}>
            <Title style={styles.levelNum}>{level}</Title>
        </LinearGradient>
        
        <Title style={styles.levelName}>
          {level === 1 ? 'Newcomer' : level < 5 ? 'Steady Walker' : 'Master of Balance'}
        </Title>
        <Text style={styles.xpTotal}>{totalXp} Lifetime XP</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.nextLevelLabel}>TO LEVEL {level + 1}</Text>
            <Text style={styles.nextLevelValue}>{xpInLevel} / 500</Text>
          </View>
          <ProgressBar progress={progress} color={COLORS.primary} style={styles.bigProgress} />
        </View>
      </Surface>

      <Title style={styles.sectionTitle}>Achievements</Title>
      <View style={styles.badgeGrid}>
        {BADGES.map(badge => {
            // Logic to unlock badges based on level/xp could go here
            const isUnlocked = badge.unlocked || (badge.id === 'b1' && level >= 2);
            return (
                <Surface key={badge.id} style={[styles.badgeItem, !isUnlocked && styles.locked]} elevation={1}>
                    <LinearGradient 
                        colors={isUnlocked ? GRADIENTS.secondary : ['#e2e8f0', '#cbd5e1']} 
                        style={styles.badgeIconBg}
                    >
                        <MaterialCommunityIcons 
                            name={badge.icon} 
                            size={32} 
                            color="white" 
                        />
                    </LinearGradient>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    {!isUnlocked && <MaterialCommunityIcons name="lock" size={12} color={COLORS.muted} style={styles.lock} />}
                </Surface>
            );
        })}
      </View>

      <Title style={styles.sectionTitle}>Quest History</Title>
      <Card style={styles.streakCard}>
        {xpEntries.slice(0, 3).map((entry, i) => (
            <View key={entry.id || i} style={[styles.streakItem, i > 0 && { marginTop: 15 }]}>
                <LinearGradient colors={['#fb7185', '#e11d48']} style={styles.streakIcon}>
                    <MaterialCommunityIcons name="star" size={24} color="white" />
                </LinearGradient>
                <View style={styles.streakInfo}>
                    <Text style={styles.streakTitle}>{entry.source}</Text>
                    <Text style={styles.streakDesc}>+{entry.xpAmount} XP • {new Date(entry.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
        ))}
        {xpEntries.length === 0 && (
            <Text style={{ textAlign: 'center', color: COLORS.muted }}>No achievements yet. Start your first quest!</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const enhance = withObservables([], ({ database }: any) => ({
  xpEntries: database.get('xp_ledger').query().observe(),
}));

export const LevelTab = withDatabase(enhance(LevelTabBase));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  topCard: { padding: 30, borderRadius: 32, backgroundColor: 'white', alignItems: 'center', marginBottom: 30 },
  badgeCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  levelNum: { fontSize: 42, color: 'white', fontWeight: 'bold' },
  levelName: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
  xpTotal: { color: COLORS.muted, fontSize: 14, marginBottom: 25 },
  progressSection: { width: '100%' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  nextLevelLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.muted },
  nextLevelValue: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  bigProgress: { height: 16, borderRadius: 8, backgroundColor: '#f1f5f9' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginVertical: 20 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeItem: { width: '48%', backgroundColor: 'white', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 15 },
  badgeIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  badgeName: { fontWeight: '600', fontSize: 13, color: COLORS.text, textAlign: 'center' },
  locked: { opacity: 0.7 },
  lock: { position: 'absolute', top: 15, right: 15 },
  streakCard: { borderRadius: 24, padding: 20, backgroundColor: 'white', marginBottom: 20 },
  streakItem: { flexDirection: 'row', alignItems: 'center' },
  streakIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  streakInfo: { flex: 1 },
  streakTitle: { fontWeight: 'bold', fontSize: 16 },
  streakDesc: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});
