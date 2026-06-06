# Mustafa İsmail Toptaş'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Kişisel Analiz Başlatma Ekranı
- **API Endpoint:** `POST /api/ai/analysis`
- **Görev:** Kullanıcının oyun performansına dayalı olarak yapay zeka analizi başlatabilmesi için buton ve ilgili UI bileşenlerinin tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - "✨ Analiz Başlat" butonu (mor gradient tasarım, loading state destekli)
  - "Yapay Zeka Düşünüyor..." yükleme durumu (ActivityIndicator + metin)
  - Buton disabled state (spam koruması boyunca)
- **Form Validasyonu:**
  - 10 saniyelik cooldown süresi boyunca butona tekrar basılamaması (`cooldownRef` kontrolü)
  - İstek atılırken butona basılamaması (disabled state)
- **Kullanıcı Deneyimi:**
  - Butona basıldığında anında görsel geri bildirim (yükleme animasyonu)
  - Analiz tamamlandığında "✅ Analiz tamamlandı!" Alert bildirimi
  - Hata durumunda Alert ile kullanıcı dostu mesaj
- **Teknik Detaylar:**
  - `useRef` ile cooldown yönetimi
  - `useState` ile loading state kontrolü
  - Başarılı analizin ID'si SecureStore'a kaydedilir ve ekrana eklenir

## 2. Analiz Sonucu Görüntüleme Ekranı
- **API Endpoint:** `GET /api/ai/reports/{reportId}`
- **Görev:** Kullanıcının geçmiş yapay zeka analizlerini listeleyip detaylarını inceleyebileceği ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Rapor Listesi (FlatList: tarih, kısa özet, detay 👁️ ve sil 🗑️ butonları)
  - İstatistik Kartları (Toplam analiz sayısı, Güçlü Yönler, Gelişim alanları)
  - Detay Modal (ScrollView içinde tam analiz metni, animasyonlu slide-up)
  - "Tümünü Sil" header butonu (raporlar varken görünür)
- **Kullanıcı Deneyimi:**
  - Yükleme sırasında ActivityIndicator
  - Rapor olmadığında Empty State ("🤖 Henüz Analiz Yok" + yönlendirme metni)
  - Raporlar paralel olarak yüklenir (hızlı görüntüleme)
- **Teknik Detaylar:**
  - `SecureStore`'dan rapor ID listesi okunup her biri ayrı GET isteğiyle çekilir
  - `Promise.all` ile paralel fetch işlemi
  - Modal açma/kapama için `selectedReport` state yönetimi

## 3. Eski Analizleri Silme Akışı
- **API Endpoint:** `DELETE /api/ai/reports/{reportId}`
- **Görev:** Kullanıcının tekil veya toplu olarak eski AI analizlerini güvenli şekilde silmesini sağlayan UI akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Her rapor kartındaki çöp kutusu (🗑️) silme butonu
  - Onay dialog'u (destructive action uyarısı)
  - "Tümünü Sil" header butonu ile toplu silme akışı
  - Silme işlemi sırasında opacity azaltma (görsel geri bildirim)
- **Kullanıcı Deneyimi:**
  - Silme öncesinde onay (Confirm) dialog'u
  - Başarılı silmede öğenin listeden anında kaybolması (Optimistic Update)
  - Açık modaldaki rapor silinirse modal otomatik kapanır
- **Teknik Detaylar:**
  - `deletingId` state ile hangi öğenin silindiği takip edilir
  - SecureStore'daki ID listesi güncellenir
  - `Array.filter` ile state optimizasyonu

## 4. Yapay Zeka Komutu Düzenleme Ekranı (Admin)
- **API Endpoints:** `GET /api/admin/ai/prompt`, `PUT /api/admin/ai/prompt`
- **Görev:** Yöneticinin yapay zekanın kullanacağı analiz komutunu (prompt) görebileceği ve güncelleyebileceği modal ekranının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Admin Dashboard'da "🤖 Yapay Zeka Komutu" menü kartı
  - Animasyonlu Bottom Sheet Modal
  - Modal açılırken "Prompt yükleniyor..." loading placeholder
  - Tam genişlikte TextArea (height: 180, mevcut prompt ile dolu)
  - "Kaydet" butonu (güncelleme sırasında loading state)
- **Form Validasyonu:**
  - Yalnızca boşluk içeren prompt gönderilmesinin engellenmesi (`trim()` kontrolü)
- **Kullanıcı Deneyimi:**
  - Modal açıldığında mevcut prompt otomatik yüklenir
  - Kayıt sırasında buton kilitlenir (Optimistic Feedback)
  - Başarı Alert: "✅ Başarılı — Yapay zeka promptu güncellendi"
- **Teknik Detaylar:**
  - Modal mount edildiğinde asenkron GET çağrısı yapılır
  - Fetching state ve updating state ayrı tutulur

## 5. Küresel Bildirim Gönderme Ekranı (Admin)
- **API Endpoint:** `POST /api/admin/notifications`
- **Görev:** Yöneticinin tüm kullanıcılara eşzamanlı bildirim gönderebileceği modal ekranının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Admin Dashboard'da "🔔 Bildirim Gönder" menü kartı
  - Animasyonlu Bottom Sheet Modal
  - Çok satırlı TextArea girişi (height: 100)
  - "Gönder" butonu (ActivityIndicator yükleme durumu ile)
- **Form Validasyonu:**
  - Boş veya yalnızca boşluk içeren mesajın gönderilmesinin engellenmesi (`trim()` kontrolü)
- **Kullanıcı Deneyimi:**
  - Gönderim sırasında buton kilitlenir
  - Başarı ve hata durumları Alert ile bildirilir
  - Modal kapandığında form alanı temizlenir (sıfırlanır)
- **Teknik Detaylar:**
  - Form state yönetimi (`notifMessage` state)
  - Keyboard dismiss ve ScrollView kullanımı

## 6. Gelen Bildirimleri Görüntüleme Ekranı
- **API Endpoint:** `GET /api/notifications`
- **Görev:** Kullanıcıya gönderilen sistem bildirimlerinin kart bazlı listelendiği ve gerçek zamanlı güncellenen ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Bildirim Listesi (FlatList ile kart bazlı: mesaj, tarih, okundu durumu)
  - Okunmamış Badge (Mavi nokta ile görsel işaret)
  - "✓ Tümünü Okundu" header butonu (yalnızca okunmamış varsa görünür)
  - Empty State ("🔕 Burası şimdilik sessiz" + açıklama)
- **Kullanıcı Deneyimi:**
  - Socket.io `newNotification` eventi ile gerçek zamanlı anlık bildirim ekleme
  - İlk yüklemede ActivityIndicator loading durumu
  - Okunmamış bildirimler mavi nokta ile ayrışır
- **Teknik Detaylar:**
  - Socket.io event listener kaydı ve sayfa kapanışında cleanup işlemleri
  - `Array.isArray` kontrolü ile güvenli veri parse'ı

## 7. Bildirimi Okundu Olarak İşaretleme Akışı
- **API Endpoint:** `PUT /api/notifications/{notifId}/read`
- **Görev:** Kullanıcının tek tek veya toplu olarak bildirimleri okundu olarak işaretleyebileceği UI akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Her bildirim kartındaki "✓" okundu butonu (yeşil, yalnızca okunmamış bildirimlerde görünür)
  - "✓ Tümünü Okundu" header butonu
- **Kullanıcı Deneyimi:**
  - Okundu işaretlemede anında mavi nokta kaybolur (Optimistic Update)
  - Tek buton ile tüm okunmamışlar aynı anda işaretlenir
- **Teknik Detaylar:**
  - Çoklu PUT isteği için `Promise.all` kullanımı
  - `Array.map` ile state güncellenmesi (`isRead: true`)

## 8. Bildirim Silme Akışı
- **API Endpoint:** `DELETE /api/notifications/{notifId}`
- **Görev:** Kullanıcının artık görmek istemediği bildirimleri listesinden kalıcı olarak silebileceği UI akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Her bildirim kartındaki "✕" sil butonu
  - Onay dialog'u (destructive action için)
  - Silme sırasında yumuşak fade-out animasyonu
- **Kullanıcı Deneyimi:**
  - Silme öncesinde onay (Confirm) dialog'u
  - `LayoutAnimation.create(300ms)` ile animasyonlu listeden çıkarma
  - Başarılı silmede liste anında güncellenir
- **Teknik Detaylar:**
  - `LayoutAnimation` API (Android için `UIManager.setLayoutAnimationEnabledExperimental(true)`)
  - `Array.filter` ile state optimizasyonu
  - Error handling ve kullanıcı Alert bildirimi
