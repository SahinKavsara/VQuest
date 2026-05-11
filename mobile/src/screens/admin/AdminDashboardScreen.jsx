import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Admin Paneli</Text>
      <Text style={styles.subtitle}>Kullanıcı ve oda yönetimi burada olacak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 28, fontWeight: '800', color: '#e94560', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888' },
});
