import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StarryBackground } from '../../src/components/StarryBackground';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10);
  const tabHeight = 58 + bottomInset;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StarryBackground />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: isDark ? 'transparent' : theme.colors.background },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.borderLight,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Spaces',
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'domain' : 'domain'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: 'Controls',
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'tune' : 'tune-variant'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="energy"
        options={{
          title: 'Energy',
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'lightning-bolt' : 'lightning-bolt-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'cog' : 'cog-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
