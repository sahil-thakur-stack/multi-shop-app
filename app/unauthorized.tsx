import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

const C = {
  background: '#FFA500',
  foreground: '#FFFFFF',
  accent: '#FF1493',
};

export default function UnauthorizedScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '401' }} />
      <View style={styles.container}>
        <Text style={styles.errorCode}>401</Text>

        <Text style={styles.subtitle}>Authorization required.</Text>

        <View style={styles.iconContainer}>
          <Text style={[styles.stickFigure, { color: C.accent }]}>🏃</Text>
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
});
