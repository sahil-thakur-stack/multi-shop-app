import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/context/ToastContext';
import { sellerService } from '@/services/sellerService';
import { useCallback } from 'react';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
};

function Icon({ name, size = 20, color = C.foreground }: any) {
  return <Feather name={name} size={size} color={color} />;
}

function Input({ label, placeholder, value, onChangeText, keyboardType = 'default' }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={C.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={keyboardType !== 'none'}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const { user } = useSession();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadProfileData = async () => {
    try {
      // Load fullName from context
      setFullName(user?.fullName || '');
      setPhone(user?.phoneNumber || '');

      // Load email from API (shop details returns User info)
      const res = await sellerService.getShopDetails();
     console.log('-------------',res)
      if (res.data?.data?.email) {
        setEmail(res.data.data.email);
      } else if (user?.email) {
        setEmail(user.email);
      }
    } catch (error) {
      console.log('Using context data only');
      if (user) {
        setFullName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phoneNumber || '');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user])
  );

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sellerService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });

      showToast('Profile updated successfully!', 'success');
      // Update local state immediately
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(seller-tabs)/profile')}>
          <Icon name="chevron-left" size={24} color={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name *"
          placeholder="Enter full name"
          value={fullName}
          onChangeText={setFullName}
        />
        <Input
          label="Email"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Input
          label="Phone Number"
          placeholder="Phone number"
          value={phone}
          onChangeText={() => {}}
          keyboardType="none"
        />

        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  form: { paddingBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, color: C.foreground, fontSize: 14 },
  submitButton: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 12, marginTop: 20, alignItems: 'center' },
  submitButtonText: { color: C.foreground, fontSize: 14, fontWeight: '600' },
  submitButtonDisabled: { opacity: 0.5 },
});
