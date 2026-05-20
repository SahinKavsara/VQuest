Şahin Kavsara'nın Mobil Frontend Görevleri
Mobile Front-end Demo Videosu: Link buraya eklenecek

1. Soru Paketi Oluşturma Ekranı
API Endpoint: POST /api/packages
Görev: Kullanıcının özel soru paketi oluşturabilmesi için mobil ekran tasarımı ve implementasyonu
UI Bileşenleri:
Paket başlığı (title) input alanı
Paket açıklaması (description) çok satırlı text alanı
Gizlilik ayarı (isPublic) için switch/toggle butonu
Soru ekleme bölümü ("Havuzdan Seç" veya "Yeni Soru Ekle" butonları)
Eklenen soruların önizleme listesi
"Paketi Oluştur" butonu
Loading indicator (oluşturma işlemi sırasında)
Form Validasyonu:
Başlık boş olamaz kontrolü (real-time validation)
En az 1 soru eklenmiş olma zorunluluğu
Tüm gerekli alanlar doldurulmadan buton disabled
Kullanıcı Deneyimi:
Form hatalarının ilgili alanların altında gösterilmesi
Başarılı oluşturma sonrası success mesajı ve paketler listesine otomatik yönlendirme
Hata durumlarında kullanıcı dostu mesajlar (Toast/Snackbar)
ScrollView kullanımı (klavye açıldığında form içeriğinin kaybolmaması için)
Keyboard dismiss işlevi
Teknik Detaylar:
Platform: Android (Jetpack Compose/XML) veya iOS (SwiftUI/UIKit)
State management (form state, seçili sorular listesi, loading state, error state)
Navigation (soru seçme ekranına geçiş ve dönüş, oluşturma sonrası listeye geçiş)

2. Soru Önerisi Yapma Ekranı
API Endpoint: POST /api/suggestions
Görev: Kullanıcının ana soru havuzuna eklenmek üzere sisteme yeni soru önermesini sağlayan mobil ekran tasarımı ve implementasyonu
UI Bileşenleri:
Soru metni (questionText) çok satırlı text alanı
Şıklar için dinamik input alanları (Ekle/Çıkar butonlarıyla birlikte)
Doğru cevabı seçmek için RadioButton veya işaretleme ikonu
Kategori seçimi için Dropdown/BottomSheet menüsü
"Öneriyi Gönder" butonu
Form Validasyonu:
Soru metni boş bırakılamaz
En az 2 şık girilmiş olmalı ve şıklar boş olamaz
Doğru cevap mutlaka işaretlenmiş olmalı
Kategori seçilmiş olmalı
Kullanıcı Deneyimi:
Şık eklerken veya çıkarırken akıcı animasyonlar (smooth transitions)
Başarılı gönderim sonrası teşekkür dialog'u ve formun temizlenmesi
Hata durumunda error mesajı gösterimi
Alanlar arası klavye ile kolay geçiş (Next/Done aksiyonları)
Teknik Detaylar:
Dinamik liste yönetimi (şıkların state üzerinde tutulması ve güncellenmesi)
State management (form inputs, kategori listesi yükleme durumu, submit state)
Klavye yönetimi ve Focus state takibi

3. Soru Paketi Listeleme ve Güncelleme Ekranları
API Endpoints: GET /api/packages, PUT /api/packages/{packageId}
Görev: Kullanıcının kendi paketlerini listeleyip, detaylarını ve sorularını düzenleyebilmesi için UI tasarımı ve implementasyonu
UI Bileşenleri:
Listeleme: Paket kartları (Başlık, soru sayısı, gizlilik durumu, düzenle/sil ikonları)
Listeleme: Pull-to-refresh mekanizması
Düzenleme: Başlık ve açıklama inputları (mevcut değerlerle dolu)
Düzenleme: Soru listesi (kaldırma ikonlu) ve "Soru Ekle" butonu
Düzenleme: "Kaydet" ve "İptal" butonları
Form Validasyonu:
Başlık kontrolü (boş olamaz)
Soru listesi kontrolü (boş paket kaydedilemez)
Değişiklik yoksa "Kaydet" butonu disabled
Kullanıcı Deneyimi:
Listede veri yüklenirken Skeleton loading ekranı
Empty state (hiç paket yoksa yönlendirici mesaj)
Düzenleme ekranında optimistic update (kaydet butonuna basıldığında anında tepki)
Değişiklik yapılıp kaydedilmeden geri çıkılmak istendiğinde onay dialog'u ("Değişiklikler kaydedilmedi, çıkmak emin misiniz?")
Teknik Detaylar:
Lazy loading (RecyclerView/LazyColumn veya List kullanımı)
Form state management (initial values, edited values)
Navigation (Listeden detay/düzenleme ekranına geçiş ve geri dönüş)

4. Soru Paketi Silme Akışı
API Endpoint: DELETE /api/packages/{packageId}
Görev: Kullanıcının soru paketini güvenli bir şekilde silmesi için UI akışı tasarımı ve implementasyonu
UI Bileşenleri:
Liste veya detay ekranında "Sil" butonu (kırmızı renkli veya çöp kutusu ikonu)
Onay dialog'u (destructive action için uyarı içeren)
Silme işlemi sırasında loading indicator
Kullanıcı Deneyimi:
Destructive action için görsel uyarılar (kırmızı renk, dikkat çekici ikonlar)
Açık ve net uyarı mesajları ("Bu paket kalıcı olarak silinecektir, onaylıyor musunuz?")
İptal seçeneğinin her zaman belirgin ve kolay erişilebilir olması
Başarılı silme sonrası animasyonlu olarak listeden öğenin kaybolması ve success snackbar
Akış Adımları:
Sil ikonuna tıklama
Uyarı dialog'u gösterilmesi
Onaylandığında silme işleminin (API isteği) başlatılması
Başarılı işlem sonrası UI listesinin güncellenmesi
Teknik Detaylar:
Dialog/Modal component kullanımı
List state update (öğeyi listeden silip UI'ı yenileme)
Error handling (silme başarısız olursa kullanıcıya bildirme)

5. Admin Önerileri Yönetme Ekranı
API Endpoints: GET /api/admin/suggestions, POST /api/admin/questions, DELETE /api/admin/suggestions/{suggestionId}
Görev: Yöneticilerin gelen soru önerilerini inceleyip onaylama veya reddetme işlemlerini yapabileceği yönetim paneli ekranı
UI Bileşenleri:
Öneri kartları (Soru metni, şıklar, doğru cevap belirteci, kategori)
Her kartın altında "Kabul Et" (Yeşil) ve "Reddet" (Kırmızı) butonları
Pull-to-refresh özelliği
Kullanıcı Deneyimi:
Butonlara basıldığında hızlı aksiyon (anında listeden kaybolma / optimistic update)
İşlem tamamlanınca "Soru havuza eklendi" veya "Öneri reddedildi" şeklinde kısa geri bildirimler (Toast/Snackbar)
Reddetme işleminde yanlışlıkla basmayı önlemek için hızlı bir geri alma (Undo) seçeneği (opsiyonel)
Teknik Detaylar:
Birden fazla API isteğini ardışık yönetme (Kabul etme durumunda POST ve DELETE zinciri)
State management (suggestions list, action processing state)
Hata durumunda silinen/kabul edilen öğeyi listeye geri ekleme (Rollback mekanizması)
