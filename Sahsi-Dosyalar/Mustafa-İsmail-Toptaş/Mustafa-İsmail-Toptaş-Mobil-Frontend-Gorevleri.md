# Mustafa İsmail Toptaş'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Kullanıcı AI Performans Analizi Ekranı
- **API Endpoints:** `POST /api/ai/analysis`, `GET /api/ai/reports/{reportId}`, `DELETE /api/ai/reports/{reportId}`
- **Görev:** Kullanıcının oyun performansına dayalı yapay zeka analiz raporlarını oluşturmasını, görüntülemesini ve silebilmesini sağlayan mobil ekran tasarımı ve implementasyonu (AnalysisScreen.jsx).
- **UI Bileşenleri:**
  - "✨ Analiz Başlat" butonu (gradient/solid tasarım, loading state destekli)
  - "Yapay Zeka Düşünüyor..." yükleme (ActivityIndicator) durumu
  - İstatistik Kartları (Toplam analiz sayısı, Güçlü Yönler, Gelişim alanları)
  - Rapor Listesi (FlatList ile tarih, kısa özet, detay 👁️ ve sil 🗑️ butonları)
  - Detay Modal (ScrollView içinde tam analiz metni gösterimi)
  - "Tümünü Sil" header butonu
  - Empty State ("🤖 Henüz Analiz Yok" mesajı ve yönlendirme)
- **Form Validasyonu (Mantık Kontrolleri):**
  - Butona arka arkaya tıklamayı engellemek için cooldown takibi (10 saniye bekleme)
  - İstek atılırken butonun disabled state'e geçirilmesi
- **Kullanıcı Deneyimi:**
  - Spam koruması anında görsel geribildirim (disabled buton)
  - Rapor silme işleminden önce onay (Confirm Dialog) gösterilmesi
  - Hata durumunda kullanıcı dostu Alert mesajları verilmesi
  - Optimistic update ile silinen öğelerin anında arayüzden kaybolması
- **Teknik Detaylar:**
  - Hooks (`useState`, `useEffect`, `useRef`) ve state yönetimi
  - Local caching (SecureStore ile rapor ID'lerini yerel cihazda saklama)
  - Birden fazla API isteğini `Promise.all` ile paralel işleme
  - Platform bağımsız SafeAreaView ve StatusBar kullanımı

## 2. Kullanıcı Bildirimler Ekranı
- **API Endpoints:** `GET /api/notifications`, `PUT /api/notifications/{notifId}/read`, `DELETE /api/notifications/{notifId}`
- **Görev:** Kullanıcının sistemsel duyuruları veya kişisel bildirimleri görebileceği, okundu olarak işaretleyip silebileceği mobil ekran tasarımı ve implementasyonu (NotificationsScreen.jsx).
- **UI Bileşenleri:**
  - Bildirim Listesi (FlatList ile kart bazlı listeleme: mesaj, tarih, okundu bilgisi)
  - Okunmamış Badge (Mavi nokta - `unreadDot` ile görsel işaretleme)
  - "✓ Tümünü Okundu" header butonu (yalnızca okunmamış bildirim varsa görünür)
  - Okundu butonu (✓) (yalnızca okunmamış bildirimlerde görünür)
  - Sil butonu (✕) (her bildirim satırında)
  - Empty State ("🔕 Burası şimdilik sessiz" mesajı)
- **Form Validasyonu (Mantık Kontrolleri):**
  - Sadece okunmamış bildirimi olan durumlarda çoklu okundu işlemine izin verilmesi
- **Kullanıcı Deneyimi:**
  - Socket.io entegrasyonu ile gerçek zamanlı (real-time) anlık bildirim düşmesi
  - Bildirim silme işlemlerinde LayoutAnimation (300ms) ile yumuşak fade-out/slide animasyonu
  - Okundu işaretlemesinde anında UI tepkisi (Optimistic Update)
  - İlk yükleme esnasında Skeleton/ActivityIndicator loading durumu
- **Teknik Detaylar:**
  - `LayoutAnimation` API entegrasyonu ve Android için `UIManager` flag'inin aktifleştirilmesi
  - Socket.io event listener kaydı ve sayfa kapanışında cleanup işlemleri
  - Performanslı `Array.filter` kullanımı ile state optimizasyonu

## 3. Admin Bildirim Gönderme Paneli
- **API Endpoint:** `POST /api/admin/notifications`
- **Görev:** Sistem yöneticilerinin kullanıcılara hızlıca genel bildirim göndermesini sağlayan Bottom Sheet Modal tasarımı ve entegrasyonu (AdminDashboardScreen.jsx).
- **UI Bileşenleri:**
  - Admin Dashboard'da "🔔 Bildirim Gönder" menü kartı
  - Animasyonlu Bottom Sheet Modal ekranı
  - Çok satırlı TextArea girişi (height: 100)
  - "Gönder" butonu (ActivityIndicator yükleme durumu ile)
- **Form Validasyonu:**
  - Boş mesaj (yalnızca boşluk) engellemesi (`trim()` kontrolü)
- **Kullanıcı Deneyimi:**
  - Gönderim esnasında kullanıcının başka butona basmasını engellemek için buton kilitlenmesi (disabled)
  - Başarı veya hata durumunda net Alert geri bildirimleri
  - Modal kapandığında önceki girilmiş hatalı/yarım form metninin sıfırlanması (temizlenmesi)
- **Teknik Detaylar:**
  - Modal içinde ScrollView kullanımı ve Keyboard dismiss/avoid işlemleri
  - State üzerinden form input yönetimi (notifMessage state)
  - Hızlı UI tepkisi için action loading state yönetimi

## 4. Admin Yapay Zeka Promptu Düzenleme Paneli
- **API Endpoints:** `GET /api/admin/ai/prompt`, `PUT /api/admin/ai/prompt`
- **Görev:** Sistem yöneticilerinin, analiz oluştururken kullanılacak AI davranışını (prompt) dinamik olarak değiştirmesini sağlayan modal tasarımı (AdminDashboardScreen.jsx).
- **UI Bileşenleri:**
  - Admin Dashboard'da "🤖 Yapay Zeka Komutu" menü kartı
  - Animasyonlu Bottom Sheet Modal ekranı
  - Modal açılırken verinin yüklendiğini belirten Loading State metni/ikonu
  - Tam genişlikte (full-width) TextArea (height: 180, mevcut veriyi içeren)
  - "Kaydet" butonu
- **Form Validasyonu:**
  - Prompt alanının tamamen boş bırakılarak veya sadece boşluk atılarak gönderilmesinin engellenmesi
- **Kullanıcı Deneyimi:**
  - Ekran açılırken mevcut güncel verinin otomatik gelmesi (loading placeholder sonrası)
  - Kaydetme esnasında Optimistic Feedback ile butonun bekliyor durumuna geçmesi
  - İşlem başarıyla bitince "✅ Başarılı — Yapay zeka promptu güncellendi" Alert bildirimi
- **Teknik Detaylar:**
  - Sayfa mount edildiğinde (Modal açıldığında) hızlı asenkron API GET çağrısı
  - Component içinde iki yönlü state kontrolü (fetching state ve updating state ayrımı)
