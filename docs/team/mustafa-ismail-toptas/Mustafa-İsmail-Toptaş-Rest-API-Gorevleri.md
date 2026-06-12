# Mustafa İsmail Toptaş'ın REST API Metotları

https://www.youtube.com/watch?v=usTNg_cH_GY

## Yapay Zeka (AI) Algoritma ve Analiz Modülü

1. Kişisel Analiz Başlatma

* Endpoint: `POST /api/ai/analysis`
* Request Body:

  ```text
  Boş Gönderilir (Veriler Token ile DB'den Çekilir)
  ```

* Authentication: Bearer Token gerekli
* Response: `202 Accepted` - Analiz başarıyla oluşturuldu

2. Analiz Sonucu Görüntüleme

* Endpoint: `GET /api/ai/reports/{reportId}`
* Path Parameters:
  * `reportId` (string, required) - Analiz Rapor ID'si
* Authentication: Bearer Token gerekli
* Response: `200 OK` - İlgili analiz raporu başarıyla getirildi

3. Eski Analizleri Silme

* Endpoint: `DELETE /api/ai/reports/{reportId}`
* Path Parameters:
  * `reportId` (string, required) - Silinmek istenen rapor ID'si
* Authentication: Bearer Token gerekli (Kullanıcının sadece kendi raporu)
* Response: `204 No Content` - Analiz geçmişi başarıyla silindi

4. Yapay Zeka Komutunu (Prompt) Güncelleme (Admin)

* Endpoint: `PUT /api/admin/ai/prompt`
* Request Body:

  ```json
  {
    "promptText": "Kullanıcının güçlü ve zayıf yönlerini analiz et..."
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `200 OK` - Sistem Promptu anında güncellendi

## Sistem Bildirimleri (Notification) Modülü

5. Küresel Bildirim Gönderme (Admin)

* Endpoint: `POST /api/admin/notifications`
* Request Body:

  ```json
  {
    "message": "Sistem yarın 02:00'da bakıma girecektir. İyi oyunlar!"
  }
  ```

* Authentication: Bearer Token gerekli (Yönetici yetkisi gerekir)
* Response: `201 Created` - Bildirim havuzuna eklendi ve tüm kullanıcılara iletildi

6. Gelen Bildirimleri Görüntüleme

* Endpoint: `GET /api/notifications`
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Kullanıcıya ait bildirimler listelendi

7. Bildirimi Okundu Olarak İşaretleme

* Endpoint: `PUT /api/notifications/{notifId}/read`
* Path Parameters:
  * `notifId` (string, required) - Bildirim ID'si
* Authentication: Bearer Token gerekli
* Response: `200 OK` - Bildirim okundu statüsüne çekildi

8. Bildirim Silme

* Endpoint: `DELETE /api/notifications/{notifId}`
* Path Parameters:
  * `notifId` (string, required) - Kaldırılacak Bildirim ID'si
* Authentication: Bearer Token gerekli
* Response: `204 No Content` - Bildirim başarıyla silindi
