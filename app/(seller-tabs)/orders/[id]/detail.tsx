import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { sellerService } from '@/services/sellerService';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  success: '#3E8B62',
};

function Icon({ name, size = 20, color = C.foreground }: any) {
  return <Feather name={name} size={size} color={color} />;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [status, setStatus] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getOrders();
      const found = (response.data || []).find((o: any) => String(o.orderId) === String(id));
      if (found) {
        setOrder(found);
        setStatus(found.status?.toLowerCase() || '');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newStatus === 'confirmed' && status === 'pending') {
        await sellerService.acceptOrder(Number(id));
      } else if (newStatus === 'shipped') {
        await sellerService.pickUpOrder(Number(id));
      } else if (newStatus === 'shipped') {
        await sellerService.outForDelivery(Number(id));
      } else if (newStatus === 'delivered') {
        await sellerService.deliverOrder(Number(id));
      }

      setStatus(newStatus);
      Alert.alert('Updated', `Order status changed to ${newStatus}`);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: C.foreground }}>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Number & Status */}
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNum}>#{order.orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `#3B82F630` }]}>
            <Text style={[styles.statusText, { color: '#3B82F6' }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderTime}>Placed {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="user" size={20} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Buyer</Text>
              <Text style={styles.infoValue}>#{order.buyerId}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.separator]}>
            <Icon name="map-pin" size={20} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, i: number) => (
              <View key={i} style={[styles.itemRow, i > 0 && styles.separator]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.itemName}>No items</Text>
          )}
        </View>
      </View>

      {/* Bill */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.card}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery</Text>
            <Text style={styles.billValue}>₹{order.deliveryFee}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusButtons}>
          {['pending', 'confirmed', 'shipped', 'delivered'].map((s) => (
            <Pressable
              key={s}
              style={[styles.statusBtn, status === s && styles.statusBtnActive]}
              onPress={() => handleStatusChange(s)}
            >
              <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Contact Button */}
      <Pressable style={styles.contactButton}>
        <Icon name="message-circle" size={18} color={C.foreground} />
        <Text style={styles.contactButtonText}>Contact Customer</Text>
      </Pressable>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingVertical: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderTime: { color: C.mutedForeground, fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  separator: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  infoContent: { flex: 1 },
  infoLabel: { color: C.mutedForeground, fontSize: 12, marginBottom: 4 },
  infoValue: { color: C.foreground, fontSize: 14, fontWeight: '600' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  itemInfo: { flex: 1 },
  itemName: { color: C.foreground, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemQty: { color: C.mutedForeground, fontSize: 12 },
  itemPrice: { color: C.primary, fontSize: 14, fontWeight: '700' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  billLabel: { color: C.mutedForeground, fontSize: 13 },
  billValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  billTotal: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4 },
  billTotalLabel: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  billTotalValue: { color: C.primary, fontSize: 16, fontWeight: '700' },
  statusButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusBtn: { flex: 1, minWidth: '45%', backgroundColor: C.background, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingVertical: 10 },
  statusBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  statusBtnText: { color: C.foreground, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statusBtnTextActive: { color: C.foreground, fontWeight: '700' },
  contactButton: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  contactButtonText: { color: C.foreground, fontSize: 15, fontWeight: '700' },
});
