import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const C = {
  primary: '#FFA500',
  background: '#FFA500',
  foreground: '#FFFFFF',
  darkText: '#333333',
};

export default function NotFoundScreen() {
  const funnyMessages = [
    '404 - Ye page Google ke ghar gaya kya?',
    '404 - Ye rasta galat hai bhai!',
    '404 - Iska matlab page gayab ho gaya!',
    '404 - Link tutega, page gayab hota hai!',
  ];

  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.container}>
        <Text style={styles.errorCode}>404</Text>

        <Text style={styles.title}>Oops... page not found</Text>

        <View style={styles.iconContainer}>
          <Text style={styles.stickFigure}>🧑‍💻</Text>
        </View>

        <Text style={styles.message}>
          {randomMessage}
        </Text>

        <Text style={styles.description}>
          Ye rasta exist nahi karta bhai!
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
          >
            <Feather name="home" size={20} color={C.background} />
            <Text style={styles.primaryButtonText}>Home Chalo</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={C.foreground} />
            <Text style={styles.secondaryButtonText}>Pichhe Chalo</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorCode: {
    fontSize: 120,
    fontWeight: '700',
    color: C.foreground,
    textAlign: 'center',
    lineHeight: 120,
    marginBottom: -20,
  },
  title: {
    fontSize: 20,
    color: C.foreground,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  iconContainer: {
    marginBottom: 30,
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    color: C.foreground,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: C.foreground,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: C.foreground,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: C.background,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: C.foreground,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButtonText: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  stickFigure: {
    fontSize: 120,
  },
});
