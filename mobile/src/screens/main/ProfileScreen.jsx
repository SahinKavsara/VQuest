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
  Modal,
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

  // Soru önerisi için state'ler
  const [categories, setCategories] = useState([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    category: ''
  });

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

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
        if (data.length > 0) {
          setSuggestForm(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (err) {
        console.warn('[ProfileScreen] Kategoriler yüklenemedi:', err);
      }
    };

    fetchProfile();
    fetchCategories();
  }, []);

  const p = profile || { username, role };

  const handleSuggestSubmit = async () => {
    if (!suggestForm.questionText.trim()) {
      Alert.alert('Hata', 'Soru metni zorunludur.');
      return;
    }
    if (suggestForm.options.some(opt => !opt.trim())) {
      Alert.alert('Hata', 'Lütfen tüm şıkları doldurun.');
      return;
    }
    if (!suggestForm.correctAnswer) {
      Alert.alert('Hata', 'Lütfen doğru cevabı seçin.');
      return;
    }
    setSuggestLoading(true);
    try {
      await api.post('/suggestions', {
        questionText: suggestForm.questionText.trim(),
        options: suggestForm.options.map(o => o.trim()),
        correctAnswer: suggestForm.correctAnswer.trim(),
        category: suggestForm.category || undefined
      });
      Alert.alert('✅ Başarılı', 'Soru öneriniz yönetici onayına gönderildi!');
      setSuggestForm({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: categories[0]?._id || ''
      });
      setShowSuggestModal(false);
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Soru önerisi gönderilemedi.');
    } finally {
      setSuggestLoading(false);
    }
  };

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
            <Text style={styles.statValue}>{p.score || 0}</Text>
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

            {/* Soru Önerisi Yap */}
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12, backgroundColor: C.accent }]} onPress={() => setShowSuggestModal(true)}>
              <Text style={[styles.primaryBtnText, { color: C.cardAlt }]}>💡 Soru Önerisi Yap</Text>
            </TouchableOpacity>

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

        {/* Soru Önerisi Modal */}
        <Modal visible={showSuggestModal} animationType="slide" transparent onRequestClose={() => setShowSuggestModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💡 Yeni Soru Öner</Text>
                <TouchableOpacity onPress={() => setShowSuggestModal(false)}>
                  <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>Soru Metni</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Sorulacak soruyu buraya yazın..."
                  placeholderTextColor={C.muted}
                  multiline
                  value={suggestForm.questionText}
                  onChangeText={v => setSuggestForm(f => ({ ...f, questionText: v }))}
                />

                <Text style={styles.formLabel}>Kategori Seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} keyboardShouldPersistTaps="handled">
                  {categories.map(c => (
                    <TouchableOpacity
                      key={c._id}
                      style={[styles.chipBtn, suggestForm.category === c._id && styles.chipBtnActive]}
                      onPress={() => setSuggestForm(f => ({ ...f, category: c._id }))}
                    >
                      <Text style={[styles.chipText, suggestForm.category === c._id && { color: C.primary }]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Şıklar ve Doğru Cevap (Seçmek için harfe tıklayın)</Text>
                {suggestForm.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isCorrect = suggestForm.correctAnswer === opt && opt !== '';
                  return (
                    <View key={oIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                      <TouchableOpacity
                        style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isCorrect ? 'rgba(34,197,94,0.15)' : C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: isCorrect ? C.success : C.border }}
                        onPress={() => {
                          if (opt.trim()) {
                            setSuggestForm(f => ({ ...f, correctAnswer: opt }));
                          } else {
                            Alert.alert('Hata', 'Lütfen önce bu şıkka ait bir içerik yazın.');
                          }
                        }}
                      >
                        <Text style={{ color: isCorrect ? C.success : C.muted, fontWeight: '800', fontSize: 14 }}>
                          {isCorrect ? `✅ ${letter}` : letter}
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder={`Şık ${letter} seçeneği...`}
                        placeholderTextColor={C.muted}
                        value={opt}
                        onChangeText={v => {
                          const nq = [...suggestForm.options];
                          if (suggestForm.correctAnswer === nq[oIdx]) {
                            setSuggestForm(f => ({ ...f, correctAnswer: v }));
                          }
                          nq[oIdx] = v;
                          setSuggestForm(f => ({ ...f, options: nq }));
                        }}
                      />
                    </View>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSuggestModal(false)}>
                    <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, suggestLoading && { opacity: 0.6 }]}
                    onPress={handleSuggestSubmit}
                    disabled={suggestLoading}
                  >
                    {suggestLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Öneriyi Gönder</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
  // Suggestion Modal Stilleri
  chipBtn: { backgroundColor: C.cardAlt, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
  chipBtnActive: { borderColor: C.primary, backgroundColor: 'rgba(233,69,96,0.1)' },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
