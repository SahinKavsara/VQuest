1. **Soru Paketi Oluşturma**
* **API Metodu:** POST
* **Açıklama:** Kullanıcının havuzdaki sorulardan veya kendi yazdığı sorulardan oluşan, arkadaşlarıyla oynamak üzere özel bir soru seti (koleksiyon) hazırlamasını sağlar.

2. **Soru Önerisi Yapma**
* **API Metodu:** POST
* **Açıklama:** Kullanıcının uygulamanın ana soru havuzuna eklenmesi amacıyla yönetime yeni bir soru tavsiyesi (soru, şıklar ve cevap ile birlikte) göndermesini sağlar.

3. **Soru Paketi Güncelleme**
* **API Metodu:** PUT
* **Açıklama:** Kullanıcının daha önce hazırladığı özel soru paketinin ismini değiştirmesini, pakete yeni sorular eklemesini veya mevcut soruları paketten çıkarmasını sağlar.

4. **Soru Paketi Listeleme**
* **API Metodu:** GET
* **Açıklama:** Kullanıcının kendi oluşturduğu tüm özel soru paketlerinin profilinde liste halinde görüntülenmesini sağlar.

5. **Önerilen Soruları Listeleme**
* **API Metodu:** GET
* **Açıklama:** Yönetici yetkisine sahip kişilerin, kullanıcılar tarafından sisteme eklenmesi için gönderilmiş olan tüm soru tavsiyelerini onaylamak veya reddetmek üzere görüntülemesini sağlar.

6. **Soru Paketi Silme**
* **API Metodu:** DELETE
* **Açıklama:** Kullanıcının artık kullanmak istemediği kendi oluşturduğu özel soru paketini sistemden kalıcı olarak kaldırmasını sağlar.

7. **Önerilen Soruyu Reddetme**
* **API Metodu:** DELETE
* **Açıklama:** Yöneticinin, kullanıcılar tarafından önerilen ancak uygun veya doğru bulunmayan bir soru tavsiyesini sistemden silerek reddetmesini sağlar.