// ==========================================
// App Entry Screen — Splash & Login Gateway
// ==========================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores';
import { simulationManager } from '../src/services/simulationManager';
import { useTheme } from '../src/hooks/useTheme';

export default function IndexScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, rememberMe } = useAuthStore();

  useEffect(() => {
    // Start background simulation engine
    simulationManager.start();

    const timer = setTimeout(() => {
      // If user is already authenticated with "Remember Me", go to Dashboard
      if (isAuthenticated && rememberMe) {
        router.replace('/(tabs)');
      } else {
        // Otherwise always show the Login page first
        router.replace('/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, rememberMe]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.logoBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
        <Image
          source={require('../assets/EnviroSync_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>EnviroSync AI</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Smart Indoor Environment & Comfort Control
      </Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
        Starting EnviroSync Platform...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 36,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
