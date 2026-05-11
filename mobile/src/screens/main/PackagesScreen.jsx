import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PackagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Paketler</Text>
      <Text style={styles.subtitle}>Soru paketleri burada listelenecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 28, fontWeight: '800', color: '#e94560', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888' },
});
