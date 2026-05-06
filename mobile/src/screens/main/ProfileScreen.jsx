import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useAuthStore from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { username, role, score, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.avatar}>👤</Text>
      <Text style={styles.username}>{username ?? 'Kullanıcı'}</Text>
      <Text style={styles.role}>{role === 'admin' ? '🛡️ Admin' : '🎮 Oyuncu'}</Text>
      <Text style={styles.score}>Toplam Puan: {score}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 24 },
  avatar: { fontSize: 64, marginBottom: 16 },
  username: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  role: { fontSize: 14, color: '#888', marginBottom: 8 },
  score: { fontSize: 16, color: '#e94560', fontWeight: '700', marginBottom: 40 },
  logoutBtn: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 40, paddingVertical: 14 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
