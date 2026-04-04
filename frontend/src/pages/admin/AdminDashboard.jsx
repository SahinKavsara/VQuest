import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Dummy fetch for stats, imagine an admin summary endpoint
    setTimeout(() => {
      setStats({
        users: 124,
        activeRooms: 3,
        totalQuestions: 850,
        pendingSuggestions: 12
      });
    }, 500);
  }, []);

  if (!stats) return <div className="loading-center"><span className="spinner-lg spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Admin Dashboard</h1>
        <p className="page-subtitle">Sistem genel bakış ve istatistikler</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Toplam Kullanıcı</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚪</div>
          <div className="stat-value">{stats.activeRooms}</div>
          <div className="stat-label">Aktif Odalar</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-label">Soru Havuzu</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💡</div>
          <div className="stat-value">{stats.pendingSuggestions}</div>
          <div className="stat-label">Bekleyen Öneri</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Son Aktiviteler</h3>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p className="mb-2">🟢 Yeni kullanıcı kayıt oldu: <strong>ahmet123</strong></p>
            <p className="mb-2">🟢 Yeni oda kuruldu: <strong>Tarih Ustaları</strong></p>
            <p className="mb-2">🟡 Yeni soru önerisi yapıldı</p>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Hızlı İşlemler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a href="/admin/questions" className="btn btn-ghost">➕ Soru Ekle</a>
            <a href="/admin/notifications" className="btn btn-ghost">📢 Duyuru Yap</a>
            <a href="/admin/ai-prompt" className="btn btn-ghost">🤖 AI Prompt Güncelle</a>
          </div>
        </div>
      </div>
    </div>
  );
}
