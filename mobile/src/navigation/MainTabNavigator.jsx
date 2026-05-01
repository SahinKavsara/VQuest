import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/main/HomeScreen';
import PackagesScreen from '../screens/main/PackagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();

// ─── Admin Stack (yalnızca role === 'admin') ──────────────────────────────────
export function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </AdminStack.Navigator>
  );
}

// ─── Main Tab Navigator (doğrulanmış kullanıcılar) ───────────────────────────
export default function MainTabNavigator({ role }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#16213e',
        },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: '🏠',
            Packages: '📦',
            Profile: '👤',
            Admin: '🛡️',
          };
          return (
            <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Packages" component={PackagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminNavigator} />
      )}
    </Tab.Navigator>
  );
}
