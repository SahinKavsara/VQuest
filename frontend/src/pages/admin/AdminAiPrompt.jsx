import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminAiPrompt() {
  const [promptText, setPromptText] = useState(
    'Kullanıcının performansını analiz et. Kategorilere göre zayıf ve güçlü yönlerini belirle ve motive edici tavsiyeler ver. Çıktı çok uzun olmasın, kolay okunabilir bir formatta olsun.'
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setLoading(true);
    try {
      await api.put('/admin/ai/prompt', { promptText });
      toast.success('Yapay zeka analiz komutu başarıyla güncellendi!');
    } catch {
      toast.error('Komut güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1 className="page-title">🤖 AI Prompt Ayarları</h1>
        <p className="page-subtitle">Analiz raporlarını üreten sistem komutunu (prompt) özelleştirin</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>Mevcut Sistem Komutu</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <textarea
              className="form-input"
              style={{ minHeight: 200, fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6 }}
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Kaydediliyor...</> : '💾 Promptu Kaydet ve Güncelle'}
          </button>
        </form>
      </div>

      <div className="card mt-2" style={{ background: 'var(--bg-card-2)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>İpuçları</h4>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>Komutlarınızda kullanıcıya "sen" diliyle hitap edilmesini isteyebilirsiniz.</li>
          <li>Analizin formatını belirtebilirsiniz (örn: "Madde madde liste şeklinde yaz").</li>
          <li>Verilecek değerler sistem tarafından eklenecektir (Doğru oranı, oynanan oyun sayısı vs).</li>
        </ul>
      </div>
    </div>
  );
}
