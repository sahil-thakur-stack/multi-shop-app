import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
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

interface StoreLocation {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function StoreMapViewFree({ store }: { store: StoreLocation }) {
  const [userLocation, setUserLocation] = useState<any>(null);
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
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const initialRegion = {
    latitude: store.latitude,
    longitude: store.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Store Marker */}
        <Marker
          coordinate={{
            latitude: store.latitude,
            longitude: store.longitude,
          }}
          title={store.name}
          description={store.address}
          pinColor={C.primary}
        />

        {/* User Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#3B82F6"
          />
        )}
      </MapView>

      <View style={styles.info}>
        <View style={styles.infoContent}>
          <Feather name="map-pin" size={18} color={C.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{store.name}</Text>
            <Text style={styles.infoAddress}>{store.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>📍 OpenStreetMap (Free)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  info: { position: 'absolute', bottom: 50, left: 0, right: 0, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, padding: 16, marginHorizontal: 12, borderRadius: 12 },
  infoContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoText: { flex: 1 },
  infoTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  infoAddress: { color: C.mutedForeground, fontSize: 12 },
  badge: { position: 'absolute', top: 12, right: 12, backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  badgeText: { color: C.mutedForeground, fontSize: 11, fontWeight: '600' },
});
