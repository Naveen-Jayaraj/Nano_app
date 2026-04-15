import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      gender,
    };
    navigation.navigate('GoalSelection', { profileData });
  };

  const isFormValid = name && age && height && weight;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Welcome to Nano</Title>
      <Text style={styles.subtitle}>Let's set up your profile for a personalized experience.</Text>
      
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />
      
      <TextInput
        label="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />
      
      <TextInput
        label="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.label}>Gender</Text>
      <SegmentedButtons
        value={gender}
        onValueChange={setGender}
        buttons={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ]}
        style={styles.segmented}
      />

      <Button
        mode="contained"
        onPress={handleNext}
        disabled={!isFormValid}
        style={styles.button}
      >
        Next
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 30, color: 'gray' },
  input: { marginBottom: 15 },
  label: { marginBottom: 8, fontSize: 16, fontWeight: '500' },
  segmented: { marginBottom: 30 },
  button: { marginTop: 10, paddingVertical: 5 },
});
