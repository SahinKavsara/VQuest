# Emir Omrak'ın Web Frontend Görevleri
Front-end Test Videosu: Link buraya eklenecek

### 1. Ana Soru Havuzu Yönetimi Modülü (Admin Panel)
**API Endpoint:** `GET /api/questions` | `POST /api/admin/questions` | `PUT /api/admin/questions/{id}` | `DELETE /api/admin/questions/{id}`
**Görev:** Yöneticinin, platform içerisindeki oyunlarda çıkacak ana soru havuzunu yönettiği, yeni soru ekleyebildiği veya silebildiği `AdminQuestions.jsx` sayfasının tasarımı.
**UI Bileşenleri:**
- Soruların sergilendiği Geniş Grid veya Liste/Table tasarımı.
- Her sorunun yanında "Kalem" (Düzenle) ve "Çöp Kutusu" (Sil) ikon/butonları.
- Yeni soru eklemek ve var olanı değiştirmek için Açılır-Kapanır Modal (Popup) veya Form Container.
- Kategori seçimi için Select/Dropdown Box, Soru şıkları için birden fazla (A,B,C,D) input alanı.
**Form Validasyonu:**
- Soru metni boş bırakılamaz kuralı.
- Şıkların en az 2 tanesinin doldurulması zorunluluğu (Mongoose Validasyonu) ve bir Doğru Cevap (correctAnswer) seçilme şartı.
**Kullanıcı Deneyimi (UX):**
- Silme işlemi öncesinde tehlikeli aksiyon için tarayıcı uyarı diyalogu (Confirm dialog).
- Ekleme/düzenleme tamamlandıktan sonra sayfanın React State üzerinde hızlıca yenilenmesi ve "Başarılı" Toast bildirimi atılması.
**Teknik Detaylar:**
- Axios ve State Management üzerinden Data mapping yapılması, Component mount edildiğinde listenin anında getirilmesi.


### 2. Soru Kategorileri Yönetimi Modülü (Admin Panel)
**API Endpoint:** `GET /api/categories` | `POST /api/admin/categories` | `PUT /api/admin/categories/{id}`
**Görev:**  Yöneticinin soruları tasnifleyebilmesi için yeni kategori oluşturduğu veya mevcutları düzenlediği `AdminCategories.jsx` arayüzünün kurulumu.
**UI Bileşenleri:**
- Kategori isimlerinin ve (varsa) soru sayılarının yeraldığı dinamik Card yapısı veya listeler.
- Yeni Kategori Ekleme Form Kutusu (Sadece String Name).
- Liste elemanlarının yanında Düzenle tetikleyicisi.
**Form Validasyonu:**
- Kategori ismi boş veya minimum x karakterden düşük olursa uyarı basılması.
**Kullanıcı Deneyimi (UX):**
- Modern CSS hover efektleriyle kategori kartlarının net şekilde seçilmesi.
- Adminin hızlıca yazı yazıp Enter ile ekleyebilmesi.
**Teknik Detaylar:**
- Form State yönetiminin `useState` aracılığıyla izole olarak bileşen içerisinde kontrol edilmesi.
- Promise bazlı Toast notification entegrasyonu.
