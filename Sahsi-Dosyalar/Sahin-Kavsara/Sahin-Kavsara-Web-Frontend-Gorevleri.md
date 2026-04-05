# Şahin Kavsara'nın Web Frontend Görevleri
Front-end Test Videosu: [Buraya Tıklayarak İzleyin](https://drive.google.com/file/d/1ImDIuVVli9-kYcLQKjN0T3wrLm7B-883/view?usp=sharing)

### 1. Özel Soru Paketleri Yönetim Sayfası (Listeleme & Oluşturma)
**API Endpoint:** `GET /packages` | `POST /packages`
**Görev:** Kullanıcıların kendi oyun listelerini görebileceği ve yeni soru paketi oluşturabileceği sayfanın (`PackagesPage.jsx`) tasarımı ve implementasyonu.
**UI Bileşenleri:**
- Responsive paket listesi (Grid layout: desktop ve mobile uyumlu paket kartları)
- "Yeni Paket Oluştur" butonu (primary action button)
- Paket başlığı (Title) input alanı
- Paket icon/görsel seçici (opsiyonel placeholder)
- İçeriğe eklenecek soruları arama ve seçme alanı (Checkbox listesi veya Multi-select)
- Oluşturma formunu saran Modal veya ayrı Card yapısı
- Loading spinner (veriler yüklenirken)
**Form Validasyonu:**
- Paket adı boş olamaz (HTML5 required)
- Paket adının minimum/maksimum karakter limitleri
- En az 1 sorunun pakete ekli olması zorunluluğu
- React state üzerinden real-time validation kontrolleri
**Kullanıcı Deneyimi (UX):**
- Sayfa yüklendiğinde Skeleton Loading ekranı gösterimi
- Başarılı paket oluşturmada anlık UI güncellenmesi (Optimistic Update)
- Özel `react-hot-toast` notifications ile başarı/hata mesajları ("Paket oluşturuldu!")
- Modal kapatıldığında form state'inin sıfırlanması
**Teknik Detaylar:**
- Framework: React v18, Vite
- HTTP Client: Axios (`api.js` interceptor ile JWT taşıması)
- State Management: Mevcut paketlerin Local state (`useState`, `useEffect`) ile veya React Query ile yönetimi
- Accessibility: Card içi erişilebilirlik (ARIA labels)

### 2. Soru Paketi Düzenleme ve Silme İşlemleri
**API Endpoint:** `PUT /packages/{packageId}` | `DELETE /packages/{packageId}`
**Görev:** Var olan question paketinin ismini/sorularını güncelleme ve paketi sistemden kalıcı olarak silme akışı tasarımı.
**UI Bileşenleri:**
- Her paket kartında "Düzenle" ve "Sil" icon butonları (Font/Emoji ile)
- Silme işlemi için Confirmation (Emin misiniz?) Modal Dialog arayüzü
- Düzenleme yapılması için "Save / İptal" action butonları
- Unsaved changes indicator (Düzenleme yapılmış ama kaydedilmemiş uyarısı)
**Form Validasyonu:**
- Paket isminin boş bırakılamaması yönünde anlık hata tetikleyicisi
- Silinecek paketin ID varlık kontrolü (Client-side validation)
**Kullanıcı Deneyimi:**
- Silme tuşuna basıldığında (Destructive action) renkli uyarılar (kırmızı danger zone)
- İptal mekanizmasının hep erişilebilir olması
- Düzenleme yapılırken butonun loading (Kaydediliyor...) durumuna geçmesi
- İşlem sonrası liste renderının anında yenilenmesi
**Teknik Detaylar:**
- Modal/Dialog bileşenlerinin (`react-modal` vb. veya Custom CSS Modal) sisteme entegresi
- Hata yönetimleri: Eğer sunucudan silinmezse, frontend listesinde geri getirme
- Router yönlendirmesi gerektirmeden In-page (sayfa içi) component aksiyonları

### 3. Soru Önerme (Tavsiye) Sayfası
**API Endpoint:** `POST /suggestions`
**Görev:** Normal kullanıcıların sisteme eklenilmesi amacıyla yeni bilgi yarışması sorusu önerebileceği destek sayfasının (`SuggestPage.jsx`) implementasyonu.
**UI Bileşenleri:**
- Responsive Suggestion Form (Dar ve orthalanmış estetik form UI)
- Soru metni için Textarea input alanı
- A, B, C, D şıkları için 4 adet text input alanı
- Doğru şıkkın seçilebileceği Dropdown (Select) arayüzü veya Radio Button grubu
- Kategori seçimi için Select menüsü
- Onaylama (Gönder) primary butonu
**Form Validasyonu:**
- Soru içeriğinin asgari karakter limiti doğrulaması
- Hiçbir şık alanının boş bırakılamaması
- Doğru cevabın zorunlu olarak seçtirilmesi
- Çift tıklama / çift submit (Double-click submit) engellenmesi (Button disabled logic)
**Kullanıcı Deneyimi:**
- Inline validation ile (Alan boş bırakılırsa hemen altında "Bu alan zorunludur" uyarısı kırmızı ile basılır)
- Soru gönderimi sonrasında formun temizlenmesi ve başarılı Pop-up'ı (Gönderim başarılı, onay sürecindedir)
- Basit, oyuncuyu sıkmayacak akıcı ve animasyonlu form geçişleri
**Teknik Detaylar:**
- Routing: `App.jsx` içine `/suggest` adresinin yerleştirilmesi (*Eksik Route Tamamlaması*)
- API Yönetimi: Başarısız form gönderimlerinde (400 Bad Request) API logunun ekrana basılması
- SEO ve Accessibility uyumluluğu (Input label mappingleri)

### 4. Önerilen Soruları Yönetme Paneli (Admin)
**API Endpoint:** `GET /admin/suggestions` | `DELETE /admin/suggestions/{suggestionId}`
**Görev:** Adminin (yöneticinin), kullanıcıların gönderdiği soru önerilerini listeleyip onaylayabileceği veya silip reddedebileceği özel ekranın (`AdminSuggestions.jsx`) tasarımı.
**UI Bileşenleri:**
- Tablo veya Card Dashboard yapısı (Tüm önerileri listelemek için)
- Gönderici ismi, zamanı ve soru kopyası hücreleri
- "Onayla (Yeşil Check)" ve "Reddet (Kırmızı Trash)" butonları
- Empty state (Veri yoksa "Bekleyen öneri bulunmuyor" mesaj ekranı)
**Kullanıcı Deneyimi:**
- Reddet (Delete) butonu çalıştırıldığında anlık tablo güncellemesi ve Toast mesajı ("Öneri Reddedildi")
- Uzun metinli sorular için metin küçültme (Ellipsis) özelliği kullanımı
- Admin yoğunluğunu azaltmak için anlaşılır Badge'ler (Beklemede, Yeni) kullanılması
**Teknik Detaylar:**
- Routing: `AdminSidebar.jsx` bileşenine `AdminSuggestions` sayfasının linkinin bağlanması
- `<ProtectedRoute adminOnly>` blokunun altından render mekanizmasının sağlanması
- Gönüllü veri çekimlerinin (GET) Zustand / Loading indicator bağlamı altında izole edilmesi
