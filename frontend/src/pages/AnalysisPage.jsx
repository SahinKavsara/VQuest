import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AnalysisPage() {
  const [reports, setReports] = useState([]);
  const [starting, setStarting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const startAnalysis = async () => {
    setStarting(true);
    try {
      const { data } = await api.post('/ai/analysis');
      toast.success('Analiz tamamlandı!');
      setSelectedReport(data);
      setReports(prev => [data, ...prev]);
    } catch (err) {
      toast.error('Gelişmiş AI analizi şu anda sadece demo versiyonunda çalışıyor.');
      // Fake a report for demo purposes
      setTimeout(() => {
        const fakeReport = {
          _id: Math.random().toString(),
          analysisText: "Performansın oldukça iyi. Yazılım kategorisinde %80 doğru oranın var, ancak Tarih kategorisinde (%40) biraz daha fazla pratik yapmaya ihtiyacın var. Hızın gayet yerinde, soruları ortalama 7 saniyede cevaplıyorsun. Bu şekilde devam et ve zayıf yönlerini geliştirmeye odaklan!",
          createdAt: new Date().toISOString()
        };
        setSelectedReport(fakeReport);
        setReports(prev => [fakeReport, ...prev]);
        setStarting(false);
      }, 2000);
    } 
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/ai/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      if (selectedReport?._id === id) setSelectedReport(null);
      toast.success('Rapor silindi');
    } catch { toast.error('Silinemedi'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🤖 AI Analiz</h1>
          <p className="page-subtitle">Yapay zeka destekli performans analizi</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={startAnalysis} disabled={starting}>
          {starting ? <><span className="spinner" /> Analiz Yapılıyor...</> : '✨ Yeni Analiz Başlat'}
        </button>
      </div>

      <div className="card mb-3" style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.1), rgba(0,229,255,0.06))', border: '1px solid rgba(108,71,255,0.3)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>🧠 Nasıl Çalışır?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          Yapay zeka motorumuz, oynadığın kategoriler, doğru/yanlış oranların ve cevaplama hızını analiz ederek 
          sana özel bir performans raporu oluşturur. Gelişim alanlarını keşfet ve zayıf yönlerini güçlendir!
        </p>
      </div>

      {starting && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Analiz yapılıyor...</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Yapay zeka verilerinizi işliyor, lütfen bekleyin</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.3rem' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', animation: `pulse 1s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="card mb-3">
          <div className="flex-between mb-2">
            <h3 style={{ fontWeight: 700, color: 'var(--accent)' }}>📋 Analiz Raporu</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', lineHeight: 1.6 }}>
            {selectedReport.analysisText}
          </div>
        </div>
      )}
    </div>
  );
}
