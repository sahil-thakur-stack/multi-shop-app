import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  destructive: '#C84B43',
};

export default function UnauthorizedScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '401' }} />
      <View style={styles.container}>
        <Text style={styles.errorCode}>401</Text>

        <Text style={styles.subtitle}>Authorization required.</Text>

        <View style={styles.iconContainer}>
          <Text style={styles.stickFigure}>🏃</Text>
        </View>

        <Pressable
          style={styles.loginButton}
          onPress={() => router.replace('/auth/login')}
        >
          <Feather name="log-in" size={20} color={C.background} />
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>
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
    fontSize: 140,
    fontWeight: '700',
    color: C.foreground,
    textAlign: 'center',
    lineHeight: 140,
    marginBottom: -10,
  },
  subtitle: {
    fontSize: 18,
    color: C.foreground,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '400',
  },
  iconContainer: {
    marginBottom: 20,
  },
  stickFigure: {
    fontSize: 100,
  },
  loginButton: {
    backgroundColor: C.foreground,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 30,
    minWidth: 200,
  },
  loginButtonText: {
    color: C.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
