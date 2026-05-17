import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import api from '../../services/api';

const C = {
  bg: '#1a1a2e',
  card: '#16213e',
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
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/questions');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[QuestionsScreen] fetch hatası:', error.message);
      Alert.alert('Hata', 'Sorular alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
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
          } catch (err) {
            Alert.alert('Hata', 'Soru silinemedi.');
          }
        },
      },
    ]);
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
              opt === item.correctAnswer && { color: C.success, fontWeight: '700' }
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
        <TouchableOpacity
          style={styles.delBtn}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.delBtnText}>Sil</Text>
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
          <Text style={styles.headerTitle}>❓ Sorular</Text>
          <Text style={styles.headerSub}>Sistemdeki tüm havuz soruları</Text>
        </View>
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
  delBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  delBtnText: { color: C.danger, fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyText: { color: C.muted, fontSize: 13 },
});
