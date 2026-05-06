import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Ana Sayfa</Text>
      <Text style={styles.subtitle}>Açık oyun odaları burada listelenecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 28, fontWeight: '800', color: '#e94560', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888' },
});
