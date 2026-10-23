import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/context/ToastContext';

const C = colors.light;

function Icon({
  name,
  size = 18,
  color = C.foreground,
}: {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}

export default function VerifyOtpPage() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const session = useSession();
  const { verifyOtp, sendOtp, selectRole } = session;
  const { showToast } = useToast();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<'Seller' | 'Buyer' | null>(null);

  // Load registration data from AsyncStorage
  useEffect(() => {
    const loadPendingRegistration = async () => {
      try {
        const data = await AsyncStorage.getItem('pending-registration');
        console.log('📦 Loaded pending-registration from AsyncStorage:', data);
        if (data) {
          const parsed = JSON.parse(data);
          console.log('✅ Parsed registration data:', parsed);
          setFullName(parsed.fullName);
          setRole(parsed.role);
        } else {
          console.warn('⚠️ No pending-registration found in AsyncStorage');
        }
      } catch (error) {
        console.error('❌ Failed to load pending registration:', error);
      }
    };
    loadPendingRegistration();
  }, []);

  if (!phoneNumber) {
    return (
      <View style={styles.center}>
        <Text>Invalid phone number</Text>
      </View>
    );
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast('Please enter a 6-digit OTP', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(phoneNumber, otp);
      console.log('📱 VerifyOtp result:', result);

      const { isNewUser, role, approvalStatus } = result;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check seller approval status
      console.log('🔎 Checking: isNewUser=', isNewUser, 'role=', role, 'approvalStatus=', approvalStatus);

      if (!isNewUser && role === 'Seller') {
        // Backend returns "Approved", "Pending", or "Rejected" (capital letters)
        if (approvalStatus !== 'Approved') {
          console.log('Seller not approved, showing toast');

          let message = 'Your seller account is awaiting admin approval. Please check back later.';

          if (approvalStatus === 'Rejected') {
            message = 'Your seller account has been rejected. Please contact support.';
          }

          showToast(message, 'error');
          setOtp('');
          setIsLoading(false);
          return;
        }
      }

      // Wait for context state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isNewUser) {
        // For new users, get registration data
        let regFullName = fullName;
        let regRole = role as 'Seller' | 'Buyer';

        // Load from AsyncStorage if not set
        if (!regFullName || !regRole) {
          const stored = await AsyncStorage.getItem('pending-registration');
          if (stored) {
            const parsed = JSON.parse(stored);
            regFullName = parsed.fullName;
            regRole = parsed.role;
          }
        }

        // Must have fullName and role
        if (!regFullName || !regRole) {
          showToast('Registration data missing. Please register again.', 'error');
          setTimeout(() => router.replace('/auth/register'), 1500);
          return;
        }

        console.log('✅ Creating account for:', { fullName: regFullName, role: regRole });

        // Call selectRole immediately to create user and get auth token
        try {
          await selectRole(regFullName, regRole);

          // Clear pending registration from AsyncStorage
          await AsyncStorage.removeItem('pending-registration');

          if (regRole === 'Seller') {
            // Sellers go to onboarding form
            showToast('Account created! Complete your profile.', 'success');
            setTimeout(() => router.replace('/seller-onboarding'), 1500);
          } else {
            // Buyers go directly to dashboard
            showToast('Account created successfully!', 'success');
            setTimeout(() => router.replace('/(buyer-tabs)'), 1500);
          }
        } catch (selectError) {
          const errorMsg = selectError instanceof Error ? selectError.message : 'Failed to create account';
          console.error('❌ SelectRole error:', errorMsg);
          showToast(errorMsg, 'error');
          setOtp('');
          setIsLoading(false);
          return;
        }

        return;
      } else if (role === 'Seller') {
        // For approved sellers, go straight to dashboard
        router.replace('/(seller-tabs)');
      } else {
        // Buyers go straight to dashboard
        router.replace('/(buyer-tabs)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify OTP';
      showToast(errorMsg, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phoneNumber) return;

    try {
      await sendOtp(phoneNumber);
      showToast('OTP sent to your phone number', 'success');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={styles.content}
      bottomOffset={35}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        testID="back-verify"
        onPress={() => router.replace('/auth/login')}
        style={styles.back}
      >
        <Icon name="arrow-left" color={C.primaryForeground} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.logo}>
        <Icon name="shield" size={23} color={C.primaryForeground} />
      </View>

      <Text style={styles.eyebrow}>VERIFY YOUR NUMBER</Text>
      <Text style={styles.title}>Enter the OTP</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to
        {'\n'}
        <Text style={styles.phone}>{phoneNumber}</Text>
      </Text>

      <View style={styles.otpContainer}>
        <TextInput
          testID="otp-input"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="Enter OTP"
          placeholderTextColor={C.mutedForeground}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading}
          style={styles.otpInput}
        />
      </View>

      <Pressable
        testID="verify-button"
        onPress={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        style={[styles.primaryButton, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primaryForeground} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Verify OTP</Text>
            <Icon name="arrow-right" color={C.primaryForeground} />
          </>
        )}
      </Pressable>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <Pressable
          testID="resend-otp"
          onPress={handleResendOtp}
          disabled={isLoading}
        >
          <Text style={[styles.resendButton, isLoading && styles.buttonDisabled]}>
            Resend OTP
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.ink,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.ink,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  eyebrow: {
    color: C.successLight,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 28,
  },
  title: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 29,
    letterSpacing: -0.7,
    marginTop: 10,
  },
  subtitle: {
    color: '#B8C3BD',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 7,
  },
  phone: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
  },
  otpContainer: {
    marginVertical: 40,
    paddingHorizontal: 10,
  },
  otpInput: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#496057',
    backgroundColor: C.background,
    color: C.foreground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  resendText: {
    color: '#B8C3BD',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  resendButton: {
    color: C.successLight,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
});
