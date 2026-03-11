1. **Kayıt Olma**
    * **API Metodu:** POST
    * **Açıklama:** Sisteme yeni bir kullanıcının bilgilerini girerek hesap oluşturmasını sağlar. Kullanıcı adı, e-posta ve güvenli bir şifre belirlenerek veritabanında yeni bir kullanıcı kaydı açılır. Başarılı kayıt sonrası kullanıcı giriş yapmaya yönlendirilir.

2. **Giriş Yapma** 
    * **API Metodu:** POST
    * **Açıklama:** Kullanıcının e-posta ve şifresiyle sisteme giriş isteği göndermesini ve kimliğini doğrulamasını sağlar. Doğrulama başarılı olursa kullanıcıya oturum izni (token) verilir ve uygulamanın ana ekranına yönlendirilir.

3. **Profil Görüntüleme** 
    * **API Metodu:** GET
    * **Açıklama:** Kullanıcının kendi hesap bilgilerini, istatistiklerini, toplam puanını ve katıldığı yarışma sayısını görüntülemesini sağlar. Sadece giriş yapmış kullanıcılar kendi profil verilerine erişebilir.

4. **Şifre Güncelleme** 
    * **API Metodu:** PUT
    * **Açıklama:** Güvenlik amacıyla veya şifresini unutan kullanıcının mevcut şifresini yenisiyle değiştirmesini sağlar. İşlem sırasında kullanıcının eski şifresini doğrulaması veya e-posta onay kodunu girmesi istenir.

5. **Kullanıcı Engelleme**
    * **API Metodu:** PUT
    * **Açıklama:** Yönetici yetkisine sahip kişilerin, topluluk kurallarını ihlal eden bir kullanıcının sisteme girişini geçici veya kalıcı olarak durdurmasını sağlar. Engellenen kullanıcı yarışma odalarına katılamaz.

6. **Kullanıcı Listeleme**
    * **API Metodu:** GET
    * **Açıklama:** Yöneticilerin sisteme kayıtlı olan tüm kullanıcıları liste halinde görüntülemesini sağlar. Bu listede kullanıcıların aktiflik durumu, toplam puanları ve kayıt tarihleri yer alır.

7. **Hesap Silme** 
    * **API Metodu:** DELETE
    * **Açıklama:** Kullanıcının kendi isteğiyle hesabını sistemden kalıcı olarak kaldırmasını sağlar. İşlem sonucunda kullanıcının kişisel bilgileri anonimleştirilir veya veritabanından tamamen silinir.