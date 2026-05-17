import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
};

export default function PackagesScreen() {
  const { role } = useAuthStore();
  const [packages, setPackages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: true, questions: [], newQuestions: [] });

  const fetchData = async () => {
    try {
      const [pRes, qRes] = await Promise.all([
        api.get('/packages').then(r => r.data).catch(() => []),
        api.get('/questions').then(r => r.data).catch(() => []),
      ]);
      setPackages(Array.isArray(pRes) ? pRes : []);
      setQuestions(Array.isArray(qRes) ? qRes : []);
    } catch {
      setPackages([]); setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) { Alert.alert('Hata', 'Paket başlığı zorunludur.'); return; }
    setCreating(true);
    try {
      await api.post('/packages', form);
      await fetchData();
      setShowModal(false);
      setForm({ title: '', description: '', isPublic: true, questions: [], newQuestions: [] });
      Alert.alert('✅', 'Paket oluşturuldu!');
    } catch {
      Alert.alert('Hata', 'Paket oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Onayla', 'Bu paketi silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/packages/${id}`);
            setPackages(prev => prev.filter(p => p._id !== id));
          } catch { Alert.alert('Hata', 'Paket silinemedi.'); }
        },
      },
    ]);
  };

  const toggleQuestion = (qId) => {
    setForm(f => ({
      ...f,
      questions: f.questions.includes(qId)
        ? f.questions.filter(id => id !== qId)
        : [...f.questions, qId],
    }));
  };

  const renderPackage = ({ item }) => (
    <View style={styles.pkgCard}>
      <Text style={styles.pkgEmoji}>📚</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.pkgTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.pkgDesc} numberOfLines={2}>{item.description}</Text> : null}
        <Text style={styles.pkgCount}>{item.questions?.length || 0} soru</Text>
      </View>
      {role === 'admin' && (
        <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item._id)}>
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📦 Soru Paketleri</Text>
          <Text style={styles.headerSub}>Soru setlerini görüntüle ve yönet</Text>
        </View>
        {role === 'admin' && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.createBtnText}>➕ Yeni</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={renderPackage}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Henüz paket yok</Text>
              <Text style={styles.emptyText}>Admin yeni paket oluşturabilir.</Text>
            </View>
          }
        />
      )}

      {/* Yeni Paket Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ Yeni Paket Oluştur</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>Paket Başlığı</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: Tarih Sorularım"
                placeholderTextColor={C.muted}
                value={form.title}
                onChangeText={v => setForm(f => ({ ...f, title: v }))}
              />

              <Text style={styles.formLabel}>Açıklama (İsteğe Bağlı)</Text>
              <TextInput
                style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Bu paket hakkında kısa açıklama..."
                placeholderTextColor={C.muted}
                multiline
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />

              <Text style={styles.formLabel}>Sorular ({form.questions.length} seçildi)</Text>
              <View style={styles.questionListBox}>
                {questions.length === 0 ? (
                  <Text style={{ color: C.muted, fontSize: 13, padding: 10 }}>Soru bulunamadı.</Text>
                ) : (
                  questions.map(q => (
                    <TouchableOpacity
                      key={q._id}
                      style={[styles.qCheckRow, form.questions.includes(q._id) && styles.qCheckRowActive]}
                      onPress={() => toggleQuestion(q._id)}
                    >
                      <Text style={[styles.qCheckBox, form.questions.includes(q._id) && { color: C.primary }]}>
                        {form.questions.includes(q._id) ? '☑' : '☐'}
                      </Text>
                      <Text style={styles.qCheckText} numberOfLines={2}>{q.text}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, creating && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  {creating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Oluştur</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  createBtn: { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pkgCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 12 },
  pkgEmoji: { fontSize: 36 },
  pkgTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 3 },
  pkgDesc: { fontSize: 12, color: C.muted, marginBottom: 6, lineHeight: 18 },
  pkgCount: { color: C.accent, fontSize: 12, fontWeight: '700' },
  delBtn: { backgroundColor: 'rgba(233,69,96,0.1)', padding: 10, borderRadius: 10 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 12, color: C.muted, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  formInput: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  questionListBox: { backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, maxHeight: 200, overflow: 'hidden', marginBottom: 6 },
  qCheckRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  qCheckRowActive: { backgroundColor: 'rgba(233,69,96,0.08)' },
  qCheckBox: { fontSize: 18, color: C.muted, width: 22 },
  qCheckText: { flex: 1, color: C.text, fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 10, paddingTop: 10, paddingBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
