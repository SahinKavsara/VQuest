# Sedat Bakla'nın Web Frontend Görevleri
Front-end Test Videosu: Link buraya eklenecek

### 1. Canlı Lobi Ekranı (Oda Bulma/Kurma) Modülü
**API Endpoint:** `GET /api/rooms` | `POST /api/rooms` | `POST /api/rooms/join-code`
**Görev:** Oyuncuların yeni oyunlar açabildiği veya açık havuzdaki/özel kodlu odalara giriş yaptığı `LobbyPage.jsx` sayfasının tasarımı.
**UI Bileşenleri:**
- Canlı Açık Odalar (Public Rooms) Izgara / Kart Liste (Grid Layout) görünümü.
- Üst panelde "Oda Oluştur" Popup (Modal) Butonu ve Katılım Kodu arama (Search Input) barı.
- Oda Kartlarının içerisinde; "Oda İsmi", "Kurucu Adı", "Kapasite (örn: 3/10)" ve "Kategori" bilgileri.
- Aksiyon olarak "Katıl" (Join) CTA butonu.
**Form Validasyonu:**
- Katılım kodunun minimum metin gereksinimini karşılaması (boş arama yapılmaması).
- Oda kurarken Kapasite (number) inputunun 2 ile 50 arası olması limitasyonu.
**Kullanıcı Deneyimi (UX):**
- Odaya dahil olurken arkaplanda "Bağlanıyor..." loading overlay'i çalıştırılması.
- API'den odalar çekilirken Skeleton Loading (Pulse animasyonu) kullanılması.
**Teknik Detaylar:**
- Socket.io Client kütüphanesi başlatılarak lobiye bağlanan kullanıcının global `roomUpdate` eventleriyle listesini anlık tazelemesi.


### 2. Aktif Oyun Odası (Live Game) Ekranı
**API Endpoint:** `POST /api/rooms/{id}/answers` | `GET /api/rooms/{id}/leaderboard`
**Görev:** İçerideki oyuncuların trivia sorularını çözdüğü, süreyi takip ettiği tam ekran yarışma sistemi olan `GameRoomPage.jsx`'in kodlanması.
**UI Bileşenleri:**
- Üst panelde büyük Progress Bar Timer (Geri sayım çubuğu ve rakamsal süre).
- Soru metni panosu ve Şıkların bulunduğu (4 adet geniş buton) Seçenekler Grid'i.
- Kenar çubuğu (Sidebar) / Alt bar olarak Canlı Skor Tablosu (Leaderboard).
**Form Validasyonu:**
- Süre dolduğunda şıklara tıklanılmasının UI tarafında direkt kilitlenmesi (Disabled state).
**Kullanıcı Deneyimi (UX):**
- Şıkka tıklandığında "Seçiminiz alındı" görsel feedbacki (Buton renginin griye veya sarıya dönmesi).
- Bekleme sırasında "Oyunun Başlaması Bekleniyor!" ekranı.
- Oyun bittiğinde kazananın konfeti animasyonlarıyla vurgulandığı Sonuç popup'ı.
**Teknik Detaylar:**
- Socket üzerinden anlık `newQuestion`, `timerUpdate` ve `gameOver` event dinleyicileri (Hooks) ile React UI componentinin (State'in) senkronizasyonu.


### 3. Yönetici Odaları Kontrol Paneli
**API Endpoint:** `DELETE /api/rooms/{id}` | `DELETE /api/rooms/{roomId}/participants/{userId}`
**Görev:** Adminin aktif odaları denetlediği, manipüle edebildiği sistem tarafı olan `AdminRooms.jsx` in tasarımı.
**UI Bileşenleri:**
- Aktif odaların yatay Table veya liste akışı.
- Zararlı oyuncu için "Kick" (Atma) veya odayı anında kapatma (Close Room) butonları.
**Kullanıcı Deneyimi (UX):**
- İhlal durumunda süreci hızlı atlatabilmek için aksiyon alanının temiz ve erişilebilir olması.
**Teknik Detaylar:**
- Backend API rotalarına admin token bearer'ı eklenerek axios requestlerinin çalıştırılması.
