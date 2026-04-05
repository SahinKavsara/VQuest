# Ömer Said Karakuş'un REST API Metotları
https://www.youtube.com/watch?v=Kkpk1ry7fTE

## Kimlik Doğrulama (Auth) & Profil İşlemleri

1.⁠ ⁠Üye Olma (Kayıt)
•⁠  ⁠Endpoint: ⁠ `POST /api/auth/register`⁠
•⁠  ⁠Request Body:
```json
{
  "username": "vdev_omer",
  "email": "omer@vquest.com",
  "password": "Sifre123!"
}
```
Authentication: Gerekmez

Response: `201 Created` - Kullanıcı başarıyla oluşturuldu ve veritabanına kaydedildi

2. Giriş Yapma (Login)

Endpoint: `POST /api/auth/login`

Request Body:

```json
{
  "email": "omer@vquest.com",
  "password": "Sifre123!"
}
```
Authentication: Gerekmez

Response: `200 OK` - Başarıyla giriş yapıldı ve Bearer Token döndürüldü

3. Kullanıcı Bilgilerini (Profil) Görüntüleme

Endpoint: `GET /api/profile`

Authentication: Bearer Token gerekli

Response: `200 OK` - Kullanıcı bilgileri (Kullanıcı adı, email ve skor) başarıyla getirildi

4. Kullanıcı Bilgilerini (Şifre) Güncelleme

Endpoint: `PUT /api/profile/password`

Request Body:

```json
{
  "oldPassword": "EskiSifre123!",
  "newPassword": "YeniSifre456!"
}
```
Authentication: Bearer Token gerekli

Response: `200 OK` - Kullanıcı şifresi başarıyla güncellendi

5. Hesap Silme

Endpoint: `DELETE /api/profile`

Authentication: Bearer Token gerekli (Kendi hesabını silme yetkisi)

Response: `204 No Content` - Kullanıcı hesabı tüm verileriyle başarıyla silindi

Admin (Yönetici) İşlemleri
6. Kullanıcı Listeleme

Endpoint: `GET /api/admin/users`

Authentication: Bearer Token gerekli (Sadece Admin yetkisi)

Response: `200 OK` - Tüm kullanıcıların listesi (aktiflik, puan, kayıt tarihi) başarıyla getirildi

7. Kullanıcı Engelleme

Endpoint: `PUT /api/admin/users/:userId/block`

Authentication: Bearer Token gerekli (Sadece Admin yetkisi)

Response: `200 OK` - Kullanıcının sisteme girişi ve yarışmalara katılımı başarıyla engellendi
