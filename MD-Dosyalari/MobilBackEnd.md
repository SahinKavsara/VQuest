# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** [api.yazmuh.com](https://api.yazmuh.com)

Bu dokümanda, mobil uygulamanın REST API ile iletişimini sağlayan backend entegrasyon görevleri listelenmektedir. Her grup üyesi, kendisine atanan API endpoint'lerinin mobil uygulamadan çağrılması ve yönetilmesinden sorumludur.

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Şahin Kavsara'nın Mobil Backend Görevleri](../Sahsi-Dosyalar/Sahin-Kavsara/Sahin-Kavsara-Mobil-Backend-Gorevleri.md)
2. [Mustafa İsmail Toptaş'ın Mobil Backend Görevleri](../Sahsi-Dosyalar/Mustafa-%C4%B0smail-Topta%C5%9F/Mustafa-%C4%B0smail-Topta%C5%9F-Mobil-Backend-Gorevleri.md)
3. [Ömer Said Karakuş'un Mobil Backend Görevleri](../Sahsi-Dosyalar/Ömer-Said-Karakus/Ömer-Said-Karakus-Mobil-Backend-Gorevleri.md)
4. [Emir Omrak'ın Mobil Backend Görevleri](../Sahsi-Dosyalar/Emir-Omrak/Emir-Omrak-Mobil-Backend-Gorevleri.md)
5. [Sedat Bakla'nın Mobil Backend Görevleri](../Sahsi-Dosyalar/Sedat-Bakla/Sedat-Bakla-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://api.yazmuh.com/v1`
- **Timeout:** Request timeout 30 saniye, connect timeout 10 saniye
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (gerekli endpoint'lerde)

### 2. Authentication Yönetimi
- JWT token'ları secure storage'da saklama
- Token refresh mekanizması implementasyonu
- Otomatik token yenileme (401 durumunda)
- Logout durumunda token temizleme

### 3. Error Handling
- Network hataları (timeout, connection error)
- HTTP status kodlarına göre uygun mesajlar gösterme
- Retry mekanizması (network hatalarında)
- Offline durum yönetimi

### 4. Caching Stratejisi
- GET istekleri için response caching
- Cache invalidation (PUT/DELETE sonrası)
- Offline-first yaklaşımı (mümkün olduğunda)

### 5. Loading States
- Request başlangıcında loading indicator
- Başarılı/başarısız durum bildirimleri
- Optimistic updates (kullanıcı deneyimi için)

### 6. Logging ve Debugging
- API request/response logging (development modunda)
- Error logging ve crash reporting
- Network interceptor kullanımı
