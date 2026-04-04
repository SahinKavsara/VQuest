# Emir Omrak'ın REST API Metotları

API Test Videosu: Link buraya eklenecek

## Ana Soru Havuzu (Questions) İşlemleri

1. Sistemdeki Soruları Listeleme

* Endpoint: `GET /api/questions`
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Soru havuzu başarıyla listelendi

2. Soru Havuzuna Soru Ekleme (Admin)

* Endpoint: `POST /api/admin/questions`
* Request Body:

  ```json
  {
    "text": "JavaScript Event Loop nasıl çalışır?",
    "options": [
      "Senkron olarak her şeyi sırayla işler",
      "Call stack boşaldığında Callback Queue'yi alır",
      "Sadece asenkron işlemleri durdurur",
      "Sadece istekleri yönetir"
    ],
    "correctAnswer": "Call stack boşaldığında Callback Queue'yi alır",
    "category": "65f0123..."
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `201 Created` - Yeni soru havuz sistemine eklendi

3. Soru Güncelleme (Admin)

* Endpoint: `PUT /api/admin/questions/{questionId}`
* Path Parameters:
  * `questionId` (string, required) - Düzenlenecek Soru ID'si
* Request Body:

  ```json
  {
    "text": "JavaScript Event Loop nasıl çalışır? (Güncel)",
    "options": [
      "Secenek A",
      "Secenek B"
    ],
    "correctAnswer": "Secenek A"
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `200 OK` - Soru veritabanında güncellendi

4. Soru Silme (Admin)

* Endpoint: `DELETE /api/admin/questions/{questionId}`
* Path Parameters:
  * `questionId` (string, required) - Silinecek Soru ID'si
* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `204 No Content` - Soru kalıcı olarak silindi

## Soru Kategorileri (Categories) Yönetimi

5. Kategorileri Listeleme

* Endpoint: `GET /api/categories`
* Authentication: Gerekmez (Veya opsiyonel)
* Response: `200 OK` - Sistemdeki tüm soru kategorileri getirildi

6. Yeni Kategori Ekleme (Admin)

* Endpoint: `POST /api/admin/categories`
* Request Body:

  ```json
  {
    "name": "Coğrafya"
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `201 Created` - Kategori sisteme eklendi

7. Kategori İsmi Güncelleme (Admin)

* Endpoint: `PUT /api/admin/categories/{categoryId}`
* Path Parameters:
  * `categoryId` (string, required) - Kategori ID'si
* Request Body:

  ```json
  {
    "name": "Fiziki Coğrafya"
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `200 OK` - Kategori adı güncellendi
