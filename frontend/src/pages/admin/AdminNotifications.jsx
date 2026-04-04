import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/admin/notifications', { message });
      toast.success('Bildirim tüm kullanıcılara gönderildi!');
      setMessage('');
    } catch {
      toast.error('Bildirim gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">📢 Bildirim Gönder</h1>
        <p className="page-subtitle">Sistemdeki tüm kullanıcılara anlık duyuru yapın</p>
      </div>

      <div className="card">
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Duyuru Mesajı</label>
            <textarea
              className="form-input"
              style={{ minHeight: 120 }}
              placeholder="Örn: Bu akşam saat 20:00'da büyük Tarih Yarışması başlıyor! Kaçırmayın!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading || !message.trim()}>
            {loading ? <><span className="spinner" /> Gönderiliyor...</> : '🚀 Tüm Kullanıcılara Gönder'}
          </button>
        </form>
      </div>
      
      <div className="mt-2" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        * Gönderilen bildirimler kullanıcıların "Bildirimler" sekmesine anında düşer. Üstte uyarı balonu belirir.
      </div>
    </div>
  );
}
