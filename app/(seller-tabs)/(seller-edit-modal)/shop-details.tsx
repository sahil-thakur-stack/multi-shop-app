import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import { sellerService } from '@/services/sellerService';

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

function Input({ label, placeholder, value, onChangeText, multiline = false }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={C.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not set'}</Text>
    </View>
  );
}

export default function ShopDetailsScreen() {
  const { showToast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadShopDetails();
  }, []);

  const loadShopDetails = async () => {
    try {
      setIsLoading(true);
      const res = await sellerService.getShopDetails();
      setShop(res.data?.data || {});
      setShopName(res.data?.data?.shopName || '');
      setAddress(res.data?.data?.address || '');
      setDeliveryRadius(String(res.data?.data?.deliveryRadiusKm || ''));
      setDeliveryFee(String(res.data?.data?.deliveryFee || ''));
    } catch (error) {
      console.error('Failed to load shop details:', error);
      showToast('Failed to load shop details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!shopName.trim()) {
      showToast('Shop name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await sellerService.updateShopDetails({
        shopName: shopName.trim(),
        address: address.trim() || undefined,
        deliveryRadiusKm: deliveryRadius ? parseFloat(deliveryRadius) : undefined,
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
      });

      showToast('Shop details updated successfully!', 'success');
      setIsEditing(false);
      setTimeout(() => loadShopDetails(), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to update shop details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(seller-tabs)/profile')} hitSlop={10}>
          <Icon name="chevron-left" size={24} color={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Shop Details</Text>
        <Pressable onPress={() => setIsEditing(!isEditing)}>
          <Icon name={isEditing ? 'x' : 'edit-2'} size={24} color={C.primary} />
        </Pressable>
      </View>

      {!isEditing ? (
        <View style={styles.viewMode}>
          <View style={styles.shopCard}>
            <View style={styles.shopIconContainer}>
              <Icon name="store" size={48} color={C.primary} />
            </View>
            <Text style={styles.shopName}>{shop?.shopName || 'Shop Name'}</Text>
            {shop?.description && <Text style={styles.shopDescription}>{shop.description}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            <InfoRow label="Shop ID" value={shop?.sellerId} />
            <InfoRow label="Shop Name" value={shop?.shopName} />
            <InfoRow label="Address" value={shop?.address} />
            <InfoRow label="Delivery Radius (km)" value={shop?.deliveryRadiusKm} />
            <InfoRow label="Delivery Fee (₹)" value={shop?.deliveryFee} />
            <InfoRow label="Email" value={shop?.email} />
            <InfoRow label="Phone" value={shop?.phoneNumber} />
            <InfoRow label="City" value={shop?.city} />
            <InfoRow label="Status" value={shop?.status || 'Active'} />
          </View>
        </View>
      ) : (
        <View style={styles.editMode}>
          <Input
            label="Shop Name *"
            placeholder="Enter shop name"
            value={shopName}
            onChangeText={setShopName}
          />
          <Input
            label="Address"
            placeholder="Enter shop address"
            value={address}
            onChangeText={setAddress}
          />
          <Input
            label="Delivery Radius (km)"
            placeholder="Enter delivery radius"
            value={deliveryRadius}
            onChangeText={setDeliveryRadius}
          />
          <Input
            label="Delivery Fee (₹)"
            placeholder="Enter delivery fee"
            value={deliveryFee}
            onChangeText={setDeliveryFee}
          />

          <Pressable
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
            onPress={handleUpdate}
            disabled={isSaving}
          >
            <Text style={styles.submitButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setIsEditing(false)}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },

  viewMode: { paddingBottom: 20 },
  shopCard: { backgroundColor: C.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.border },
  shopIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(200, 107, 44, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  shopName: { color: C.foreground, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  shopDescription: { color: C.mutedForeground, fontSize: 12, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  infoRow: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  infoLabel: { color: C.mutedForeground, fontSize: 12, marginBottom: 4 },
  infoValue: { color: C.foreground, fontSize: 14, fontWeight: '600' },

  editMode: { paddingBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, color: C.foreground, fontSize: 14 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  submitButton: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 12, marginTop: 20, alignItems: 'center' },
  submitButtonText: { color: C.foreground, fontSize: 14, fontWeight: '600' },
  submitButtonDisabled: { opacity: 0.5 },

  cancelButton: { borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingVertical: 12, marginTop: 8, alignItems: 'center' },
  cancelButtonText: { color: C.mutedForeground, fontSize: 14, fontWeight: '600' },
});
