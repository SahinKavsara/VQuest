UI da sıkıntı var
web databaseden hariç mabil için yeni database açmış
admindeki hiçbir özellik çalışmıyor
kullanıcılardaki hiçbir özellik çalışmıyor

1. Adım Promptu: Altyapı, Routing ve Admin İşlemleri
Bu promptu araca vererek önce sistemin temelini, sayfalar arası geçişleri ve yetkilendirmeyi sağlamlaştır:

Proje Durumu ve Görev (Adım 1):
Uygulamanın web tarafında sorunsuz çalışan yapısını istemci (mobil/app) tarafına entegre ediyoruz. Şu an ciddi routing (path) ve yetkilendirme (Auth/Admin) sorunları var. Öncelikle sistemin temel iskeletini ve yönlendirmelerini düzeltmeni istiyorum. Tüm path'leri web ile uyumlu olacak şekilde baştan sona kontrol et ve aşağıdaki sorunları çöz:

1. Auth ve Üyelik İşlemleri:

Üye Olunmuyor: Kayıt olma (Register) path'i, form gönderimi ve API bağlantısı çalışmıyor. Bağlantıları onar ve kayıt akışını web'deki gibi eksiksiz hale getir.

Yetkilendirme (Auth State) Hatası: Sisteme normal kullanıcı girişi yapılamıyor, sadece adminden giriş yapılmış gibi garip bir davranış sergiliyor. Auth state yönetimini temizle ve role-based (kullanıcı/admin) yönlendirmeleri düzelt.

2. Admin Paneli ve Yetkileri:

Admin Özellikleri Çalışmıyor: Admin yetkileri tanımlanmıyor veya algılanmıyor.

Kullanıcılar Görünmüyor: Admin panelinde kullanıcı listesini çeken servisi ve tablo/liste arayüzünü (fetch/render) düzelt.

Yeni Paket Oluşmuyor: Admin panelindeki "Yeni Paket Oluştur" fonksiyonu işlemiyor, veri gönderim (POST) akışını ve endpoint bağlantısını onar.

Lütfen sadece bu sorunlara odaklan ve değişiklik yaptığın dosyaları/kodları adım adım açıkla. Bu kısımlar tamamen stabil hale gelince diğer UI ve temel işlev hatalarına geçeceğiz.

2. Adım Promptu: Temel Özellikler ve UI/UX
İlk adımdaki sorunlar çözülüp kodları projene entegre ettikten sonra, kalan hatalar için şu promptu kullanabilirsin:

Proje Durumu ve Görev (Adım 2):
Altyapı ve Admin kısımlarını düzelttik. Şimdi uygulamanın temel işlevlerindeki veri çekme problemlerini ve UI/UX hatalarını web tarafıyla birebir aynı ve stabil çalışacak şekilde düzeltmeni istiyorum:

1. Temel İşlevler ve Veri Çekme (Core Features):

Oda Kurulmuyor: Oda (Room) oluşturma fonksiyonu tepki vermiyor. İsteklerin (API/Socket) web platformundaki yapıyla aynı şekilde tetiklendiğinden emin ol ve düzelt.

Sorular Görünmüyor: Ekrandaki soruların listelendiği component veriyi çekemiyor veya render edemiyor. Fetch mekanizmasını kontrol et.

Bildirimler Görünmüyor: Bildirim (Notification) sistemi tetiklenmiyor veya arayüzde gösterilmiyor. Socket veya API bağlantısını onar.

2. UI ve UX Sorunları:

Scroll ve Tıklama Hatası: Box elementlerine tıklayınca veya etkileşime girince scroll mekanizması bozuluyor veya çalışmıyor. Dokunmatik/tıklama (gesture) event'leri ile scroll çakışmalarını gider.

Genel UI Sıkıntıları: Arayüzde yerleşim hataları var. Overflow hatalarını, padding/margin dengesizliklerini çöz ve component yapılarını temiz, responsive bir hale getir.

Lütfen web tarafında tıkır tıkır çalışan bu özelliklerin istemci tarafındaki bağlantı ve arayüz kodlarını düzelt. Değişiklikleri adım adım açıkla.