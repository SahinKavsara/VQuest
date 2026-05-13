import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../services/api';

const C = {
  bg: '#1a1a2e',
  card: '#16213e',
  cardAlt: '#0f1630',
  primary: '#e94560',
  accent: '#00e5ff',
  border: '#0f3460',
  text: '#e8eaf6',
  muted: '#888',
  success: '#22c55e',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      Alert.alert('Hata', 'İşlem başarısız');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      Alert.alert('Hata', 'İşlem başarısız');
    }
  };

  const deleteNotif = (id) => {
    Alert.alert('Onayla', 'Bu bildirim silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
          } catch {
            Alert.alert('Hata', 'Bildirim silinemedi');
          }
        },
      },
    ]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderItem = ({ item }) => (
    <View style={[styles.notifCard, !item.isRead && styles.notifUnread]}>
      {!item.isRead && <View style={styles.unreadDot} />}
      <View style={{ flex: 1, marginLeft: item.isRead ? 0 : 10 }}>
        <Text style={styles.notifMessage}>{item.message}</Text>
        {item.createdAt && (
          <Text style={styles.notifDate}>
            {new Date(item.createdAt).toLocaleString('tr-TR')}
          </Text>
        )}
      </View>
      <View style={styles.notifActions}>
        {!item.isRead && (
          <TouchableOpacity style={styles.readBtn} onPress={() => markRead(item._id)}>
            <Text style={{ color: C.success, fontSize: 14, fontWeight: '700' }}>✓</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.delBtn} onPress={() => deleteNotif(item._id)}>
          <Text style={{ color: C.primary, fontSize: 14 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔔 Bildirimler</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>✓ Tümünü Okundu</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔕</Text>
              <Text style={styles.emptyTitle}>Burası şimdilik sessiz</Text>
              <Text style={styles.emptyText}>
                Sistem yöneticilerinden yeni bir bildirim geldiğinde burada görünecek.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  markAllBtn: { backgroundColor: C.cardAlt, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  markAllText: { color: C.accent, fontSize: 12, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notifCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  notifUnread: {
    borderColor: 'rgba(0,229,255,0.3)',
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    flexShrink: 0,
  },
  notifMessage: { color: C.text, fontSize: 14, fontWeight: '500', marginBottom: 4, lineHeight: 20 },
  notifDate: { color: C.muted, fontSize: 11 },
  notifActions: { flexDirection: 'row', gap: 6, flexShrink: 0, marginLeft: 10 },
  readBtn: { padding: 8, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 8 },
  delBtn: { padding: 8, backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 8 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
});
