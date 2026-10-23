import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  success: '#3E8B62',
};

interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export default function DeliveryTrackingMap({
  pickupLocation,
  deliveryLocation,
  deliveryPersonLocation,
  deliveryPersonName,
}: {
  pickupLocation: Location;
  deliveryLocation: Location;
  deliveryPersonLocation?: Location;
  deliveryPersonName: string;
}) {
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    if (deliveryPersonLocation) {
      const minLat = Math.min(
        pickupLocation.latitude,
        deliveryLocation.latitude,
        deliveryPersonLocation.latitude
      );
      const maxLat = Math.max(
        pickupLocation.latitude,
        deliveryLocation.latitude,
        deliveryPersonLocation.latitude
      );
      const minLng = Math.min(
        pickupLocation.longitude,
        deliveryLocation.longitude,
        deliveryPersonLocation.longitude
      );
      const maxLng = Math.max(
        pickupLocation.longitude,
        deliveryLocation.longitude,
        deliveryPersonLocation.longitude
      );

      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: (maxLat - minLat) * 1.5,
        longitudeDelta: (maxLng - minLng) * 1.5,
      });
    } else {
      setRegion({
        latitude: (pickupLocation.latitude + deliveryLocation.latitude) / 2,
        longitude: (pickupLocation.longitude + deliveryLocation.longitude) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [pickupLocation, deliveryLocation, deliveryPersonLocation]);

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
      >
        {/* Pickup Location */}
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          title={pickupLocation.name}
          pinColor={C.primary}
        />

        {/* Delivery Location */}
        <Marker
          coordinate={{
            latitude: deliveryLocation.latitude,
            longitude: deliveryLocation.longitude,
          }}
          title={deliveryLocation.name}
          pinColor={C.success}
        />

        {/* Delivery Person Location */}
        {deliveryPersonLocation && (
          <>
            <Marker
              coordinate={{
                latitude: deliveryPersonLocation.latitude,
                longitude: deliveryPersonLocation.longitude,
              }}
              title={deliveryPersonName}
              pinColor="#3B82F6"
            />

            {/* Route Line */}
            <Polyline
              coordinates={[
                {
                  latitude: deliveryPersonLocation.latitude,
                  longitude: deliveryPersonLocation.longitude,
                },
                {
                  latitude: deliveryLocation.latitude,
                  longitude: deliveryLocation.longitude,
                },
              ]}
              strokeColor={C.primary}
              strokeWidth={3}
              lineDashPattern={[5]}
            />
          </>
        )}
      </MapView>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={styles.deliveryPersonInfo}>
            <View style={styles.avatar}>
              <Feather name="user" size={20} color={C.primary} />
            </View>
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{deliveryPersonName}</Text>
              <Text style={styles.status}>On the way</Text>
            </View>
          </View>
          <Feather name="phone" size={20} color={C.primary} />
        </View>

        <View style={styles.divider} />

        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <Text style={styles.locationLabel}>{pickupLocation.name}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, styles.dotDefault]} />
            <Text style={styles.locationLabel}>{deliveryLocation.name}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  statusCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, padding: 16, margin: 12, borderRadius: 12 },
  statusContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  deliveryPersonInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  personDetails: { flex: 1 },
  personName: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  status: { color: C.mutedForeground, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  locationInfo: { gap: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: C.primary },
  dotDefault: { backgroundColor: C.success },
  line: { width: 2, height: 16, backgroundColor: C.border, marginLeft: 4 },
  locationLabel: { color: C.foreground, fontSize: 12, fontWeight: '600', flex: 1 },
});
