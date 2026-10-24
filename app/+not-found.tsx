import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  destructive: '#C84B43',
};

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.container}>
        <Text style={styles.errorCode}>404</Text>

        <Text style={styles.subtitle}>Page not found.</Text>

        <View style={styles.iconContainer}>
          <Text style={styles.stickFigure}>🧑‍💻</Text>
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
