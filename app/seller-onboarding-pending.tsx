import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

export default function SellerOnboardingPendingScreen() {
  const { logout } = useSession();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconBox}>
        <Icon name="clock" size={48} color={C.primary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Account Under Review</Text>

      {/* Message */}
      <Text style={styles.message}>
        Thank you for submitting your onboarding information!
      </Text>
      <Text style={styles.subtitle}>
        Your seller account is currently under review by our admin team. You'll receive a notification once your account is approved.
      </Text>

      {/* What's Next */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Next?</Text>
        <View style={styles.checkItem}>
          <Icon name="check-circle" size={20} color={C.primary} />
          <Text style={styles.checkText}>Admin will verify your documents</Text>
        </View>
        <View style={styles.checkItem}>
          <Icon name="check-circle" size={20} color={C.primary} />
          <Text style={styles.checkText}>You'll get approval notification</Text>
        </View>
        <View style={styles.checkItem}>
          <Icon name="check-circle" size={20} color={C.primary} />
          <Text style={styles.checkText}>Access full seller dashboard</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineBox}>
        <Text style={styles.timelineTitle}>Expected Timeline</Text>
        <Text style={styles.timelineText}>
          Our team typically reviews seller applications within 24-48 hours. We'll send you an update soon!
        </Text>
      </View>

      {/* Contact */}
      <View style={styles.contactBox}>
        <Text style={styles.contactText}>
          Questions? Reach out to{'\n'}
          <Text style={styles.contactLink}>support@nearby.in</Text>
        </Text>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `rgba(200, 107, 44, 0.15)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: C.foreground,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: C.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  checkText: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  timelineBox: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  timelineTitle: {
    color: C.foreground,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  timelineText: {
    color: C.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
  },
  contactBox: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  contactText: {
    color: C.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  contactLink: {
    color: C.primary,
    fontWeight: '700',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
  },
  logoutText: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
});
