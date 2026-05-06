import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre alanlarını doldurunuz.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Backend'den gelen token ve kullanıcı bilgilerini store'a yaz
      await login({
        token: data.token,
        userId: data.user._id ?? data.user.id,
        role: data.user.role,
        username: data.user.username,
        score: data.user.score ?? 0,
      });

    } catch (error) {
      // 401 → interceptor zaten handle eder
      // Diğer hatalar
      const msg = error.response?.data?.message ?? 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      Alert.alert('Giriş Başarısız', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / Başlık */}
        <Text style={styles.logo}>VQuest</Text>
        <Text style={styles.subtitle}>Yarışmaya katılmak için giriş yap</Text>

        {/* E-posta */}
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Şifre */}
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Giriş Butonu */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Giriş Yap</Text>
          }
        </TouchableOpacity>

        {/* Kayıt ol yönlendirmesi */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    color: '#e94560',
    fontWeight: '700',
  },
});
