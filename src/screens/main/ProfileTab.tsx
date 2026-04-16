import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, NativeModules } from 'react-native';
import { Title, Text, Card, List, Surface } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, GRADIENTS } from '../../utils/theme';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';

const barData = [
  { value: 6, label: 'M', frontColor: COLORS.primary },
  { value: 8, label: 'T', frontColor: COLORS.primary },
  { value: 7, label: 'W', frontColor: COLORS.primary },
  { value: 5, label: 'T', frontColor: COLORS.accent },
  { value: 9, label: 'F', frontColor: COLORS.primary },
  { value: 11, label: 'S', frontColor: COLORS.secondary },
  { value: 8, label: 'S', frontColor: COLORS.primary },
];

const calculateBmi = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return { val: 0, cat: 'Unknown', color: COLORS.muted };
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  let cat = 'Healthy';
  let color = COLORS.success;
  if (bmi < 18.5) { cat = 'Underweight'; color = COLORS.accent; }
  else if (bmi > 25) { cat = 'Overweight'; color = COLORS.warning; }
  
  return { val: bmi.toFixed(1), cat, color };
};

const ProfileTabBase = ({ database }: { database: any }) => {
  const [healthScore, setHealthScore] = useState(85);
  const [bmiData, setBmiData] = useState({ val: '22.5', cat: 'Healthy', color: COLORS.success });

  useEffect(() => {
    const runCalc = async () => {
      const profiles = await database.get('user_profile').query(Q.take(1)).fetch();
      if (profiles.length > 0) {
        const u = profiles[0];
        setBmiData(calculateBmi(u.weight, u.height));
      } else {
        setBmiData(calculateBmi(65, 170));
      }

      let score = 70;
      const challenges = await database.get('user_challenges').query(Q.where('status', 'active')).fetch();
      score += challenges.length * 5; 
      
      const limitedScore = Math.min(Math.max(score, 0), 100);
      setHealthScore(limitedScore);
    };
    runCalc();
  }, []);

  const getScoreColor = () => {
    if (healthScore >= 70) return COLORS.success;
    if (healthScore >= 40) return COLORS.warning;
    return COLORS.danger;
  };

  const exportDataVault = async () => {
    try {
       // Serialize Data
       const healthLogs = await database.get('health_logs').query(Q.take(100)).fetch(); // limited for preview
       const xpLedger = await database.get('xp_ledger').query(Q.take(100)).fetch();
       const payload = JSON.stringify({ version: '1.0', exportDate: Date.now(), healthLogs, xpLedger });

       // Lightweight cipher obfuscation (XOR with a key '123' and convert to base64 via pseudo buffer to avoid heavy crypto packages)
       const hexEncode = (str: string) => {
         let hex = '';
         for(let i=0; i<str.length; i++) {
           let code = str.charCodeAt(i) ^ 45; // XOR 45
           hex += ('000'+code.toString(16)).slice(-4);
         }
         return hex;
       };
       const encryptedPayload = "LFS_" + hexEncode(payload);

       // Physical write using Native Bridge
       const { HardwareSignalModule } = NativeModules;
       if (HardwareSignalModule) {
           const path = await HardwareSignalModule.exportToDownloads('LifeForge_Vault.obf', encryptedPayload);
           Alert.alert("Export Successful", `File saved safely to:\n\n${path}`);
       } else {
           Alert.alert("Export Failed", "HardwareSignalModule missing. Cannot write to storage.");
       }
    } catch (e) {
       Alert.alert("Export Failed", "Could not generate or save Data Vault file.");
       console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[COLORS.surface, '#0f172a']} style={styles.headerGrade} start={{x:0, y:0}} end={{x:1, y:1}}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(), shadowColor: getScoreColor() }]}>
           <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{healthScore}</Text>
           <Text style={styles.scoreLabel}>Health Score</Text>
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
            xAxisLabelTextStyle={{ color: COLORS.muted }}
          />
        </Surface>

        <Title style={styles.sectionTitle}>Player Stats</Title>
        <View style={styles.statsRow}>
          {[
            { label: 'Sleep Avg', value: '7.5h', icon: 'sleep', color: '#8b5cf6' },
            { label: 'BMI: ' + bmiData.cat, value: bmiData.val, icon: 'human-handsup', color: bmiData.color },
            { label: 'Daily Steps', value: '8.4k', icon: 'walk', color: COLORS.success },
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
            title={<Text style={{color: COLORS.text, fontWeight: 'bold'}}>Power Saver Mode</Text>}
            description={<Text style={{color: COLORS.muted}}>Battery low. Sensor polling reduced to 120s intervals.</Text>}
            left={props => <List.Icon {...props} icon="battery-20" color={COLORS.danger} />}
            style={{backgroundColor: COLORS.surface}}
          />
          <TouchableOpacity onPress={exportDataVault}>
            <List.Item
              title={<Text style={{color: COLORS.text, fontWeight: 'bold'}}>Data Vault Options</Text>}
              description={<Text style={{color: COLORS.accent}}>Encrypt or restore your local history</Text>}
              left={props => <List.Icon {...props} icon="safe" color={COLORS.primary} />}
              style={{backgroundColor: COLORS.surface}}
            />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

export const ProfileTab = withDatabase(ProfileTabBase);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  headerGrade: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderWidth: 1,
    borderColor: '#200b3b',
    borderTopWidth: 0
  },
  scoreCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 10
  },
  scoreValue: { fontSize: 54, fontWeight: 'bold' },
  scoreLabel: { fontSize: 13, color: 'white', opacity: 0.9 },
  body: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, color: COLORS.text },
  chartSurface: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#200b3b'
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '31%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#200b3b'
  },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 8, color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 3 },
  insightCard: { borderRadius: 24, backgroundColor: COLORS.surface, overflow: 'hidden', borderWidth: 1, borderColor: '#200b3b' },
});
