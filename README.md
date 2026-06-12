<div align="center">

# 🏆 VQuest

### Gerçek Zamanlı & AI Destekli Bilgi Yarışması Platformu

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)

<br/>

![Ürün Tanıtım Görseli](docs/assets/product.png)

</div>

---

## 📋 Proje Hakkında

**VQuest**, kullanıcıların farklı soru kategorilerinde çevrimiçi odalara katılarak eşzamanlı yarıştığı ve **yapay zeka destekli** kişisel performans analizi sunan kapsamlı bir bilgi yarışması platformudur.

Gelişmiş altyapımız sayesinde kullanıcılara rekabetçi ve kesintisiz bir oyun deneyimi sunarken, dinamik soru havuzumuz ve kendi özel soru paketlerini oluşturma imkanı ile sistemi tamamen kişiselleştirilebilir kılıyoruz. VQuest olarak sıradan bir test uygulamasının ötesine geçerek; canlı puan tabloları, zaman kısıtlı rekabet ve oyun sonrası oluşturulan yapay zeka destekli gelişim raporlarıyla hem eğlendiren hem de kullanıcıların zayıf ve güçlü yönlerini keşfetmelerini sağlayan öğretici bir ekosistem yaratmayı hedefliyoruz.

**Proje Kategorisi:** Eğitim Teknolojileri (EdTech) & Gerçek Zamanlı Çok Oyunculu Bilgi Yarışması

**Referans Uygulama:** [Kahoot!](https://kahoot.com/)

---

## 🔗 Canlı Linkler

| Servis | URL |
|--------|-----|
| 🌐 Web Frontend | [v-quest-frontend-deploy.vercel.app](https://v-quest-frontend-deploy.vercel.app/) |
| 🔧 REST API | [vquest-backend-api.onrender.com](https://vquest-backend-api.onrender.com) |
| 📖 API Docs (Swagger) | [vquest-backend-api.onrender.com/api-docs](https://vquest-backend-api.onrender.com/api-docs) |

---

## 🏗️ Teknoloji Yığını

| Katman | Teknolojiler |
|--------|-------------|
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT, Swagger |
| **Web Frontend** | React 18, Vite, React Router v6, Zustand, Axios, React Query |
| **Mobil** | React Native (Expo), React Navigation |
| **Gerçek Zamanlı** | Socket.IO |
| **Mesaj Kuyruğu** | RabbitMQ |
| **Cache & Rate Limit** | Redis (ioredis) |
| **AI** | Google Gemini API |
| **CI/CD** | Jenkins, Docker, Docker Compose |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Proje Yapısı

```
VQuest/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Veritabanı, Redis, Swagger, Rate Limiter
│   │   ├── controllers/      # İş mantığı katmanı
│   │   ├── middlewares/      # Auth middleware
│   │   ├── models/           # Mongoose şemaları
│   │   ├── routes/           # API rotaları
│   │   └── services/         # Gemini AI, Socket.IO servisleri
│   ├── controllers/          # AI & Bildirim controller'ları
│   ├── models/               # Analiz, Bildirim, Sistem modelleri
│   ├── routes/               # AI & Bildirim rotaları
│   ├── services/             # RabbitMQ, Redis servisleri
│   ├── workers/              # Hesap silme worker'ı
│   ├── scripts/              # Yardımcı scriptler
│   └── tests/                # Test dosyaları
│
├── frontend/                 # React + Vite Web Uygulaması
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, ProtectedRoute
│   │   ├── pages/            # Sayfa bileşenleri
│   │   │   └── admin/        # Admin panel sayfaları
│   │   ├── services/         # API & Socket istemcileri
│   │   └── store/            # Zustand state yönetimi
│   └── public/               # Statik dosyalar
│
├── mobile/                   # React Native (Expo) Mobil Uygulama
│   ├── src/
│   │   ├── screens/          # Uygulama ekranları
│   │   ├── navigation/       # Navigasyon yapısı
│   │   ├── services/         # API & Socket istemcileri
│   │   └── store/            # Zustand state yönetimi
│   └── assets/               # Uygulama ikonları
│
├── jenkins/                  # Jenkins CI/CD Dockerfile
├── docs/                     # Proje dokümantasyonu
│   ├── api/                  # OpenAPI spesifikasyonu
│   ├── assets/               # Dokümantasyon görselleri
│   └── team/                 # Ekip üyesi görev dağılımları
│
├── docker-compose.yml        # Çoklu servis orkestrasyon
├── Jenkinsfile               # CI/CD pipeline tanımı
└── README.md
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (v6+)
- [Redis](https://redis.io/) (v7+)
- [Docker](https://www.docker.com/) & Docker Compose (opsiyonel)

### 🐳 Docker ile Çalıştırma (Önerilen)

```bash
# Repoyu klonla
git clone https://github.com/SahinKavsara/VQuest.git
cd VQuest

# Tüm servisleri başlat
docker compose up -d --build
```

| Servis | Port |
|--------|------|
| Frontend (Nginx) | `http://localhost:80` |
| Backend API | `http://localhost:3000` |
| MongoDB | `localhost:27017` |
| Redis | `localhost:6379` |
| RabbitMQ Management | `http://localhost:15672` |
| Jenkins | `http://localhost:8082` |

### 🔧 Manuel Kurulum

#### Backend

```bash
cd backend
cp .env.example .env          # Ortam değişkenlerini yapılandır
npm install
npm run dev                   # http://localhost:3000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

#### Mobile

```bash
cd mobile
npm install
npx expo start                # Expo Go ile bağlan
```

---

## 📖 Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [Gereksinim Analizi](docs/requirements.md) | Tüm fonksiyonel gereksinimler |
| [API Tasarımı (OpenAPI)](docs/api-design.md) | Detaylı REST API spesifikasyonu |
| [REST API Görev Dağılımı](docs/rest-api.md) | Backend endpoint sorumlulukları |
| [Web Frontend](docs/web-frontend.md) | Web arayüzü prensipleri ve görev dağılımı |
| [Mobil Frontend](docs/mobile-frontend.md) | Mobil arayüz prensipleri ve görev dağılımı |
| [Mobil Backend](docs/mobile-backend.md) | Mobil API entegrasyon görevleri |

---

## 👥 Proje Ekibi — VDevs

| Üye | Sorumluluk Alanı |
|-----|------------------|
| **Şahin Kavsara** | Özel Paketler & Öneriler |
| **Mustafa İsmail Toptaş** | Yapay Zeka & Bildirimler |
| **Sedat Bakla** | Canlı Oyun & Odalar |
| **Emir Omrak** | Sorular & Kategoriler |
| **Ömer Said Karakuş** | Kimlik & Profil Yönetimi |

---

## 🤝 Katkıda Bulunma

Katkıda bulunmak için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını inceleyiniz.

---

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.
