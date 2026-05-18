import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import GameRoomScreen from '../screens/main/GameRoomScreen';
import AnalysisScreen from '../screens/main/AnalysisScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PackagesScreen from '../screens/main/PackagesScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import QuestionsScreen from '../screens/admin/QuestionsScreen';
import CategoriesScreen from '../screens/admin/CategoriesScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

// ── Home Stack: Lobi + Oyun Odası ─────────────────────────────────────────────
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Lobby" component={HomeScreen} />
      <HomeStack.Screen name="GameRoom" component={GameRoomScreen} />
    </HomeStack.Navigator>
  );
}

// ── Admin Stack ────────────────────────────────────────────────────────────────
function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="Packages" component={PackagesScreen} />
      <AdminStack.Screen name="Users" component={UsersScreen} />
      <AdminStack.Screen name="Questions" component={QuestionsScreen} />
      <AdminStack.Screen name="Categories" component={CategoriesScreen} />
    </AdminStack.Navigator>
  );
}

// ── Tab ikonu bileşeni ─────────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 9,
          marginTop: 2,
          color: focused ? '#e94560' : '#666',
          fontWeight: focused ? '700' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Ana Tab Navigator ──────────────────────────────────────────────────────────
export default function MainTabNavigator({ role }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f1630',
          borderTopColor: '#16213e',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* Ana Sayfa — Lobi */}
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Lobi" focused={focused} />
          ),
        }}
      />

      {/* AI Analiz */}
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤖" label="Analiz" focused={focused} />
          ),
        }}
      />

      {/* Bildirimler */}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Bildirim" focused={focused} />
          ),
        }}
      />

      {/* Profil */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profil" focused={focused} />
          ),
        }}
      />

      {/* Admin — sadece admin rolü */}
      {role === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🛡️" label="Admin" focused={focused} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
