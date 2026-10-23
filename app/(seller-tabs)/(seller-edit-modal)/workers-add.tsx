import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/context/ToastContext';

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

export default function AddWorkerScreen() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!fullName.trim() || !phone.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sellerService.createDeliveryWorker({
        Name: fullName.trim(),
        PhoneNumber: phone.trim(),
      });

      showToast('Worker added successfully!', 'success');
      setTimeout(() => router.replace('/(seller-tabs)/workers'), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to add worker', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} removeClippedSubviews={true}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(seller-tabs)/workers')}>
          <Icon name="chevron-left" size={24} color={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Add Worker</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter worker name"
            placeholderTextColor={C.mutedForeground}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            placeholderTextColor={C.mutedForeground}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <Pressable
          style={[styles.addButton, isLoading && styles.disabledButton]}
          onPress={handleAdd}
          disabled={isLoading}
        >
          <Icon name="plus" size={18} color={C.foreground} />
          <Text style={styles.addButtonText}>{isLoading ? 'Adding...' : 'Add Worker'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  form: { paddingHorizontal: 16, paddingVertical: 12 },
  field: { marginBottom: 12 },
  label: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: C.card, color: C.foreground, borderColor: C.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  addButton: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  disabledButton: { opacity: 0.6 },
  addButtonText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
