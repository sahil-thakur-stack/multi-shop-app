import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const C = {
  primary: '#E74C3C',
  background: '#E74C3C',
  foreground: '#FFFFFF',
  darkText: '#333333',
};

export default function UnauthorizedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.errorCode}>401</Text>

      <Text style={styles.title}>Unauthorized Access</Text>

      <View style={styles.iconContainer}>
        <Text style={styles.stickFigure}>🏃‍♂️</Text>
      </View>

      <Text style={styles.message}>
        Login karte ho bhai!
      </Text>

      <Text style={styles.description}>
        Ye page sirf authenticated users ke liye hai. Pehle login karo!
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/auth/login')}
        >
          <Feather name="log-in" size={20} color={C.background} />
          <Text style={styles.primaryButtonText}>Login Karoo</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/')}
        >
          <Feather name="home" size={20} color={C.foreground} />
          <Text style={styles.secondaryButtonText}>Home Chalo</Text>
        </Pressable>
      </View>
    </View>
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
