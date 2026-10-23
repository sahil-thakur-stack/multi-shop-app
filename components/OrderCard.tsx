import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import colors from '@/constants/colors';

const C = colors.light;

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  label: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  shopName: string;
  totalAmount: number;
  itemCount: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string;
}

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onCancel?: () => void;
}

function Icon({ name, size = 16, color = C.foreground }: { name: keyof typeof Feather.glyphMap; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'confirmed':
      return '#3B82F6';
    case 'shipped':
      return '#8B5CF6';
    case 'delivered':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return C.mutedForeground;
  }
}

export function OrderCard({ order, onPress, onCancel }: OrderCardProps) {
  const statusColor = getStatusColor(order.status.status);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{order.shopName}</Text>
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{order.status.label}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detail}>
          <Icon name="package" size={14} color={C.mutedForeground} />
          <Text style={styles.detailText}>{order.itemCount} items</Text>
        </View>
        <View style={styles.detail}>
          <Icon name="calendar" size={14} color={C.mutedForeground} />
          <Text style={styles.detailText}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>₹{order.totalAmount}</Text>
        {order.status.status === 'pending' && onCancel && (
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#496057',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopName: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  orderNumber: {
    color: C.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: C.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    color: C.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
