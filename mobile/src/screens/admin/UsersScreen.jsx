import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const C = {
  bg: '#1a1a2e',
  card: '#16213e',
  primary: '#e94560',
  accent: '#00e5ff',
  border: '#0f3460',
  text: '#e8eaf6',
  muted: '#888',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

export default function UsersScreen({ navigation }) {
  const { role } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[UsersScreen] fetch hatası:', error.message);
      Alert.alert('Hata', 'Kullanıcılar alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user) => {
    const actionText = user.isBlocked ? 'Engelini kaldırmak' : 'Engellemek';
    Alert.alert('Onay', `Bu kullanıcının ${actionText.toLowerCase()} istiyor musun?\n(${user.username})`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet',
        style: user.isBlocked ? 'default' : 'destructive',
        onPress: async () => {
          try {
            const { data } = await api.put(`/admin/users/${user._id}/block`);
            // Update local state
            setUsers((prev) =>
              prev.map((u) => (u._id === user._id ? { ...u, isBlocked: data.isBlocked ?? !u.isBlocked } : u))
            );
          } catch (err) {
            Alert.alert('Hata', 'İşlem başarısız oldu.');
          }
        },
      },
    ]);
  };

  const handleDelete = (userId, username) => {
    Alert.alert('Kalıcı Silme', `Kullanıcıyı (${username}) tamamen silmek istediğine emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
          } catch (err) {
            Alert.alert('Hata', 'Kullanıcı silinemedi.');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }) => (
    <View style={[styles.userCard, item.isBlocked && { borderColor: C.danger, opacity: 0.8 }]}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.username} {item.role === 'admin' ? '🛡️' : ''}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userScore}>Skor: {item.score}</Text>
        {item.isBlocked && <Text style={styles.blockedText}>Engellendi</Text>}
      </View>

      {item.role !== 'admin' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: item.isBlocked ? C.success : C.warning }]}
            onPress={() => handleToggleBlock(item)}
          >
            <Text style={styles.actionBtnText}>{item.isBlocked ? 'Aç' : 'Engelle'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.danger }]}
            onPress={() => handleDelete(item._id, item.username)}
          >
            <Text style={styles.actionBtnText}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
          <Text style={{ color: C.muted, fontSize: 28 }}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>👥 Kullanıcılar</Text>
          <Text style={styles.headerSub}>Sistemdeki tüm kullanıcıları yönet</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={renderUser}
          refreshing={loading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Kullanıcı Bulunamadı</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: C.muted, marginBottom: 4 },
  userScore: { fontSize: 13, color: C.accent, fontWeight: '600' },
  blockedText: { fontSize: 12, color: C.danger, fontWeight: '700', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text },
});
