import axios from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─────────────────────────────────────────────────────────────────────────────
// Zustand store'u doğrudan import etmek, interceptor içindeki state yönetiminde
// döngüsel bağımlılığa (circular dependency) yol açabilir.
// Bu yüzden store'u runtime'da (lazy) alıyoruz.
// ─────────────────────────────────────────────────────────────────────────────
let _getAuthStore = null;

/**
 * Navigation referansı — 401'de Login'e yönlendirmek için dışarıdan set edilmeli.
 * Örnek kullanım (App.js ya da RootNavigator.js içinde):
 *   import { setNavigationRef } from '@/services/api';
 *   setNavigationRef(navigationRef);
 */
let _navigationRef = null;

export const setNavigationRef = (ref) => {
  _navigationRef = ref;
};

/**
 * Zustand store getter'ını lazy olarak bağla.
 * App başlatılırken bir kez çağrılması yeterli:
 *   import { setAuthStoreGetter } from '@/services/api';
 *   import useAuthStore from '@/store/useAuthStore';
 *   setAuthStoreGetter(useAuthStore.getState);
 */
export const setAuthStoreGetter = (getter) => {
  _getAuthStore = getter;
};

// ─────────────────────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────────────────────

/** Backend'in base URL'i. Geliştirme ortamında kendi IP'nizi yazın.
 *  Docker'da frontend ile aynı network'te ise container adını da kullanabilirsiniz.
 *  Mobilde 'localhost' çalışmaz; gerçek IP veya ngrok adresi kullanın.
 */
const BASE_URL = 'http://10.101.120.200:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Render uyku modundan uyanırken 30 saniyeye kadar sürebilir
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Request Interceptor — JWT'yi otomatik ekle
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      // Önce Zustand store'dan dene (hızlı, senkron)
      const storeToken = _getAuthStore?.()?.token;

      // Fallback: SecureStore (ilk açılış veya store henüz yüklenmemişse)
      const token = storeToken ?? (await SecureStore.getItemAsync('jwt_token'));

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API] Token okunamadı:', err.message);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────────────────────
// Response Interceptor — Hata yönetimi
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  // ✅ Başarılı yanıt — olduğu gibi geçir
  (response) => response,

  // ❌ Hata yanıtı
  async (error) => {
    const status = error.response?.status;

    // ── 401 Unauthorized ─────────────────────────────────────────────────────
    if (status === 401) {
      console.warn('[API] 401 Unauthorized — oturum sonlandırılıyor');

      // Zustand state'ini ve SecureStore'u temizle
      if (_getAuthStore) {
        await _getAuthStore().logout();
      } else {
        // Store getter bağlı değilse en azından SecureStore'u temizle
        await SecureStore.deleteItemAsync('jwt_token');
      }

      // Kullanıcıyı Login ekranına yönlendir
      if (_navigationRef?.isReady()) {
        _navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }

    // ── 429 Too Many Requests ─────────────────────────────────────────────────
    else if (status === 429) {
      console.warn('[API] 429 Rate limit aşıldı');
      Alert.alert(
        'Çok Fazla İstek',
        'Kısa sürede çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.',
        [{ text: 'Tamam' }],
      );
    }

    // ── Diğer hatalar ─────────────────────────────────────────────────────────
    else if (!error.response) {
      // Ağ hatası (sunucuya ulaşılamıyor)
      console.error('[API] Ağ hatası veya sunucu yanıt vermiyor:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
