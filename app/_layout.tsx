// ==========================================
// Root Layout — App Shell with Providers
// ==========================================

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../src/hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { StarryBackground } from '../src/components/StarryBackground';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <StarryBackground />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? 'transparent' : theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="camera/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="analytics/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="halls/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="demo/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
