import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { buyerService } from '@/services/buyerService';
import * as Location from 'expo-location';
import { filterStoresWithinRadius, getDistanceDisplay, estimateDeliveryTime, calculateDistance } from '@/utils/locationUtils';

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

function StoreCard({ store, userLocation }: { store: any; userLocation: any }) {
  const hasCoords =
    userLocation && store.latitude != null && store.longitude != null;
  const distanceKm = hasCoords
    ? calculateDistance(userLocation.latitude, userLocation.longitude, store.latitude, store.longitude)
    : null;

  return (
    <Pressable
      style={styles.storeGridCard}
      onPress={() => router.push(`/(buyer-tabs)/store/${store.storeId}`)}
    >
      <View style={styles.storeGridImage}>
        <Icon name="store" size={40} color={C.primary} />
      </View>

      <View style={styles.storeGridInfo}>
        <Text style={styles.storeGridName} numberOfLines={2}>{store.storeName || store.businessName}</Text>

        {distanceKm !== null && (
          <View style={styles.storeGridStats}>
            <Text style={styles.storeGridDistance}>{getDistanceDisplay(distanceKm)}</Text>
            <Text style={styles.storeGridDot}>•</Text>
            <Text style={styles.storeGridDelivery}>{estimateDeliveryTime(distanceKm)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function BuyerHomeScreen() {
  const { totalItems } = useCart();
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [hasRealLocation, setHasRealLocation] = useState(false);
  const { user } = useSession();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      let coords = { latitude: 28.7041, longitude: 77.1025 };
      let hasReal = false;

      // Get user location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          hasReal = true;

          const [place] = await Location.reverseGeocodeAsync(coords);
          if (place) {
            setAddress([place.city || place.subregion, place.region].filter(Boolean).join(', '));
          }
        } else {
          setAddress('');
        }
      } catch (error) {
        setAddress('');
      }

      // Set location state once we have it
      setUserLocation(coords);
      setHasRealLocation(hasReal);

      // Load stores
      const res = await buyerService.getStores();
      if (res.data) {
        setStores(res.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter stores by distance and search
  useEffect(() => {
    let filtered = stores;

    // Apply search filter only (skip radius - show all stores)
    filtered = filtered.filter(s =>
      (s.storeName || s.businessName || '').toLowerCase().includes(search.toLowerCase())
    );

    setFilteredStores(filtered);
  }, [stores, search]);


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome{user?.fullName ? `, ${user.fullName}` : ''}</Text>
          {!!address && <Text style={styles.location}>📍 {address}</Text>}
        </View>
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push('/(buyer-tabs)/cart')}
        >
          <Icon name="shopping-cart" size={20} color={C.foreground} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color={C.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stores or products..."
          placeholderTextColor={C.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stores Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : filteredStores.length > 0 ? (
          <View style={styles.gridContainer}>
            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item.storeId.toString()}
              renderItem={({ item }) => <StoreCard store={item} userLocation={userLocation} />}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gridContent}
            />
          </View>
        ) : (
          <View style={styles.empty}>
            {userLocation && hasRealLocation ? (
              <>
                <Icon name="map" size={40} color={C.mutedForeground} />
                <Text style={styles.emptyText}>No stores deliver to your location</Text>
                <Text style={styles.emptySubtext}>Check back later</Text>
              </>
            ) : (
              <>
                <Icon name="navigation" size={40} color={C.mutedForeground} />
                <Text style={styles.emptyText}>Enable location to see nearby stores</Text>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  greeting: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  location: { color: C.mutedForeground, fontSize: 13, marginTop: 4 },
  cartButton: { position: 'relative', padding: 8 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#C84B43', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: C.foreground, fontSize: 10, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12, backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.foreground, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  seeAll: { color: C.primary, fontSize: 13, fontWeight: '600' },

  // Grid Layout
  gridContainer: { paddingHorizontal: 8 },
  columnWrapper: { justifyContent: 'flex-start', paddingHorizontal: 8, marginBottom: 8, gap: 8 },
  gridContent: { paddingBottom: 16 },

  // Store Grid Card
  storeGridCard: { width: '48%', backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  storeGridImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: 'rgba(200, 107, 44, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  storeGridInfo: { width: '100%', alignItems: 'center' },
  storeGridName: { color: C.foreground, fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  storeGridStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeGridDistance: { color: C.mutedForeground, fontSize: 10 },
  storeGridDot: { color: C.mutedForeground, fontSize: 10 },
  storeGridDelivery: { color: C.mutedForeground, fontSize: 10 },

  empty: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: C.mutedForeground, fontSize: 14, marginTop: 12 },
  emptySubtext: { color: C.mutedForeground, fontSize: 12, marginTop: 6 },
});
