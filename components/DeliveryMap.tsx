import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export default function DeliveryMap({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  deliveryPersonName,
}: {
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  currentLocation?: DeliveryLocation;
  deliveryPersonName: string;
}) {
  // Calculate distance (simple approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceToDelivery = currentLocation
    ? calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        deliveryLocation.latitude,
        deliveryLocation.longitude
      )
    : '5.2';

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={48} color={C.mutedForeground} />
        <Text style={styles.mapText}>Live Tracking Map</Text>
        <Text style={styles.mapSubtext}>
          {currentLocation ? `${distanceToDelivery} km away from delivery` : 'Loading location...'}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Delivery Person</Text>
            <Text style={styles.detailValue}>{deliveryPersonName}</Text>
          </View>
          <Icon name="phone" size={18} color={C.primary} />
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={[styles.dot, styles.dotDefault]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Your Location</Text>
            <Text style={styles.detailValue}>{deliveryLocation.label}</Text>
          </View>
        </View>

        {currentLocation && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={[styles.dot, styles.dotProgress]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>In Transit</Text>
                <Text style={styles.detailValue}>{distanceToDelivery} km away</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  mapPlaceholder: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  mapText: { color: C.foreground, fontSize: 14, fontWeight: '600', marginTop: 12 },
  mapSubtext: { color: C.mutedForeground, fontSize: 11, marginTop: 4 },
  details: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { backgroundColor: C.success },
  dotDefault: { backgroundColor: C.primary },
  dotProgress: { backgroundColor: C.primary },
  detailContent: { flex: 1 },
  detailLabel: { color: C.mutedForeground, fontSize: 11, marginBottom: 2 },
  detailValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
});
