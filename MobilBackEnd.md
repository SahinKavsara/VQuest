# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** `api.yazmuh.com`

Bu doküman, mobil uygulamanın REST API ile iletişimini sağlayan backend entegrasyon görevlerini tanımlar. Her grup üyesi, kendisine atanan API endpoint’lerinin mobil uygulamadan çağrılması, yönetilmesi ve hata senaryolarının ele alınmasından sorumludur.

---

## Grup Üyelerinin Mobil Backend Görevleri

### Ömer – Auth & Profil
- Login / Register
- JWT token alma ve yenileme
- Profil bilgileri (GET / UPDATE)
- Şifre işlemleri (reset / change)

### Emir – Soru & Kategori
- Soru listeleme
- Kategori listeleme
- Soru detayları
- Filtreleme / pagination

### Mustafa İsmail Toptaş – AI & Bildirim
- AI endpoint çağrıları
- AI sonuçlarının parse edilmesi
- Push notification tetikleme
- Bildirim listeleme / okundu işaretleme

### Şahin Kavsara – Soru Paketleri
- Paket listeleme
- Paket detayları
- Paket satın alma / erişim kontrolü

### Sedat – Oda & Yarışma
- Oda oluşturma / katılma
- Yarışma başlatma
- Canlı yarışma state yönetimi
- Sonuçların çekilmesi

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://api.yazmuh.com/v1`
- **Timeout**
  - Request timeout: **30 saniye**
  - Connect timeout: **10 saniye**
- **Headers**
  ```http
  Content-Type: application/json
  Authorization: Bearer {token}