# Ömer Said Karakuş'un Web Frontend Görevleri


### 1. Üye Olma (Kayıt) ve Giriş (Login) Ekranları
**API Endpoint:** `POST /api/auth/register` | `POST /api/auth/login`
**Görev:** Kullanıcıların sisteme dahil olabilmeleri ve giriş yapıp token üretebilmeleri için Auth arayüzlerinin (`RegisterPage.jsx` ve `LoginPage.jsx`) tasarımı ve implementasyonu.
**UI Bileşenleri:**
- Responsive Kayıt ve Giriş formu (Dar, ortalanmış Auth Card layout)
- Email input alanı (type="email")
- Şifre input alanı (type="password")
- Kullanıcı Adı (Username) input alanı (Yalnızca kayıtta)
- "Giriş Yap" / "Kayıt Ol" birincil butonları (Primary button style)
- Formlar arası hızlı geçiş için alt bilgi linki ("Hesabın yok mu? Kaydol")
- Auth Header (Logo veya Başlık) ve Gradient arka plan
**Form Validasyonu:**
- HTML5 Form doğrulamaları (`required` attribute)
- Javascript ile real-time şifre uzunluğu (>6 karakter) doğrulaması
- Ad, Soyad (veya Username) boş kalamaz kuralı kontrolü
**Kullanıcı Deneyimi (UX):**
- Auth submission protection (Yükleme anında çift tıklama koruması ve Button loading indicator "Giriş Yapılıyor...")
- Başarılı girişte doğrudan anasayfaya (`/`) yönlendirme (React Router Navigate)
- `react-hot-toast` aracılığıyla hatalı giriş bildirimleri (Örn: "Şifre Yanlış")
**Teknik Detaylar:**
- Framework: React (v18), Vite, Vanilla CSS
- State Management: Giriş başarılı olduğunda `Zustand`'ın `authStore.js` modülüne `jwt token` ve `user` yüklenmesi.
- Routing yönlendirme stratejisi.


### 2. Kullanıcı Profil (Dashboard) Görüntüleme Sayfası
**API Endpoint:** `GET /api/profile`
**Görev:** Oyuncunun kendi profil bilgilerini ve oyun istatistiklerini görüntüleyebileceği interaktif arayüzün (`ProfilePage.jsx`) tasarımı.
**UI Bileşenleri:**
- Gradient Arka plana sahip dinamik Initial-Avatar (Yuvarlak Profil Logosu)
- Kullanıcı adı, e-posta adresi ve rolü (Admin/User Badge) bölümü
- İstatistik Panosu: "Toplam Puan", "Oyun Sayısı" ve "Doğruluk Oranı" kartları
- Modern Tab Navigation: (Kişisel Bilgiler, Şifre Değiştirme ve Tehlikeli Alan) sekmeleri
**Kullanıcı Deneyimi (UX):**
- Tüm statik değerlerin animasyonlu / temiz Card yapısında sergilenmesi
- API verisi gelene kadar (veya hata oluğunda) Lokal Zustand verisinin (fallback) anında gösterilmesi
- Grid sistemiyle istatistiklerin ekrana sığdırılması
**Teknik Detaylar:**
- Hook'lar: `useEffect` ile anında `fetchProfile` çağrısı yapma ve `useState` kullanımı.
- State senkronizasyonu.


### 3. Kullanıcı Profil (Şifre) Düzenleme Sayfası
**API Endpoint:** `PUT /api/profile/password`
**Görev:** Güvenlik gereği kullanıcının mevcut şifresini yenisi ile eşzamanlı olarak değiştirebileceği form formunun ve tab arayüzünün implementasyonu.
**UI Bileşenleri:**
- "Şifre" Sekmesi (Tab Panel yapısı) altında bağımsız form nesnesi
- "Yeni Şifre" input alanı
- "Şifreyi Güncelle" özel butonu
**Form Validasyonu:**
- Minimum 6 karakterli String validasyonu. Validasyon çökmeden API'ye gitmez.
**Kullanıcı Deneyimi (UX):**
- Optimistic form (Form submit edilirken "Güncelleniyor..." loading indicator'ı ve disabled durumu)
- Başarılı API aksiyonu sonucunda input'un temizlenip (reset form) "Şifre güncellendi!" Pop-up (toast) çıkarılması.
**Teknik Detaylar:**
- Sayfa değiştirmeye (Router'a) gerek kalmadan State-bazlı sekme (Tab) navigasyonu kullanımı.


### 4. Hesap Silme (Tehlikeli Bölge) Akışı
**API Endpoint:** `DELETE /api/profile`
**Görev:** Kullanıcının VQuest sisteminden tüm verileriyle beraber silinmesi için gerekli güvenli Web UI işlem akışı tasarımı.
**UI Bileşenleri:**
- Profil sayfasında özel kırmızı renklendirilmiş "⚠️ Tehlikeli Alan" Sekmesi
- "Hesabımı Sil" butonu (Danger/Red button style)
- Kırmızı kenarlıklı özel tasarım Card Layout.
**Kullanıcı Deneyimi (UX):**
- Tam Destructive Action (Yok edici eylem) olduğu için kırmızı vurgularla tasarımsal caydırıcılık
- İşlem gerçekleşmeden önce Browser native "Emin misiniz?" onay penceresiyle (Confirmation alert) çift-güvenlik katmanı doğrulaması
- Silme sonrası otomatik "Logout" çalıştırılması ve Login sayfasına atılma
**Teknik Detaylar:**
- Zustang Global Login State (`logout()` fonksiyonu) API silme metodunun birleştirilmesi.
- Token'in sunucu belleklerinden silinmesi.
