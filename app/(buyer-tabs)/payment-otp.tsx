import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { buyerService } from '@/services/buyerService';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

export default function PaymentOTPScreen() {
  const { amount } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await buyerService.verifyPaymentOTP({
        amount: parseInt(amount as string) || 0,
        otp: otp,
      });
      Alert.alert('Success', 'Payment verified successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(buyer-tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    Alert.alert('OTP Sent', 'OTP sent to your registered mobile number');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="lock" size={48} color={C.primary} />
        </View>

        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Verify payment of ₹{amount || '0'}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>6-Digit OTP *</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter OTP"
            placeholderTextColor={C.mutedForeground}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Text style={styles.hint}>Check your registered mobile number</Text>
        </View>

        <Pressable
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color={C.foreground} />
          ) : (
            <>
              <Icon name="check-circle" size={18} color={C.foreground} />
              <Text style={styles.verifyText}>Verify & Confirm Payment</Text>
            </>
          )}
        </Pressable>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>
            {canResend ? "Didn't receive OTP? " : `Resend OTP in ${timer}s`}
          </Text>
          {canResend && (
            <Pressable onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, justifyContent: 'flex-end' },
  content: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingVertical: 30, paddingBottom: 40 },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  title: { color: C.foreground, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: C.mutedForeground, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: C.background, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  label: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  otpInput: { backgroundColor: C.card, color: C.foreground, borderColor: C.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, fontWeight: '700', letterSpacing: 8, textAlign: 'center', marginBottom: 10 },
  hint: { color: C.mutedForeground, fontSize: 12, textAlign: 'center' },
  verifyButton: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  disabledButton: { opacity: 0.6 },
  verifyText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 16 },
  resendLabel: { color: C.mutedForeground, fontSize: 13 },
  resendLink: { color: C.primary, fontSize: 13, fontWeight: '700' },
  cancelButton: { borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  cancelText: { color: C.mutedForeground, fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
