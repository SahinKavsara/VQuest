# Şahin Kavsara'nın Mobil Backend Görevleri

## 1. Soru Paketi Oluşturma Servisi
- **API Endpoint:** `POST /api/packages`
- **Görev:** Mobil uygulamada kullanıcının havuzdaki sorulardan veya kendi yazdığı sorulardan oluşan özel bir soru seti (koleksiyon) hazırlamasını sağlayan servis entegrasyonu.
- **İşlevler:**
  - Paket bilgilerini (title, description, isPublic, questions) toplama
  - Form validasyonu (gerekli alanların doldurulması)
  - API'ye POST isteği gönderme
  - Başarılı oluşturma durumunda kullanıcıyı paket detay veya liste ekranına yönlendirme
  - Hata durumlarını yakalama ve kullanıcıya gösterilmesi
- **Teknik Detaylar:**
  - HTTP Client kullanımı (Retrofit/OkHttp - Android, URLSession/Alamofire - iOS)
  - Request/Response model sınıfları oluşturma
  - Authentication header ekleme (Bearer Token)
  - Error handling ve retry mekanizması
  - Loading state yönetimi

## 2. Soru Önerisi Yapma Servisi
- **API Endpoint:** `POST /api/suggestions`
- **Görev:** Kullanıcının uygulamanın ana soru havuzuna eklenmesi amacıyla yönetime yeni bir soru tavsiyesi göndermesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Soru bilgilerini (questionText, options, correctAnswer, category) toplama
  - Form validasyonu (en az 2 şık girilmesi, doğru cevabın belirtilmesi)
  - API'ye POST isteği gönderme
  - Başarılı gönderim durumunda kullanıcıya teşekkür mesajı gösterme ve formu temizleme
  - Hata durumlarını yakalama ve kullanıcıya gösterilmesi
- **Teknik Detaylar:**
  - Request body oluşturma (JSON formatında soru ve şıklar)
  - Authentication header ekleme (Bearer Token)
  - Response parsing ve UI update
  - Error handling (400 Bad Request)

## 3. Soru Paketi Güncelleme Servisi
- **API Endpoint:** `PUT /api/packages/{packageId}`
- **Görev:** Kullanıcının daha önce hazırladığı özel soru paketinin bilgilerini ve içerdiği soruları güncellemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Paket düzenleme ekranından güncel verileri toplama
  - Değişen bilgilerin ve soru listesinin (eklenen/çıkarılan) validasyonu
  - API'ye PUT isteği gönderme
  - Başarılı güncelleme sonrası cache'i veya listeyi güncelleme
  - Optimistic UI update ile kullanıcı deneyimini iyileştirme
- **Teknik Detaylar:**
  - Path parametresi (packageId) ve request body kullanımı
  - Authentication header ekleme (Bearer Token)
  - Partial update desteği (yalnızca değişen alanları gönderme veya tüm seti yenileme)
  - Conflict resolution (eşzamanlı güncelleme durumları)
  - Error handling ve kullanıcı bildirimleri

## 4. Soru Paketi Listeleme Servisi
- **API Endpoint:** `GET /api/packages`
- **Görev:** Kullanıcının kendi oluşturduğu tüm özel soru paketlerini API'den çekip profilinde liste halinde gösterme.
- **İşlevler:**
  - JWT token ile kimlik doğrulama
  - Kullanıcının paketlerini getirme
  - Gelen veriyi parse edip UI'da (RecyclerView/List) gösterme
  - Token süresi dolmuşsa refresh token ile yenileme
  - Offline durumda cache'den veri gösterme veya hata mesajı
- **Teknik Detaylar:**
  - Authentication header ekleme (Bearer Token)
  - Response caching stratejisi
  - Token refresh mekanizması
  - Error handling (401 Unauthorized, vb.) ve empty state gösterimi

## 5. Önerilen Soruları Listeleme Servisi
- **API Endpoint:** `GET /api/admin/suggestions`
- **Görev:** Yönetici yetkisine sahip kişilerin, sisteme eklenmesi için gönderilmiş soru tavsiyelerini onaylamak veya reddetmek üzere listeleyebileceği servis entegrasyonu.
- **İşlevler:**
  - Admin yetkisi kontrolü ve kimlik doğrulama
  - Bekleyen soru önerilerini API'den çekme
  - Önerileri liste ekranında (onay/red butonlarıyla birlikte) gösterme
  - Sayfalama (pagination) veya lazy loading (gerekiyorsa)
- **Teknik Detaylar:**
  - Authentication header ekleme (Bearer Token)
  - Model mapping (Öneri objelerini UI modellerine çevirme)
  - Error handling (403 Forbidden - Yetkisiz erişim)
  - Pull-to-refresh mekanizması

## 6. Soru Paketi Silme Servisi
- **API Endpoint:** `DELETE /api/packages/{packageId}`
- **Görev:** Kullanıcının artık kullanmak istemediği soru paketini kalıcı olarak sistemden kaldırmasını sağlayan servis entegrasyonu.
- **İşlevler:**
  - Kullanıcıya silme işlemi için onay (confirmation) dialog'u gösterme
  - API'ye DELETE isteği gönderme
  - Başarılı silme sonrası ilgili paketi listeden ve cache'den çıkarma
  - Silme işlemi sırasında loading gösterimi
- **Teknik Detaylar:**
  - Destructive action için confirmation dialog
  - Path parametresi kullanımı
  - List state update (silinen öğeyi UI'dan animasyonlu çıkarma)
  - Error handling (401, 403, 404)

## 7. Önerilen Soruyu Reddetme Servisi
- **API Endpoint:** `DELETE /api/admin/suggestions/{suggestionId}`
- **Görev:** Yöneticinin, kullanıcılar tarafından önerilen ancak uygun bulunmayan bir soru tavsiyesini silerek reddetmesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Reddetme butonuna basıldığında API'ye DELETE isteği gönderme
  - İsteğe bağlı olarak red nedenini almak için dialog gösterme (isteğe bağlı)
  - Başarılı işlem sonrası ilgili öneriyi listeden çıkarma
  - İşlem sonucunu (Snackbar/Toast) ile bildirme
- **Teknik Detaylar:**
  - Path parametresi kullanımı
  - Authentication header ekleme (Bearer Token)
  - UI state update (listeden anında çıkarma)
  - Error handling (403, 404)

## 8. Önerilen Soruyu Kabul Etme (Onaylama) Servisi
- **API Endpoint:** `POST /api/admin/questions` (1) & `DELETE /api/admin/suggestions/{suggestionId}` (2)
- **Görev:** Yöneticinin onayladığı bir soru önerisini kalıcı soru havuzuna eklemesi ve ardından öneriler listesinden silmesi işlemlerini yöneten servis entegrasyonu.
- **İşlevler:**
  - Kabul et butonuna basıldığında ilk olarak POST isteği ile soruyu havuz için kaydetme
  - İlk işlem başarılı olursa DELETE isteği ile öneriyi silme
  - Her iki işlem de başarılı olduğunda öğeyi listeden çıkarma
  - Ardışık istekleri yönetme ve hata durumunda kullanıcıyı bilgilendirme
- **Teknik Detaylar:**
  - Zincirleme API istekleri (RxJava/Coroutines - Android, Combine/Async-Await - iOS)
  - Authentication header ekleme (Bearer Token)
  - İşlem sırasındaki state'i yönetme (Loading durumu, kısmi başarısızlık)
  - UI state update (listeden çıkarma)
  - Error handling ve rollback mekanizmaları (gerekiyorsa)
