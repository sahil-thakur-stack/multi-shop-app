import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { sellerService } from '@/services/sellerService';

const C_COLORS = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  ink: '#22312B',
  success: '#3E8B62',
};

export default function SellerTabsLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    try {
      const res = await sellerService.getApprovalStatus();
      const status = res.data?.approvalStatus;
      setApprovalStatus(status);

      // If not approved, redirect to approval page
      if (status !== 'Approved') {
        router.replace('/(seller-tabs)/dashboard-approval');
      }
    } catch (error) {
      console.error('Failed to check approval status:', error);
      // On error, redirect to approval page to be safe
      router.replace('/(seller-tabs)/dashboard-approval');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C_COLORS.background }}>
        <ActivityIndicator size="large" color={C_COLORS.primary} />
      </View>
    );
  }

  // If not approved, don't render tabs - redirect handled above
  if (approvalStatus !== 'Approved') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C_COLORS.primary,
        tabBarInactiveTintColor: C_COLORS.mutedForeground,
        headerShown: true,
        headerStyle: {
          backgroundColor: C_COLORS.background,
          borderBottomColor: C_COLORS.border,
          borderBottomWidth: 1,
        },
        headerTintColor: C_COLORS.foreground,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: C_COLORS.background,
          borderTopColor: C_COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workers"
        options={{
          title: 'Workers',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
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

      <Tabs.Screen
        name="dashboard-approval"
        options={{
          title: 'Approval',
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products/[id]/edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="orders/[id]/detail"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="(seller-edit-modal)"
        options={{ href: null }}
      />

    </Tabs>
  );
}
