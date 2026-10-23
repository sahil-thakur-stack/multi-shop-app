import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
};

export default function AddressMapPicker({
  onAddressSelected,
}: {
  onAddressSelected: (lat: number, lng: number, address: string) => void;
}) {
  const [userLocation, setUserLocation] = useState<any>(null);
  const [region, setRegion] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      setSelectedLocation(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e: any) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    try {
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      const address = addressResult[0]
        ? `${addressResult[0].street}, ${addressResult[0].city}, ${addressResult[0].postalCode}`
        : `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`;

      onAddressSelected(
        selectedLocation.latitude,
        selectedLocation.longitude,
        address
      );
    } catch (error) {
      onAddressSelected(
        selectedLocation.latitude,
        selectedLocation.longitude,
        `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to get location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {/* Current Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#3B82F6"
          />
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Delivery Location"
            pinColor={C.primary}
            draggable
            onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      {/* Center Pin */}
      <View style={styles.centerPin}>
        <Feather name="map-pin" size={32} color={C.primary} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={styles.currentLocationBtn}
          onPress={getUserLocation}
        >
          <Feather name="navigation" size={18} color={C.foreground} />
        </Pressable>
      </View>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <Text style={styles.instruction}>Tap on map or drag pin to select location</Text>
        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <Feather name="check" size={20} color={C.foreground} />
          <Text style={styles.confirmText}>Confirm Location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  errorText: { color: C.foreground, fontSize: 14 },
  centerPin: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -16 }, { translateY: -32 }], pointerEvents: 'none' },
  controls: { position: 'absolute', bottom: 150, right: 16, gap: 10 },
  currentLocationBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, padding: 16 },
  instruction: { color: C.mutedForeground, fontSize: 12, textAlign: 'center', marginBottom: 12 },
  confirmBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  confirmText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
