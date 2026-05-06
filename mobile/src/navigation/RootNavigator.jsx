import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import useAuthStore from '../store/useAuthStore';
import { setNavigationRef, setAuthStoreGetter } from '../services/api';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

// NavigationContainer için ref (api.js interceptor'ı için gerekli)
import { useNavigationContainerRef } from '@react-navigation/native';

export default function RootNavigator() {
  const navigationRef = useNavigationContainerRef();
  const { token, role, isLoading, loadToken } = useAuthStore();

  // Uygulama açılışında token'ı SecureStore'dan yükle
  useEffect(() => {
    // API interceptor'larına navigation ve store bağla
    setNavigationRef(navigationRef);
    setAuthStoreGetter(useAuthStore.getState);
    loadToken();
  }, []);

  // Token yüklenirken splash/spinner göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {token ? <MainTabNavigator role={role} /> : <AuthStack />}
    </NavigationContainer>
  );
}
