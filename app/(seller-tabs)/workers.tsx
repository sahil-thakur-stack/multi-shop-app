import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, router, useNavigation } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useCallback } from 'react';

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

export default function WorkersScreen() {
  const navigation = useNavigation();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [])
  );

  // Also refresh when modal closes (navigation blur/focus cycle)
  useEffect(() => {
    const unsubscribe = navigation?.addListener('beforeRemove', () => {
      // Refresh when coming back from modal
      setTimeout(() => loadWorkers(), 100);
    });
    return unsubscribe;
  }, [navigation]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getDeliveryWorkers();
      if (res.data) {
        setWorkers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load workers:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkers();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Delivery Workers</Text>
            <Text style={styles.subtitle}>{workers.filter(w => w.isActive).length} active</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(seller-edit-modal)/workers-add')}
          >
            <Icon name="plus" size={20} color={C.foreground} />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={workers.filter(w => w.isActive !== false)}
          keyExtractor={(item) => (item.deliveryWorkerId || item.id || Math.random()).toString()}
          renderItem={({ item }) => (
            <Pressable
              style={styles.workerCard}
              onPress={() => router.push(`/(seller-edit-modal)/workers/${item.deliveryWorkerId || item.id}`)}
            >
              <View style={styles.workerAvatar}>
                <Icon name="user" size={24} color={C.primary} />
              </View>
              <View style={styles.workerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>{item.name || item.fullName || item.Name}</Text>
                  <View style={[styles.statusDot, { backgroundColor: item.status === 'active' || item.isActive ? C.success : C.mutedForeground }]} />
                </View>
                <Text style={styles.phone}>{item.phone || item.phoneNumber || item.PhoneNumber}</Text>
              </View>
              <Pressable style={styles.actionBtn}>
                <Icon name="more-vertical" size={20} color={C.mutedForeground} />
              </Pressable>
            </Pressable>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="users" size={40} color={C.mutedForeground} />
              <Text style={styles.emptyText}>No delivery workers</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: C.mutedForeground, fontSize: 14, marginTop: 12 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  subtitle: { color: C.mutedForeground, fontSize: 12, marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: C.foreground, fontWeight: '600', fontSize: 13 },
  list: { paddingBottom: 16 },
  workerCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(200, 107, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  workerName: { color: C.foreground, fontSize: 14, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  phone: { color: C.mutedForeground, fontSize: 12, marginBottom: 6 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { color: C.mutedForeground, fontSize: 12 },
  actionBtn: { padding: 6 },
});
