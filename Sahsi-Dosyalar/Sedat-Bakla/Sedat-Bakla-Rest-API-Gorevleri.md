# Sedat Bakla'nın REST API Metotları

API Test Videosu: Link buraya eklenecek

## Canlı Oyun Odaları (Game Rooms) Yönetimi

1. Yeni Oyun Odası Oluşturma

* Endpoint: `POST /api/rooms`
* Request Body:

  ```json
  {
    "categoryId": "65f0123...",
    "maxParticipants": 10,
    "roomName": "Yazılım Uzmanları"
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `201 Created` - Oda başarıyla oluşturuldu ve katılım kodu (_joinCode_) üretildi

2. Aktif Odaları Listeleme ve Detay Görüntüleme

* Endpoint: `GET /api/rooms` (Liste)
* Endpoint: `GET /api/rooms/{roomId}` (Detay)
* Path Parameters:
  * `roomId` (string, optional) - Odaların spesifik ID'si
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Lobide bekleyen odalar listelendi

3. Odaya Katılma (Açık Odalar)

* Endpoint: `PUT /api/rooms/{roomId}/join`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Odaya başarıyla dahil olundu ve WebSocket kanalına bağlanıldı

4. Özel Davet Kodu İle Katılma & Oyunu Başlatma

* Endpoint: `POST /api/rooms/join-code`
* Request Body:

  ```json
  {
    "code": "VQ-7A3B"
  }
  ```

* Endpoint: `POST /api/rooms/{roomId}/start`
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Kullanıcı kod ile odaya atandı / Oyun döngüsü başlatıldı

5. Oda Ayarlarını Güncelleme

* Endpoint: `PUT /api/rooms/{roomId}/settings`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
* Request Body:

  ```json
  {
    "maxParticipants": 20,
    "timeLimit": 45
  }
  ```

* Authentication: Bearer Token gerekli (Oda kurucusu olmalı)
* Response: `200 OK` - Oda ayarları başarıyla güncellendi

## Oyun İçi Dinamikler ve Etkileşimler

6. Soruya Cevap Gönderme (Submit)

* Endpoint: `POST /api/rooms/{roomId}/answers`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
* Request Body:

  ```json
  {
    "questionId": "65123qwe...",
    "answer": "Polymorphism"
  }
  ```

* Authentication: Bearer Token gerekli
* Response: `200 OK` - Cevap işlendi ve doğrulandı

7. Anlık Liderlik (Puan) Tablosunu Görüntüleme

* Endpoint: `GET /api/rooms/{roomId}/leaderboard`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Katılımcıların canlı skor durumları getirildi

8. Odadan Katılımcı Atma

* Endpoint: `DELETE /api/rooms/{roomId}/participants/{userId}`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
  * `userId` (string, required) - Atılacak Kullanıcı ID'si
* Authentication: Bearer Token gerekli (Oda kurucusu olmalı)
* Response: `204 No Content` - Kullanıcı odadan çıkarıldı

9. Odayı Kapatma / Sonlandırma

* Endpoint: `DELETE /api/rooms/{roomId}`
* Path Parameters:
  * `roomId` (string, required) - Odanın Object ID'si
* Authentication: Bearer Token gerekli (Oda Kurucusu veya Admin olmalı)
* Response: `204 No Content` - Oda kapatıldı ve kalıcı olarak silindi
