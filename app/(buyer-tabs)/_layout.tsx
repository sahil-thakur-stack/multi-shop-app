import React, { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { View, ActivityIndicator } from 'react-native';
import UnauthorizedScreen from '@/app/unauthorized';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
};

export default function BuyerTabsLayout() {
  const { isAuthenticated, user, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!isAuthenticated || user?.role !== 'Buyer') {
    return <UnauthorizedScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.mutedForeground,
        headerShown: true,
        headerStyle: {
          backgroundColor: C.background,
          borderBottomColor: C.border,
          borderBottomWidth: 1,
        },
        headerTintColor: C.foreground,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: C.background,
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="payment-otp" options={{ href: null }} />
      <Tabs.Screen name="orders/[id]/track" options={{ href: null }} />
      <Tabs.Screen name="store/[id]" options={{ href: null }} />
    </Tabs>
  );
}
