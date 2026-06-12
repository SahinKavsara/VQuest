# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [VQuest Frontend](https://v-quest-frontend-deploy.vercel.app/)

Bu dokümanda, VQuest projesinin kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) standartları, kullanılan teknoloji yığını ile ekip üyelerinin sorumluluk alanları listelenmektedir.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Şahin Kavsara'nın Web Frontend Görevleri](team/sahin-kavsara/Sahin-Kavsara-Web-Frontend-Gorevleri.md)
2. [Mustafa İsmail Toptaş'ın Web Frontend Görevleri](team/mustafa-ismail-toptas/Mustafa-İsmail-Toptaş-Web-Frontend-Gorevleri.md)
3. [Ömer Said Karakuş'un Web Frontend Görevleri](team/omer-said-karakus/Ömer-Said-Karakus-Web-Frontend-Gorevleri.md)
4. [Emir Omrak'ın Web Frontend Görevleri](team/emir-omrak/Emir-Omrak-Web-Frontend-Gorevleri.md)
5. [Sedat Bakla'nın Web Frontend Görevleri](team/sedat-bakla/Sedat-Bakla-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Önce mobil, sonra desktop
- **Breakpoints:** 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Layouts:** Flexbox ve CSS Grid
- **Responsive Layout:** Yüzdelik (esnek) container yapıları

### 2. Tasarım Sistemi
- **CSS Framework:** Custom Vanilla CSS (`index.css`)
- **Renk Paleti:** CSS variables (örn: `var(--bg-dark)`)
- **Tipografi:** Web-safe fontlar (Google Fonts)
- **Spacing:** Tutarlı padding ve margin değerleri
- **Iconography:** Native Emojiler
- **Component Library:** Reusable React components (`Navbar`, `AdminSidebar`)

### 3. Performans Optimizasyonu
- **Code Splitting:** Route-based splitting (Vite SSR üzerinden)
- **Minification:** CSS ve JavaScript minification (Vite build)
- **Bundle Size:** Tree shaking ve dead code elimination

### 4. SEO (Search Engine Optimization)
- **Meta Tags:** Standart SPA tags
- **Semantic HTML:** HTML5 semantic tag entegrasyonu (header, main, aside)

### 5. Erişilebilirlik (Accessibility)
- **Color Contrast:** Minimum 4.5:1 ratio (Dark theme odaklı)
- **Focus Indicators:** Visible focus/hover states
- **Alerts:** Özel `react-hot-toast` yönlendirmeleri

### 6. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari, Edge
- **Graceful Degradation:** Erişilemeyen sayfalar için SPA route fallback

### 7. State Management
- **Global State:** Zustand (`src/store/authStore`)
- **Local State:** React Component state ve Hooks
- **Server State:** `@tanstack/react-query`

### 8. Routing
- **Client-Side Routing:** React Router DOM (v6)
- **Protected Routes:** `ProtectedRoute` component guards
- **404 Handling:** Geçersiz route'larda Home'a (Lobby) otomatik yönlendirme (`Navigate replace`)

### 9. API Entegrasyonu
- **HTTP Client:** Axios (`api.js` interceptors)
- **WebSocket:** Socket.io-client (Gerçek zamanlı odalar)
- **Loading States:** React state tabanlı, Spinner componentleri

### 10. Testing
- **Development Tool:** Vite HMR ile anlık tarayıcı testi

### 11. Build ve Deployment
- **Build Tool:** Vite
- **Module Bundler:** ES modules
- **Environment Variables:** `.env` files (API url, Socket host)