import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { buyerService } from '@/services/buyerService';
import { useCallback } from 'react';

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

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return '#3E8B62';
    case 'cancelled': return '#C84B43';
    case 'pending': return '#F59E0B';
    case 'confirmed': return '#3B82F6';
    default: return C.mutedForeground;
  }
};

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
      const res = await buyerService.getMyOrders();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
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
            <Pressable
              style={styles.orderCard}
              onPress={() => router.push(`/(buyer-tabs)/orders/${item.orderId}/track`)}
            >
              <View style={styles.orderLeft}>
                <Text style={styles.orderNum}>#{item.orderId}</Text>
                <Text style={styles.shopName}>{item.storeName}</Text>
                <Text style={styles.orderMeta}>{item.items?.length || 0} items • ₹{item.totalAmount}</Text>
              </View>
              <View style={styles.orderRight}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}30` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Pending'}
                  </Text>
                </View>
                <Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
  },
  orderLeft: { flex: 1 },
  orderNum: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  shopName: { color: C.foreground, fontSize: 13, marginBottom: 6 },
  orderMeta: { color: C.mutedForeground, fontSize: 12 },
  orderRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  date: { color: C.mutedForeground, fontSize: 12 },
});
