import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

export default function UnauthorizedScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.largeEmoji}>🚫</Text>
      </View>

      <Text style={styles.title}>Arre! Yaha nahi aa sakte! 🛑</Text>

      <Text style={styles.subtitle}>
        Login karte ho bhai, pehle authentication nikalna padta hai! 😅
      </Text>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          🤔 Tum kaun ho? Kya tum hacker ho? Nahi re, sirf login karo!
        </Text>
      </View>

      <View style={styles.funFacts}>
        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>🔐</Text>
          <Text style={styles.factText}>Security pehle, content baad mein!</Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>👤</Text>
          <Text style={styles.factText}>Account ban ka? Login kar na!</Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>⚡</Text>
          <Text style={styles.factText}>Direct URL se nahi chalega beta!</Text>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/auth/login')}
      >
        <Feather name="log-in" size={18} color={C.foreground} />
        <Text style={styles.buttonText}>Login Karoo (Finally!)</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Error 401 - "Tum yaha ke allowed nahi ho, dost!" 🚶
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 20,
    transform: [{ rotate: '0deg' }],
  },
  largeEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.destructive,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: C.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  messageBox: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftColor: C.destructive,
    borderLeftWidth: 4,
  },
  messageText: {
    color: C.foreground,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  funFacts: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  factCard: {
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  factEmoji: {
    fontSize: 24,
  },
  factText: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 24,
  },
  buttonText: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: C.mutedForeground,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
