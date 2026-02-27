
1. Oda Oluşturma

* **API Metodu:** POST
* **Açıklama:** Kullanıcının diğer kişilerin katılabileceği canlı bir yarışma alanı açması.

2. Cevap Gönderme

* **API Metodu:** POST
* **Açıklama:** Yarışma esnasında kullanıcının soruya verdiği yanıtın sisteme iletilmesi.

3. Odaya Katılma

* **API Metodu:** PUT
* **Açıklama:** Kullanıcının mevcut bir yarışma alanına dahil olması.

4. Oda Ayarı Güncelleme

* **API Metodu:** PUT
* **Açıklama:** Oda kurucusunun maksimum katılımcı sayısı veya süreyi değiştirmesi.

5. Oda Listeleme

* **API Metodu:** GET
* **Açıklama:** Aktif olan ve katılım sağlanabilecek canlı odaların getirilmesi.

6. Puan Tablosu Görüntüleme

* **API Metodu:** GET
* **Açıklama:** Yarışmadaki anlık skorların ve başarı sıralamalarının listelenmesi.

7. Odadan Katılımcı Çıkarma

* **API Metodu:** DELETE
* **Açıklama:** Kurallara uymayan bir katılımcının odadan atılması (Kick).

8. Oda Kapatma/Silme

* **API Metodu:** DELETE
* **Açıklama:** Süresi dolan canlı odanın sonlandırılıp erişime kapatılması.

