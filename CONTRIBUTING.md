# VQuest'e Katkıda Bulunma Rehberi

VQuest projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkı sağlayabileceğinizi açıklar.

---

## 🚀 Başlarken

1. Bu repoyu **fork** edin
2. Kendi fork'unuzdan bir **feature branch** oluşturun:
   ```bash
   git checkout -b feature/yeni-ozellik
   ```
3. Değişikliklerinizi yapın ve commit edin:
   ```bash
   git commit -m "feat: yeni özellik açıklaması"
   ```
4. Branch'inizi push edin:
   ```bash
   git push origin feature/yeni-ozellik
   ```
5. Bir **Pull Request** açın

---

## 📐 Geliştirme Kuralları

### Branch İsimlendirme

| Prefix | Kullanım |
|--------|----------|
| `feature/` | Yeni özellik |
| `fix/` | Hata düzeltme |
| `refactor/` | Kod yeniden düzenleme |
| `docs/` | Dokümantasyon değişikliği |
| `test/` | Test ekleme/güncelleme |

### Commit Mesajları

[Conventional Commits](https://www.conventionalcommits.org/) formatını kullanıyoruz:

```
feat: kullanıcı profil sayfası eklendi
fix: oda katılım hatası düzeltildi
docs: API dokümantasyonu güncellendi
refactor: auth middleware yeniden yapılandırıldı
test: room controller unit testleri eklendi
```

### Kod Stili

- **JavaScript/JSX:** ES Modules (`import/export`)
- **Girintileme:** 2 boşluk
- **Satır sonu:** LF
- **Dosya sonu:** Yeni satır ile biter
- **Değişken isimleri:** camelCase
- **Dosya isimleri:** camelCase (controller, service) veya PascalCase (React component)

---

## 🏗️ Proje Yapısı

Projenin genel yapısını anlamak için [README.md](README.md) dosyasındaki **Proje Yapısı** bölümünü inceleyiniz.

---

## 🧪 Test

Backend testlerini çalıştırmak için:

```bash
cd backend
npm test
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

- `.env` dosyalarını **asla** commit etmeyin
- Hassas bilgileri (API key, şifre, token) kaynak kodda bırakmayın
- Pull request açmadan önce kodunuzun çalıştığından emin olun
- Büyük değişiklikler için önce bir **issue** açarak tartışma başlatın

---

## 📄 Lisans

Bu projeye katkıda bulunarak, katkılarınızın [MIT Lisansı](LICENSE) altında lisanslanacağını kabul etmiş olursunuz.
