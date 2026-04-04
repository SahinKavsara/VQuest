import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import socket from '../services/socket';

export default function GameRoomPage() {
  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [phase, setPhase] = useState('lobby'); // lobby, playing, result
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCorrectLocal, setIsCorrectLocal] = useState(null);
  const [performanceLog, setPerformanceLog] = useState([]); // [{ category, isCorrect }]
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    try {
      const { data: found } = await api.get(`/rooms/${roomId}`); 
      
      // Eğer kullanıcı katılımcı değilse, odaya katıl
      const isParticipant = found.participants.some(p => (p.userId?._id || p.userId) === (user?._id || user?.id));
      if (!isParticipant) {
        await api.put(`/rooms/${roomId}/join`);
        // Yeniden çek ki katılımcı listesi güncel olsun
        const { data: refreshed } = await api.get(`/rooms/${roomId}`);
        setRoom(refreshed);
      } else {
        setRoom(found);
      }

      // Sorular zaten backend tarafından populate edildi
      const roomQs = found.questions || [];
      setQuestions(roomQs);
      if (roomQs.length > 0 && !currentQuestion) {
        setCurrentQuestion(roomQs[0]);
      }
    } catch (err) {
       console.error('GameRoom fetchData error:', err);
       toast.error('Oda verisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const s = socket.connect();

    s.emit('joinRoom', { roomId, user });

    s.on('updateScoreboard', (participants) => {
      setRoom(prev => ({ ...prev, participants }));
    });

    s.on('gameStarted', () => {
      setPhase('playing');
      setTimeLeft(15);
      setIsCorrectLocal(null);
      setSelectedAnswer(null);
      toast.success('Oyun Başladı!');
    });

    s.on('roomClosed', () => {
      toast.error('Oda kapatıldı veya host ayrıldı.');
      nav('/');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Timer logic
  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (phase === 'playing' && timeLeft === 0) {
      setPhase('result');
      if (isCorrectLocal === true) {
         toast.success('Tebrikler! Doğru cevap.', { icon: '⭐️' });
      } else if (isCorrectLocal === false) {
         toast.error('Maalesef yanlış cevap.');
      } else {
         toast.error('Süre bitti, cevap vermedin!');
      }

      // Eğer oyun bittiyse (tüm sorular cevaplandıysa veya odadaki son durumsa) AI analizi iste
      // Bu örnekte her soru sonucunda değil aslında toplu yapılması isteniyor.
      // Basitleştirmek için: Eğer bu son soruysa (questions array indisi bittiyse) tetiklenebilir
      // Veya direkt her soru sonucu 'result' fazında geçici gösterilebilir.
      // Kullanıcı "Oyun bittiğinde Leaderboard ekranında" dediği için final faza saklayalım.
    }
  }, [phase, timeLeft, isCorrectLocal, selectedAnswer, currentQuestion]);

  const fetchAiAnalysis = async (log) => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/analysis', { performanceData: log });
      setAiAnalysis(data.analysisText);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Oyun bittiğinde AI analizini tetikle (Basitleştirilmiş: phase result olduğunda ve questions bittiğinde)
  useEffect(() => {
    if (phase === 'result' && questions.length > 0 && currentQuestion?._id === questions[questions.length - 1]?._id) {
       fetchAiAnalysis(performanceLog);
    }
  }, [phase]);

  const startRoomGame = async () => {
    try {
      // API'ye söyle (DB güncellemesi için)
      await api.post(`/rooms/${roomId}/start`);
      // Socket ile herkese duyur
      socket.emit('startGame', { roomId });
    } catch (err) {
      toast.error('Oyun başlatılamadı');
    }
  };

  const answerQuestion = async (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = currentQuestion?.options[index] === currentQuestion?.correctAnswer;
    setIsCorrectLocal(isCorrect);
    setPerformanceLog(prev => [...prev, { category: currentQuestion.category || room.category, isCorrect }]);
    
    // Sokete gönder (Skor güncellemesi için)
    socket.emit('submitAnswer', { 
      roomId, 
      userId: user?._id || user?.id, 
      isCorrect, 
      score: timeLeft * 10 // Kalan saniye bazlı puan
    });
    // NO TOAST HERE - Wait for timer end
  };

  const closeRoomSession = () => {
    if (window.confirm('Odayı tamamen kapatmak istiyor musun?')) {
      socket.emit('closeRoom', { roomId });
    }
  };

  if (phase === 'lobby') {
    return (
      <div className="card text-center" style={{ maxWidth: 600, margin: '2rem auto', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
        <h1 className="page-title">Bekleme Odası</h1>
        <p className="text-muted mb-3">Diğer oyuncuların katılması bekleniyor... (Oda ID: {roomId})</p>
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Katılımcılar:</h4>
          {room?.participants?.map((p, i) => (
             <div key={i} className="badge badge-success" style={{ margin: '0.2rem' }}>
               👤 {p.userId?.username || `Oyuncu ${i+1}`} {(p.userId?._id || p.userId?.id) === (user?.id || user?._id) && '(Sen)'}
             </div>
          ))}
        </div>
        
        <div className="mb-2" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Giriş Kodu: <strong style={{ fontSize: '1.2rem' }}>{room?.joinCode}</strong></p>
        </div>

        {(room?.hostId?._id || room?.hostId) === (user?.id || user?._id) ? (
          <button className="btn btn-primary btn-lg btn-full" onClick={startRoomGame}>Macerayı Başlat</button>
        ) : (
          <div className="loading-center" style={{ height: 'auto', gap: '0.5rem' }}>
            <span className="spinner spinner-sm" />
            <p>Oyun sahibinin başlatması bekleniyor...</p>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="card text-center" style={{ maxWidth: 800, margin: '2rem auto', padding: '3rem 2rem' }}>
        <h1 className="page-title mb-3">🏆 Skor Tablosu</h1>
        <div className="table-wrap mb-2">
          <table className="table">
            <thead><tr><th>Sıralama</th><th>Oyuncu</th><th>Puan</th></tr></thead>
            <tbody>
              {room?.participants?.sort((a,b) => b.score - a.score).map((p, i) => (
                <tr key={i} style={i===0 ? { background: 'rgba(255,215,0,0.1)' } : {}}>
                  <td style={{ fontSize: '1.2rem' }}>
                    {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : `#${i+1}`}
                  </td>
                  <td className="font-bold">{p.userId?.username || 'Oyuncu'}</td>
                  <td className="text-success font-bold">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {aiLoading ? (
          <div className="card mb-2 p-1 text-center" style={{ border: '1px dashed var(--primary)' }}>
             <span className="spinner sm" /> Yapay zeka performansını analiz ediyor...
          </div>
        ) : aiAnalysis && (
          <div className="card mb-2 p-1" style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid var(--primary)' }}>
             <h4 style={{ color: 'var(--primary-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>🤖 AI Değerlendirmesi</h4>
             <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{aiAnalysis}"</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => nav('/')}>Odadan Çık</button>
          {(room?.hostId?._id || room?.hostId) === (user?.id || user?._id) && (
            <button className="btn btn-danger" onClick={closeRoomSession}>⚠️ Odayı Kapat</button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'playing' && (!currentQuestion || questions.length === 0)) {
     return (
       <div className="loading-center">
         <span className="spinner spinner-lg" />
         <p>Sorular hazırlanıyor...</p>
       </div>
     );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <div className="timer-bar-container">
        <div className="timer-bar" style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      <div style={{ fontSize: '3rem', fontWeight: 800, textShadow: 'var(--glow)', marginBottom: '2rem' }}>
        {timeLeft}
      </div>

      <div className="card mb-3" style={{ padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>{currentQuestion?.text}</h2>
      </div>

      <div className="grid-2">
         {currentQuestion?.options.map((opt, i) => (
           <button 
             key={i} 
             className={`answer-btn answer-btn-${i} ${selectedAnswer === i ? 'answer-selected' : ''}`}
             onClick={() => answerQuestion(i)}
             disabled={selectedAnswer !== null}
             style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
           >
             {opt}
           </button>
         ))}
      </div>
    </div>
  );
}
