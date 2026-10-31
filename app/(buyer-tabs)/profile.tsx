import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSession } from '@/context/SessionContext';
import { router } from 'expo-router';

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

function SettingItem({ label, value, icon, onPress, danger = false }: any) {
  return (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={18} color={danger ? C.destructive : C.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      <Icon name="chevron-right" size={18} color={C.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useSession();

  const handleLogout = async () => {
    try {
      debugger
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Icon name="user" size={40} color={C.primary} />
        </View>
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem label="Edit Profile" icon="edit-2" onPress={() => {}} />
        <SettingItem label="Saved Addresses" icon="map-pin" onPress={() => {}} />
        <SettingItem label="Payments" icon="credit-card" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem label="Help & Support" icon="help-circle" onPress={() => {}} />
        <SettingItem label="Privacy Policy" icon="lock" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <SettingItem label="Logout" icon="log-out" onPress={handleLogout} danger />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingTop: 16 },
  profileCard: { backgroundColor: C.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.border },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(200, 107, 44, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  userName: { color: C.foreground, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userPhone: { color: C.mutedForeground, fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  settingItem: { backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  settingValue: { color: C.mutedForeground, fontSize: 11 },
  spacer: { height: 32 },
});
