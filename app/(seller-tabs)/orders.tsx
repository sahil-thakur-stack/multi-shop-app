import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getOrders();
      if (res.data) {
        setOrders(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return C.success;
      default: return C.mutedForeground;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{orders.length} orders</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId.toString()}
          renderItem={({ item }) => (
            <Pressable style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNum}>#{item.orderId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}30` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.detailText}>{item.itemCount || 0} items • ₹{item.totalAmount || item.total || 0}</Text>
                <Text style={styles.timeText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </Pressable>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="inbox" size={40} color={C.mutedForeground} />
              <Text style={styles.emptyText}>No orders yet</Text>
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
  title: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  subtitle: { color: C.mutedForeground, fontSize: 12, marginTop: 4 },
  list: { paddingBottom: 16 },
  orderCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderNum: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderDetails: { gap: 4 },
  detailText: { color: C.foreground, fontSize: 13 },
  timeText: { color: C.mutedForeground, fontSize: 12 },
});
