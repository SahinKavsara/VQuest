# VQuest - Mobil Backend (API Entegrasyon) Görevleri

Bu doküman, VQuest mobil uygulamasının REST API entegrasyonlarını ve ağ (network) katmanı gereksinimlerini tanımlar. Tüm isteklerde HTTP istemcisi (örn. Dio, http) kullanılmalı ve yetki gerektiren tüm isteklere (Kayıt ve Giriş hariç) `Bearer Token` interceptor aracılığıyla otomatik eklenmelidir.

## 1. Kayıt Olma
* **API Metodu:** `POST /api/auth/register`
* **Request Body:** `username`, `email`, `password`
* **Auth:** Gerekmez.
* **Görev:** JSON formatında gönderilen verilerle 201 Created yanıtı beklenmelidir. 400 (Bad Request - Örn: E-posta zaten kullanımda) hataları yakalanıp Frontend'e anlamlı bir mesaj olarak iletilmelidir.

## 2. Giriş Yapma
* **API Metodu:** `POST /api/auth/login`
* **Request Body:** `email`, `password`
* **Auth:** Gerekmez.
* **Görev:** 200 OK yanıtı ile dönen `Bearer Token` ayrıştırılmalı ve cihazın güvenli belleğine (Secure Storage) kaydedilmelidir. Token başarıyla kaydedildikten sonra uygulama içi oturum durumu "Aktif"e çekilmelidir.

## 3. Profil Görüntüleme
* **API Metodu:** `GET /api/profile`
* **Auth:** Bearer Token Gerekli.
* **Görev:** 200 OK yanıtı ile dönen kullanıcı adı, email ve skor verileri modele (Serialization) dönüştürülmelidir. İnternet bağlantısının koptuğu (offline) durumlarda, önceden cache'lenmiş veriler getirilerek uygulamanın çökmesi engellenmelidir.

## 4. Şifre Güncelleme
* **API Metodu:** `PUT /api/profile/password`
* **Request Body:** `oldPassword`, `newPassword`
* **Auth:** Bearer Token Gerekli.
* **Görev:** Eski şifre yanlış girildiğinde dönen 400 veya 401 hataları spesifik olarak yakalanmalı ve UI katmanına haber verilmelidir.

## 5. Kullanıcı Engelleme
* **API Metodu:** `PUT /api/admin/users/:userId/block`
* **Path Parameter:** `userId`
* **Auth:** Bearer Token Gerekli (Admin Yetkisi).
* **Görev:** Admin yetkisi olmayan bir token ile istek atıldığında dönen 403 Forbidden hatası global interceptor tarafından yakalanıp "Yetkisiz İşlem" akışına sokulmalıdır. 200 OK alındığında işlem tamamlanmış kabul edilir.

## 6. Kullanıcı Listeleme
* **API Metodu:** `GET /api/admin/users`
* **Auth:** Bearer Token Gerekli (Admin Yetkisi).
* **Görev:** Dönen büyük veri setini (array) performansı etkilemeden parse etmek. 200 OK ile gelen aktiflik durumu, puan ve kayıt tarihi verileri, Frontend'in liste yapısına uygun modellere dönüştürülmelidir.

## 7. Hesap Silme
* **API Metodu:** `DELETE /api/profile`
* **Auth:** Bearer Token Gerekli (Kendi hesabını silme yetkisi).
* **Görev:** API'den 204 No Content yanıtı alındığı anda; cihazdaki `Bearer Token` güvenli bellekten silinmeli, varsa yerel veritabanı temizlenmeli ve kullanıcı oturumu tamamen kapatılmalıdır.