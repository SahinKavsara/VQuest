# Şahin Kavsara'nın REST API Metotları

API Test Videosu: https://drive.google.com/file/d/1ImDIuVVli9-kYcLQKjN0T3wrLm7B-883/view

## Özel Soru Paketleri (Packages) Yönetimi

1. Soru Paketi Oluşturma

* Endpoint: `POST /api/packages`
* Request Body:

  ```json
  {
    "title": "İleri Düzey Yazılım Soruları",
    "description": "Javascript ve Python ustaları için özenle seçilmiş sorular",
    "isPublic": true,
    "questions": [
      "65f123456789...", 
      "65f987654321..."
    ]
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `201 Created` - Paket başarıyla oluşturuldu

2. Soru Paketi Listeleme

* Endpoint: `GET /api/packages`
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Paketler başarıyla listelendi

3. Soru Paketi Güncelleme

* Endpoint: `PUT /api/packages/{packageId}`
* Path Parameters:
  * `packageId` (string, required) - Soru paketi ID'si
* Request Body:

  ```json
  {
    "title": "İleri Düzey Yazılım Soruları (Güncellendi)",
    "description": "Yalnızca uzmanlar girebilir. Sorular güncellendi.",
    "isPublic": false,
    "questions": [
      "65f123456789...", 
      "yeni-soru-id..."
    ]
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `200 OK` - Paket başarıyla güncellendi

4. Soru Paketi Silme

* Endpoint: `DELETE /api/packages/{packageId}`
* Path Parameters:
  * `packageId` (string, required) - Soru paketi ID'si
* Authentication: Bearer Token gerekli
* Response: `204 No Content` - Soru paketi başarıyla silindi ve pasif hale getirildi

## Soru Önerme (Suggestions) Sistemi

5. Soru Önerisi Yapma

* Endpoint: `POST /api/suggestions`
* Request Body:

  ```json
  {
    "questionText": "React kütüphanesinde durum yönetimi için hangi kanca (hook) kullanılır?",
    "options": [
      "useEffect",
      "useState",
      "useContext",
      "useMemo"
    ],
    "correctAnswer": "useState",
    "category": "65f0123..."
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `201 Created` - Soru önerisi sisteme başarıyla gönderildi

6. Önerilen Soruları Listeleme

* Endpoint: `GET /api/admin/suggestions`
* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `200 OK` - Tüm bekleyen soru önerileri başarıyla getirildi

7. Önerilen Soruyu Reddetme (Silme)

* Endpoint: `DELETE /api/admin/suggestions/{suggestionId}`
* Path Parameters:
  * `suggestionId` (string, required) - Soru önerisi ID'si
* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `204 No Content` - Soru önerisi başarıyla reddedildi ve silindi
