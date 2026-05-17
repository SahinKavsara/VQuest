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
  ScrollView,
} from 'react-native';

import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
      });

      // Başarılı kayıt → otomatik giriş yapmak için login isteği at
      const loginRes = await api.post('/auth/login', { email, password });
      const { data } = loginRes;

      await login({
        token: data.token,
        userId: data.user._id ?? data.user.id,
        role: data.user.role ?? 'user',
        username: data.user.username,
        score: data.user.score ?? 0,
      });

    } catch (error) {
      const msg = error.response?.data?.message ?? 'Kayıt olunamadı. Lütfen tekrar deneyin.';
      Alert.alert('Kayıt Başarısız', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo / Başlık */}
        <Text style={styles.logo}>VQuest</Text>
        <Text style={styles.subtitle}>Yeni hesap oluştur</Text>

        {/* Kullanıcı Adı */}
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

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
          placeholder="Şifre (min. 6 karakter)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Şifre Tekrar */}
        <TextInput
          style={styles.input}
          placeholder="Şifreyi Tekrar Gir"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Kayıt Ol Butonu */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Kayıt Ol</Text>
          }
        </TouchableOpacity>

        {/* Giriş yap yönlendirmesi */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>
            Zaten hesabın var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
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
