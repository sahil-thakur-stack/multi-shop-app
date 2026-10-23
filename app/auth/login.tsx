import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
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

export default function LoginPage() {
  const { sendOtp } = useSession();
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(phoneNumber);
      showToast('OTP sent successfully!', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: '/auth/verify-otp',
        params: { phoneNumber },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send OTP';
      showToast(errorMsg, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={styles.content}
      bottomOffset={35}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Icon name="shopping-bag" size={24} color={C.primaryForeground} />
        </View>
        <Text style={styles.brandText}>nearby</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text style={styles.title}>
          Local shops,
          {'\n'}
          made simple.
        </Text>
        <Text style={styles.subtitle}>Enter your phone number to continue.</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Phone number</Text>
        <TextInput
          testID="login-phone"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          placeholderTextColor={C.mutedForeground}
          keyboardType="phone-pad"
          editable={!isLoading}
          style={styles.input}
        />

        <Pressable
          testID="send-otp"
          onPress={handleSendOtp}
          disabled={isLoading}
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color={C.primaryForeground} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
              <Icon name="arrow-right" color={C.primaryForeground} />
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.registerLinkContainer}>
        <Pressable
          testID="login-register"
          onPress={() => {
            console.log('Create account pressed');
            router.push('/auth/register');
          }}
          style={({ pressed }) => [
            styles.registerLink,
            pressed && { opacity: 0.7 }
          ]}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.mutedText}>New here?</Text>
          <Text style={styles.registerText}> Create an account</Text>
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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
  },
  copy: {
    marginTop: 70,
  },
  eyebrow: {
    color: C.successLight,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.2,
    marginTop: 12,
  },
  subtitle: {
    color: '#B8C3BD',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 14,
  },
  formContainer: {
    marginTop: 40,
  },
  label: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginBottom: 9,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.background,
    color: C.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingHorizontal: 13,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: C.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  registerLinkContainer: {
    marginTop: 24,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  mutedText: {
    color: '#B8C3BD',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  registerText: {
    color: C.successLight,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
});
