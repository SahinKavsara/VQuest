import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

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
  warning: '#f59e0b',
  purple: '#6c47ff',
};

function StatCard({ emoji, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdminMenuItem({ emoji, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
      <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const { username } = useAuthStore();
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, roomsRes, questionsRes] = await Promise.all([
          api.get('/admin/users').then(r => r.data).catch(() => []),
          api.get('/rooms').then(r => r.data).catch(() => []),
          api.get('/questions').then(r => r.data).catch(() => []),
        ]);
        setStats({
          users: Array.isArray(usersRes) ? usersRes.length : 0,
          rooms: Array.isArray(roomsRes) ? roomsRes.length : 0,
          questions: Array.isArray(questionsRes) ? questionsRes.length : 0,
        });
      } catch {
        setStats({ users: 0, rooms: 0, questions: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hoşgeldin,</Text>
          <Text style={styles.adminName}>{username} 🛡️</Text>
          <Text style={styles.headerSub}>Admin Paneli</Text>
        </View>

        {/* İstatistik Kartları */}
        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard emoji="👥" value={stats?.users || 0} label="Kullanıcı" color={C.accent} />
            <StatCard emoji="🎮" value={stats?.rooms || 0} label="Oda" color={C.primary} />
            <StatCard emoji="❓" value={stats?.questions || 0} label="Soru" color={C.warning} />
          </View>
        )}

        {/* Menü */}
        <Text style={styles.sectionTitle}>Yönetim</Text>
        <View style={styles.menuBox}>
          <AdminMenuItem
            emoji="📦"
            title="Soru Paketleri"
            subtitle="Paketleri listele, oluştur ve yönet"
            onPress={() => navigation.navigate('Packages')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="❓"
            title="Sorular"
            subtitle="Tüm soruları görüntüle"
            onPress={() => Alert.alert('Bilgi', 'Web admin panelinden yönetebilirsiniz.')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="👥"
            title="Kullanıcılar"
            subtitle="Kullanıcı listesi ve yönetimi"
            onPress={() => Alert.alert('Bilgi', 'Web admin panelinden yönetebilirsiniz.')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="🔔"
            title="Bildirim Gönder"
            subtitle="Tüm kullanıcılara duyuru yap"
            onPress={() => Alert.alert('Bilgi', 'Web admin panelinden bildirim gönderebilirsiniz.')}
          />
        </View>

        {/* Hızlı İşlemler */}
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { borderColor: C.accent }]} onPress={() => navigation.navigate('Packages')}>
            <Text style={styles.quickBtnEmoji}>📦</Text>
            <Text style={[styles.quickBtnText, { color: C.accent }]}>Paketler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { borderColor: C.primary }]}
            onPress={() => Alert.alert('Bilgi', 'Web üzerinde http://localhost:8081 adresindeki Jenkins panelini kullanabilirsiniz.')}
          >
            <Text style={styles.quickBtnEmoji}>🔧</Text>
            <Text style={[styles.quickBtnText, { color: C.primary }]}>Jenkins</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  welcomeText: { fontSize: 14, color: C.muted, fontWeight: '600' },
  adminName: { fontSize: 28, fontWeight: '900', color: C.text, marginBottom: 2 },
  headerSub: { fontSize: 13, color: C.primary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  menuBox: { backgroundColor: C.card, borderRadius: 16, marginBottom: 28, borderWidth: 1, borderColor: C.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemEmoji: { fontSize: 24, width: 32 },
  menuItemTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  menuItemSubtitle: { fontSize: 12, color: C.muted },
  menuDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1 },
  quickBtnEmoji: { fontSize: 28, marginBottom: 8 },
  quickBtnText: { fontSize: 13, fontWeight: '800' },
});
