import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

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
  danger: '#ff5252',
};

export default function ProfileScreen() {
  const { username, userId, role, logout } = useAuthStore();
  const [tab, setTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/profile');
        setProfile(data);
      } catch {
        setProfile({ username, role });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const p = profile || { username, role };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/profile/password', { newPassword });
      setNewPassword('');
      Alert.alert('✅', 'Şifre güncellendi!');
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Şifre güncellenemedi.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Hesabı Sil',
      'Hesabını kalıcı olarak silmek istediğinden emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/profile');
              logout();
            } catch (err) {
              Alert.alert('Hata', err.response?.data?.message || 'Hesap silinemedi.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const avatarLetter = (p.username || 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Avatar & Kullanıcı Bilgisi */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View>
            <Text style={styles.username}>{p.username || 'Kullanıcı'}</Text>
            <Text style={styles.email}>{p.email || ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {p.role === 'admin' ? '⭐ Admin' : '👤 Kullanıcı'}
              </Text>
            </View>
          </View>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{p.totalScore || 0}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statValue}>{p.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Oyun Sayısı</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{p.correctRate || 0}%</Text>
            <Text style={styles.statLabel}>Doğruluk</Text>
          </View>
        </View>

        {/* Tab Seçici */}
        <View style={styles.tabRow}>
          {['info', 'password', 'danger'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && { color: C.primary }]}>
                {t === 'info' ? '📋 Bilgiler' : t === 'password' ? '🔑 Şifre' : '⚠️ Tehlikeli'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab: Bilgiler */}
        {tab === 'info' && (
          <View style={styles.card}>
            <Text style={styles.formLabel}>Kullanıcı Adı</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{p.username || '-'}</Text>
            </View>
            <Text style={styles.formLabel}>E-posta</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{p.email || '-'}</Text>
            </View>
            <Text style={styles.formLabel}>Rol</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{p.role || 'user'}</Text>
            </View>
            {/* Çıkış Yap */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>🚪 Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab: Şifre */}
        {tab === 'password' && (
          <View style={styles.card}>
            <Text style={styles.formLabel}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 karakter"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, pwLoading && { opacity: 0.6 }]}
              onPress={handlePasswordUpdate}
              disabled={pwLoading}
            >
              {pwLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.primaryBtnText}>🔑 Şifreyi Güncelle</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Tab: Tehlikeli */}
        {tab === 'danger' && (
          <View style={[styles.card, { borderColor: 'rgba(255,82,82,0.3)' }]}>
            <Text style={[styles.formLabel, { color: C.danger, fontSize: 16 }]}>⚠️ Hesap Silme</Text>
            <Text style={styles.dangerText}>
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
              <Text style={styles.dangerBtnText}>🗑️ Hesabımı Kalıcı Olarak Sil</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { padding: 20, paddingBottom: 40 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 30, fontWeight: '900', color: '#fff' },
  username: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 2 },
  email: { fontSize: 13, color: C.muted, marginBottom: 6 },
  roleBadge: { backgroundColor: 'rgba(233,69,96,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.primary },
  roleBadgeText: { color: C.primary, fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600', textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tabBtn: { flex: 1, backgroundColor: C.card, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  tabBtnActive: { borderColor: C.primary, backgroundColor: 'rgba(233,69,96,0.1)' },
  tabText: { color: C.muted, fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  formLabel: { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  disabledInput: { backgroundColor: C.cardAlt, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  disabledText: { color: C.text, fontSize: 14 },
  input: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  primaryBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { backgroundColor: C.cardAlt, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: C.border },
  logoutBtnText: { color: C.muted, fontWeight: '700', fontSize: 14 },
  dangerText: { color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  dangerBtn: { backgroundColor: 'rgba(255,82,82,0.15)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.danger },
  dangerBtnText: { color: C.danger, fontWeight: '700', fontSize: 14 },
});
