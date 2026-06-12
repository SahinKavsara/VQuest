# Emir Omrak'ın Mobil Frontend Görevleri



## 1. Soru Listeleme Ekranı

- **API Endpoint:** `GET /api/questions`
- **Görev:** Adminin sistemdeki tüm soruları görüntüleyebildiği, yönettiği mobil ekran implementasyonu
- **UI Bileşenleri:**
  - Soru kartları (Soru metni, kategori etiketi, şıklar ve doğru cevap vurgulaması)
  - Her sorunun yanında **Düzenle** ve **Sil** butonları
  - Loading indicator (sorular yüklenirken)
  - Empty state — Hiç soru yoksa "Soru Bulunamadı 📭" mesajı
  - Pull-to-refresh mekanizması
- **Kullanıcı Deneyimi:**
  - Başlık bölümünde "➕ Soru Ekle" butonu ile yeni soru ekleme modalına erişim
  - Başlık bölümünde "‹" geri butonu ile önceki ekrana dönüş
  - Doğru cevap olan şık listede yeşil renk ve ✓ işaretiyle vurgulanır
- **Teknik Detaylar:**
  - `FlatList` ile performanslı liste render, `keyboardShouldPersistTaps="handled"`
  - `useState` ile soru listesi ve yükleme state'i yönetimi
  - Component mount edildiğinde `GET /api/questions` isteği atılır

## 2. Soru Ekleme ve Düzenleme Ekranı (Admin — Modal)

- **API Endpoint:** `POST /api/admin/questions` | `PUT /api/admin/questions/{questionId}`
- **Görev:** Admin kullanıcının soru havuzuna yeni soru ekleyebildiği veya mevcut soruyu düzenleyebildiği modal implementasyonu
- **UI Bileşenleri:**
  - Soru metni için çok satırlı `TextInput`
  - A, B, C, D şıkları için 4 ayrı `TextInput` alanı
  - Her şıkın solunda RadioCircle — şık dolu iken tıklanınca o şık doğru cevap olarak işaretlenir (yeşil arka plan + ✓); boşken tıklanınca uyarı verilir
  - Kategori seçimi için "▼" butonuyla açılan ayrı bir Kategori Picker Modal; mevcut kategoriler listelenir, seçili kategori vurgulanır, yoksa varsayılan olarak "Genel Kültür" sunulur
  - Kaydet ve İptal butonları; kaydetme sırasında `ActivityIndicator`
- **Form Validasyonu:**
  - Soru metni boş bırakılamaz
  - Şıkların en az 2 tanesi doldurulmuş olmalı
  - Doğru cevap seçilmiş olmalı ve doldurulmuş şıklardan biri olmalı
- **Kullanıcı Deneyimi:**
  - Modal, ekleme için boş — düzenleme için mevcut değerlerle dolu açılır
  - Başarılı ekleme/güncelleme sonrası modal kapanır ve liste anında güncellenir
  - Başarı/hata durumları `Toast` bildirimiyle ekranda gösterilir
- **Teknik Detaylar:**
  - Aynı modal hem ekleme hem düzenleme için kullanılır (`editingQuestion` state'i ile ayrıştırılır)
  - `ScrollView` içinde form — klavye açıldığında içerik kaybolmaz
  - Kaydetme sırasında buton `disabled`, üzerinde `ActivityIndicator` gösterilir

## 3. Soru Silme Akışı (Admin)

- **API Endpoint:** `DELETE /api/admin/questions/{questionId}`
- **Görev:** Admin kullanıcının bir soruyu güvenli şekilde soru listesinden kalıcı olarak silmesi
- **UI Bileşenleri:**
  - Her soru kartında kırmızı renkli **Sil** butonu
  - Onay diyalogu: "Bu soruyu silmek istediğine emin misin?" — İptal / Sil seçenekleri
- **Kullanıcı Deneyimi:**
  - Yanlış silme yapılmaması için destructive onay diyalogu zorunludur
  - Başarılı silme sonrası soru listeden anında çıkarılır ve Toast bildirimi gösterilir
  - Hata durumunda "Soru silinemedi" Toast bildirimi gösterilir
- **Teknik Detaylar:**
  - `Alert.alert` ile native onay diyalogu
  - 204 yanıtı sonrası `setQuestions(prev => prev.filter(...))` ile state güncellenir

## 4. Kategori Listeleme Ekranı (Admin)

- **API Endpoint:** `GET /api/categories`
- **Görev:** Admin kullanıcının sistemdeki tüm soru kategorilerini görüntüleyebildiği ekran implementasyonu
- **UI Bileşenleri:**
  - Kategori kartları listesi — her kartın sağında **Düzenle** butonu
  - Pull-to-refresh mekanizması
  - Loading indicator (kategoriler yüklenirken)
  - Empty state — "Kategori Bulunamadı 📭" mesajı
- **Teknik Detaylar:**
  - `FlatList` ile kategori listesi render
  - `useState` ile kategori listesi ve yükleme state'i yönetimi
  - Component mount edildiğinde `GET /api/categories` isteği atılır

## 5. Kategori Ekleme Ekranı (Admin)

- **API Endpoint:** `POST /api/admin/categories`
- **Görev:** Admin kullanıcının ekran üzerinden sisteme yeni kategori ekleyebildiği form implementasyonu
- **UI Bileşenleri:**
  - Sayfanın üst sabit bölümünde kategori adı `TextInput` alanı ve **Ekle** butonu
  - Ekleme sırasında `ActivityIndicator` (buton üzerinde)
- **Form Validasyonu:**
  - Kategori adı boş bırakılamaz
  - Kategori adı en az 2 karakter olmalı
- **Kullanıcı Deneyimi:**
  - `onSubmitEditing` ile klavyeden doğrudan **Enter** tuşuna basarak kategori eklenebilir
  - Başarılı ekleme sonrası input alanı temizlenir ve yeni kategori listeye anında eklenir
  - 3 aşamalı Promise Toast: "Ekleniyor ⏳" → "Başarıyla eklendi 🎉" veya "Hata oluştu"
- **Teknik Detaylar:**
  - `useState` ile ekleme formu state'i (`newCatName`, `adding`) izole yönetilir
  - `handlePromiseToast` fonksiyonu ile Loading/Başarı/Hata mesaj akışı

## 6. Kategori Düzenleme Ekranı (Admin)

- **API Endpoint:** `PUT /api/admin/categories/{categoryId}`
- **Görev:** Admin kullanıcının mevcut bir kategorinin ismini düzenleyebildiği modal implementasyonu
- **UI Bileşenleri:**
  - Her kategori kartındaki **Düzenle** butonuyla açılan BottomSheet benzeri Modal
  - Modal içinde mevcut kategori adıyla dolu `TextInput`
  - Kaydet ve İptal butonları; güncelleme sırasında `ActivityIndicator`
- **Form Validasyonu:**
  - Kategori adı boş bırakılamaz
  - Kategori adı en az 2 karakter olmalı
- **Kullanıcı Deneyimi:**
  - `onSubmitEditing` ile modal içindeki input'tan Enter'a basarak kayıt tetiklenebilir
  - Başarılı güncelleme sonrası modal kapanır ve liste anında güncellenir
  - 3 aşamalı Promise Toast: "Güncelleniyor ⏳" → "Başarıyla güncellendi 🎉" veya "Hata oluştu"
- **Teknik Detaylar:**
  - `useState` ile düzenleme state'i (`editingCategory`, `editCatName`, `updating`) yönetilir
  - `handlePromiseToast` fonksiyonu ile Loading/Başarı/Hata mesaj akışı
