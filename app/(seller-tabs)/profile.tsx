import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSession } from '@/context/SessionContext';
import { router } from 'expo-router';
import { useToast } from '@/context/ToastContext';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  destructive: '#C84B43',
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

function SettingItem({
  label,
  value,
  icon,
  onPress,
  danger = false,
}: {
  label: string;
  value?: string;
  icon: any;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={20} color={danger ? C.destructive : C.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      <Icon name="chevron-right" size={20} color={C.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useSession();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      showToast('Logging out...', 'info');
      await logout();
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Icon name="user" size={48} color={C.primary} />
        </View>
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          label="Edit Profile"
          value="Update your information"
          icon="edit-2"
          onPress={() => router.push('/(seller-edit-modal)/edit-profile')}
        />
        <SettingItem
          label="Shop Details"
          value="View shop information"
          icon="store"
          onPress={() => router.push('/(seller-edit-modal)/shop-details')}
        />
        <SettingItem
          label="Bank Details"
          value="Manage payouts"
          icon="credit-card"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingItem
          label="Notifications"
          value="Push notifications"
          icon="bell"
          onPress={() => {}}
        />
        <SettingItem
          label="Privacy"
          value="Data and privacy"
          icon="lock"
          onPress={() => {}}
        />
        <SettingItem
          label="Help & Support"
          value="FAQs and support"
          icon="help-circle"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          label="Logout"
          icon="log-out"
          onPress={handleLogout}
          danger
        />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 16 },
  profileCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200, 107, 44, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: { color: C.foreground, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userPhone: { color: C.mutedForeground, fontSize: 13, marginBottom: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(200, 107, 44, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ratingText: { color: C.primary, fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  settingItem: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { color: C.foreground, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  settingValue: { color: C.mutedForeground, fontSize: 12 },
  spacer: { height: 32 },
});
