import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { buyerService } from '@/services/buyerService';

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

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await buyerService.getOrder(parseInt(id as string));
      if (res.data) {
        setOrder(res.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
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
      {/* Header */}
      <Pressable onPress={() => router.replace('/orders')} style={styles.backButton}>
        <Icon name="chevron-left" size={24} color={C.foreground} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {/* Order Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Icon name="check-circle" size={32} color={C.success} />
        </View>
        <Text style={styles.orderNum}>Order #{order.orderId}</Text>
        <Text style={styles.statusText}>
          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </Text>
      </View>

      {/* Shop Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From {order.storeName}</Text>
        <Pressable style={styles.shopCard}>
          <Icon name="phone" size={18} color={C.primary} />
          <Text style={styles.contactText}>Contact Shop</Text>
          <Icon name="chevron-right" size={18} color={C.mutedForeground} />
        </Pressable>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items && order.items.map((item: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
          </View>
        ))}
      </View>

      {/* Bill */}
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{order.subtotal}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery</Text>
          <Text style={styles.billValue}>₹{order.deliveryFee}</Text>
        </View>
        <View style={[styles.billRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }]}>
          <Text style={styles.billLabel}>Total Amount</Text>
          <Text style={styles.billValue}>₹{order.totalAmount}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Pressable style={styles.actionButton}>
          <Icon name="download" size={16} color={C.foreground} />
          <Text style={styles.actionText}>Download Invoice</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.actionButtonSecondary]}>
          <Icon name="star" size={16} color={C.primary} />
          <Text style={[styles.actionText, styles.actionTextSecondary]}>Rate Order</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  backText: { color: C.foreground, fontSize: 14, fontWeight: '600' },
  statusCard: { backgroundColor: C.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: C.border },
  statusIcon: { marginBottom: 12 },
  orderNum: { color: C.foreground, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusText: { color: C.success, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  timestamp: { color: C.mutedForeground, fontSize: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  shopCard: { backgroundColor: C.card, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  contactText: { flex: 1, color: C.foreground, fontSize: 13, fontWeight: '600' },
  timeline: { marginLeft: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { alignItems: 'center', marginRight: 16 },
  timelineCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  timelineCircleCompleted: { borderColor: C.success, backgroundColor: C.success },
  timelineLine: { width: 2, height: 40, backgroundColor: C.border, marginTop: 8 },
  timelineLineCompleted: { backgroundColor: C.success },
  timelineContent: { justifyContent: 'center' },
  timelineStatus: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  timelineTime: { color: C.mutedForeground, fontSize: 11, marginTop: 2 },
  itemRow: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  itemLeft: { flex: 1 },
  itemName: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  itemQty: { color: C.mutedForeground, fontSize: 11 },
  itemPrice: { color: C.primary, fontSize: 13, fontWeight: '700' },
  billCard: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { color: C.mutedForeground, fontSize: 13 },
  billValue: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  actionSection: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  actionButton: { flex: 1, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  actionButtonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border },
  actionText: { color: C.foreground, fontSize: 12, fontWeight: '600' },
  actionTextSecondary: { color: C.primary },
});
