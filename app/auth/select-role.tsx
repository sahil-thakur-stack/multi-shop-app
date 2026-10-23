import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { useSession, UserRole } from '@/context/SessionContext';

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

export default function SelectRolePage() {
  const { selectRole } = useSession();
  const [role, setRole] = useState<UserRole>('Buyer');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      await selectRole(fullName.trim(), role);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const targetRoute = role === 'Seller' ? '/(seller-tabs)' : '/(buyer-tabs)';
      router.replace(targetRoute);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to select role');
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
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        testID="back-role"
        onPress={() => router.back()}
        style={styles.back}
      >
        <Icon name="arrow-left" color={C.primaryForeground} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.logo}>
        <Icon name="user-plus" size={23} color={C.primaryForeground} />
      </View>

      <Text style={styles.eyebrow}>COMPLETE YOUR PROFILE</Text>
      <Text style={styles.title}>Welcome to nearby.</Text>
      <Text style={styles.subtitle}>Choose your role and enter your name.</Text>

      <Text style={styles.label}>I am registering as</Text>
      <View style={styles.roles}>
        <Pressable
          testID="role-buyer"
          onPress={() => {
            setRole('Buyer');
            Haptics.selectionAsync();
          }}
          style={[styles.role, role === 'Buyer' && styles.roleActive]}
        >
          <Icon
            name="shopping-cart"
            color={role === 'Buyer' ? C.primaryForeground : C.primary}
          />
          <Text style={[styles.roleText, role === 'Buyer' && styles.roleTextActive]}>
            Buyer
          </Text>
        </Pressable>
        <Pressable
          testID="role-seller"
          onPress={() => {
            setRole('Seller');
            Haptics.selectionAsync();
          }}
          style={[styles.role, role === 'Seller' && styles.roleActive]}
        >
          <Icon
            name="shopping-bag"
            color={role === 'Seller' ? C.primaryForeground : C.primary}
          />
          <Text style={[styles.roleText, role === 'Seller' && styles.roleTextActive]}>
            Seller
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Your name</Text>
      <TextInput
        testID="name-input"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        placeholderTextColor={C.mutedForeground}
        editable={!isLoading}
        style={styles.input}
      />

      <Pressable
        testID="complete-profile"
        onPress={handleSelectRole}
        disabled={isLoading || !fullName.trim()}
        style={[
          styles.primaryButton,
          (isLoading || !fullName.trim()) && styles.buttonDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primaryForeground} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Complete Profile</Text>
            <Icon name="arrow-right" color={C.primaryForeground} />
          </>
        )}
      </Pressable>

      <Text style={styles.footnote}>You can change your role anytime in settings.</Text>
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
    marginBottom: 25,
  },
  label: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginTop: 14,
    marginBottom: 9,
  },
  roles: {
    flexDirection: 'row',
    gap: 10,
  },
  role: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#496057',
    backgroundColor: '#2B3E35',
    borderRadius: 13,
    paddingVertical: 13,
  },
  roleActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  roleText: {
    color: '#B8C3BD',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  roleTextActive: {
    color: C.primaryForeground,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.background,
    color: C.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingHorizontal: 13,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 25,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  footnote: {
    color: '#8EA097',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
  },
});
