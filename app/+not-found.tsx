import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  destructive: '#C84B43',
};

export default function NotFoundScreen() {
  const funnyMessages = [
    '404 - Ye page Google ke ghar gaya kya? 🏠',
    '404 - Ye rasta galat hai bhai! 🚫',
    '404 - Iska to matlab page gayab ho gaya! 👻',
    '404 - Link tutega, page gayab hota hai! 💔',
  ];

  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  return (
    <>
      <Stack.Screen options={{ title: '404 - Page Lost!' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.largeEmoji}>404</Text>
        </View>

        <Text style={styles.title}>Oops! Page Lost! 🗺️</Text>

        <Text style={styles.subtitle}>
          {randomMessage}
        </Text>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Ye rasta exist nahi karta bhai! Kya aap GPS se aa rahe ho? 📍
          </Text>
        </View>

        <View style={styles.suggestions}>
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionEmoji}>🔗</Text>
            <Text style={styles.suggestionText}>Link galat type kar di</Text>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionEmoji}>🛣️</Text>
            <Text style={styles.suggestionText}>Rasta hi nahi exist karta</Text>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionEmoji}>🏃</Text>
            <Text style={styles.suggestionText}>Wapas aa jao home par!</Text>
          </View>
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: C.primary }]}
          onPress={() => router.replace('/')}
        >
          <Feather name="home" size={18} color={C.foreground} />
          <Text style={styles.buttonText}>Home Chalo</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={C.primary} />
          <Text style={[styles.buttonText, { color: C.primary }]}>Pichhe Chalo</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Error 404 - "Ye page minecraft mein khod kar aya kya?" 🎮
          </Text>
        </View>
      </ScrollView>
    </>
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
  },
  largeEmoji: {
    fontSize: 90,
    fontWeight: '700',
    color: C.destructive,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.foreground,
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
  suggestions: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  suggestionEmoji: {
    fontSize: 24,
  },
  suggestionText: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  buttonText: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    color: C.mutedForeground,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
