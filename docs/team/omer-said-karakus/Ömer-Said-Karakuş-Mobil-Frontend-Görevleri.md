# VQuest - Mobil Frontend (UI/UX) Görevleri

Bu doküman, VQuest karakter analizi platformunun mobil uygulamasındaki kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) gereksinimlerini tanımlar. İşlemler sırasında uygulamanın donmaması için state yönetiminin (Provider, Riverpod vb.) doğru kurgulanması ve formlarda `SingleChildScrollView` ile klavye yönetiminin (Keyboard dismiss) sağlanması genel standarttır.

## 1. Kayıt Olma
* **Görsel Alanlar:** Kullanıcı Adı, E-posta, Şifre text alanları ve "Kayıt Ol" butonu.
* **Validasyon:** E-posta format kontrolü (regex) ve şifre gücü göstergesi anlık (real-time) olarak yapılmalıdır.
* **UX Detayı:** Başarılı kayıt sonrası (201 Created), kullanıcıyı vakit kaybettirmeden Giriş ekranına yönlendiren akıcı bir geçiş sağlanmalıdır. Yüklenme sırasında butonda CircularProgressIndicator gösterilmelidir.

## 2. Giriş Yapma
* **Görsel Alanlar:** E-posta, Şifre text alanları ve "Giriş Yap" butonu.
* **UX Detayı:** Şifre alanının yanına göster/gizle ikonu eklenmelidir.
* **Hata Yönetimi:** Yanlış girişlerde "E-posta veya şifre hatalı" uyarısı kullanıcı dostu bir `SnackBar` ile gösterilmeli, form verileri silinmemelidir.

## 3. Profil Görüntüleme
* **Görsel Alanlar:** Kullanıcı Adı, E-posta ve dinamik istatistikler (Toplam Puan, Katılınan Yarışma Sayısı).
* **Performans:** Profil verileri API'den çekilirken Skeleton ekran gösterilmelidir. Yapay zeka destekli karakter analizi konseptine uygun olarak puanlar oyunlaştırma (gamification) hissiyatı veren kartlar içinde sunulmalıdır.

## 4. Şifre Güncelleme
* **Görsel Alanlar:** Eski Şifre, Yeni Şifre text alanları ve "Güncelle" butonu.
* **Validasyon:** Eski şifre ile yeni şifrenin aynı olmaması kontrol edilmelidir.
* **UX Detayı:** İşlem başarılı olduğunda form alanları temizlenmeli ve "Şifreniz başarıyla güncellendi" şeklinde yeşil bir başarı `Toast` mesajı çıkarılmalıdır.

## 5. Kullanıcı Engelleme
* **Görsel Alanlar:** Kullanıcı listesinde her satırın yanında veya kullanıcı detay sayfasında bir "Engelle" butonu.
* **UX Detayı:** Yanlış tıklamaları önlemek için "Bu kullanıcıyı engellemek istediğinize emin misiniz?" yazılı bir onay (Dialog) penceresi çıkarılmalıdır.
* **Optimistic Update:** Onay verildiğinde API yanıtı beklenmeden kullanıcının durumu arayüzde hemen "Engellendi" olarak güncellenmeli, hata durumunda geri alınmalıdır (rollback).

## 6. Kullanıcı Listeleme
* **Görsel Alanlar:** Sistemdeki kullanıcıları aktiflik, toplam puan ve kayıt tarihi ile gösteren bir liste (ListView).
* **Performans:** Yüksek kullanıcı sayısında kasmayı önlemek için Pagination (Sayfalama) veya Infinite Scroll uygulanmalıdır.
* **UX Detayı:** Yöneticinin belirli bir kullanıcıyı kolayca bulabilmesi için üst kısma bir Arama (Search) çubuğu eklenmelidir.

## 7. Hesap Silme
* **Görsel Alanlar:** Profil ayarları sayfasının en altında "Hesabımı Sil" butonu.
* **Tasarım Dili:** Yıkıcı bir işlem olduğu için buton rengi kırmızı (Danger/Warning) olmalıdır.
* **UX Detayı:** Kullanıcı butona tıkladığında kesinlikle ikinci bir onay ekranı (BottomSheet veya AlertDialog) gösterilmelidir. Silme başarılı olduğunda kullanıcı doğrudan Giriş ekranına atılmalıdır.