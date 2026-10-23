import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { sellerService } from '@/services/sellerService';
import { useCallback } from 'react';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  ink: '#22312B',
  success: '#3E8B62',
  successSoft: '#E2F1E7',
  card: '#2B3E35',
  accent: '#F5E4D5',
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
  return `${Math.floor(secondsAgo / 86400)} days ago`;
}

function Icon({
  name,
  size = 20,
  color = C.foreground,
}: {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}

function StatCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.statCard} onPress={onPress}>
      <View style={styles.statIcon}>
        <Icon name={icon} size={24} color={C.primary} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={C.mutedForeground} />
    </Pressable>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  primary = false,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        primary && styles.actionButtonPrimary,
      ]}
      onPress={onPress}
    >
      <Icon
        name={icon}
        size={20}
        color={primary ? C.foreground : C.primary}
      />
      <Text
        style={[
          styles.actionButtonText,
          primary && styles.actionButtonTextPrimary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SellerDashboard() {
  const { user, isLoading } = useSession();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    pendingOrders: 0,
    totalRevenue: '₹0',
    todayRevenue: '₹0',
    workers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [approval, setApproval] = useState<{ status: string; businessName: string }>({ status: '', businessName: '' });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [productsRes, ordersRes, workersRes, approvalRes] = await Promise.all([
        sellerService.getMyProducts(),
        sellerService.getOrders(),
        sellerService.getDeliveryWorkers(),
        sellerService.getApprovalStatus(),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const workers = workersRes.data || [];

      setApproval({
        status: approvalRes.data?.approvalStatus || '',
        businessName: approvalRes.data?.businessName || '',
      });

      // Count active and pending orders
      const activeOrders = orders.filter((o: any) => o.status === 'Accepted' || o.status === 'PickedUp' || o.status === 'OutForDelivery').length;
      const pendingOrders = orders.filter((o: any) => o.status === 'Pending').length;

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = orders
        .filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        })
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      // Generate recent activity from orders (last 2 orders)
      const activity = [...orders]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .map((order: any) => ({
        id: order.orderId,
        title: `Order #${order.orderId} ${order.status === 'Delivered' ? 'Completed' : order.status}`,
        timestamp: new Date(order.createdAt),
        status: order.status,
      }));

      setStats({
        totalProducts: products.filter((p: any) => p.isActive !== false).length || 0,
        activeOrders: activeOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        todayRevenue: `₹${todayRevenue.toLocaleString('en-IN')}`,
        workers: workers.filter((w: any) => w.isActive !== false).length || 0,
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.shopName}>{approval.businessName || user?.fullName}</Text>
        </View>
        {!!approval.status && (
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{approval.status}</Text>
          </View>
        )}
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <View>
          <Text style={styles.revenueLabel}>Today's Revenue</Text>
          <Text style={styles.revenueValue}>{stats.todayRevenue}</Text>
        </View>
        <View>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>{stats.totalRevenue}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <StatCard
        label="Products"
        value={stats.totalProducts.toString()}
        icon="package"
        onPress={() => router.push('/(seller-tabs)/products')}
      />
      <StatCard
        label="Active Orders"
        value={stats.activeOrders.toString()}
        icon="shopping-cart"
        onPress={() => router.push('/(seller-tabs)/orders')}
      />
      <StatCard
        label="Pending Orders"
        value={stats.pendingOrders.toString()}
        icon="clock"
        onPress={() => router.push('/(seller-tabs)/orders')}
      />
      <StatCard
        label="Delivery Workers"
        value={stats.workers.toString()}
        icon="users"
        onPress={() => router.push('/(seller-tabs)/workers')}
      />

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionButton
          label="Add Product"
          icon="plus"
          onPress={() => router.push('/products')}
          primary
        />
        <ActionButton
          label="View Orders"
          icon="list"
          onPress={() => router.push('/(seller-tabs)/orders')}
        />
      </View>

      <View style={styles.actionsGrid}>
        <ActionButton
          label="Manage Workers"
          icon="users"
          onPress={() => router.push('/(seller-tabs)/workers')}
        />
        <ActionButton
          label="Analytics"
          icon="bar-chart-2"
          onPress={() => {}}
        />
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentActivity.length > 0 ? (
        recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Icon
                name={activity.status === 'Delivered' ? 'check-circle' : 'clock'}
                size={20}
                color={activity.status === 'Delivered' ? C.success : C.primary}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>
                {getTimeAgo(activity.timestamp)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>No recent activity</Text>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: C.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  shopName: {
    color: C.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  statusText: {
    color: C.success,
    fontSize: 12,
    fontWeight: '600',
  },
  revenueCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },
  revenueLabel: {
    color: C.mutedForeground,
    fontSize: 12,
    marginBottom: 6,
  },
  revenueValue: {
    color: C.foreground,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  statCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 107, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: C.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: C.foreground,
    fontSize: 18,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionButtonPrimary: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  actionButtonText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: C.foreground,
  },
  activityCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 107, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    color: C.mutedForeground,
    fontSize: 12,
  },
  spacer: {
    height: 32,
  },
});
