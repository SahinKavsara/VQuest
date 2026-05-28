# Mustafa İsmail Toptaş'ın Mobil Backend (REST API Bağlantısı) Görevleri

**Modül:** Yapay Zeka (AI) Analiz + Sistem Bildirimleri  
**API Base URL:** `https://vquest-backend-api.onrender.com/api`  
**Mobil Ekran Dosyaları:** `AnalysisScreen.jsx`, `NotificationsScreen.jsx`, `AdminDashboardScreen.jsx`

---

## 1. Kişisel Analiz Başlatma

**Endpoint:** `POST /api/ai/analysis`  
**Sorumlu Ekran:** `AnalysisScreen.jsx` + `GameRoomScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
// GameRoomScreen.jsx — oyun bitişinde performans verisiyle çağrılır
const { data } = await api.post('/ai/analysis', {
  performanceData: performanceLogRef.current // [{ category, isCorrect, question }]
});

// AnalysisScreen.jsx — manuel başlatmada (boş body, fallback çalışır)
const { data } = await api.post('/ai/analysis');
```

**Response Davranışı:**
- `202 Accepted` → `{ _id, analysisText, createdAt }` 
- Report ID, SecureStore'a kaydedilir (`vquest_ai_report_ids` key)
- Spam koruması: `cooldownRef` ile 10 saniye cooldown

---

## 2. Analiz Sonucu Görüntüleme

**Endpoint:** `GET /api/ai/reports/:reportId`  
**Sorumlu Ekran:** `AnalysisScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
// SecureStore'daki ID listesinden her raporu tek tek fetch eder
const { data } = await api.get(`/ai/reports/${id}`);
```

**Response Davranışı:**
- `200 OK` → `{ _id, analysisText, createdAt }`
- Modal içinde scrollable text olarak gösterilir

---

## 3. Eski Analizleri Silme

**Endpoint:** `DELETE /api/ai/reports/:reportId`  
**Sorumlu Ekran:** `AnalysisScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
await api.delete(`/ai/reports/${id}`);
// SecureStore'dan da ID kaldırılır
await saveIds(saved.filter(x => x !== id));
setReports(prev => prev.filter(r => r._id !== id));
```

**Response Davranışı:**
- `204 No Content` → Confirm dialog sonrası UI'dan animasyonlu kaldırma
- "Tümünü Sil" butonu tüm raporları toplu siler

---

## 4. Yapay Zeka Komutu Güncelleme (Admin)

**Endpoint:** `PUT /api/admin/ai/prompt`  
**Sorumlu Ekran:** `AdminDashboardScreen.jsx`  
**Authentication:** Bearer Token (Admin yetkisi gerekli)  

**Mobil Uygulama:**
```js
// Önce mevcut prompt GET ile alınır (ekstra endpoint)
const { data } = await api.get('/admin/ai/prompt');
setAiPromptText(data.promptText || '');

// Ardından güncelleme yapılır
await api.put('/admin/ai/prompt', { promptText: aiPromptText.trim() });
```

**Validasyon:**
- Boş prompt gönderilmesi engellenir (`trim()` kontrolü)
- Güncelleme sırasında buton "Yükleniyor..." state'ine geçer

---

## 5. Küresel Bildirim Gönderme (Admin)

**Endpoint:** `POST /api/admin/notifications`  
**Sorumlu Ekran:** `AdminDashboardScreen.jsx`  
**Authentication:** Bearer Token (Admin yetkisi gerekli)  

**Mobil Uygulama:**
```js
await api.post('/admin/notifications', { message: notifMessage });
```

**Response Davranışı:**
- `201 Created` → Alert ile başarı bildirimi
- Backend Socket.io ile anlık yayın yapar, tüm aktif kullanıcılara iletilir

---

## 6. Gelen Bildirimleri Görüntüleme

**Endpoint:** `GET /api/notifications`  
**Sorumlu Ekran:** `NotificationsScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
const { data } = await api.get('/notifications');
setNotifications(Array.isArray(data) ? data : []);
```

**Ek Özellik:**
- Socket.io `newNotification` eventi ile gerçek zamanlı yeni bildirim ekleme
- Okunmamışlar mavi nokta ile işaretlenir
- Boş durum: "Burası şimdilik sessiz" empty state

---

## 7. Bildirimi Okundu Olarak İşaretleme

**Endpoint:** `PUT /api/notifications/:notifId/read`  
**Sorumlu Ekran:** `NotificationsScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
// Tekil okundu işaretleme
await api.put(`/notifications/${id}/read`);
setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

// Tümünü okundu işaretleme
await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
```

**Response Davranışı:**
- `200 OK` → Optimistic UI güncelleme (mavi nokta kalkar)

---

## 8. Bildirim Silme

**Endpoint:** `DELETE /api/notifications/:notifId`  
**Sorumlu Ekran:** `NotificationsScreen.jsx`  
**Authentication:** Bearer Token gerekli  

**Mobil Uygulama:**
```js
await api.delete(`/notifications/${id}`);
// LayoutAnimation ile fade-out animasyonu
LayoutAnimation.configureNext(LayoutAnimation.create(300, ...));
setNotifications(prev => prev.filter(n => n._id !== id));
```

**Response Davranışı:**
- `204 No Content` → Confirm dialog → LayoutAnimation fade-out → listeden kaldırma

---

## Genel Prensiplere Uyum

| Prensip | Durum |
|--------|-------|
| HTTP Client (Axios + Interceptor) | ✅ `api.js` — 30s timeout, JWT auto-inject |
| Authentication (SecureStore) | ✅ Token otomatik ekleniyor |
| 401 Error Handling | ✅ Login'e yönlendirme |
| 429 Rate Limit | ✅ Alert ile kullanıcıya uyarı |
| Loading States | ✅ ActivityIndicator her istekte |
| Error Handling | ✅ Alert.alert ile kullanıcı dostu mesaj |
| Caching (Redis) | ✅ Backend tarafında — DELETE'te cache temizleme |
