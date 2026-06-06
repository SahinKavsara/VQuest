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

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit Category State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [updating, setUpdating] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const handlePromiseToast = async (promise, loadingMsg, successMsg, errorMsg) => {
    setToast({ visible: true, message: loadingMsg, type: 'info' });
    try {
      const result = await promise;
      setToast({ visible: true, message: successMsg, type: 'success' });
      setTimeout(() => {
        setToast((prev) => (prev.message === successMsg ? { ...prev, visible: false } : prev));
      }, 2500);
      return result;
    } catch (error) {
      setToast({ visible: true, message: errorMsg, type: 'error' });
      setTimeout(() => {
        setToast((prev) => (prev.message === errorMsg ? { ...prev, visible: false } : prev));
      }, 3500);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      const normalized = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        _id: c._id || c.mongoId || c.id,
      }));
      // Sunucudan gelen duplicate _id'leri temizle
      const unique = Array.from(
        new Map(normalized.map((c) => [c._id, c])).values()
      );
      setCategories(unique);
    } catch (error) {
      console.error('[CategoriesScreen] fetch hatası:', error.message);
      Alert.alert('Hata', 'Kategoriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setToast({ visible: true, message: 'Kategori ismi boş bırakılamaz.', type: 'error' });
      setTimeout(() => setToast((p) => p.message === 'Kategori ismi boş bırakılamaz.' ? { ...p, visible: false } : p), 3000);
      return;
    }

    if (trimmedName.length < 2) {
      setToast({ visible: true, message: 'Kategori ismi en az 2 karakter olmalıdır.', type: 'error' });
      setTimeout(() => setToast((p) => p.message === 'Kategori ismi en az 2 karakter olmalıdır.' ? { ...p, visible: false } : p), 3000);
      return;
    }

    setAdding(true);
    try {
      const addPromise = api.post('/admin/categories', { name: trimmedName });
      const { data } = await handlePromiseToast(
        addPromise,
        'Kategori ekleniyor... ⏳',
        'Kategori başarıyla eklendi! 🎉',
        'Kategori eklenirken hata oluştu.'
      );
      const added = { ...data, _id: data._id || data.mongoId || data.id };
      // Zaten listede aynı _id varsa ekleme (optimistic duplicate guard)
      setCategories((prev) =>
        prev.some((c) => c._id === added._id) ? prev : [...prev, added]
      );
      setNewCatName('');
    } catch (error) {
      console.error('[CategoriesScreen] ekleme hatası:', error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || '');
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    const trimmedName = editCatName.trim();
    if (!trimmedName) {
      setToast({ visible: true, message: 'Kategori ismi boş bırakılamaz.', type: 'error' });
      setTimeout(() => setToast((p) => p.message === 'Kategori ismi boş bırakılamaz.' ? { ...p, visible: false } : p), 3000);
      return;
    }

    if (trimmedName.length < 2) {
      setToast({ visible: true, message: 'Kategori ismi en az 2 karakter olmalıdır.', type: 'error' });
      setTimeout(() => setToast((p) => p.message === 'Kategori ismi en az 2 karakter olmalıdır.' ? { ...p, visible: false } : p), 3000);
      return;
    }

    setUpdating(true);
    try {
      const updatePromise = api.put(`/admin/categories/${editingCategory._id}`, { name: trimmedName });
      const { data } = await handlePromiseToast(
        updatePromise,
        'Kategori güncelleniyor... ⏳',
        'Kategori başarıyla güncellendi! 🎉',
        'Kategori güncellenirken hata oluştu.'
      );
      const updated = { ...data, _id: data._id || data.mongoId || data.id || editingCategory._id };
      setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? updated : c)));
      setShowEditModal(false);
    } catch (error) {
      console.error('[CategoriesScreen] güncelleme hatası:', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    Alert.alert(
      'Kategoriyi Sil',
      `"${cat.name}" kategorisini silmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await handlePromiseToast(
                api.delete(`/admin/categories/${cat._id}`),
                'Kategori siliniyor... ⏳',
                'Kategori başarıyla silindi! 🗑️',
                'Kategori silinemedi.'
              );
              setCategories((prev) => prev.filter((c) => c._id !== cat._id));
            } catch (error) {
              console.error('[CategoriesScreen] silme hatası:', error.message);
            }
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }) => (
    <View style={styles.catCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.catName}>🏷️ {item.name}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleOpenEditModal(item)}
        >
          <Text style={styles.editBtnText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteCategory(item)}
        >
          <Text style={styles.deleteBtnText}>Sil</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.headerTitle}>🏷️ Kategoriler</Text>
          <Text style={styles.headerSub}>Soru havuzu kategorileri yönetimi</Text>
        </View>
      </View>

      {/* Add Kategori Form */}
      <View style={styles.addFormContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="Yeni kategori adı yazıp Enter'a basın..."
          placeholderTextColor={C.muted}
          value={newCatName}
          onChangeText={setNewCatName}
          onSubmitEditing={handleAddCategory}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, adding && { opacity: 0.6 }]}
          onPress={handleAddCategory}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Ekle</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderCategory}
          refreshing={loading}
          onRefresh={fetchCategories}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Kategori Bulunamadı</Text>
              <Text style={styles.emptyText}>Henüz sisteme eklenmiş kategori yok.</Text>
            </View>
          }
        />
      )}

      {/* Kategori Düzenleme Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Kategoriyi Düzenle</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.formLabel}>Kategori İsmi</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Kategori adını girin..."
                placeholderTextColor={C.muted}
                value={editCatName}
                onChangeText={setEditCatName}
                onSubmitEditing={handleUpdateCategory}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={{ color: C.muted, fontWeight: '600' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, updating && { opacity: 0.6 }]}
                onPress={handleUpdateCategory}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {toast.visible && (
        <View style={[
          styles.toastContainer,
          toast.type === 'success' ? styles.toastSuccess : (toast.type === 'error' ? styles.toastError : styles.toastInfo)
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

  addFormContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
    backgroundColor: C.cardAlt,
  },
  addInput: {
    flex: 1,
    backgroundColor: C.bg,
    color: C.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  addBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  catCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  catName: { fontSize: 15, fontWeight: '700', color: C.text },
  editBtn: { backgroundColor: 'rgba(0,229,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: C.accent, fontSize: 12, fontWeight: '700' },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: C.danger, fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { color: C.muted, fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 12, color: C.muted, fontWeight: '700', marginBottom: 8 },
  formInput: { backgroundColor: C.cardAlt, color: C.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: C.border },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.cardAlt, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  submitBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
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
  toastInfo: {
    backgroundColor: '#00e5ff',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
