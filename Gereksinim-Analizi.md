# Tüm Gereksinimler

1. **Kayıt Olma** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** POST
    * **Açıklama:** Sisteme yeni bir kullanıcının bilgilerini girerek hesap oluşturmasını sağlar. Kullanıcı adı, e-posta ve güvenli bir şifre belirlenerek veritabanında yeni bir kullanıcı kaydı açılır. Başarılı kayıt sonrası kullanıcı giriş yapmaya yönlendirilir.

2. **Giriş Yapma** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının e-posta ve şifresiyle sisteme giriş isteği göndermesini ve kimliğini doğrulamasını sağlar. Doğrulama başarılı olursa kullanıcıya oturum izni (token) verilir ve uygulamanın ana ekranına yönlendirilir.

3. **Profil Görüntüleme** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** GET
    * **Açıklama:** Kullanıcının kendi hesap bilgilerini, istatistiklerini, toplam puanını ve katıldığı yarışma sayısını görüntülemesini sağlar. Sadece giriş yapmış kullanıcılar kendi profil verilerine erişebilir.

4. **Şifre Güncelleme** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** PUT
    * **Açıklama:** Güvenlik amacıyla veya şifresini unutan kullanıcının mevcut şifresini yenisiyle değiştirmesini sağlar. İşlem sırasında kullanıcının eski şifresini doğrulaması veya e-posta onay kodunu girmesi istenir.

5. **Kullanıcı Engelleme** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** PUT
    * **Açıklama:** Yönetici yetkisine sahip kişilerin, topluluk kurallarını ihlal eden bir kullanıcının sisteme girişini geçici veya kalıcı olarak durdurmasını sağlar. Engellenen kullanıcı yarışma odalarına katılamaz.

6. **Kullanıcı Listeleme** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** GET
    * **Açıklama:** Yöneticilerin sisteme kayıtlı olan tüm kullanıcıları liste halinde görüntülemesini sağlar. Bu listede kullanıcıların aktiflik durumu, toplam puanları ve kayıt tarihleri yer alır.

7. **Hesap Silme** [(Ömer Said KARAKUŞ)]
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının kendi isteğiyle hesabını sistemden kalıcı olarak kaldırmasını sağlar. İşlem sonucunda kullanıcının kişisel bilgileri anonimleştirilir veya veritabanından tamamen silinir.

8. **Soru Ekleme** [(Emir OMRAK)]
    * **API Metodu:** POST
    * **Açıklama:** Yöneticinin uygulamanın ana soru havuzuna yeni bir bilgi yarışması sorusu kaydetmesini sağlar. Soru metni, şıklar, doğru cevap ve zorluk derecesi belirtilerek sisteme işlenir.

9. **Kategori Ekleme** [(Emir OMRAK)]
    * **API Metodu:** POST
    * **Açıklama:** Soruları sınıflandırmak ve oyun içi filtreleme sağlamak amacıyla sisteme "Tarih, Bilim, Yazılım" gibi yeni bir kategori başlığı eklenmesini sağlar.

10. **Soru Güncelleme** [(Emir OMRAK)]
    * **API Metodu:** PUT
    * **Açıklama:** Ana havuzda bulunan mevcut bir sorunun içeriğinde yazım hatası varsa veya cevabı değişmişse, yöneticinin bu soruyu düzenlemesini sağlar.

11. **Kategori Güncelleme** [(Emir OMRAK)]
    * **API Metodu:** PUT
    * **Açıklama:** Sistemde var olan bir kategori isminin veya kategoriye ait görsel ikonun yönetici tarafından değiştirilmesini sağlar.

12. **Soru Listeleme** [(Emir OMRAK)]
    * **API Metodu:** GET
    * **Açıklama:** Belirli bir kategoriye veya zorluk seviyesine ait soruların listelenmesini sağlar. Yöneticiler tüm soruları, kullanıcılar ise sadece oyun sırasında sistemin seçtiği soruları görebilir.

13. **Kategori Listeleme** [(Emir OMRAK)]
    * **API Metodu:** GET
    * **Açıklama:** Sistemde aktif olarak bulunan tüm soru kategorilerinin kullanıcıya liste halinde sunulmasını sağlar. Kullanıcılar oyun kurarken veya oda ararken bu listeyi kullanır.

14. **Soru Silme** [(Emir OMRAK)]
    * **API Metodu:** DELETE
    * **Açıklama:** Güncelliğini yitirmiş, hatalı olduğu tespit edilmiş veya artık kullanılmayacak olan bir sorunun yönetici tarafından havuzdan tamamen çıkarılmasını sağlar.

15. **Oda Oluşturma** [(Sedat BAKLA)]
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının diğer oyuncuların katılabileceği canlı bir yarışma lobi alanı açmasını sağlar. Odanın kategorisi, maksimum kişi sayısı ve soru süresi bu aşamada belirlenir.

16. **Cevap Gönderme** [(Sedat BAKLA)]
    * **API Metodu:** POST
    * **Açıklama:** Canlı yarışma esnasında kullanıcının ekrandaki soruya verdiği yanıtın, süre bitmeden sisteme iletilmesini sağlar. Cevabın doğruluğu ve cevaplama hızı bu aşamada kaydedilir.

17. **Odaya Katılma** [(Sedat BAKLA)]
    * **API Metodu:** PUT
    * **Açıklama:** Kullanıcının mevcut ve aktif durumdaki bir yarışma odasına katılımcı olarak dahil olmasını sağlar. Odanın katılımcı listesi güncellenir ve diğer oyunculara bildirim gider.

18. **Oda Ayarı Güncelleme** [(Sedat BAKLA)]
    * **API Metodu:** PUT
    * **Açıklama:** Odayı kuran kullanıcının (oda sahibi), yarışma henüz başlamadan önce odanın gizlilik durumunu (açık/şifreli) veya kişi sınırını değiştirmesini sağlar.

19. **Oda Listeleme** [(Sedat BAKLA)]
    * **API Metodu:** GET /rooms
    * **Açıklama:** Sistemde aktif olan, yarışması henüz başlamamış ve katılım sağlanabilecek canlı odaların liste halinde kullanıcıya sunulmasını sağlar.

20. **Puan Tablosu Görüntüleme** [(Sedat BAKLA)]
    * **API Metodu:** GET
    * **Açıklama:** Yarışma esnasında her sorudan sonra veya yarışma bitiminde, odadaki katılımcıların anlık skorlarının ve başarı sıralamalarının listelenmesini sağlar.

21. **Odadan Katılımcı Çıkarma** [(Sedat BAKLA)]
    * **API Metodu:** DELETE
    * **Açıklama:** Oda sahibinin veya yöneticinin, oyunun huzurunu bozan veya kurallara uymayan bir katılımcıyı odadan zorla atmasını (kick) sağlar.

22. **Oda Kapatma** [(Sedat BAKLA)]
    * **API Metodu:** DELETE
    * **Açıklama:** Süresi dolan, tüm soruları biten veya oda kurucusu tarafından iptal edilen canlı odanın sistemden kaldırılarak erişime kapatılmasını sağlar.

23. **Soru Paketi Oluşturma** [(Şahin KAVSARA)]
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının havuzdaki sorulardan veya kendi yazdığı sorulardan oluşan, arkadaşlarıyla oynamak üzere özel bir soru seti (koleksiyon) hazırlamasını sağlar.

24. **Soru Önerisi Yapma** [(Şahin KAVSARA)]
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının uygulamanın ana soru havuzuna eklenmesi amacıyla yönetime yeni bir soru tavsiyesi (soru, şıklar ve cevap ile birlikte) göndermesini sağlar.

25. **Soru Paketi Güncelleme** [(Şahin KAVSARA)]
    * **API Metodu:** PUT
    * **Açıklama:** Kullanıcının daha önce hazırladığı özel soru paketinin ismini değiştirmesini, pakete yeni sorular eklemesini veya mevcut soruları paketten çıkarmasını sağlar.

26. **Soru Paketi Listeleme** [(Şahin KAVSARA)]
    * **API Metodu:** GET
    * **Açıklama:** Kullanıcının kendi oluşturduğu tüm özel soru paketlerinin profilinde liste halinde görüntülenmesini sağlar.

27. **Önerilen Soruları Listeleme** [(Şahin KAVSARA)]
    * **API Metodu:** GET
    * **Açıklama:** Yönetici yetkisine sahip kişilerin, kullanıcılar tarafından sisteme eklenmesi için gönderilmiş olan tüm soru tavsiyelerini onaylamak veya reddetmek üzere görüntülemesini sağlar.

28. **Soru Paketi Silme** [(Şahin KAVSARA)]
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının artık kullanmak istemediği kendi oluşturduğu özel soru paketini sistemden kalıcı olarak kaldırmasını sağlar.

29. **Önerilen Soruyu Reddetme** [(Şahin KAVSARA)]
    * **API Metodu:** DELETE
    * **Açıklama:** Yöneticinin, kullanıcılar tarafından önerilen ancak uygun veya doğru bulunmayan bir soru tavsiyesini sistemden silerek reddetmesini sağlar.

30. **Kişisel Analiz Başlatma** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının son yarışmalardaki cevaplama süreleri, doğru/yanlış oranları ve oynadığı kategoriler baz alınarak, yapay zeka motorunun kişisel bir performans analizi başlatmasını tetikler.

31. **Bildirim Gönderme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** POST
    * **Açıklama:** Yöneticinin sistemdeki tüm kullanıcılara veya belirli bir kullanıcı grubuna yeni bir özellik, bakım çalışması veya etkinlik hakkında anlık duyuru göndermesini sağlar.

32. **Yapay Zeka Komutu Güncelleme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** PUT
    * **Açıklama:** Yöneticinin, yapay zekanın analiz raporları oluştururken kullanacağı temel sistem komutunu (prompt) ve analiz kriterlerini güncelleyerek sistemin daha doğru çıktılar vermesini sağlamasını ifade eder.

33. **Bildirim Okundu İşaretleme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** PUT
    * **Açıklama:** Kullanıcının kendisine gelen bir sistem bildirimini veya oyun davetini gördükten sonra "okundu" durumuna getirerek bildirim işaretinin silinmesini sağlar.

34. **Analiz Sonucu Görüntüleme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** GET
    * **Açıklama:** Yapay zeka tarafından kullanıcının verileri işlenerek hazırlanan detaylı performans raporunun, grafikler ve tavsiyeler eşliğinde kullanıcıya sunulmasını sağlar.

35. **Bildirim Görüntüleme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** GET
    * **Açıklama:** Kullanıcıya oyun sistemi veya yöneticiler tarafından gönderilen okunmuş ve okunmamış tüm bildirimlerin ve duyuruların liste halinde gösterilmesini sağlar.

36. **Eski Analizleri Silme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının geçmiş aylara ait, geçerliliğini yitirmiş veya artık görmek istemediği eski yapay zeka performans raporlarını kendi listesinden silmesini sağlar.

37. **Bildirim Silme** [(Mustafa İsmail TOPTAŞ)]
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının daha önce okuduğu ve bildirim kutusunda yer kaplamasını istemediği mesajları tek tek veya toplu olarak sistemden kaldırmasını sağlar.

---

# Gereksinim Dağılımları

1. [Şahin KAVSARA Gereksinimleri](Sahin-Kavsara/Sahin-Kavsara-Gereksinimler.md)
2. [Mustafa İsmail TOPTAŞ Gereksinimleri](Mustafa-Toptas/Mustafa-Toptas-Gereksinimler.md)
3. [Sedat BAKLA Gereksinimleri](Sedat-Bakla/Sedat-Bakla-Gereksinimler.md)
4. [Emir OMRAK Gereksinimleri](Emir-Omrak/Emir-Omrak-Gereksinimler.md)
5. [Ömer Said KARAKUŞ Gereksinimleri](Omer-Karakus/Omer-Karakus-Gereksinimler.md)