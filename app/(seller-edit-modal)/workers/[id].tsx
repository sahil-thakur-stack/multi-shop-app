import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/context/ToastContext';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  destructive: '#C84B43',
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

export default function EditWorkerScreen() {
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Redirect if no valid ID
    if (!id || id === 'undefined') {
      router.replace('/(seller-tabs)/workers');
      return;
    }
    loadWorkerData();
  }, [id]);

  const loadWorkerData = async () => {
    try {
      setIsLoading(true);
      const res = await sellerService.getDeliveryWorkers();
      const workers = res.data || [];
      const worker = workers.find((w: any) => String(w.deliveryWorkerId) === String(id));

      if (worker) {
        setName(worker.name || worker.Name || '');
        setPhone(worker.phoneNumber || worker.PhoneNumber || '');
      }
    } catch (error) {
      console.error('Failed to load worker:', error);
      showToast('Failed to load worker data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sellerService.updateDeliveryWorker(Number(id), {
        Name: name.trim(),
        PhoneNumber: phone.trim(),
        IsActive: true,
      });

      showToast('Worker updated successfully!', 'success');
      setTimeout(() => router.replace('/(seller-tabs)/workers'), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to update worker', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await sellerService.deleteDeliveryWorker(Number(id));
      showToast('Worker deleted successfully!', 'success');
      setTimeout(() => router.replace('/(seller-tabs)/workers'), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to delete worker', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !name) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(seller-tabs)/workers')}>
          <Icon name="chevron-left" size={24} color={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Edit Worker</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Worker name"
            placeholderTextColor={C.mutedForeground}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={C.mutedForeground}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <Pressable
          style={[styles.updateButton, isLoading && styles.disabledButton]}
          onPress={handleUpdateWorker}
          disabled={isLoading}
        >
          <Text style={styles.updateButtonText}>{isLoading ? 'Updating...' : 'Update Worker'}</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, isDeleting && styles.disabledButton]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Text style={styles.deleteButtonText}>{isDeleting ? 'Deleting...' : 'Delete Worker'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  form: { paddingHorizontal: 16, paddingVertical: 12 },
  field: { marginBottom: 12 },
  label: { color: C.foreground, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: C.foreground, fontSize: 14 },
  updateButton: { backgroundColor: C.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  deleteButton: { backgroundColor: C.destructive, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  updateButtonText: { color: C.foreground, fontSize: 16, fontWeight: '600' },
  deleteButtonText: { color: C.foreground, fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
});
