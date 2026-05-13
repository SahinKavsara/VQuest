import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../services/api';

// ── Renk Paleti ───────────────────────────────────────────────────────────────
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
};

// ── Oda Kartı ─────────────────────────────────────────────────────────────────
function RoomCard({ room, onJoin }) {
  const isFull = (room.participants?.length || 0) >= room.maxParticipants;
  const isStarted = room.isStarted;
  const disabled = isStarted || isFull;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
        <View style={[styles.badge, isStarted ? styles.badgeWarning : styles.badgeSuccess]}>
          <Text style={styles.badgeText}>{isStarted ? 'Oynanıyor' : 'Bekliyor'}</Text>
        </View>
      </View>

      <View style={styles.cardTags}>
        <View style={[styles.badge, styles.badgeInfo]}>
          <Text style={styles.badgeText}>{room.category || 'Genel'}</Text>
        </View>
        <View style={[styles.badge, styles.badgePrimary]}>
          <Text style={styles.badgeText}>
            👥 {room.participants?.length || 0}/{room.maxParticipants}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={() => onJoin(room._id)}
        disabled={disabled}
      >
        <Text style={styles.btnText}>
          {isStarted ? 'Devam Ediyor' : isFull ? 'Dolu' : 'Katıl →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Ana Bileşen: HomeScreen (Lobi) ────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinCodeLoading, setJoinCodeLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    packageId: '',
    maxParticipants: 10,
    duration: 30,
    isPublic: true,
    sourceType: 'ready',
    newQuestions: [],
  });
  const [creating, setCreating] = useState(false);

  // ── Veri Yükle ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [rRes, cRes, pRes] = await Promise.all([
        api.get('/rooms').then(r => r.data).catch(() => []),
        api.get('/categories').then(r => r.data).catch(() => []),
        api.get('/packages').then(r => r.data).catch(() => []),
      ]);

      setRooms(Array.isArray(rRes) ? rRes : []);

      const cats = Array.isArray(cRes) ? cRes : [];
      setCategories(cats);

      const catNames = cats.map(c => c.name);
      const filteredPkgs = Array.isArray(pRes)
        ? pRes.filter(pkg =>
            Array.isArray(pkg.questions) &&
            pkg.questions.some(q => {
              const cat = typeof q === 'object' ? q.category : null;
              return cat && catNames.includes(cat);
            })
          )
        : [];
      setPackages(filteredPkgs);

      if (cats.length > 0 && !form.category && !form.packageId) {
        setForm(f => ({ ...f, category: cats[0].name }));
      }
    } catch (err) {
      console.error('[HomeScreen] fetchData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Pull to Refresh ──────────────────────────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── Odaya Katıl ─────────────────────────────────────────────────────────────
  const joinRoom = (roomId) => {
    navigation.navigate('GameRoom', { roomId });
  };

  // ── Kod ile Katıl ───────────────────────────────────────────────────────────
  const handleJoinByCode = async () => {
    if (!joinCodeInput.trim()) return;
    setJoinCodeLoading(true);
    try {
      const { data } = await api.post('/rooms/join-code', { code: joinCodeInput.trim().toUpperCase() });
      setJoinCodeInput('');
      navigation.navigate('GameRoom', { roomId: data._id });
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Geçersiz kod');
    } finally {
      setJoinCodeLoading(false);
    }
  };

  // ── Oda Oluştur ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name.trim()) {
      Alert.alert('Hata', 'Oda adı zorunludur.');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post('/rooms', form);
      setShowModal(false);
      setForm({ name: '', category: categories[0]?.name || '', packageId: '', maxParticipants: 10, duration: 30, isPublic: true, sourceType: 'ready', newQuestions: [] });
      navigation.navigate('GameRoom', { roomId: data._id });
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Oda oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  // ── Özel Soru ────────────────────────────────────────────────────────────────
  const addCustomQuestion = () => {
    setForm(prev => ({
      ...prev,
      newQuestions: [...prev.newQuestions, { text: '', options: ['', '', '', ''], correctAnswer: '' }],
    }));
  };

  const removeCustomQuestion = (idx) => {
    setForm(prev => ({ ...prev, newQuestions: prev.newQuestions.filter((_, i) => i !== idx) }));
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎮 Oyun Lobisi</Text>
          <Text style={styles.headerSub}>Aktif odalara katıl veya kendi odanı kur</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.createBtnText}>➕ Oda Kur</Text>
        </TouchableOpacity>
      </View>

      {/* Kod ile Katıl */}
      <View style={styles.joinCodeRow}>
        <TextInput
          style={styles.joinCodeInput}
          placeholder="📌 Oda Kodu"
          placeholderTextColor={C.muted}
          value={joinCodeInput}
          onChangeText={setJoinCodeInput}
          autoCapitalize="characters"
          maxLength={8}
        />
        <TouchableOpacity
          style={[styles.joinCodeBtn, joinCodeLoading && { opacity: 0.6 }]}
          onPress={handleJoinByCode}
          disabled={joinCodeLoading}
        >
          {joinCodeLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.joinCodeBtnText}>Katıl</Text>}
        </TouchableOpacity>
      </View>

      {/* Oda Listesi */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.muteText, { marginTop: 12 }]}>Odalar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RoomCard room={item} onJoin={joinRoom} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={styles.emptyTitle}>Aktif oda yok</Text>
              <Text style={styles.emptyText}>İlk odayı sen kur ve arkadaşlarını davet et!</Text>
            </View>
          }
        />
      )}

      {/* Oda Oluşturma Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Oda Kur</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Oda Adı */}
              <Text style={styles.formLabel}>Oda Adı</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Oda adı girin..."
                placeholderTextColor={C.muted}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />

              {/* Soru Kaynağı Seçimi */}
              <Text style={styles.formLabel}>Soru Kaynağı</Text>
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, form.sourceType === 'ready' && styles.tabBtnActive]}
                  onPress={() => setForm(f => ({ ...f, sourceType: 'ready', newQuestions: [] }))}
                >
                  <Text style={[styles.tabBtnText, form.sourceType === 'ready' && { color: C.primary }]}>
                    📚 Hazır Paket
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, form.sourceType === 'custom' && styles.tabBtnActive]}
                  onPress={() => setForm(f => ({ ...f, sourceType: 'custom', packageId: '' }))}
                >
                  <Text style={[styles.tabBtnText, form.sourceType === 'custom' && { color: C.primary }]}>
                    ✍️ Özel Soru
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Kategori / Paket Seçimi */}
              {form.sourceType === 'ready' && (
                <View>
                  <Text style={styles.formLabel}>Kategori Seç</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {categories.map(c => (
                      <TouchableOpacity
                        key={c._id}
                        style={[styles.chipBtn, form.category === c.name && form.packageId === '' && styles.chipBtnActive]}
                        onPress={() => setForm(f => ({ ...f, category: c.name, packageId: '' }))}
                      >
                        <Text style={[styles.chipText, form.category === c.name && form.packageId === '' && { color: C.primary }]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {packages.map(p => (
                      <TouchableOpacity
                        key={p._id}
                        style={[styles.chipBtn, form.packageId === p._id && styles.chipBtnActive]}
                        onPress={() => setForm(f => ({ ...f, packageId: p._id, category: '' }))}
                      >
                        <Text style={[styles.chipText, form.packageId === p._id && { color: C.primary }]}>
                          📦 {p.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Özel Sorular */}
              {form.sourceType === 'custom' && (
                <View style={styles.customQBox}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.formLabel}>Sorular ({form.newQuestions.length})</Text>
                    <TouchableOpacity onPress={addCustomQuestion}>
                      <Text style={{ color: C.accent, fontWeight: '700' }}>+ Soru Ekle</Text>
                    </TouchableOpacity>
                  </View>
                  {form.newQuestions.map((q, qIdx) => (
                    <View key={qIdx} style={styles.customQCard}>
                      <View style={styles.rowBetween}>
                        <Text style={{ color: C.muted, fontSize: 12 }}>Soru {qIdx + 1}</Text>
                        <TouchableOpacity onPress={() => removeCustomQuestion(qIdx)}>
                          <Text style={{ color: C.primary }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[styles.formInput, { marginTop: 6 }]}
                        placeholder="Soru metni..."
                        placeholderTextColor={C.muted}
                        value={q.text}
                        onChangeText={v => {
                          const nq = [...form.newQuestions];
                          nq[qIdx].text = v;
                          setForm(f => ({ ...f, newQuestions: nq }));
                        }}
                      />
                      {q.options.map((opt, oIdx) => (
                        <TextInput
                          key={oIdx}
                          style={[styles.formInput, { marginTop: 4 }]}
                          placeholder={`Şık ${String.fromCharCode(65 + oIdx)}`}
                          placeholderTextColor={C.muted}
                          value={opt}
                          onChangeText={v => {
                            const nq = [...form.newQuestions];
                            nq[qIdx].options[oIdx] = v;
                            setForm(f => ({ ...f, newQuestions: nq }));
                          }}
                        />
                      ))}
                    </View>
                  ))}
                  {form.newQuestions.length === 0 && (
                    <Text style={[styles.muteText, { textAlign: 'center', marginVertical: 12 }]}>
                      Henüz soru eklemedin.
                    </Text>
                  )}
                </View>
              )}

              {/* Maks Oyuncu */}
              <Text style={styles.formLabel}>Maksimum Oyuncu: {form.maxParticipants}</Text>
              <View style={styles.stepRow}>
                {[2, 5, 10, 20, 50].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.stepBtn, form.maxParticipants === v && styles.stepBtnActive]}
                    onPress={() => setForm(f => ({ ...f, maxParticipants: v }))}
                  >
                    <Text style={[styles.stepBtnText, form.maxParticipants === v && { color: C.primary }]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Süre */}
              <Text style={styles.formLabel}>Süre (dk): {form.duration}</Text>
              <View style={styles.stepRow}>
                {[5, 10, 15, 30, 60].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.stepBtn, form.duration === v && styles.stepBtnActive]}
                    onPress={() => setForm(f => ({ ...f, duration: v }))}
                  >
                    <Text style={[styles.stepBtnText, form.duration === v && { color: C.primary }]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Herkese Açık */}
              <View style={[styles.rowBetween, { marginTop: 8, marginBottom: 20 }]}>
                <Text style={styles.formLabel}>Herkese Açık Oda</Text>
                <Switch
                  value={form.isPublic}
                  onValueChange={v => setForm(f => ({ ...f, isPublic: v }))}
                  trackColor={{ false: C.border, true: C.primary }}
                  thumbColor="#fff"
                />
              </View>

              {/* Butonlar */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, creating && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  {creating
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.submitBtnText}>Oluştur</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  createBtn: { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  joinCodeRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  joinCodeInput: { flex: 1, backgroundColor: C.card, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: C.border },
  joinCodeBtn: { backgroundColor: C.cardAlt, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border, justifyContent: 'center' },
  joinCodeBtnText: { color: C.text, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roomName: { fontSize: 16, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  cardTags: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  badgeSuccess: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: C.success },
  badgeWarning: { backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: C.warning },
  badgeInfo: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: C.accent },
  badgePrimary: { backgroundColor: 'rgba(233,69,96,0.15)', borderWidth: 1, borderColor: C.primary },
  btn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#333', opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 40 },
  muteText: { color: C.muted, fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 13, color: C.muted, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  formInput: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tabBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  tabBtnActive: { borderColor: C.primary, backgroundColor: 'rgba(233,69,96,0.1)' },
  tabBtnText: { color: C.muted, fontWeight: '600', fontSize: 13 },
  chipBtn: { backgroundColor: C.cardAlt, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
  chipBtnActive: { borderColor: C.primary, backgroundColor: 'rgba(233,69,96,0.1)' },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  stepRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  stepBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  stepBtnActive: { borderColor: C.primary, backgroundColor: 'rgba(233,69,96,0.1)' },
  stepBtnText: { color: C.muted, fontWeight: '700', fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalActions: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  customQBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border, marginBottom: 6 },
  customQCard: { backgroundColor: C.cardAlt, borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: C.border },
});
