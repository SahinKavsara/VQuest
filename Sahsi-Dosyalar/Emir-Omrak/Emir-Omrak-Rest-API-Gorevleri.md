# Emir Omrak'ın REST API Metotları
API Test Videosu: Link buraya eklenecek

## Ana Soru Havuzu (Questions) İşlemleri

1. Sistemdeki Soruları Listeleme
Endpoint: GET /api/questions
Authentication: Bearer Token gerekli
Response: 200 OK - Kullanıcının veya sistemin görebildiği soruların (category tabanlı filtreleri dahil) başarıyla listelenmesi


2. Soru Havuzuna Soru Ekleme (Admin)
Endpoint: POST /api/admin/questions
Request Body:
{
  "text": "JavaScript Event Loop nasıl çalışır?",
  "options": [
    "Senkron olarak her şeyi sırayla işler",
    "Call stack boşaldığında Callback Queue'daki işlemleri alır",
    "Sadece asenkron işlemleri tamamen durdurur",
    "Sadece API isteklerini yönetir"
  ],
  "correctAnswer": "Call stack boşaldığında Callback Queue'daki işlemleri alır",
  "category": "65f0123... (Category ID)"
}
Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
Response: 201 Created - Yeni soru havuz sistemine eklendi


3. Soru Güncelleme (Admin)
Endpoint: PUT /api/admin/questions/{questionId}
Path Parameters:
questionId (string, required) - Düzenlenecek Soru ID'si
Request Body:
{
  "text": "JavaScript Event Loop nasıl çalışır? (Güncel)",
  "options": ["..."],
  "correctAnswer": "..."
}
Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
Response: 200 OK - Soru veritabanında güncellendi


4. Soru Silme (Admin)
Endpoint: DELETE /api/admin/questions/{questionId}
Path Parameters:
questionId (string, required) - Silinecek Soru ID'si
Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
Response: 204 No Content - Soru ana havuzdan kalıcı olarak çıkarıldı


## Soru Kategorileri (Categories) Yönetimi

5. Kategorileri Listeleme
Endpoint: GET /api/categories
Authentication: Gerekmez (veya opsiyonel)
Response: 200 OK - Sistemdeki tüm soru kategorileri (Yazılım, Tarih vb.) getirildi


6. Yeni Kategori Ekleme (Admin)
Endpoint: POST /api/admin/categories
Request Body:
{
  "name": "Coğrafya"
}
Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
Response: 201 Created - Kategori sisteme eklendi


7. Kategori İsmi Güncelleme (Admin)
Endpoint: PUT /api/admin/categories/{categoryId}
Path Parameters:
categoryId (string, required) - Düzenlenecek Kategori ID'si
Request Body:
{
  "name": "Fiziki Coğrafya"
}
Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
Response: 200 OK - Kategori adı güncellendi
