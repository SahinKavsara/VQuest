# Mustafa İsmail Toptaş'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Kişisel Analiz Başlatma Servisi
- **API Endpoint:** `POST /api/ai/analysis`
- **Görev:** Mobil uygulamada kullanıcının oynadığı oyunlardaki performansı baz alarak yapay zeka aracılığıyla kişisel analiz raporu oluşturmasını sağlayan servis entegrasyonu.
- **İşlevler:**
  - Kullanıcının performans verilerini toplama
  - API'ye POST isteği gönderme (başarısızlık durumunda fallback mekanizması kullanımı)
  - Yeni oluşturulan raporun ID'sini SecureStore'a (lokal depolama) kaydetme
  - Spam koruması olarak 10 saniyelik cooldown mekanizması uygulama
- **Teknik Detaylar:**
  - Axios HTTP Client kullanımı (`api.js` interceptor ile 30s timeout)
  - Authentication header ekleme (Bearer Token otomatik eklentisi)
  - 202 Accepted durum kodu yönetimi
  - Error handling ve kullanıcı bildirimleri (Alert)

## 2. Analiz Sonucu Görüntüleme Servisi
- **API Endpoint:** `GET /api/ai/reports/{reportId}`
- **Görev:** Kullanıcının geçmiş performanslarına dair yapay zeka analiz raporlarını sistemden çekip görüntülemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - SecureStore'da saklanan rapor ID'lerini kullanarak her bir raporu tek tek fetch etme
  - Gelen veriyi parse edip UI'da Modal içerisinde scrollable text olarak gösterme
  - Yükleme (loading) sırasında activity indicator gösterme
- **Teknik Detaylar:**
  - Path parametresi kullanımı (reportId)
  - `Promise.all` ile paralel istek yönetimi
  - Authentication header ekleme (Bearer Token)
  - Empty state (boş durum) gösterimi

## 3. Eski Analizleri Silme Servisi
- **API Endpoint:** `DELETE /api/ai/reports/{reportId}`
- **Görev:** Kullanıcının artık görmek istemediği veya geçmişteki AI analiz raporlarını kalıcı olarak silmesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Silme işleminden önce kullanıcıya onay (confirm) dialog'u gösterme
  - API'ye DELETE isteği gönderme
  - Başarılı silme sonrasında ilgili rapor ID'sini SecureStore'dan ve liste state'inden çıkarma
  - Toplu silme (Tümünü Sil) özelliği sağlama
- **Teknik Detaylar:**
  - Path parametresi kullanımı
  - Optimistic UI update ve list state yönetimi
  - Authentication header ekleme (Bearer Token)
  - Destructive action için onay dialog yönetimi

## 4. Yapay Zeka Komutu Güncelleme Servisi (Admin)
- **API Endpoint:** `GET /api/admin/ai/prompt` & `PUT /api/admin/ai/prompt`
- **Görev:** Admin yetkisine sahip kullanıcıların, yapay zekanın analiz yaparken kullanacağı temel komutları (prompt) görüntülemesi ve güncellemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Sayfa yüklendiğinde mevcut prompt bilgisini GET isteğiyle çekme
  - Admin tarafından düzenlenen yeni promptu validasyon işleminden (boşluk kontrolü) geçirme
  - API'ye PUT isteği ile yeni promptu gönderme
  - Güncelleme sırasında "Yükleniyor" durumuna geçiş ve sonuç bildirimleri
- **Teknik Detaylar:**
  - Admin yetki kontrolü ve Authentication header ekleme (Bearer Token)
  - String validasyonu (`trim()` kontrolü)
  - Error handling ve kullanıcı geri bildirimleri

## 5. Küresel Bildirim Gönderme Servisi (Admin)
- **API Endpoint:** `POST /api/admin/notifications`
- **Görev:** Yönetici yetkisine sahip kullanıcıların, sistemdeki tüm kullanıcılara eşzamanlı olarak duyuru/bildirim göndermesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Admin panelinden bildirim metnini toplama ve form validasyonu uygulama
  - API'ye POST isteği ile mesajı iletme
  - İşlem başarılı olduğunda form alanını temizleme ve Alert ile bilgilendirme
- **Teknik Detaylar:**
  - Authentication header ekleme (Bearer Token)
  - Backend tarafında RabbitMQ ile mesaj kuyruğuna alınması ve Socket.io ile canlı yayınlanması (Backend işlevi)
  - Redis cache temizleme tetikleyicisi

## 6. Gelen Bildirimleri Görüntüleme Servisi
- **API Endpoint:** `GET /api/notifications`
- **Görev:** Kullanıcıya gönderilmiş genel veya kişisel bildirimleri liste halinde gösteren servis entegrasyonu.
- **İşlevler:**
  - Sayfa yüklendiğinde kullanıcıya ait bildirimleri API'den çekme
  - Gelen veriyi parse edip okunmamış olanları özel bir mavi nokta ile işaretleyerek listeleme
  - Socket.io `newNotification` eventi üzerinden gerçek zamanlı olarak listeyi güncelleme
- **Teknik Detaylar:**
  - Authentication header ekleme (Bearer Token)
  - Socket.io event listener yönetimi ve cleanup işlemleri
  - State optimizasyonu ve listeleme
  - Backend tarafında Redis önbellekleme kullanılarak hızlı yanıt alınması

## 7. Bildirimi Okundu Olarak İşaretleme Servisi
- **API Endpoint:** `PUT /api/notifications/{notifId}/read`
- **Görev:** Kullanıcının gelen yeni bir bildirimi okuduğunu belirtmek amacıyla, bildirim durumunu güncelleyen servis entegrasyonu.
- **İşlevler:**
  - Okundu butonuna tıklandığında API'ye PUT isteği gönderme
  - Başarılı işlem sonucunda mavi bildirim noktasını UI'dan kaldırma
  - Okunmamış tüm bildirimleri aynı anda okundu olarak işaretleyebilme
- **Teknik Detaylar:**
  - Path parametresi kullanımı
  - Optimistic UI update
  - Çoklu güncellemeler için `Promise.all` kullanımı
  - Authentication header ekleme

## 8. Bildirim Silme Servisi
- **API Endpoint:** `DELETE /api/notifications/{notifId}`
- **Görev:** Kullanıcının artık görmek istemediği veya eski bildirimleri kendi listesinden kalıcı olarak silmesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Silme işlemi öncesinde onay (confirmation) dialog'u gösterme
  - API'ye DELETE isteği gönderme
  - Silinen bildirimi listeden yumuşak bir fade-out animasyonu ile çıkarma
- **Teknik Detaylar:**
  - Path parametresi kullanımı
  - LayoutAnimation API entegrasyonu (Animasyonlu UI)
  - Error handling ve kullanıcı bildirimi
  - Authentication header ekleme
