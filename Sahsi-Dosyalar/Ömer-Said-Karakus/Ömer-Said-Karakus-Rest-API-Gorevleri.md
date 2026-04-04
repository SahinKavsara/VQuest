# Ömer Said Karakuş'un REST API Metotları

API Test Videosu: Link buraya eklenecek

## Kimlik Doğrulama (Auth) & Profil İşlemleri

1. Üye Olma (Kayıt)

* Endpoint: `POST /api/auth/register`
* Request Body:

  ```json
  {
    "username": "vdev_omer",
    "email": "omer@vquest.com",
    "password": "Sifre123!"
  }
  ```

* Authentication: Gerekmez
* Response: `201 Created` - Kullanıcı başarıyla oluşturuldu ve veritabanına kaydedildi

2. Kullanıcı Bilgilerini (Profil) Görüntüleme

* Endpoint: `GET /api/profile`
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Kullanıcı bilgileri (Kullanıcı adı, email ve skor) başarıyla getirildi

3. Kullanıcı Bilgilerini (Şifre) Güncelleme

* Endpoint: `PUT /api/profile/password`
* Request Body:

  ```json
  {
    "newPassword": "YeniSifre456!"
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `200 OK` - Kullanıcı şifresi başarıyla güncellendi

4. Kullanıcı Silme

* Endpoint: `DELETE /api/profile`
* Authentication: Bearer Token gerekli (Kendi hesabını silme yetkisi)
* Response: `204 No Content` - Kullanıcı hesabı tüm verileriyle başarıyla silindi
