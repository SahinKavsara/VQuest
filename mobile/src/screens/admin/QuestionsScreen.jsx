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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  danger: '#ef4444',
  success: '#22c55e',
};

export default function QuestionsScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, visible: false } : prev));
    }, 2500);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/questions');
      const normalized = (Array.isArray(data) ? data : []).map((q) => ({
        ...q,
        _id: q._id || q.mongoId || q.id,
      }));
      setQuestions(normalized);
    } catch (error) {
      console.error('[QuestionsScreen] fetch hatası:', error.message);
      Alert.alert('Hata', 'Sorular alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[QuestionsScreen] kategori fetch hatası:', error.message);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const handleDelete = (questionId) => {
    Alert.alert('Silme Onayı', 'Bu soruyu silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/questions/${questionId}`);
            setQuestions((prev) => prev.filter((q) => q._id !== questionId));
            showToast('Soru başarıyla silindi! 🗑️', 'success');
          } catch (err) {
            showToast('Soru silinemedi.', 'error');
          }
        },
      },
    ]);
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setSelectedCategory(categories[0]?.name || 'Genel Kültür');
    setShowModal(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionText(q.text || '');
    const opts = [...(q.options || [])];
    while (opts.length < 4) opts.push('');
    setOptions(opts);
    setCorrectAnswer(q.correctAnswer || '');
    setSelectedCategory(q.category || 'Genel Kültür');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      Alert.alert('Hata', 'Soru metni boş bırakılamaz.');
      return;
    }

    const filledOptions = options.map((opt) => opt.trim()).filter((opt) => opt !== '');

    if (filledOptions.length < 2) {
      Alert.alert('Hata', 'Şıkların en az 2 tanesinin doldurulması zorunluluğu vardır.');
      return;
    }

    if (!correctAnswer.trim()) {
      Alert.alert('Hata', 'Bir Doğru Cevap (correctAnswer) seçilme şartı vardır.');
      return;
    }

    if (!filledOptions.includes(correctAnswer.trim())) {
      Alert.alert('Hata', 'Lütfen doğru şık olarak doldurulmuş seçeneklerden birini işaretleyin.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        text: questionText.trim(),
        options: filledOptions,
        correctAnswer: correctAnswer.trim(),
        category: selectedCategory || 'Genel Kültür',
      };

      if (editingQuestion) {
        const { data } = await api.put(`/admin/questions/${editingQuestion._id}`, payload);
        const updated = {
          ...data,
          _id: data._id || data.mongoId || data.id || editingQuestion._id,
        };
        setQuestions((prev) => prev.map((q) => (q._id === editingQuestion._id ? updated : q)));
        showToast('Soru başarıyla güncellendi! 🎉', 'success');
      } else {
        const { data } = await api.post('/admin/questions', payload);
        const added = {
          ...data,
          _id: data._id || data.mongoId || data.id,
        };
        setQuestions((prev) => [added, ...prev]);
        showToast('Soru başarıyla eklendi! ➕', 'success');
      }
      setShowModal(false);
    } catch (error) {
      console.error('[QuestionsScreen] kaydet hatası:', error.message);
      Alert.alert('Hata', error.response?.data?.message || 'Soru kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{item.text}</Text>

      <View style={styles.optionsBox}>
        {item.options?.map((opt, idx) => (
          <Text
            key={idx}
            style={[
              styles.optionText,
              opt === item.correctAnswer && { color: C.success, fontWeight: '700' },
            ]}
          >
            {String.fromCharCode(65 + idx)}) {opt} {opt === item.correctAnswer && '✓'}
          </Text>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category || 'Genel'}</Text>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleOpenEditModal(item)}
          >
            <Text style={styles.editBtnText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.delBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.delBtnText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
            <Text style={{ color: C.muted, fontSize: 28 }}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>❓ Sorular</Text>
            <Text style={styles.headerSub}>Sistemdeki tüm havuz soruları</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={handleOpenAddModal}>
          <Text style={styles.addHeaderBtnText}>➕ Soru Ekle</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={renderQuestion}
          refreshing={loading}
          onRefresh={fetchQuestions}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Soru Bulunamadı</Text>
              <Text style={styles.emptyText}>Henüz sisteme eklenmiş genel bir soru yok.</Text>
            </View>
          }
        />
      )}

      {/* Soru Ekle / Düzenle Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? '✏️ Soruyu Düzenle' : '➕ Yeni Soru Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>Soru Metni</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Soru metnini yazın..."
                placeholderTextColor={C.muted}
                multiline
                value={questionText}
                onChangeText={setQuestionText}
              />

              <Text style={styles.formLabel}>Kategori</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowCatPicker(true)}>
                <Text style={styles.selectBtnText}>{selectedCategory || 'Kategori Seçin...'}</Text>
                <Text style={{ color: C.accent }}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>Şıklar (Doğru şıkkı yanındaki daireye tıklayarak seçin)</Text>
              {options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isCorrect = correctAnswer === opt && opt.trim() !== '';
                return (
                  <View key={idx} style={styles.optionInputRow}>
                    <TouchableOpacity
                      style={[
                        styles.radioCircle,
                        isCorrect && { backgroundColor: C.success, borderColor: C.success }
                      ]}
                      onPress={() => {
                        if (opt.trim() === '') {
                          Alert.alert('Bilgi', 'Önce şık içeriğini doldurmalısınız.');
                          return;
                        }
                        setCorrectAnswer(opt);
                      }}
                    >
                      {isCorrect && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={styles.optionLetter}>{letter}</Text>
                    <TextInput
                      style={styles.optionInput}
                      placeholder={`${letter} Şıkkını girin...`}
                      placeholderTextColor={C.muted}
                      value={opt}
                      onChangeText={(val) => {
                        const newOpts = [...options];
                        newOpts[idx] = val;
                        setOptions(newOpts);
                        if (correctAnswer === opt) {
                          setCorrectAnswer(val);
                        }
                      }}
                    />
                  </View>
                );
              })}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Kaydet</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Kategori Seçim Modal */}
      <Modal visible={showCatPicker} animationType="fade" transparent onRequestClose={() => setShowCatPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏷️ Kategori Seç</Text>
              <TouchableOpacity onPress={() => setShowCatPicker(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories.length > 0 ? categories : [{ _id: 'default', name: 'Genel Kültür' }]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.catSelectItem,
                    selectedCategory === item.name && { backgroundColor: 'rgba(0,229,255,0.1)' }
                  ]}
                  onPress={() => {
                    setSelectedCategory(item.name);
                    setShowCatPicker(false);
                  }}
                >
                  <Text style={[
                    styles.catSelectItemText,
                    selectedCategory === item.name && { color: C.accent, fontWeight: '700' }
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {toast.visible && (
        <View style={[
          styles.toastContainer,
          toast.type === 'success' ? styles.toastSuccess : styles.toastError
        ]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
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
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  questionText: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12, lineHeight: 22 },
  optionsBox: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, marginBottom: 12 },
  optionText: { color: C.muted, fontSize: 13, marginBottom: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: 'rgba(0,229,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryBadgeText: { color: C.accent, fontSize: 11, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: 'rgba(0,229,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: C.accent, fontSize: 12, fontWeight: '700' },
  delBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  delBtnText: { color: C.danger, fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { color: C.muted, fontSize: 13 },
  addHeaderBtn: { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addHeaderBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 12, color: C.muted, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  formInput: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.cardAlt, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  selectBtnText: { color: C.text, fontSize: 14 },
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  optionLetter: { color: C.accent, fontWeight: '800', fontSize: 15 },
  optionInput: { flex: 1, backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, borderWidth: 1, borderColor: C.border },
  modalActions: { flexDirection: 'row', gap: 10, paddingBottom: 20, marginTop: 15 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  catSelectItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  catSelectItemText: { color: C.text, fontSize: 14 },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: '#22c55e',
  },
  toastError: {
    backgroundColor: '#ef4444',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
