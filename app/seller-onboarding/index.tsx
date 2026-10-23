import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/context/ToastContext';
import { sellerService } from '@/services/sellerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

let MapView: any;
let Marker: any;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

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

export default function SellerOnboardingScreen() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('2');

  const [gstFile, setGstFile] = useState<any>(null);
  const [aadhaarFile, setAadhaarFile] = useState<any>(null);

  const [latitude, setLatitude] = useState(28.7041);
  const [longitude, setLongitude] = useState(77.1025);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.7041,
    longitude: 77.1025,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getDeviceLocation();
  }, []);

  const getDeviceLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude: lat, longitude: lon } = location.coords;
        setLatitude(lat);
        setLongitude(lon);
        setMapRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.log('Location permission denied or error:', error);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lon);
  };

  const pickDocument = async (setFile: any, docType: string) => {
    try {
      if (Platform.OS === 'web') {
        // Web: use native file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log(`📄 Selected ${docType}:`, file.name);
            setFile({
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              size: file.size,
              _file: file,
            });
          }
        };
        input.click();
      } else {
        // Mobile: use ImagePicker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });

        if (!result.canceled && result.assets?.[0]) {
          const file = result.assets[0];
          console.log(`📄 Selected ${docType}:`, file.uri);
          setFile(file);
        }
      }
    } catch (error) {
      console.error(`Error picking ${docType}:`, error);
      showToast(`Failed to select ${docType}`, 'error');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!businessName.trim() || !category.trim() || !gstNumber.trim() || !aadhaarNumber.trim() || !storeName.trim() || !address.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Submit onboarding data
      const formData = new FormData();
      formData.append('BusinessName', businessName);
      formData.append('Category', category);
      formData.append('GstNumber', gstNumber);
      formData.append('AadhaarNumber', aadhaarNumber);
      formData.append('StoreName', storeName);
      formData.append('Address', address);
      formData.append('DeliveryRadiusKm', deliveryRadius);
      formData.append('Latitude', latitude.toString());
      formData.append('Longitude', longitude.toString());

      // Add documents if selected
      if (gstFile) {
        if (Platform.OS === 'web' && gstFile._file) {
          formData.append('GstDocument', gstFile._file);
        } else {
          formData.append('GstDocument', {
            uri: gstFile.uri,
            name: gstFile.name,
            type: gstFile.mimeType || gstFile.type || 'application/pdf',
          } as any);
        }
      }
      if (aadhaarFile) {
        if (Platform.OS === 'web' && aadhaarFile._file) {
          formData.append('AadhaarDocument', aadhaarFile._file);
        } else {
          formData.append('AadhaarDocument', {
            uri: aadhaarFile.uri,
            name: aadhaarFile.name,
            type: aadhaarFile.mimeType || aadhaarFile.type || 'application/pdf',
          } as any);
        }
      }

      console.log('📤 Submitting onboarding:', {
        businessName,
        category,
        gstNumber,
        aadhaarNumber,
        storeName,
        address,
        deliveryRadius,
        latitude,
        longitude,
      });

      const result = await sellerService.submitOnboarding(formData);
      console.log('✅ Onboarding response:', result);

      showToast('Onboarding submitted! Awaiting approval.', 'success');
      setTimeout(() => router.replace('/seller-onboarding-pending'), 1500);
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit onboarding';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Icon name="store" size={32} color={C.primary} />
        </View>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us about your business</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your business name"
          placeholderTextColor={C.mutedForeground}
          value={businessName}
          onChangeText={setBusinessName}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Grocery, Electronics"
          placeholderTextColor={C.mutedForeground}
          value={category}
          onChangeText={setCategory}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>GST Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your GST number"
          placeholderTextColor={C.mutedForeground}
          value={gstNumber}
          onChangeText={setGstNumber}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Aadhaar Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Aadhaar number"
          placeholderTextColor={C.mutedForeground}
          value={aadhaarNumber}
          onChangeText={setAadhaarNumber}
          editable={!isLoading}
          secureTextEntry
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Store Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your store name"
          placeholderTextColor={C.mutedForeground}
          value={storeName}
          onChangeText={setStoreName}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Full address"
          placeholderTextColor={C.mutedForeground}
          value={address}
          onChangeText={setAddress}
          editable={!isLoading}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Delivery Radius (km)</Text>
        <TextInput
          style={styles.input}
          placeholder="Delivery radius in kilometers"
          placeholderTextColor={C.mutedForeground}
          value={deliveryRadius}
          onChangeText={setDeliveryRadius}
          editable={!isLoading}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>GST Certificate (PDF/Image)</Text>
        <Pressable
          style={styles.uploadButton}
          onPress={() => pickDocument(setGstFile, 'GST')}
          disabled={isLoading}
        >
          <Icon name="upload" size={18} color={C.primary} />
          <Text style={styles.uploadButtonText}>
            {gstFile ? `✓ ${gstFile.name}` : 'Choose GST Document'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Aadhaar Document (PDF/Image)</Text>
        <Pressable
          style={styles.uploadButton}
          onPress={() => pickDocument(setAadhaarFile, 'Aadhaar')}
          disabled={isLoading}
        >
          <Icon name="upload" size={18} color={C.primary} />
          <Text style={styles.uploadButtonText}>
            {aadhaarFile ? `✓ ${aadhaarFile.name}` : 'Choose Aadhaar Document'}
          </Text>
        </Pressable>
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.section}>
          <Text style={styles.label}>Store Location *</Text>
          <Pressable
            style={styles.mapButton}
            onPress={() => setShowMapModal(true)}
            disabled={isLoading}
          >
            <Icon name="map-pin" size={18} color={C.primary} />
            <View style={styles.mapButtonText}>
              <Text style={styles.mapButtonLabel}>Tap to select location on map</Text>
              <Text style={styles.mapButtonCoords}>
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={C.mutedForeground} />
          </Pressable>
        </View>
      )}

      <View style={styles.note}>
        <Icon name="info" size={16} color={C.mutedForeground} />
        <Text style={styles.noteText}>All documents will be verified by our team within 24-48 hours.</Text>
      </View>

      {/* Map Modal - Mobile Only */}
      {Platform.OS !== 'web' && MapView && (
        <Modal visible={showMapModal} animationType="slide">
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <Pressable onPress={() => setShowMapModal(false)}>
                <Icon name="x" size={24} color={C.foreground} />
              </Pressable>
              <Text style={styles.mapHeaderTitle}>Select Store Location</Text>
              <View style={{ width: 24 }} />
            </View>

            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={{ latitude, longitude }}
                title="Store Location"
              />
            </MapView>

            <View style={styles.mapFooter}>
              <Pressable
                style={[styles.mapActionButton, styles.mapCancelButton]}
                onPress={() => setShowMapModal(false)}
              >
                <Text style={styles.mapActionButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.mapActionButton, styles.mapConfirmButton]}
                onPress={() => setShowMapModal(false)}
              >
                <Text style={styles.mapActionButtonTextConfirm}>Confirm Location</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <Pressable
        style={[styles.submitButton, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={C.foreground} />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Submit & Wait for Approval</Text>
            <Icon name="arrow-right" size={18} color={C.foreground} />
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `rgba(200, 107, 44, 0.15)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: C.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: C.mutedForeground,
    fontSize: 13,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    color: C.foreground,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.foreground,
    fontSize: 13,
  },
  multilineInput: {
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  note: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `rgba(200, 107, 44, 0.1)`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  noteText: {
    color: C.mutedForeground,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  mapButton: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapButtonText: {
    flex: 1,
  },
  mapButtonLabel: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
  },
  mapButtonCoords: {
    color: C.mutedForeground,
    fontSize: 11,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  mapHeaderTitle: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  mapActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapCancelButton: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  mapConfirmButton: {
    backgroundColor: C.primary,
  },
  mapActionButtonText: {
    color: C.mutedForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  mapActionButtonTextConfirm: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  webLocationBox: {
    backgroundColor: `rgba(200, 107, 44, 0.1)`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  webLocationText: {
    color: C.mutedForeground,
    fontSize: 13,
    flex: 1,
  },
  uploadButton: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadButtonText: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
