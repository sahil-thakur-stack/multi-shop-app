import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/context/ToastContext';

type Role = 'Seller' | 'Buyer';
const C = colors.light;

function Icon({ name, size = 18, color = C.foreground }: { name: keyof typeof Feather.glyphMap; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export default function RegisterPage() {
  const session = useSession();
  const { sendOtp } = session;
  const { showToast } = useToast();
  const [role, setRole] = useState<Role>('Buyer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter your name and a valid 10-digit phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Store registration data in AsyncStorage
      console.log('📝 Storing registration data:', { fullName: name, role });
      await AsyncStorage.setItem('pending-registration', JSON.stringify({ fullName: name, role }));

      // Send OTP
      await sendOtp(phone);
      showToast('OTP sent! Please verify.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to OTP verification page
      setTimeout(() => {
        router.push({
          pathname: '/auth/verify-otp',
          params: { phoneNumber: phone },
        });
      }, 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send OTP';
      showToast(errorMsg, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return <KeyboardAwareScrollViewCompat style={styles.container} contentContainerStyle={styles.content} bottomOffset={35} keyboardShouldPersistTaps="always">
    <Pressable testID="register-login" onPress={() => router.replace('/auth/login')} style={styles.back}><Icon name="arrow-left" color={C.primaryForeground} /><Text style={styles.backText}>Already have an account? Login</Text></Pressable>
    <View style={styles.logo}><Icon name="user-plus" size={23} color={C.primaryForeground} /></View>
    <Text style={styles.eyebrow}>CREATE YOUR ACCOUNT</Text>
    <Text style={styles.title}>Welcome to nearby.</Text>
    <Text style={styles.subtitle}>Choose your role and enter your details.</Text>
    <Text style={styles.label}>I am registering as</Text>
    <View style={styles.roles}><Pressable testID="register-shopkeeper" onPress={() => setRole('Seller')} disabled={isLoading} style={[styles.role, role === 'Seller' && styles.roleActive]}><Icon name="shopping-bag" color={role === 'Seller' ? C.primaryForeground : C.primary} /><Text style={[styles.roleText, role === 'Seller' && styles.roleTextActive]}>Seller</Text></Pressable><Pressable testID="register-customer" onPress={() => setRole('Buyer')} disabled={isLoading} style={[styles.role, role === 'Buyer' && styles.roleActive]}><Icon name="shopping-cart" color={role === 'Buyer' ? C.primaryForeground : C.primary} /><Text style={[styles.roleText, role === 'Buyer' && styles.roleTextActive]}>Buyer</Text></Pressable></View>
    <Text style={styles.label}>Your name</Text><TextInput testID="register-name" value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={C.mutedForeground} editable={!isLoading} style={styles.input} />
    <Text style={styles.label}>Phone number</Text><TextInput testID="register-phone" value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor={C.mutedForeground} keyboardType="phone-pad" editable={!isLoading} style={styles.input} />
    <Pressable testID="register-submit" onPress={submit} disabled={isLoading} style={[styles.primaryButton, isLoading && styles.buttonDisabled]}>{isLoading ? <ActivityIndicator color={C.primaryForeground} /> : <><Text style={styles.primaryButtonText}>Create account</Text><Icon name="arrow-right" color={C.primaryForeground} /></>}</Pressable>
  </KeyboardAwareScrollViewCompat>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.ink }, content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32 }, back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, alignSelf: 'flex-start' }, backText: { color: C.primaryForeground, fontFamily: 'Inter_500Medium', fontSize: 13 },
  logo: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 32 }, eyebrow: { color: C.successLight, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, marginTop: 28 }, title: { color: C.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7, marginTop: 10 }, subtitle: { color: '#B8C3BD', fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 7, marginBottom: 25 }, label: { color: C.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 14, marginBottom: 9 }, roles: { flexDirection: 'row', gap: 10 }, role: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#496057', backgroundColor: '#2B3E35', borderRadius: 13, paddingVertical: 13 }, roleActive: { backgroundColor: C.primary, borderColor: C.primary }, roleText: { color: '#B8C3BD', fontFamily: 'Inter_600SemiBold', fontSize: 12 }, roleTextActive: { color: C.primaryForeground }, input: { height: 48, borderRadius: 12, backgroundColor: C.background, color: C.foreground, fontFamily: 'Inter_400Regular', fontSize: 13, paddingHorizontal: 13 }, primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, marginTop: 25 }, primaryButtonText: { color: C.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 14 }, buttonDisabled: { opacity: 0.5 }, footnote: { color: '#8EA097', fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 18 },
});