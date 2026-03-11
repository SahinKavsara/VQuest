1. **Kişisel Analiz Başlatma**
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının son yarışmalardaki cevaplama süreleri, doğru/yanlış oranları ve oynadığı kategoriler baz alınarak, yapay zeka motorunun kişisel bir performans analizi başlatmasını tetikler.

2. **Bildirim Gönderme** 
    * **API Metodu:** POST
    * **Açıklama:** Yöneticinin sistemdeki tüm kullanıcılara veya belirli bir kullanıcı grubuna yeni bir özellik, bakım çalışması veya etkinlik hakkında anlık duyuru göndermesini sağlar.

3. **Yapay Zeka Komutu Güncelleme**
    * **API Metodu:** PUT
    * **Açıklama:** Yöneticinin, yapay zekanın analiz raporları oluştururken kullanacağı temel sistem komutunu (prompt) ve analiz kriterlerini güncelleyerek sistemin daha doğru çıktılar vermesini sağlamasını ifade eder.

4. **Bildirim Okundu İşaretleme**
    * **API Metodu:** PUT
    * **Açıklama:** Kullanıcının kendisine gelen bir sistem bildirimini veya oyun davetini gördükten sonra "okundu" durumuna getirerek bildirim işaretinin silinmesini sağlar.

5. **Analiz Sonucu Görüntüleme**
    * **API Metodu:** GET
    * **Açıklama:** Yapay zeka tarafından kullanıcının verileri işlenerek hazırlanan detaylı performans raporunun, grafikler ve tavsiyeler eşliğinde kullanıcıya sunulmasını sağlar.

6. **Bildirim Görüntüleme**
    * **API Metodu:** GET
    * **Açıklama:** Kullanıcıya oyun sistemi veya yöneticiler tarafından gönderilen okunmuş ve okunmamış tüm bildirimlerin ve duyuruların liste halinde gösterilmesini sağlar.

7. **Eski Analizleri Silme**
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının geçmiş aylara ait, geçerliliğini yitirmiş veya artık görmek istemediği eski yapay zeka performans raporlarını kendi listesinden silmesini sağlar.

8. **Bildirim Silme**
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının daha önce okuduğu ve bildirim kutusunda yer kaplamasını istemediği mesajları tek tek veya toplu olarak sistemden kaldırmasını sağlar.