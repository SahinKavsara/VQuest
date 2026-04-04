import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([
        { _id: '1', message: 'VQuest\'e hoş geldiniz! İlk oyununuzu kaybetmeyin.', isRead: false },
        { _id: '2', message: 'Yeni kategori eklendi: Astronomi!', isRead: true },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('İşlem başarısız'); }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Bildirim silindi');
    } catch { toast.error('Silinemedi'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🔔 Bildirimler</h1>
          <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <div className="empty-title">Bildirim Yok</div>
          <div className="empty-text">Şu an için hiç bildiriminiz bulunmuyor</div>
        </div>
      ) : (
        <div>
          {notifications.map(n => (
            <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
              {!n.isRead && <div className="notif-dot" />}
              <div className="notif-text" style={n.isRead ? { marginLeft: '1rem' } : {}}>
                {n.message}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {!n.isRead && (
                  <button className="btn btn-ghost btn-icon btn-sm" title="Okundu işaretle" onClick={() => markRead(n._id)}>✓</button>
                )}
                <button className="btn btn-danger btn-icon btn-sm" title="Sil" onClick={() => deleteNotif(n._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
