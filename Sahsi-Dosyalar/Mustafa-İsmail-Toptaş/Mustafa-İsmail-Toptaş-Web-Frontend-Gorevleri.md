# Mustafa İsmail Toptaş'ın Web Frontend Görevleri
Front-end Test Videosu: Link buraya eklenecek

### 1. Kullanıcı Kişisel Analiz (AI) Arayüzü
**API Endpoint:** `POST /api/ai/analysis` | `GET /api/ai/reports/{reportId}`
**Görev:** Oyuncunun kendi geçmişine ait verilerle yapay zekaya performans analizi yaptırabileceği dinamik `AnalysisPage.jsx` bileşeninin implementasyonu.
**UI Bileşenleri:**
- "Analiz Başlat" / "Sonuçlarımı Yenile" butonları (Gradient tasarımlı)
- Analiz beklenirken interaktif "Yapay Zeka Düşünüyor..." Loading Spinner animasyonu
- Güçlü/Zayıf yönlerin vurgulandığı Modern Card Dashboard tasarımı
**Form Validasyonu:**
- Kullanıcının "Arka arkaya" butonlara spam yapmasını engelleme (API Rate koruma & Disabled flag)
**Kullanıcı Deneyimi (UX):**
- Text akışı hissiyatı (AI metinlerinin okunabilirlik için Markdown olarak render edilmesi)
- API isteği patlarsa anında Error Toast ("Veri işlenemedi") basılması.
**Teknik Detaylar:**
- React Hooks (`useState`, `useEffect`) ile asenkron API sonuçlarının haritalanması.


### 2. Yönetici Yapay Zeka (Prompt) Kontrol Paneli
**API Endpoint:** `GET /api/admin/ai/prompt` | `PUT /api/admin/ai/prompt`
**Görev:** Adminin, sistemdeki arka plan AI çalışma metnini (komut dizisini) görebildiği ve canlı değiştirebildiği `AdminAiPrompt.jsx` arayüzünün kurulumu.
**UI Bileşenleri:**
- Komut düzenlemek için geniş (full-width) Textarea Box.
- "Kaydet / Güncelle" Action butonu.
- Değişiklik uygulanana kadar Placeholder görünümü.
**Form Validasyonu:**
- Prompt inputunun tamamen silinmesini ve boş gönderilmesini engelleme (`trim().length > 10` kuralı)
**Kullanıcı Deneyimi (UX):**
- Update esnasında butonun "Yükleniyor..." state durumunda kitlenmesi (Optimistic feedback)
- Başarısız yetki durumunda izole Modal/Toast uyarısı
**Teknik Detaylar:**
- Axios Interceptor üzerinden Manager Token yetkisi sağlanması.


### 3. Kullanıcı Gelen Bildirimler (Notification) Merkezi
**API Endpoint:** `GET /api/notifications` | `PUT /api/notifications/{notifId}/read` | `DELETE /api/notifications/{notifId}`
**Görev:** Sistem yöneticilerinden gelen duyuruların okunduğu, yönetildiği `NotificationsPage.jsx` sayfasının inşası.
**UI Bileşenleri:**
- Mesaj Kutusu Listeleme Mimarisi (List view)
- "Okunmadı" (Unread) olanlara mavi/sarı ufak nokta (Badge).
- "Tümünü Okundu İşaretle" veya satır bazında okundu işaretleme ikonları (Eye/Check icon)
- Satır silme (x) ikonu
**Kullanıcı Deneyimi (UX):**
- Silme işlemine tıklandığı an elemanın animasyonla sönümlenerek (Fade-out) listeden kaybolması
- Eğer hiç bildirim yoksa şık bir Empty State Grafiği ("Burası şimdilik sessiz" yazısı ve ikonu)
**Teknik Detaylar:**
- Array map'leme ve Javascript `filter` metotlarıyla State optimizasyonu.


### 4. Yönetici Global Bildirim (Broadcast) Gönderim Paneli
**API Endpoint:** `POST /api/admin/notifications`
**Görev:** Adminin topluluğa hitap edebilmesi için oluşturulan Notification Blast (`AdminNotifications.jsx`) sisteminin kurulması.
**UI Bileşenleri:**
- Text Input veya TextArea biçiminde bildirim kompozisyon kutusu.
- "Herkes Gönder" büyük gönderme butonu ve Broadcast Iconu (📢)
- Alt kısımda eski gönderilen duyuruların Geçmiş (History) tablosu
**Form Validasyonu:**
- Boş mesaj atılmaması için minimum String limiti konması.
**Kullanıcı Deneyimi (UX):**
- Gönderime basıldıktan sonra kutunun hızlıca temizlenmesi.
- Web Socket (socket.io) ile eş zamanlı Online olan kullanıcılara anlık toast basılma potansiyelinin idaresi (Opsiyonel Client Entegrasyonu)
**Teknik Detaylar:**
- Backend 201 Response kodu dinlenerek DOM manipulasyonunun sürdürülmesi.
