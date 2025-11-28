import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StudentsScreen() {
  // You can later fetch student data from your backend
  const students = [
    { name: 'Aditi', roll: 1 },
    { name: 'Krish', roll: 2 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students List</Text>
      {students.map((s) => (
        <Text key={s.roll}>{s.name}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
});
