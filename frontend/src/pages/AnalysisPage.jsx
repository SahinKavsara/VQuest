import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'vquest_ai_reports';

export default function AnalysisPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // localStorage'dan yükle
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setReports(saved);
  }, []);

  const deleteReport = (id) => {
    if (!window.confirm('Bu analiz kaydı silinsin mi?')) return;
    const updated = reports.filter(r => r._id !== id);
    setReports(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selectedReport?._id === id) setSelectedReport(null);
    toast.success('Rapor silindi');
  };

  const clearAll = () => {
    if (!window.confirm('Tüm analiz geçmişi silinsin mi?')) return;
    setReports([]);
    setSelectedReport(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Tüm geçmiş temizlendi');
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">📋 Geçmiş Analizler</h1>
          <p className="page-subtitle">Oyunlardan sonra yapılan AI değerlendirmeleri</p>
        </div>
        {reports.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearAll}>
            🗑️ Tümünü Temizle
          </button>
        )}
      </div>

      {/* Seçili rapor detayı */}
      {selectedReport && (
        <div className="card mb-3" style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.1), rgba(0,229,255,0.06))', border: '1px solid rgba(108,71,255,0.3)' }}>
          <div className="flex-between mb-2">
            <h3 style={{ fontWeight: 700, color: 'var(--accent)' }}>🤖 AI Değerlendirmesi</h3>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedReport(null)}>✕</button>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            {new Date(selectedReport.createdAt).toLocaleString('tr-TR')}
          </div>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', lineHeight: 1.7 }}>
            "{selectedReport.analysisText}"
          </div>
        </div>
      )}

      {/* Liste */}
      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div className="empty-title">Henüz Analiz Yok</div>
          <div className="empty-text">Bir oyun oynadıktan sonra AI değerlendirmelerin burada görünecek.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {reports.map((r, i) => (
            <div key={r._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  #{reports.length - i} · {new Date(r.createdAt).toLocaleString('tr-TR')}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                  "{r.analysisText?.length > 180 ? r.analysisText.slice(0, 180) + '...' : r.analysisText}"
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, paddingTop: '0.2rem' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  title="Tam raporu gör"
                  onClick={() => setSelectedReport(r)}
                >
                  👁️
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  title="Sil"
                  onClick={() => deleteReport(r._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
