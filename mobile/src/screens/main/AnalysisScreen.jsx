import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
  purple: '#6c47ff',
};

const STORAGE_KEY = 'vquest_ai_report_ids';

async function getSavedIds() {
  try {
    const val = await SecureStore.getItemAsync(STORAGE_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

async function saveIds(ids) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export default function AnalysisScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const cooldownRef = useRef(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const saved = await getSavedIds();
      if (saved.length === 0) { setReports([]); return; }
      const fetched = await Promise.all(
        saved.map(async (id) => {
          try {
            const { data } = await api.get(`/ai/reports/${id}`);
            return data;
          } catch { return null; }
        })
      );
      setReports(fetched.filter(Boolean));
    } catch {
      setReports([]);
    }
  };

  const startAnalysis = async () => {
    if (cooldownRef.current || loading) return;
    cooldownRef.current = true;
    setLoading(true);
    try {
      const { data } = await api.post('/ai/analysis');
      const saved = await getSavedIds();
      const updated = [data._id, ...saved];
      await saveIds(updated);
      setReports(prev => [data, ...prev]);
      setSelectedReport(data);
      Alert.alert('✅', 'Analiz tamamlandı!');
    } catch {
      Alert.alert('Hata', 'Analiz yapılamadı.');
    } finally {
      setLoading(false);
      setTimeout(() => { cooldownRef.current = false; }, 10000);
    }
  };

  const deleteReport = (id) => {
    Alert.alert('Onayla', 'Bu analiz kaydı silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await api.delete(`/ai/reports/${id}`);
            const saved = await getSavedIds();
            await saveIds(saved.filter(x => x !== id));
            setReports(prev => prev.filter(r => r._id !== id));
            if (selectedReport?._id === id) setSelectedReport(null);
          } catch {
            Alert.alert('Hata', 'Rapor silinemedi.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const clearAll = () => {
    Alert.alert('Onayla', 'Tüm analiz geçmişi silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Temizle',
        style: 'destructive',
        onPress: async () => {
          try {
            await Promise.all(reports.map(r => api.delete(`/ai/reports/${r._id}`).catch(() => {})));
            await saveIds([]);
            setReports([]);
            setSelectedReport(null);
          } catch {
            Alert.alert('Hata', 'Temizleme başarısız.');
          }
        },
      },
    ]);
  };

  const renderReport = ({ item, index }) => (
    <View style={[styles.reportCard, deletingId === item._id && { opacity: 0.4 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.reportMeta}>
          #{reports.length - index} · {new Date(item.createdAt || Date.now()).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.reportSnippet} numberOfLines={3}>
          {item.analysisText}
        </Text>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedReport(item)}>
          <Text style={{ fontSize: 16 }}>👁️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReport(item._id)} disabled={deletingId === item._id}>
          <Text style={{ fontSize: 16 }}>🗑️</Text>
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
          <Text style={styles.headerTitle}>🤖 AI Performans Analizi</Text>
          <Text style={styles.headerSub}>Oyunlarından elde edilen yapay zeka değerlendirmesi</Text>
        </View>
        {reports.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Butonlar */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.analysisBtn, loading && { opacity: 0.6 }]}
          onPress={startAnalysis}
          disabled={loading}
        >
          {loading
            ? <><ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /><Text style={styles.analysisBtnText}>Yapay Zeka Düşünüyor...</Text></>
            : <Text style={styles.analysisBtnText}>✨ Analiz Başlat</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => { setLoading(true); fetchReports().finally(() => setLoading(false)); }}
          disabled={loading}
        >
          <Text style={{ color: C.text, fontWeight: '600' }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* İstatistik Kartları */}
      {reports.length > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: C.purple }]}>
            <Text style={[styles.statValue, { color: C.accent }]}>{reports.length}</Text>
            <Text style={styles.statLabel}>Analiz</Text>
          </View>
          <View style={[styles.statCard, { borderColor: C.success }]}>
            <Text style={styles.statValue}>✅</Text>
            <Text style={styles.statLabel}>Güçlü Yönler</Text>
          </View>
          <View style={[styles.statCard, { borderColor: C.primary }]}>
            <Text style={styles.statValue}>📈</Text>
            <Text style={styles.statLabel}>Gelişim</Text>
          </View>
        </View>
      )}

      {/* Rapor Listesi */}
      {reports.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>Henüz Analiz Yok</Text>
          <Text style={styles.emptyText}>"Analiz Başlat" butonuna basarak yapay zekanın performansını değerlendirmesini sağlayın.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderReport}
        />
      )}

      {/* Seçili Rapor Modal */}
      <Modal visible={!!selectedReport} animationType="slide" transparent onRequestClose={() => setSelectedReport(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 AI Değerlendirmesi</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <Text style={{ color: C.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDate}>
              {selectedReport && new Date(selectedReport.createdAt || Date.now()).toLocaleString('tr-TR')}
            </Text>
            <ScrollView>
              <Text style={styles.modalContent}>{selectedReport?.analysisText}</Text>
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2, maxWidth: 220 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  analysisBtn: { flex: 1, flexDirection: 'row', backgroundColor: C.purple, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  analysisBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  refreshBtn: { backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 6 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  reportCard: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: C.border, gap: 10 },
  reportMeta: { color: C.muted, fontSize: 11, marginBottom: 6 },
  reportSnippet: { color: C.text, fontSize: 13, lineHeight: 20 },
  reportActions: { gap: 6 },
  viewBtn: { backgroundColor: C.cardAlt, padding: 8, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { backgroundColor: 'rgba(233,69,96,0.1)', padding: 8, borderRadius: 8, alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.accent },
  modalDate: { color: C.muted, fontSize: 12, marginBottom: 16 },
  modalContent: { color: C.text, fontSize: 14, lineHeight: 24 },
});
