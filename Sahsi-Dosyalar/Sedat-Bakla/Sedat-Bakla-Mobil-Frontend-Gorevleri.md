# Sedat Bakla'nın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Oda Oluşturma Ekranı
- **API Endpoint:** `POST /api/rooms`
- **Görev:** Kullanıcının canlı yarışma odası oluşturabilmesi için mobil ekran tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Oda adı (roomName) input alanı
  - Maksimum katılımcı sayısı (maxParticipants) için sayısal input veya stepper
  - Süre (duration) seçimi için Picker/Dropdown (örn. 1 dk, 3 dk, 5 dk)
  - Gizlilik ayarı (isPrivate) için switch/toggle butonu
  - "Oda Oluştur" butonu
  - Loading indicator (istek süresince)
- **Form Validasyonu:**
  - Oda adı boş bırakılamaz (real-time validation)
  - Maksimum katılımcı sayısı 2–50 arasında olmalı
  - Süre alanı seçilmemiş olamaz
  - Tüm zorunlu alanlar doldurulmadan buton disabled kalır
- **Kullanıcı Deneyimi:**
  - Form hataları ilgili alanların altında anlık gösterilir
  - Başarılı oluşturma sonrası oda lobisi ekranına otomatik yönlendirme
  - Hata durumunda `Alert.alert` ile kullanıcıya açıklayıcı mesaj gösterilir
  - ScrollView kullanımı (klavye açıldığında form içeriğinin gizlenmemesi)
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.post('/api/rooms', payload)` çağrısı
  - Zustand store: `useRoomStore` içinde `createRoom` action'ı; oluşturulan oda `currentRoom` state'ine atanır
  - Hata anında `Alert.alert('Hata', error.response?.data?.message || 'Oda oluşturulamadı.')` ile kullanıcı bilgilendirilir
  - Navigation: Başarılı yanıt sonrası `navigation.navigate('RoomLobby', { roomId })` ile yönlendirme yapılır

## 2. Cevap Gönderme Ekranı
- **API Endpoint:** `POST /api/rooms/:roomId/answers`
- **Görev:** Yarışma esnasında kullanıcının aktif soruya cevap verebileceği mobil soru ekranının tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Aktif soru metni (büyük ve okunaklı tipografi)
  - Cevap şıkları için tıklanabilir kart listesi (A, B, C, D)
  - Kalan süreyi gösteren geri sayım çubuğu (progress bar / countdown timer)
  - Seçilen cevap üzerinde highlight/vurgu animasyonu
  - Cevap gönderildikten sonra doğru/yanlış görsel geri bildirimi
- **Kullanıcı Deneyimi:**
  - Şık seçildiğinde anında görsel geri bildirim (renk değişimi, animasyon)
  - Cevap gönderilince şıklar devre dışı bırakılır (çift gönderimi önler)
  - Süre dolduğunda cevap verilmemişse otomatik olarak "süre doldu" durumu gösterilir
  - Doğru cevap yeşil, yanlış cevap kırmızı renk ile işaretlenir
  - Hata durumunda `Alert.alert` ile kullanıcıya bilgi verilir
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.post('/api/rooms/:roomId/answers', payload)` çağrısı
  - Zustand store: `useRoomStore` içinde `submitAnswer` action'ı; `currentScore` ve `lastAnswerResult` state'leri güncellenir
  - Socket.io client: `leaderboard:update` eventi dinlenerek puan tablosu anlık güncellenir
  - Hata anında `Alert.alert('Hata', 'Cevap gönderilemedi, lütfen tekrar deneyin.')` ile bilgilendirme yapılır
  - `useCallback` veya `useMemo` ile gereksiz yeniden render'lar önlenir

## 3. Odaya Katılma Ekranı
- **API Endpoint:** `PUT /api/rooms/:roomId/join`
- **Görev:** Kullanıcının mevcut aktif bir yarışma odasına kod girerek veya listeden seçerek katılmasını sağlayan ekran tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Oda kodu (roomCode) girişi için büyük ve belirgin input alanı
  - "Odaya Katıl" butonu
  - Alternatif olarak oda listesine yönlendiren link/buton
  - Loading indicator (katılım isteği süresince)
- **Form Validasyonu:**
  - Oda kodu boş bırakılamaz
  - Hatalı formatlı kod girildiğinde anlık uyarı gösterilir
  - Buton, yalnızca geçerli uzunlukta kod girildiğinde aktif olur
- **Kullanıcı Deneyimi:**
  - Büyük, net input alanı ile kolay oda kodu girişi
  - Başarılı katılım sonrası oda lobisi ekranına yönlendirme
  - Oda dolu veya bulunamadı gibi durumlarda `Alert.alert` ile açıklayıcı hata mesajı
  - Klavye açıkken form içeriğinin gizlenmemesi için KeyboardAvoidingView
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.put('/api/rooms/:roomId/join', { roomCode })` çağrısı
  - Zustand store: `useRoomStore` içinde `joinRoom` action'ı; `currentRoom` ve `participants` state'leri güncellenir
  - Socket.io client: Başarılı katılım sonrası `socket.emit('join:room', { roomId })` ile socket odasına dahil olunur
  - Hata anında `Alert.alert('Katılım Başarısız', error.response?.data?.message || 'Odaya katılınamadı.')` gösterilir
  - Navigation: Başarılı yanıt sonrası `navigation.navigate('RoomLobby', { roomId })` ile yönlendirme

## 4. Oda Ayarı Güncelleme Ekranı
- **API Endpoint:** `PUT /api/rooms/:roomId/settings`
- **Görev:** Oda kurucusunun yarışma odası ayarlarını (katılımcı sayısı, süre, gizlilik) güncelleyebileceği ekran tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Mevcut değerleriyle dolu maksimum katılımcı sayısı input/stepper'ı
  - Mevcut değeriyle dolu süre seçici (Picker/Dropdown)
  - Gizlilik ayarı switch/toggle'ı (mevcut durumda)
  - "Kaydet" ve "İptal" butonları
  - Loading indicator (kaydetme işlemi süresince)
- **Form Validasyonu:**
  - Değer aralıkları kontrol edilir (katılımcı: 2–50, süre: geçerli seçenekler)
  - Herhangi bir değişiklik yapılmadıysa "Kaydet" butonu disabled kalır
  - Değişiklik yapılıp kaydedilmeden geri çıkılmak istendiğinde onay dialog'u gösterilir
- **Kullanıcı Deneyimi:**
  - Ayarlar değiştirildiğinde anlık önizleme veya değer gösterimi
  - Başarılı güncelleme sonrası oda lobisine geri dönme
  - Hata durumunda `Alert.alert` ile kullanıcıya açıklayıcı mesaj gösterilir
  - Yalnızca oda kurucusuna görünen/erişilebilen ekran (yetki kontrolü frontend'de de yapılır)
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.put('/api/rooms/:roomId/settings', updatedSettings)` çağrısı
  - Zustand store: `useRoomStore` içinde `updateRoomSettings` action'ı; `currentRoom.settings` state'i güncellenir
  - Socket.io client: `room:settings-updated` eventi dinlenerek tüm katılımcıların UI'ı anlık güncellenir
  - Hata anında `Alert.alert('Güncelleme Başarısız', error.response?.data?.message || 'Ayarlar güncellenemedi.')` gösterilir

## 5. Oda Listeleme Ekranı
- **API Endpoint:** `GET /api/rooms`
- **Görev:** Kullanıcının aktif yarışma odalarını listeleyip istediğine katılım sağlayabileceği ekran tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Oda kartları (roomName, hostName, currentCount/maxParticipants, kalan süre)
  - Pull-to-refresh mekanizması
  - Arama/filtreleme çubuğu (opsiyonel)
  - "Yeni Oda Oluştur" kısayol butonu (sağ üst köşe veya FAB)
  - Sayfa sonunda yükleme göstergesi (infinite scroll desteği)
- **Kullanıcı Deneyimi:**
  - Veri yüklenirken Skeleton loading kartları gösterilir
  - Hiç oda yoksa yönlendirici empty state mesajı ("Henüz aktif oda yok, ilk odayı sen oluştur!")
  - Oda kartına tıklanınca katılım ekranına veya doğrudan odaya yönlendirme
  - Hata durumunda `Alert.alert` ile kullanıcıya bilgi verilir ve yenileme seçeneği sunulur
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.get('/api/rooms', { params: { page, limit } })` çağrısı
  - Zustand store: `useRoomStore` içinde `fetchRooms` action'ı; `rooms[]`, `isLoading` ve `hasNextPage` state'leri yönetilir
  - FlatList / FlashList ile performanslı liste render'ı; `keyExtractor` olarak `roomId` kullanılır
  - Hata anında `Alert.alert('Yükleme Hatası', 'Odalar getirilemedi, lütfen tekrar deneyin.')` gösterilir
  - Pull-to-refresh için `refreshing` ve `onRefresh` prop'ları yönetilir

## 6. Puan Tablosu (Leaderboard) Ekranı
- **API Endpoint:** `GET /api/rooms/:roomId/leaderboard`
- **Görev:** Yarışmadaki anlık skorların ve katılımcı sıralamalarının listeleneceği puan tablosu ekranının tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Sıralama kartları (rank ikonu/numarası, avatar, kullanıcı adı, puan, doğru cevap sayısı)
  - Kullanıcının kendi satırının görsel olarak vurgulanması (farklı renk veya badge)
  - İlk 3'e özel altın/gümüş/bronz rozet veya ikon
  - Anlık güncelleme için animasyonlu sıra değişimi
- **Kullanıcı Deneyimi:**
  - Puan değişikliklerinde smooth animasyon ile sıralama güncellenir
  - Kullanıcının kendi sırası ekranın alt kısmında sabit olarak gösterilir (sticky footer)
  - Veri yüklenirken Skeleton loading gösterilir
  - Hata durumunda `Alert.alert` ile kullanıcıya bilgi verilir
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden ilk yükleme için `axios.get('/api/rooms/:roomId/leaderboard')` çağrısı
  - Zustand store: `useLeaderboardStore` içinde `leaderboard[]`, `myRank` ve `isLoading` state'leri yönetilir
  - Socket.io client: `leaderboard:update` eventi dinlenerek gelen payload ile Zustand store anlık güncellenir (REST polling gerekmez)
  - Hata anında `Alert.alert('Sıralama Yüklenemedi', 'Puan tablosu getirilemedi.')` gösterilir
  - `Animated` API veya `react-native-reanimated` kullanılarak sıralama değişimlerinde smooth geçiş animasyonu sağlanır

## 7. Oda Kapatma/Sonlandırma Arayüzü
- **API Endpoint:** `DELETE /api/rooms/:roomId`
- **Görev:** Oda kurucusunun yarışmayı sonlandırabileceği ve odayı kapatabileceği arayüz akışının tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Oda lobi veya yönetim ekranında "Odayı Kapat" butonu (yalnızca host'a görünür, kırmızı/dikkat çekici tasarım)
  - Onay dialog'u ("Bu odayı kalıcı olarak kapatmak istediğinize emin misiniz?")
  - İşlem sırasında loading indicator
- **Kullanıcı Deneyimi:**
  - Yalnızca oda kurucusuna görünür (yetki kontrolü frontend'de de yapılır)
  - Destructive action için güçlü görsel uyarılar (kırmızı renk, uyarı ikonu, net mesaj)
  - Oda kapatılınca tüm katılımcılar ana menüye yönlendirilir; bilgilendirici mesaj gösterilir
  - Hata durumunda `Alert.alert` ile kullanıcıya açıklayıcı mesaj gösterilir
- **Akış Adımları:**
  1. Host, "Odayı Kapat" butonuna basar
  2. Onay dialog'u gösterilir
  3. Onaylandığında `DELETE` isteği gönderilir
  4. Başarılı işlem sonrası tüm katılımcılar ana ekrana yönlendirilir
- **Teknik Detaylar:**
  - `api.js` instance'ı üzerinden `axios.delete('/api/rooms/:roomId')` çağrısı
  - Zustand store: `useRoomStore` içinde `closeRoom` action'ı; `currentRoom` state'i `null`'a sıfırlanır
  - Socket.io client: `room:closed` eventi dinlenerek tüm katılımcıların ekranı otomatik ana menüye yönlendirilir (`navigation.reset(...)` kullanılır)
  - Hata anında `Alert.alert('Kapatma Başarısız', error.response?.data?.message || 'Oda kapatılamadı.')` gösterilir
