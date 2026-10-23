import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useCallback } from 'react';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  success: '#3E8B62',
  warning: '#F59E0B',
  ink: '#22312B',
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

export default function ApprovalPage() {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getApprovalStatus();
      // API returns { success, message, data: { approvalStatus, ... } }
      const status = res?.data?.approvalStatus || 'Pending';

      // If approved, redirect immediately
      // if (status === 'Approved') {
      //   router.replace('/(seller-tabs)');
      //   return;
      // }

      setApprovalStatus(status?.toLowerCase() as any);
    } catch (error) {
      console.error('Failed to check approval status:', error);
      setApprovalStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (approvalStatus === 'approved') {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Icon name="check-circle" size={64} color={C.success} />
          </View>
          <Text style={styles.mainTitle}>Account Approved! ✓</Text>
          <Text style={styles.subtitle}>Your seller account is active and ready to receive orders</Text>
          <ActivityIndicator style={{ marginTop: 24 }} size="small" color={C.primary} />
        </View>
      </View>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.center}>
          <View style={[styles.iconBox, { backgroundColor: '#C84B4320' }]}>
            <Icon name="x-circle" size={64} color="#C84B43" />
          </View>
          <Text style={styles.mainTitle}>Account Rejected</Text>
          <Text style={styles.subtitle}>Unfortunately, your application could not be approved at this time</Text>
          <Text style={styles.details}>Please contact our support team for more information about the rejection reason</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/auth/login')}>
            <Text style={styles.buttonText}>Return to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Pending approval
  return (
    <View style={styles.fullScreen}>
      <View style={styles.center}>
        <View style={[styles.iconBox, { backgroundColor: `${C.warning}20` }]}>
          <Icon name="clock" size={64} color={C.warning} />
        </View>
        <Text style={styles.mainTitle}>Under Review</Text>
        <Text style={styles.subtitle}>Your seller account is awaiting admin approval</Text>
        <Text style={styles.details}>Our team will review your onboarding documents and approve your account within 24-48 hours. You'll receive a notification once approved</Text>
        <Pressable style={styles.button} onPress={checkApprovalStatus}>
          <Text style={styles.buttonText}>Check Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: C.ink,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${C.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    color: C.foreground,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: C.mutedForeground,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  details: {
    color: C.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: C.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 200,
  },
  buttonText: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
