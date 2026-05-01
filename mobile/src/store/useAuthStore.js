import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/**
 * VQuest — Global Auth Store (Zustand)
 *
 * State:
 *   token       : JWT erişim tokeni (null ise giriş yapılmamış)
 *   userId      : Kullanıcının MongoDB _id'si
 *   role        : 'user' | 'admin'
 *   username    : Görünür kullanıcı adı
 *   score       : Toplam skor (leaderboard için)
 *   isLoading   : Token kontrol edilirken true
 *
 * Actions:
 *   login()         : Token + kullanıcı bilgilerini state'e yaz, SecureStore'a kaydet
 *   logout()        : State'i sıfırla, SecureStore'u temizle
 *   updateUserInfo(): Skor, kullanıcı adı gibi alanları güncelle
 *   loadToken()     : Uygulama açılışında SecureStore'dan token'ı yükle
 */
const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  token: null,
  userId: null,
  role: 'user',
  username: null,
  score: 0,
  isLoading: true, // Başlangıçta token kontrolü yapılıyor

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Login — Backend'den dönen kullanıcı bilgileri ile store'u doldur.
   * @param {{ token: string, userId: string, role: string, username: string, score?: number }} userData
   */
  login: async (userData) => {
    const { token, userId, role, username, score = 0 } = userData;

    // JWT'yi güvenli depoya kaydet
    await SecureStore.setItemAsync('jwt_token', token);

    set({
      token,
      userId,
      role: role ?? 'user',
      username,
      score,
      isLoading: false,
    });
  },

  /**
   * Logout — State'i temizle ve SecureStore'dan tokeni sil.
   */
  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    set({
      token: null,
      userId: null,
      role: 'user',
      username: null,
      score: 0,
      isLoading: false,
    });
  },

  /**
   * updateUserInfo — Skor veya kullanıcı adı gibi alanları kısmi güncelle.
   * @param {Partial<{ username: string, score: number, role: string }>} fields
   */
  updateUserInfo: (fields) => {
    set((state) => ({ ...state, ...fields }));
  },

  /**
   * loadToken — Uygulama başlarken SecureStore'dan token'ı okuyup store'a yükle.
   * App.js içinde useEffect ile çağrılmalıdır.
   */
  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        set({ token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
