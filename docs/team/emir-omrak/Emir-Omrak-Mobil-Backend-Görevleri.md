# Emir Omrak'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Soru Listeleme Servisi

- **API Endpoint:** `GET /api/questions`
- **Auth:** Bearer Token gerekli.
- **Görev:** Mobil uygulamada admin kullanıcının sistemdeki tüm soruları API'den çekip ekranda listelemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Bearer Token ile kimlik doğrulama
  - Soru listesini API'den çekip `Question` modellerine dönüştürme (`_id`, `text`, `options`, `correctAnswer`, `category`)
  - Başarılı yanıt (200 OK) sonrası soru listesi state'e yazılır
  - Hata durumunda (ağ hatası vb.) `Alert.alert` ile kullanıcı bilgilendirilir
  - Pull-to-refresh ile listenin yeniden çekilmesi
- **Teknik Detaylar:**
  - HTTP Client: `axios` (`api.js` instance'ı)
  - Request interceptor aracılığıyla Bearer Token otomatik eklenir (Zustand store → SecureStore fallback)
  - Response interceptor: 401 geldiğinde global olarak oturum kapatılır ve Login ekranına yönlendirilir

## 2. Soru Ekleme Servisi (Admin)

- **API Endpoint:** `POST /api/admin/questions`
- **Auth:** Bearer Token gerekli.
- **Görev:** Admin kullanıcının mobil uygulama üzerinden ana soru havuzuna yeni soru eklemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - JSON formatında `text`, `options`, `correctAnswer`, `category` alanlarını API'ye gönderme
  - 201 Created yanıtı ile dönen yeni soru nesnesini parse edip state listesinin başına ekleme
  - Hata durumunda (400 Bad Request) `Alert.alert` ile hata mesajı gösterme
- **Teknik Detaylar:**
  - Request Body: `{ text, options: [...], correctAnswer, category }`
  - Bearer Token otomatik eklenir (request interceptor)
  - Kaydetme sırasında `saving` state'i ile buton `disabled` bırakılır

## 3. Soru Güncelleme Servisi (Admin)

- **API Endpoint:** `PUT /api/admin/questions/{questionId}`
- **Auth:** Bearer Token gerekli.
- **Görev:** Admin kullanıcının mevcut bir soruyu düzenleyerek içeriğini, şıklarını veya doğru cevabını güncellemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Path parametresi `questionId` ve değişen alanları (`text`, `options`, `correctAnswer`, `category`) API'ye gönderme
  - 200 OK yanıtı ile dönen güncel soru nesnesini parse edip state listesinde ilgili öğeyi güncelleme
  - Hata durumunda `Alert.alert` ile hata mesajı gösterme
- **Teknik Detaylar:**
  - Request Body: `{ text, options: [...], correctAnswer, category }`
  - Bearer Token otomatik eklenir (request interceptor)
  - Güncelleme sırasında `saving` state'i ile buton `disabled` bırakılır

## 4. Soru Silme Servisi (Admin)

- **API Endpoint:** `DELETE /api/admin/questions/{questionId}`
- **Auth:** Bearer Token gerekli.
- **Görev:** Admin kullanıcının bir soruyu kalıcı olarak soru havuzundan silmesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Path parametresi `questionId` ile API'ye DELETE isteği gönderme
  - 204 No Content yanıtı sonrası ilgili soruyu listeden çıkarma (`filter`)
  - Hata durumunda Toast bildirimi ile kullanıcıyı bilgilendirme
- **Teknik Detaylar:**
  - Bearer Token otomatik eklenir (request interceptor)
  - Silme işlemi kullanıcı onayı (confirmation dialog) alındıktan sonra başlatılır

## 5. Kategori Listeleme Servisi

- **API Endpoint:** `GET /api/categories`
- **Auth:** Gerekmez (public endpoint).
- **Görev:** Soru ekleme/düzenleme formlarında kategori seçimi için ve kategori yönetim ekranında sistemdeki tüm kategorilerin çekilmesi.
- **İşlevler:**
  - API'den kategori listesini çekip `Category` modellerine dönüştürme (`_id`, `name`)
  - Hata durumunda `Alert.alert` ile kullanıcı bilgilendirme
  - Pull-to-refresh ile listenin yeniden çekilmesi
- **Teknik Detaylar:**
  - Token gerekmez; `api.js` interceptor'ı token olmadığında isteği yine de atar
  - Hem `CategoriesScreen` hem `QuestionsScreen` içinden bağımsız olarak çağrılır

## 6. Kategori Ekleme Servisi (Admin)

- **API Endpoint:** `POST /api/admin/categories`
- **Auth:** Bearer Token gerekli.
- **Görev:** Admin kullanıcının sisteme yeni soru kategorisi eklemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - JSON formatında `{ name }` alanını API'ye gönderme
  - 201 Created yanıtı ile dönen yeni kategori nesnesini parse edip listeye ekleme
  - 3 aşamalı Promise Toast: "Ekleniyor ⏳" → "Başarıyla eklendi 🎉" veya hata mesajı
- **Teknik Detaylar:**
  - Bearer Token otomatik eklenir (request interceptor)
  - Ekleme sırasında `adding` state'i ile buton `disabled` bırakılır

## 7. Kategori Güncelleme Servisi (Admin)

- **API Endpoint:** `PUT /api/admin/categories/{categoryId}`
- **Auth:** Bearer Token gerekli.
- **Görev:** Admin kullanıcının mevcut bir kategorinin ismini güncellemesini sağlayan servis entegrasyonu.
- **İşlevler:**
  - Path parametresi `categoryId` ve `{ name }` alanını API'ye gönderme
  - 200 OK yanıtı ile dönen güncel kategori nesnesini parse edip listede ilgili öğeyi güncelleme
  - 3 aşamalı Promise Toast: "Güncelleniyor ⏳" → "Başarıyla güncellendi 🎉" veya hata mesajı
- **Teknik Detaylar:**
  - Bearer Token otomatik eklenir (request interceptor)
  - Güncelleme sırasında `updating` state'i ile buton `disabled` bırakılır
