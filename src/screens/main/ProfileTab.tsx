import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Title, Text, Card, List, useTheme, Surface } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, GRADIENTS } from '../../utils/theme';

const screenWidth = Dimensions.get('window').width;

const barData = [
  { value: 6, label: 'M', frontColor: COLORS.primary },
  { value: 8, label: 'T', frontColor: COLORS.primary },
  { value: 7, label: 'W', frontColor: COLORS.primary },
  { value: 5, label: 'T', frontColor: COLORS.accent },
  { value: 9, label: 'F', frontColor: COLORS.primary },
  { value: 11, label: 'S', frontColor: COLORS.secondary },
  { value: 8, label: 'S', frontColor: COLORS.primary },
];

export const ProfileTab = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.headerGrade} start={{x:0, y:0}} end={{x:1, y:1}}>
        <View style={styles.scoreCircle}>
           <Text style={styles.scoreValue}>84</Text>
           <Text style={styles.scoreLabel}>Wellness Score</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Title style={styles.sectionTitle}>Activity Insight</Title>
        <Surface style={styles.chartSurface} elevation={2}>
           <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={6}
            frontColor={COLORS.primary}
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            labelTextStyle={{ color: COLORS.muted }}
          />
        </Surface>

        <Title style={styles.sectionTitle}>Biometric Stats</Title>
        <View style={styles.statsRow}>
          {[
            { label: 'Sleep', value: '7.5h', icon: 'sleep', color: '#8b5cf6' },
            { label: 'Heart', value: '72 bpm', icon: 'heart-pulse', color: '#ef4444' },
            { label: 'Steps', value: '8.4k', icon: 'walk', color: '#22c55e' },
          ].map((item) => (
            <Surface key={item.label} style={styles.statCard} elevation={1}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Surface>
          ))}
        </View>

        <Title style={styles.sectionTitle}>Smart Insights</Title>
        <Card style={styles.insightCard}>
          <List.Item
            title="Late Night Usage"
            description="Your device usage after 11 PM was 40% higher this week."
            left={props => <List.Icon {...props} icon="cellphone-off" color={COLORS.secondary} />}
          />
          <List.Item
            title="Hydration Sync"
            description="Good job! You met your 3L goal 5 days in a row."
            left={props => <List.Icon {...props} icon="water" color={COLORS.neonBlue} />}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  headerGrade: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scoreCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: 'white' },
  scoreLabel: { fontSize: 12, color: 'white', opacity: 0.9 },
  body: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginVertical: 15, color: COLORS.text },
  chartSurface: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '31%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.muted },
  insightCard: { borderRadius: 24, backgroundColor: 'white', overflow: 'hidden' },
});
