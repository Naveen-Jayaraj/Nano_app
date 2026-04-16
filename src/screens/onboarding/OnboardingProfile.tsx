import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export const OnboardingProfile = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('other');

  const handleNext = () => {
    const profileData = {
      name,
      age: parseInt(age, 10),
      height: parseFloat(height),
      weight: parseFloat(weight),
      gender,
    };
    navigation.navigate('GoalSelection', { profileData });
  };

  const isFormValid = name && age && height && weight;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Welcome to LifeForge</Title>
      <Text style={styles.subtitle}>Let's set up your profile for a personalized experience.</Text>
      
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        textColor="#fff"
        theme={{ colors: { onSurfaceVariant: '#94a3b8', background: '#1e293b', primary: '#38bdf8' } }}
      />
      
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        textColor="#fff"
        theme={{ colors: { onSurfaceVariant: '#94a3b8', background: '#1e293b', primary: '#38bdf8' } }}
      />
      
      <TextInput
        label="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        textColor="#fff"
        theme={{ colors: { onSurfaceVariant: '#94a3b8', background: '#1e293b', primary: '#38bdf8' } }}
      />
      
      <TextInput
        label="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        textColor="#fff"
        theme={{ colors: { onSurfaceVariant: '#94a3b8', background: '#1e293b', primary: '#38bdf8' } }}
      />

      <Text style={styles.label}>Gender</Text>
      <SegmentedButtons
        value={gender}
        onValueChange={setGender}
        buttons={[
          { value: 'male', label: 'Male', checkedColor: '#fff', uncheckedColor: '#94a3b8' },
          { value: 'female', label: 'Female', checkedColor: '#fff', uncheckedColor: '#94a3b8' },
          { value: 'other', label: 'Other', checkedColor: '#fff', uncheckedColor: '#94a3b8' },
        ]}
        style={styles.segmented}
        theme={{ colors: { secondaryContainer: '#38bdf8', outline: '#38bdf8' } }}
      />

      <Button
        mode="contained"
        onPress={handleNext}
        disabled={!isFormValid}
        style={styles.button}
        buttonColor="#8b5cf6"
      >
        Embark on Quest
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center', backgroundColor: '#0a0f1e' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#fff' },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#94a3b8' },
  input: { marginBottom: 15 },
  label: { marginBottom: 8, fontSize: 16, fontWeight: '500', color: '#e2e8f0' },
  segmented: { marginBottom: 30 },
  button: { marginTop: 10, paddingVertical: 5 },
});
