# Sedat Bakla'nın REST API Metotları
API Test Videosu: Link buraya eklenecek

## Canlı Oyun Odaları (Game Rooms) Yönetimi

1. Yeni Oyun Odası Oluşturma
Endpoint: POST /api/rooms
Request Body:
{
  "categoryId": "65f0123... (Kategori ID)",
  "maxParticipants": 10,
  "roomName": "Yazılım Uzmanları Yarışıyor"
}
Authentication: Bearer Token gerekli
Response: 201 Created - Oda başarıyla oluşturuldu ve katılım kodu (_joinCode_) üretildi


2. Aktif Odaları Listeleme ve Detay Görüntüleme
Endpoint: GET /api/rooms  ve  GET /api/rooms/{roomId}
Path Parameters:
roomId (string, optional) - Spesifik bir oda aranıyorsa ID girilir
Authentication: Bearer Token gerekli
Response: 200 OK - Lobide bekleyen canlı odalar listelendi


3. Odaya Katılma (İstek)
Endpoint: PUT /api/rooms/{roomId}/join
Path Parameters:
roomId (string, required) - Odanın Object ID'si
Authentication: Bearer Token gerekli
Response: 200 OK - Odaya başarıyla dahil olundu ve WebSocket kanalına bağlanıldı


4. Özel Davet Kodu İle Katılma & Oyunu Başlatma
Endpoint: POST /api/rooms/join-code  ve  POST /api/rooms/{roomId}/start
Request Body (join-code için):
{
  "code": "VQ-7A3B"
}
Authentication: Bearer Token gerekli
Response: 200 OK - Kullanıcı kod ile odaya atandı / Oyun döngüsü başlatıldı


5. Oda Ayarlarını Güncelleme
Endpoint: PUT /api/rooms/{roomId}/settings
Path Parameters:
roomId (string, required) - Odanın Object ID'si
Request Body:
{
  "maxParticipants": 20,
  "timeLimit": 45
}
Authentication: Bearer Token gerekli (Oda kurucusu olmalı)
Response: 200 OK - Oda ayarları güncellendi


## Oyun İçi Dinamikler ve Etkileşimler

6. Soruya Cevap Gönderme (Submit)
Endpoint: POST /api/rooms/{roomId}/answers
Path Parameters:
roomId (string, required) - Odanın Object ID'si
Request Body:
{
  "questionId": "65123qwe...",
  "answer": "Polymorphism"
}
Authentication: Bearer Token gerekli
Response: 200 OK - Cevap kaydedildi ve sistem tarafından doğrulandı


7. Anlık Liderlik (Puan) Tablosunu Görüntüleme
Endpoint: GET /api/rooms/{roomId}/leaderboard
Path Parameters:
roomId (string, required) - Odanın Object ID'si
Authentication: Bearer Token gerekli
Response: 200 OK - Katılımcıların canlı puan/skor durumları liste şeklinde getirildi


8. Odadan Katılımcı Atma (Kick)
Endpoint: DELETE /api/rooms/{roomId}/participants/{userId}
Path Parameters:
roomId (string, required) - Odanın Object ID'si
userId (string, required) - Atılacak Kullanıcı ID'si
Authentication: Bearer Token gerekli (Oda kurucusu olmalı)
Response: 204 No Content - Kullanıcı odadan zorla çıkarıldı


9. Odayı Kapatma / Sonlandırma (Delete Room)
Endpoint: DELETE /api/rooms/{roomId}
Path Parameters:
roomId (string, required) - Odanın Object ID'si
Authentication: Bearer Token gerekli (Oda Kurucusu veya Admin olmalı)
Response: 204 No Content - Oda sonlandırıldı, katılımcılar dışarı atıldı ve sistemden silindi
