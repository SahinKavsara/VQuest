import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import api from '../../services/api';
import socket from '../../services/socket';
import useAuthStore from '../../store/useAuthStore';

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
  green: '#22c55e',
};

// Şık renkleri (web'dekiyle aynı sıra)
const OPTION_COLORS = ['#e94560', '#0f3460', '#533483', '#16213e'];
const OPTION_ACCENT = ['#e94560', '#00e5ff', '#a855f7', '#22c55e'];

// ── Faz: Bekleme Odası ────────────────────────────────────────────────────────
function LobbyPhase({ room, userId, onStart, onBack }) {
  const isHost = (room?.hostId?._id || room?.hostId) === userId;

  return (
    <ScrollView contentContainerStyle={styles.lobbyContainer}>
      <Text style={styles.bigEmoji}>🎮</Text>
      <Text style={styles.pageTitle}>Bekleme Odası</Text>
      <Text style={styles.muteText}>Oda ID: {room?._id}</Text>

      {/* Join Code */}
      <View style={styles.joinCodeBox}>
        <Text style={styles.joinCodeLabel}>Giriş Kodu</Text>
        <Text style={styles.joinCodeValue}>{room?.joinCode || '------'}</Text>
      </View>

      {/* Katılımcılar */}
      <View style={styles.participantsBox}>
        <Text style={styles.sectionLabel}>Katılımcılar ({room?.participants?.length || 0})</Text>
        <View style={styles.participantChips}>
          {room?.participants?.map((p, i) => (
            <View key={i} style={styles.participantChip}>
              <Text style={styles.participantChipText}>
                👤 {p.userId?.username || `Oyuncu ${i + 1}`}
                {(p.userId?._id || p.userId) === userId ? ' (Sen)' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {isHost ? (
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startBtnText}>🚀 Macerayı Başlat</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.waitingBox}>
          <ActivityIndicator size="small" color={C.accent} />
          <Text style={[styles.muteText, { marginLeft: 10 }]}>Oyun sahibinin başlatması bekleniyor...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={{ color: C.muted, fontWeight: '600' }}>← Lobiye Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Faz: Oyun ─────────────────────────────────────────────────────────────────
function PlayingPhase({ question, questionIndex, totalQuestions, timeLeft, selectedAnswer, onAnswer, showCorrectAnswer, correctAnswerText }) {
  const progress = timeLeft / 15;

  return (
    <View style={styles.playingContainer}>
      {/* Timer Bar */}
      <View style={styles.timerBarBg}>
        <View style={[styles.timerBarFill, { width: `${progress * 100}%`, backgroundColor: progress > 0.5 ? C.success : progress > 0.25 ? C.warning : C.primary }]} />
      </View>

      {/* Soru Bilgisi */}
      <View style={styles.questionMeta}>
        <Text style={styles.muteText}>Soru {questionIndex + 1} / {totalQuestions}</Text>
        <Text style={styles.timerText}>{timeLeft}</Text>
        <Text style={styles.muteText}>{selectedAnswer !== null ? '✅ Cevap verildi' : '⏳ Bekleniyor'}</Text>
      </View>

      {/* Doğru Cevap Banner */}
      {showCorrectAnswer && (
        <View style={styles.correctAnswerBanner}>
          <Text style={styles.correctAnswerText}>✅ Doğru Cevap: {correctAnswerText}</Text>
        </View>
      )}

      {/* Soru Metni */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question?.text}</Text>
      </View>

      {/* Şıklar */}
      <View style={styles.optionsGrid}>
        {question?.options?.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.optionBtn,
              { borderColor: OPTION_ACCENT[i], backgroundColor: selectedAnswer === i ? OPTION_ACCENT[i] + '33' : C.card },
              selectedAnswer === i && { borderWidth: 2 },
            ]}
            onPress={() => onAnswer(i)}
            disabled={selectedAnswer !== null || showCorrectAnswer}
          >
            <Text style={[styles.optionLetter, { color: OPTION_ACCENT[i] }]}>
              {String.fromCharCode(65 + i)}
            </Text>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Faz: Sonuç ────────────────────────────────────────────────────────────────
function ResultPhase({ room, aiAnalysis, aiLoading, userId, onExit, onClose }) {
  const isHost = (room?.hostId?._id || room?.hostId) === userId;
  const sorted = [...(room?.participants || [])].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ScrollView contentContainerStyle={styles.resultContainer}>
      <Text style={styles.pageTitle}>🏆 Skor Tablosu</Text>

      {/* Skor Listesi */}
      <View style={styles.leaderboardBox}>
        {sorted.map((p, i) => (
          <View key={i} style={[styles.leaderboardRow, i === 0 && styles.leaderboardFirst]}>
            <Text style={styles.leaderboardMedal}>{medals[i] || `#${i + 1}`}</Text>
            <Text style={styles.leaderboardName}>{p.userId?.username || `Oyuncu ${i + 1}`}</Text>
            <Text style={[styles.leaderboardScore, { color: C.success }]}>{p.score} puan</Text>
          </View>
        ))}
      </View>

      {/* AI Analiz */}
      {aiLoading ? (
        <View style={styles.aiBox}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={[styles.muteText, { marginLeft: 8 }]}>Yapay zeka analiz ediyor...</Text>
        </View>
      ) : aiAnalysis ? (
        <View style={styles.aiBox}>
          <Text style={styles.aiTitle}>🤖 AI Değerlendirmesi</Text>
          <Text style={styles.aiText}>{aiAnalysis}</Text>
        </View>
      ) : null}

      {/* Butonlar */}
      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={{ color: C.muted, fontWeight: '600' }}>Odadan Çık</Text>
      </TouchableOpacity>
      {isHost && (
        <TouchableOpacity style={[styles.exitBtn, { backgroundColor: 'rgba(233,69,96,0.15)', borderColor: C.primary, marginTop: 8 }]} onPress={onClose}>
          <Text style={{ color: C.primary, fontWeight: '700' }}>⚠️ Odayı Kapat</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ── Ana Bileşen: GameRoomScreen ───────────────────────────────────────────────
export default function GameRoomScreen({ route, navigation }) {
  const { roomId } = route.params;
  const { userId, username } = useAuthStore();

  const [phase, setPhase] = useState('lobby'); // lobby | playing | result
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const questionsRef = useRef([]);
  const currentQuestionIndexRef = useRef(0);
  const performanceLogRef = useRef([]);
  const isHostRef = useRef(false);

  // ── Veri Yükle ──────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const { data: found } = await api.get(`/rooms/${roomId}`);
      const isParticipant = found.participants.some(
        p => (p.userId?._id || p.userId) === userId
      );
      if (!isParticipant) {
        await api.put(`/rooms/${roomId}/join`);
        const { data: refreshed } = await api.get(`/rooms/${roomId}`);
        setRoom(refreshed);
        isHostRef.current = (refreshed.hostId?._id || refreshed.hostId) === userId;
      } else {
        setRoom(found);
        isHostRef.current = (found.hostId?._id || found.hostId) === userId;
      }

      const roomQs = found.questions || [];
      setQuestions(roomQs);
      questionsRef.current = roomQs;
      if (roomQs.length > 0) setCurrentQuestion(roomQs[0]);
    } catch {
      Alert.alert('Hata', 'Oda verisi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sonraki Soru ─────────────────────────────────────────────────────────────
  const advanceQuestion = (nextIdx) => {
    setShowCorrectAnswer(false);
    setCorrectAnswerText('');
    const allQs = questionsRef.current;
    if (nextIdx < allQs.length) {
      currentQuestionIndexRef.current = nextIdx;
      setCurrentQuestionIndex(nextIdx);
      setCurrentQuestion(allQs[nextIdx]);
      setTimeLeft(15);
      setSelectedAnswer(null);
    } else {
      setPhase('result');
    }
  };

  // ── Socket & Veri ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    const s = socket.connect();
    // Backend'in socket.on('joinRoom') beklentisine uygun olarak objeyi düzenledik
    s.emit('joinRoom', { roomId, user: { _id: userId, username } });

    s.on('updateScoreboard', (participants) => {
      setRoom(prev => ({ ...prev, participants }));
    });

    s.on('gameStarted', () => {
      setPhase('playing');
      setTimeLeft(15);
      setSelectedAnswer(null);
    });

    s.on('nextQuestion', ({ questionIndex, correctAnswer }) => {
      if (correctAnswer) {
        setShowCorrectAnswer(true);
        setCorrectAnswerText(correctAnswer);
        setTimeout(() => advanceQuestion(questionIndex), 5000);
      } else {
        advanceQuestion(questionIndex);
      }
    });

    s.on('roomClosed', () => {
      Alert.alert('Bilgi', 'Oda kapatıldı.');
      navigation.goBack();
    });

    return () => {
      socket.leaveRoom();
    };
  }, [roomId]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else {
      const currentQ = questionsRef.current[currentQuestionIndexRef.current];
      const correctAnswer = currentQ?.correctAnswer || '';
      setShowCorrectAnswer(true);
      setCorrectAnswerText(correctAnswer);
      if (isHostRef.current) {
        const nextIdx = currentQuestionIndexRef.current + 1;
        setTimeout(() => {
          socket.emit('nextQuestion', { roomId, questionIndex: nextIdx, correctAnswer });
          advanceQuestion(nextIdx);
        }, 5000);
      }
    }
  }, [phase, timeLeft]);

  // ── AI Analiz ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'result') {
      if (performanceLogRef.current.length > 0) {
        const t = setTimeout(async () => {
          setAiLoading(true);
          try {
            const { data } = await api.post('/ai/analysis', { performanceData: performanceLogRef.current });
            setAiAnalysis(data.analysisText);
          } catch {
            setAiAnalysis('Analiz tamamlanamadı.');
          } finally {
            setAiLoading(false);
          }
        }, 500);
        return () => clearTimeout(t);
      } else {
        setAiAnalysis('Harika bir oyundu! Bir dahaki sefere daha fazla soruyla analiz yapabilirim.');
      }
    }
  }, [phase]);

  // ── Oyunu Başlat ─────────────────────────────────────────────────────────────
  const startRoomGame = async () => {
    try {
      await api.post(`/rooms/${roomId}/start`);
      socket.emit('startGame', { roomId });
    } catch {
      Alert.alert('Hata', 'Oyun başlatılamadı.');
    }
  };

  // ── Cevap Gönder ─────────────────────────────────────────────────────────────
  const answerQuestion = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = currentQuestion?.options[index] === currentQuestion?.correctAnswer;
    const newLog = [...performanceLogRef.current, {
      category: currentQuestion?.category || room?.category || 'Genel',
      isCorrect,
      question: currentQuestion?.text,
    }];
    performanceLogRef.current = newLog;
    socket.emit('submitAnswer', { roomId, userId, isCorrect, score: timeLeft * 10 });
  };

  // ── Odayı Kapat ──────────────────────────────────────────────────────────────
  const closeRoomSession = () => {
    Alert.alert('Onayla', 'Odayı tamamen kapatmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kapat', style: 'destructive', onPress: () => socket.emit('closeRoom', { roomId }) },
    ]);
  };

  // ── Yükleniyor ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {phase === 'lobby' && (
        <LobbyPhase room={room} userId={userId} onStart={startRoomGame} onBack={() => navigation.goBack()} />
      )}
      {phase === 'playing' && (
        <PlayingPhase
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
          selectedAnswer={selectedAnswer}
          onAnswer={answerQuestion}
          showCorrectAnswer={showCorrectAnswer}
          correctAnswerText={correctAnswerText}
        />
      )}
      {phase === 'result' && (
        <ResultPhase
          room={room}
          aiAnalysis={aiAnalysis}
          aiLoading={aiLoading}
          userId={userId}
          onExit={() => navigation.goBack()}
          onClose={closeRoomSession}
        />
      )}
    </SafeAreaView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  muteText: { color: C.muted, fontSize: 13 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  bigEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 12 },

  // Lobby
  lobbyContainer: { padding: 24, paddingTop: 40, alignItems: 'center' },
  joinCodeBox: { backgroundColor: C.card, borderRadius: 14, padding: 20, alignItems: 'center', width: '100%', marginVertical: 16, borderWidth: 1, borderColor: C.border },
  joinCodeLabel: { color: C.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  joinCodeValue: { color: C.text, fontSize: 36, fontWeight: '900', letterSpacing: 6 },
  participantsBox: { width: '100%', backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  sectionLabel: { color: C.muted, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  participantChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  participantChip: { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.success },
  participantChipText: { color: C.success, fontSize: 12, fontWeight: '600' },
  startBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  waitingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  backBtn: { padding: 10, marginTop: 4 },

  // Playing
  playingContainer: { flex: 1, padding: 16 },
  timerBarBg: { height: 6, backgroundColor: C.border, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: 3 },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timerText: { fontSize: 36, fontWeight: '900', color: C.text },
  correctAnswerBanner: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 2, borderColor: C.success, borderRadius: 12, padding: 14, marginBottom: 12 },
  correctAnswerText: { color: C.success, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  questionCard: { backgroundColor: C.card, borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: C.border, minHeight: 120, justifyContent: 'center' },
  questionText: { color: C.text, fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 30 },
  optionsGrid: { gap: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1, backgroundColor: C.card },
  optionLetter: { fontSize: 16, fontWeight: '800', marginRight: 12, width: 20 },
  optionText: { color: C.text, fontSize: 15, fontWeight: '600', flex: 1 },

  // Result
  resultContainer: { padding: 24, paddingTop: 40, alignItems: 'center' },
  leaderboardBox: { width: '100%', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  leaderboardFirst: { backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 8, paddingHorizontal: 8 },
  leaderboardMedal: { fontSize: 22, width: 36 },
  leaderboardName: { flex: 1, color: C.text, fontWeight: '700', fontSize: 15 },
  leaderboardScore: { fontWeight: '800', fontSize: 15 },
  aiBox: { width: '100%', backgroundColor: 'rgba(108,71,255,0.1)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(108,71,255,0.4)', marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' },
  aiTitle: { color: C.accent, fontWeight: '800', fontSize: 14, marginBottom: 8, width: '100%' },
  aiText: { color: C.text, fontSize: 13, lineHeight: 22, fontStyle: 'italic', width: '100%' },
  exitBtn: { width: '100%', backgroundColor: C.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 2 },
});
