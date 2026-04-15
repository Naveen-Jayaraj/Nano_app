import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{name} Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#333' },
});
