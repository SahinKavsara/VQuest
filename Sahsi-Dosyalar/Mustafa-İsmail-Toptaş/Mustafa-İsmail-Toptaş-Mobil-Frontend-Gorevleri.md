# Mustafa İsmail Toptaş'ın Mobil Frontend Görevleri

**Modül:** Yapay Zeka (AI) Analiz + Sistem Bildirimleri + Admin Paneli  
**Ekran Dosyaları:**
- `mobile/src/screens/main/AnalysisScreen.jsx`
- `mobile/src/screens/main/NotificationsScreen.jsx`  
- `mobile/src/screens/admin/AdminDashboardScreen.jsx` (Bildirim + AI Prompt bölümleri)

---

## 1. Kullanıcı AI Performans Analizi Ekranı

**Bağlı API:** `POST /api/ai/analysis` | `GET /api/ai/reports/{reportId}` | `DELETE /api/ai/reports/{reportId}`  
**Dosya:** `AnalysisScreen.jsx`

### UI Bileşenleri
- **"✨ Analiz Başlat"** butonu — gradient/solid tasarım, disabled state ile spam koruması
- **"Yapay Zeka Düşünüyor..."** — ActivityIndicator + metin ile loading durumu
- **İstatistik Kartları** — Toplam analiz sayısı, Güçlü Yönler, Gelişim alanları
- **Rapor Listesi (FlatList)** — Her rapor: tarih, kısa özet, detay (👁️) ve sil (🗑️) butonları
- **Detay Modal** — ScrollView içinde tam analiz metni
- **"Tümünü Sil"** header butonu
- **Empty State** — "🤖 Henüz Analiz Yok" + açıklama metni

### Kullanıcı Deneyimi (UX)
- **Spam Koruması:** `cooldownRef` ile 10 saniye bekleme süresi
- **Anlık feedback:** Buton disabled + loading spinner
- **Confirm Dialog:** Silme öncesi onay
- **Hata durumu:** Alert.alert ile kullanıcı dostu mesaj

### Teknik Detaylar
- `useState`, `useEffect`, `useRef` hook'ları
- `SecureStore` ile report ID'leri local cihazda saklanır
- Raporlar `Promise.all` ile paralel fetch edilir

---

## 2. Kullanıcı Bildirimler Ekranı

**Bağlı API:** `GET /api/notifications` | `PUT /api/notifications/{notifId}/read` | `DELETE /api/notifications/{notifId}`  
**Dosya:** `NotificationsScreen.jsx`

### UI Bileşenleri
- **Bildirim Listesi (FlatList)** — Her kart: mesaj, tarih, okundu/okunmadı durumu
- **Okunmamış Badge** — Mavi nokta (`unreadDot`) ile görsel işaret
- **"✓ Tümünü Okundu"** header butonu (sadece okunmamış varsa görünür)
- **Okundu butonu (✓)** — Yeşil, sadece okunmamış bildirimlerde görünür
- **Sil butonu (✕)** — Her bildirim satırında
- **Empty State** — "🔕 Burası şimdilik sessiz" + açıklama

### Kullanıcı Deneyimi (UX)
- **Gerçek Zamanlı:** Socket.io `newNotification` eventi ile anlık bildirim ekleme
- **Fade-out Animasyonu:** `LayoutAnimation.create(300ms)` ile silme animasyonu ✅ (MD gereksinimi)
- **Optimistic Update:** Okundu işaretleme anında UI'da yansıtılır
- **Loading:** İlk yüklemede `ActivityIndicator`

### Teknik Detaylar
- `LayoutAnimation` + `UIManager.setLayoutAnimationEnabledExperimental(true)` (Android)
- Socket.io event listener temizleme (cleanup)
- `Array.filter` ile state optimizasyonu

---

## 3. Admin — Bildirim Gönderme Paneli

**Bağlı API:** `POST /api/admin/notifications`  
**Dosya:** `AdminDashboardScreen.jsx` (Modal bileşeni)

### UI Bileşenleri
- **Admin Menü Öğesi** — "🔔 Bildirim Gönder" menü kartı
- **Bottom Sheet Modal** — Animasyonlu slide-up
- **TextArea** — Çok satırlı mesaj girişi (height: 100)
- **"Gönder" butonu** — Loading state ile

### Kullanıcı Deneyimi (UX)
- Boş mesaj validasyonu (`trim()` kontrolü)
- Gönderim sırasında `ActivityIndicator` + disabled buton
- Başarı/hata Alert bildirimi
- Modal kapandığında form temizlenir

---

## 4. Admin — Yapay Zeka Promptu Düzenleme Paneli

**Bağlı API:** `GET /api/admin/ai/prompt` | `PUT /api/admin/ai/prompt`  
**Dosya:** `AdminDashboardScreen.jsx` (Modal bileşeni)

### UI Bileşenleri
- **Admin Menü Öğesi** — "🤖 Yapay Zeka Komutu" menü kartı
- **Bottom Sheet Modal** — Animasyonlu slide-up
- **Loading State** — Modal açılırken mevcut prompt fetch edilir
- **TextArea (full-width)** — height: 180, mevcut prompt ile önceden dolu gelir
- **"Kaydet" butonu** — Güncelleme sırasında loading state

### Kullanıcı Deneyimi (UX)
- Boş prompt gönderilmesi engellenir
- Kaydetme sırasında buton kilitlenir (optimistic feedback)
- Yükleniyor placeholder: "Prompt yükleniyor..."
- Başarı Alert: "✅ Başarılı — Yapay zeka promptu güncellendi"

---

## Tasarım Sistemi

### Renk Paleti
```js
const C = {
  bg: '#1a1a2e',       // Arka plan
  card: '#16213e',     // Kart arka planı
  cardAlt: '#0f1630',  // Alternatif kart
  primary: '#e94560',  // Ana renk (kırmızı)
  accent: '#00e5ff',   // Vurgu rengi (cyan)
  border: '#0f3460',   // Kenarlık
  text: '#e8eaf6',     // Metin
  muted: '#888',       // Soluk metin
  success: '#22c55e',  // Başarı yeşili
  purple: '#6c47ff',   // AI butonu rengi
};
```

### Navigasyon
- **Analysis Ekranı** → Alt tab navigasyonu (`🤖 Analiz` tab)
- **Notifications Ekranı** → Alt tab navigasyonu (`🔔 Bildirim` tab)
- **Admin Modalleri** → Admin Dashboard üzerinden açılır

### Genel Prensiplere Uyum

| Prensip | Durum |
|--------|-------|
| Loading States (Skeleton/Spinner) | ✅ ActivityIndicator her işlemde |
| Empty States | ✅ Her iki ekranda da |
| Error Handling (Alert) | ✅ Kullanıcı dostu mesajlar |
| Feedback (Toast/Alert) | ✅ Her işlem sonrası |
| Safe Area desteği | ✅ SafeAreaView kullanılıyor |
| StatusBar | ✅ light-content, bg rengi ile |
| Responsive FlatList | ✅ contentContainerStyle ile |
| Animasyon (MD gereksinimi) | ✅ LayoutAnimation fade-out |
| Socket.io entegrasyonu | ✅ Gerçek zamanlı bildirimler |
| Form Validasyon | ✅ Boş input kontrolü |
