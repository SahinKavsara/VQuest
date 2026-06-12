# Sedat Bakla'nın Mobil Backend Görevleri


## 1. Oda Oluşturma Servisi
- **API Endpoint:** `POST /api/rooms`
- **Auth:** Bearer Token
- **Görev:** Kullanıcının diğer kişilerin katılabileceği canlı bir yarışma odası (game room) açmasını sağlayan servis entegrasyonu.
- **İşlevler:**
  - Oda bilgilerini (roomName, maxParticipants, duration, isPrivate) alarak API'ye iletme
  - Form validasyonu (zorunlu alanların doldurulması, maksimum katılımcı ve süre sınırları)
  - API'ye POST isteği gönderme ve oluşturulan odanın `roomId` değerini alma
  - Başarılı oluşturma sonrası kullanıcıyı oda lobisine veya oda detay ekranına yönlendirme
  - Hata durumlarını yakalama ve kullanıcıya bildirme
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama (`Authorization: Bearer <token>` header)
  - Request body: `{ roomName, maxParticipants, duration, isPrivate }` (JSON)
  - Response: `{ roomId, roomCode, hostId, status: "waiting" }`
  - Veritabanına yeni oda kaydı oluşturma, `status` alanı `"waiting"` olarak başlatılır
  - Socket.io: Oda oluşturulunca sunucu tarafında ilgili socket room (`socket.join(roomId)`) oluşturulur
  - Hata durumları: `400 Bad Request` (eksik alan), `401 Unauthorized` (geçersiz token)

## 2. Cevap Gönderme Servisi
- **API Endpoint:** `POST /api/rooms/:roomId/answers`
- **Auth:** Bearer Token
- **Görev:** Yarışma esnasında kullanıcının aktif soruya verdiği yanıtın sisteme iletilmesi ve puanlandırılması.
- **İşlevler:**
  - Kullanıcının seçtiği cevabı (`answerId`, `questionId`, `responseTime`) API'ye gönderme
  - Cevabın doğru/yanlış kontrolü ve puan hesaplaması (süreye göre bonus puan desteği)
  - Cevabın veritabanına kaydedilmesi
  - Puan tablosunun (leaderboard) anlık güncellenmesi
  - Cevap sonucunun WebSocket üzerinden tüm oda katılımcılarına yayılması
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama
  - Request body: `{ questionId, answerId, responseTime }` (JSON)
  - Response: `{ isCorrect, pointsEarned, currentScore }`
  - Socket.io: Cevap gönderildikten sonra `leaderboard:update` eventi oda genelinde yayınlanır
  - Veritabanı: `answers` tablosuna kayıt eklenir; `participants` tablosundaki `score` alanı güncellenir
  - Hata durumları: `400 Bad Request` (geçersiz cevap), `401 Unauthorized`, `404 Not Found` (oda/soru bulunamadı)

## 3. Odaya Katılma Servisi
- **API Endpoint:** `PUT /api/rooms/:roomId/join`
- **Auth:** Bearer Token
- **Görev:** Kullanıcının mevcut aktif bir yarışma odasına dahil olmasını sağlayan servis entegrasyonu.
- **İşlevler:**
  - Oda kodu (`roomCode`) veya `roomId` ile katılım isteği gönderme
  - Odanın kapasitesinin dolup dolmadığını ve `status` değerinin uygunluğunu kontrol etme
  - Katılımcıyı `participants` tablosuna ekleme
  - Socket.io üzerinden odadaki diğer kullanıcılara katılımcı bildirimini yayma
  - Başarılı katılım sonrası oda bilgileri ve mevcut katılımcı listesini döndürme
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama
  - Request body: `{ roomCode }` veya path param `roomId` (JSON)
  - Response: `{ roomId, roomName, participants[], hostId, status }`
  - Veritabanı: `participants` tablosuna yeni katılımcı satırı eklenir; `currentCount` alanı güncellenir
  - Socket.io: `participant:joined` eventi oda genelinde broadcast edilir
  - Hata durumları: `400 Bad Request` (oda dolu), `401 Unauthorized`, `404 Not Found` (oda bulunamadı)

## 4. Oda Ayarı Güncelleme Servisi
- **API Endpoint:** `PUT /api/rooms/:roomId/settings`
- **Auth:** Bearer Token (yalnızca oda kurucusu/host)
- **Görev:** Oda kurucusunun mevcut oyun odası ayarlarını (maksimum katılımcı sayısı, süre vb.) güncellemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Güncellenecek alanları (`maxParticipants`, `duration`, `isPrivate`) API'ye iletme
  - Yalnızca oda kurucusunun (host) bu işlemi yapabildiğini doğrulama
  - Veritabanında oda kaydının ilgili alanlarını güncelleme
  - Değişiklikleri Socket.io üzerinden oda katılımcılarına anlık bildirme
  - Başarılı güncelleme sonrası güncel oda bilgilerini döndürme
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama; `userId === room.hostId` yetki kontrolü
  - Request body: `{ maxParticipants?, duration?, isPrivate? }` (kısmi güncelleme desteklenir)
  - Response: `{ roomId, updatedSettings }`
  - Veritabanı: `rooms` tablosunda ilgili satır partial update yapılır
  - Socket.io: `room:settings-updated` eventi oda genelinde yayınlanır
  - Hata durumları: `400 Bad Request` (geçersiz değer), `401 Unauthorized`, `403 Forbidden` (yetkisiz kullanıcı), `404 Not Found`

## 5. Oda Listeleme Servisi
- **API Endpoint:** `GET /api/rooms`
- **Auth:** Bearer Token
- **Görev:** Aktif olan ve katılım sağlanabilecek canlı odaların listelenerek kullanıcıya sunulması.
- **İşlevler:**
  - Durumu `"waiting"` veya `"active"` olan odaları veritabanından sorgulama
  - Oda bilgilerini (roomName, hostName, currentCount, maxParticipants, duration) döndürme
  - Sayfalama (pagination) veya sonsuz kaydırma (infinite scroll) desteği
  - Token süresi dolmuşsa refresh token mekanizmasını tetikleme
  - Boş sonuç durumunda uygun mesaj döndürme
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama
  - Query parametreleri: `?page=1&limit=20&status=waiting`
  - Response: `{ rooms: [...], totalCount, currentPage, totalPages }`
  - Veritabanı: `rooms` tablosunda `status IN ('waiting', 'active')` filtresi ile sorgu yapılır
  - Response caching (kısa TTL, örn. 5 saniye) ile sunucu yükü azaltılır
  - Hata durumları: `401 Unauthorized`, `500 Internal Server Error`

## 6. Puan Tablosu Görüntüleme Servisi
- **API Endpoint:** `GET /api/rooms/:roomId/leaderboard`
- **Auth:** Bearer Token
- **Görev:** Yarışmadaki anlık skorların ve başarı sıralamalarının listelenerek katılımcılara sunulması.
- **İşlevler:**
  - İlgili odanın katılımcı puanlarını sıralı şekilde veritabanından çekme
  - Her katılımcı için (rank, username, score, correctAnswers) bilgilerini döndürme
  - WebSocket üzerinden gerçek zamanlı puan güncellemelerini dinleme ve yayma
  - Kullanıcının kendi sıralamasını ayrıca vurgulayarak döndürme
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama
  - Response: `{ leaderboard: [{ rank, userId, username, score, correctAnswers }], myRank }`
  - Veritabanı: `participants` tablosu `score DESC` ile sıralanarak sorgulanır; `ROW_NUMBER()` ile rank hesaplanır
  - Socket.io: Her doğru cevap sonrası `leaderboard:update` eventi oda üyelerine yayılır (REST polling yerine tercih edilir)
  - Hata durumları: `401 Unauthorized`, `404 Not Found` (oda veya leaderboard bulunamadı)

## 7. Oda Kapatma/Silme Servisi
- **API Endpoint:** `DELETE /api/rooms/:roomId`
- **Auth:** Bearer Token (yalnızca oda kurucusu/host veya sistem)
- **Görev:** Süresi dolan veya oda kurucusu tarafından sonlandırılan canlı odanın kapatılıp erişime kapatılması.
- **İşlevler:**
  - Oda kurucusunun veya sistem zamanlamasının oda kapatma isteği göndermesi
  - Odanın `status` değerini `"closed"` olarak güncelleme
  - Tüm katılımcılara Socket.io üzerinden `room:closed` bildirimi gönderme
  - Katılımcıların socket room bağlantısını sonlandırma
  - Gerekiyorsa oda ve katılımcı verilerini arşivleme (soft delete)
- **Teknik Detaylar:**
  - Bearer Token ile kimlik doğrulama; `userId === room.hostId` yetki kontrolü (sistem çağrılarında atlanır)
  - Veritabanı: `rooms` tablosunda `status = 'closed'`, `closedAt = NOW()` güncellenir (hard delete yerine soft delete önerilir)
  - Socket.io: `room:closed` eventi oda üyelerine broadcast edilir; ardından sunucu tarafında socket room dağıtılır (`socket.leave(roomId)`)
  - Cron Job / Zamanlama: Süresi dolan odalar için otomatik kapatma mekanizması (örn. `node-cron` ile periyodik kontrol)
  - Hata durumları: `401 Unauthorized`, `403 Forbidden` (yetkisiz host), `404 Not Found`
