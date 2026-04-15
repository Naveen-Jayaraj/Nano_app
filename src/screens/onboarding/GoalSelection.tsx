import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, Title, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database } from '../../data/database';
import { calculateBMI, deriveBaselines } from '../../utils/healthUtils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, GRADIENTS } from '../../utils/theme';
import LinearGradient from 'react-native-linear-gradient';

const GOALS = [
  { id: 'sleep', label: 'Sleep Tracking', icon: 'sleep' },
  { id: 'water', label: 'Hydration', icon: 'water' },
  { id: 'mobile', label: 'Mobile Usage', icon: 'cellphone-off' },
  { id: 'exercise', label: 'Exercise', icon: 'run' },
  { id: 'social', label: 'Social Life', icon: 'account-group' },
  { id: 'steps', label: 'Step Count', icon: 'walk' },
  { id: 'mood', label: 'Mood Track', icon: 'emoticon-happy-outline' },
  { id: 'stress', label: 'Stress Level', icon: 'brain' },
];

export const GoalSelection = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profileData } = route.params;

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    try {
      const bmi = calculateBMI(profileData.weight, profileData.height);
      const baselines = deriveBaselines(profileData.age, profileData.weight, bmi);

      await database.write(async () => {
        await database.get('user_profile').create((profile: any) => {
          profile.name = profileData.name;
          profile.age = profileData.age;
          profile.height = profileData.height;
          profile.weight = profileData.weight;
          profile.gender = profileData.gender;
          profile.bmi = bmi;
          profile.goals = JSON.stringify(selectedGoals);
          profile.baselines = JSON.stringify(baselines);
        });
      });

      navigation.replace('Main');
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  };

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Your Wellness Focus</Title>
        <Text style={styles.subtitle}>Select the core goals you want to track. We'll optimize your dashboard based on these.</Text>
        
        <View style={styles.grid}>
          {GOALS.map(goal => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity 
                key={goal.id} 
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
                style={styles.cardWrapper}
              >
                <Surface style={[styles.goalCard, isSelected && styles.selectedCard]} elevation={isSelected ? 4 : 1}>
                   {isSelected && (
                     <View style={styles.tickContainer}>
                        <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
                     </View>
                   )}
                   <MaterialCommunityIcons 
                    name={goal.icon} 
                    size={32} 
                    color={isSelected ? COLORS.primary : COLORS.muted} 
                   />
                   <Text style={[styles.goalLabel, isSelected && styles.selectedText]}>{goal.label}</Text>
                </Surface>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={handleFinish} 
          disabled={selectedGoals.length === 0}
          style={styles.finishBtnContainer}
        >
           <LinearGradient 
              colors={selectedGoals.length > 0 ? GRADIENTS.primary : ['#e2e8f0', '#cbd5e1']}
              style={styles.finishBtn}
              start={{x:0, y:0}} end={{x:1, y:1}}
            >
              <Text style={styles.finishText}>START MY JOURNEY</Text>
           </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 25, paddingBottom: 50 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: COLORS.text },
  subtitle: { textAlign: 'center', marginBottom: 30, color: COLORS.muted, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '47%', marginBottom: 15 },
  goalCard: { 
    height: 120, 
    borderRadius: 24, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedCard: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  tickContainer: { position: 'absolute', top: 10, right: 10 },
  goalLabel: { marginTop: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center', fontSize: 13 },
  selectedText: { color: COLORS.primary },
  finishBtnContainer: { marginTop: 20, borderRadius: 20, overflow: 'hidden' },
  finishBtn: { padding: 20, alignItems: 'center' },
  finishText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});
