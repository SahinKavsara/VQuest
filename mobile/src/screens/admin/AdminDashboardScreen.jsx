import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  // Yapay Zeka Promptu State'leri
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [fetchingPrompt, setFetchingPrompt] = useState(false);
  const [updatingPrompt, setUpdatingPrompt] = useState(false);

  // Soru Önerileri State'leri
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [rejectingSuggestions, setRejectingSuggestions] = useState({});
  const [approvingSuggestions, setApprovingSuggestions] = useState({});

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

  const handleSendNotification = async () => {
    if (!notifMessage.trim()) {
      Alert.alert('Hata', 'Lütfen bir mesaj yazın.');
      return;
    }
    setSendingNotif(true);
    try {
      await api.post('/admin/notifications', { message: notifMessage });
      setShowNotifModal(false);
      setNotifMessage('');
      Alert.alert('Başarılı', 'Bildirim tüm kullanıcılara gönderildi.');
    } catch (err) {
      Alert.alert('Hata', 'Bildirim gönderilemedi.');
    } finally {
      setSendingNotif(false);
    }
  };

  const openPromptEditor = async () => {
    setShowPromptModal(true);
    setFetchingPrompt(true);
    try {
      const { data } = await api.get('/admin/ai/prompt');
      setAiPromptText(data.promptText || '');
    } catch {
      Alert.alert('Hata', 'Mevcut prompt yüklenemedi.');
    } finally {
      setFetchingPrompt(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!aiPromptText.trim()) {
      Alert.alert('Hata', 'Prompt alanı boş bırakılamaz.');
      return;
    }
    setUpdatingPrompt(true);
    try {
      await api.put('/admin/ai/prompt', { promptText: aiPromptText.trim() });
      setShowPromptModal(false);
      Alert.alert('✅ Başarılı', 'Yapay zeka promptu güncellendi.');
    } catch {
      Alert.alert('Hata', 'Prompt güncellenemedi.');
    } finally {
      setUpdatingPrompt(false);
    }
  };

  const openSuggestionsManager = async () => {
    setShowSuggestionsModal(true);
    setFetchingSuggestions(true);
    try {
      const { data } = await api.get('/admin/suggestions');
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Hata', 'Soru önerileri listesi alınamadı.');
    } finally {
      setFetchingSuggestions(false);
    }
  };

  const handleApproveSuggestion = async (id) => {
    const item = suggestions.find(s => s._id === id);
    if (!item) return;
    Alert.alert('Onayla', 'Bu soru önerisini kabul edip soru havuzuna eklemek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: async () => {
          setApprovingSuggestions(prev => ({ ...prev, [id]: true }));
          try {
            // Öneriyi soru havuzuna ekle
            await api.post('/admin/questions', {
              text: item.questionText,
              options: item.options,
              correctAnswer: item.correctAnswer,
              category: item.category?.name || item.category || 'Genel Kültür'
            });
            // Öneriyi sil
            await api.delete(`/admin/suggestions/${id}`);
            setSuggestions(prev => prev.filter(s => s._id !== id));
            Alert.alert('✅ Başarılı', 'Öneri kabul edildi ve soru havuzuna eklendi!');
          } catch {
            Alert.alert('Hata', 'Öneri onaylanamadı.');
          } finally {
            setApprovingSuggestions(prev => ({ ...prev, [id]: false }));
          }
        }
      }
    ]);
  };

  const handleRejectSuggestion = async (id) => {
    Alert.alert('Onayla', 'Bu soru önerisini reddetmek ve silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Reddet / Sil', style: 'destructive',
        onPress: async () => {
          setRejectingSuggestions(prev => ({ ...prev, [id]: true }));
          try {
            await api.delete(`/admin/suggestions/${id}`);
            setSuggestions(prev => prev.filter(s => s._id !== id));
            Alert.alert('✅ Başarılı', 'Öneri reddedildi ve silindi.');
          } catch {
            Alert.alert('Hata', 'Öneri silinemedi.');
          } finally {
            setRejectingSuggestions(prev => ({ ...prev, [id]: false }));
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

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
            emoji="🏷️"
            title="Kategoriler"
            subtitle="Soru kategorilerini listele, oluştur ve yönet"
            onPress={() => navigation.navigate('Categories')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="❓"
            title="Sorular"
            subtitle="Tüm soruları görüntüle"
            onPress={() => navigation.navigate('Questions')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="👥"
            title="Kullanıcılar"
            subtitle="Kullanıcı listesi ve yönetimi"
            onPress={() => navigation.navigate('Users')}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="🔔"
            title="Bildirim Gönder"
            subtitle="Tüm kullanıcılara duyuru yap"
            onPress={() => setShowNotifModal(true)}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="🤖"
            title="Yapay Zeka Komutu"
            subtitle="AI promptunu ve analiz kriterlerini düzenle"
            onPress={openPromptEditor}
          />
          <View style={styles.menuDivider} />
          <AdminMenuItem
            emoji="💡"
            title="Soru Önerileri"
            subtitle="Kullanıcıların soru önerilerini yönet"
            onPress={openSuggestionsManager}
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

      {/* Bildirim Gönder Modal */}
      <Modal visible={showNotifModal} animationType="slide" transparent onRequestClose={() => setShowNotifModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Bildirim Gönder</Text>
              <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>Duyuru Mesajı</Text>
              <TextInput
                style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Kullanıcılara iletilecek mesajı yazın..."
                placeholderTextColor={C.muted}
                multiline
                value={notifMessage}
                onChangeText={setNotifMessage}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNotifModal(false)}>
                  <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, sendingNotif && { opacity: 0.6 }]}
                  onPress={handleSendNotification}
                  disabled={sendingNotif}
                >
                  {sendingNotif ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Gönder</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Yapay Zeka Promptu Modal */}
      <Modal visible={showPromptModal} animationType="slide" transparent onRequestClose={() => setShowPromptModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 Yapay Zeka Promptunu Düzenle</Text>
              <TouchableOpacity onPress={() => setShowPromptModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {fetchingPrompt ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={{ color: C.muted, marginTop: 12 }}>Prompt yükleniyor...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>Sistem Promptu</Text>
                <TextInput
                  style={[styles.formInput, { height: 180, textAlignVertical: 'top' }]}
                  placeholder="Yapay zekanın analiz yaparken kullanacağı temel prompt talimatını girin..."
                  placeholderTextColor={C.muted}
                  multiline
                  value={aiPromptText}
                  onChangeText={setAiPromptText}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPromptModal(false)}>
                    <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, updatingPrompt && { opacity: 0.6 }]}
                    onPress={handleUpdatePrompt}
                    disabled={updatingPrompt}
                  >
                    {updatingPrompt ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Kaydet</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Soru Önerileri Modal */}
      <Modal visible={showSuggestionsModal} animationType="slide" transparent onRequestClose={() => setShowSuggestionsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💡 Soru Önerileri ({suggestions.length})</Text>
              <TouchableOpacity onPress={() => setShowSuggestionsModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {fetchingSuggestions ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={{ color: C.muted, marginTop: 12 }}>Öneriler yükleniyor...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {suggestions.length === 0 ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 48, marginBottom: 12 }}>💡</Text>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>Soru önerisi bulunmuyor</Text>
                    <Text style={{ color: C.muted, textAlign: 'center', marginTop: 4 }}>Kullanıcıların yeni soru önerileri burada listelenir.</Text>
                  </View>
                ) : (
                  suggestions.map((item) => (
                    <View key={item._id} style={styles.suggestionCard}>
                      <View style={styles.suggestionHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionUser}>👤 Gönderen: {item.user?.username || 'Bilinmeyen'}</Text>
                          <Text style={styles.suggestionCategory}>🏷️ Kategori: {item.category?.name || 'Genel'}</Text>
                        </View>
                      </View>
                      <View style={styles.suggestionBody}>
                        <Text style={styles.suggestionText}>{item.questionText}</Text>
                        
                        <View style={styles.suggestionOptions}>
                          {item.options?.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isCorrect = item.correctAnswer === opt;
                            return (
                              <View key={oIdx} style={[styles.suggestionOptionRow, isCorrect && styles.suggestionOptionRowCorrect]}>
                                <Text style={[styles.suggestionOptionLetter, { color: isCorrect ? C.success : C.muted }]}>{letter})</Text>
                                <Text style={[styles.suggestionOptionText, isCorrect && { color: C.success }]}>{opt}</Text>
                              </View>
                            );
                          })}
                        </View>

                        {/* Onayla / Reddet Butonları */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                          <TouchableOpacity
                            style={styles.suggestionApproveBtn}
                            onPress={() => handleApproveSuggestion(item._id)}
                            disabled={!!approvingSuggestions[item._id]}
                          >
                            {approvingSuggestions[item._id] ? (
                              <ActivityIndicator size="small" color={C.success} />
                            ) : (
                              <Text style={{ color: C.success, fontSize: 12, fontWeight: '700' }}>✅ Onayla</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.suggestionRejectBtn}
                            onPress={() => handleRejectSuggestion(item._id)}
                            disabled={!!rejectingSuggestions[item._id]}
                          >
                            {rejectingSuggestions[item._id] ? (
                              <ActivityIndicator size="small" color={C.primary} />
                            ) : (
                              <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }}>🗑️ Reddet</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 12, color: C.muted, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  formInput: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Soru Önerileri Stilleri
  suggestionCard: { backgroundColor: C.cardAlt, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 8, marginBottom: 8 },
  suggestionUser: { color: C.text, fontSize: 13, fontWeight: '700' },
  suggestionCategory: { color: C.accent, fontSize: 11, fontWeight: '600', marginTop: 2 },
  suggestionApproveBtn: { flex: 1, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', alignItems: 'center' },
  suggestionRejectBtn: { flex: 1, backgroundColor: 'rgba(233,69,96,0.1)', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(233,69,96,0.2)', alignItems: 'center' },
  suggestionBody: { gap: 8 },
  suggestionText: { color: C.text, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  suggestionOptions: { gap: 6, marginTop: 4 },
  suggestionOptionRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, gap: 8 },
  suggestionOptionRowCorrect: { borderColor: C.success, backgroundColor: 'rgba(34,197,94,0.08)' },
  suggestionOptionLetter: { fontWeight: '800', fontSize: 12 },
  suggestionOptionText: { color: C.text, fontSize: 13, fontWeight: '600' },
});
