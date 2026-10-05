// ==========================================
// Notifications Screen — Alert Center (Polished UI/UX)
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useNotificationStore } from '../../src/stores';
import { NotificationCard, EmptyView } from '../../src/components';
import { NotificationSeverity } from '../../src/models/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

  const [filter, setFilter] = useState<'ALL' | NotificationSeverity>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.severity === filter;
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : theme.colors.background }]}>
      {/* Safe Area Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: theme.colors.borderLight,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>Alerts & Logs</Text>
        </View>

        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearNotifications} style={styles.actionBtn}>
                <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.critical} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.borderLight }]}>
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'] as const).map((sev) => (
          <TouchableOpacity
            key={sev}
            onPress={() => setFilter(sev)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === sev ? theme.colors.primary : theme.colors.inputBackground,
                borderColor: filter === sev ? theme.colors.primary : theme.colors.borderLight,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === sev ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              {sev}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <EmptyView
            icon="bell-check-outline"
            message={
              notifications.length === 0
                ? 'No alerts right now. All indoor parameters are within healthy thresholds!'
                : 'No alerts match the selected severity filter.'
            }
          />
        ) : (
          filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              title={notif.title}
              description={notif.description || (notif as any).message || ''}
              time={new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              severity={notif.severity}
              read={notif.read}
              icon={
                notif.severity === 'CRITICAL'
                  ? 'alert-decagram'
                  : notif.severity === 'WARNING'
                  ? 'alert-circle'
                  : notif.severity === 'SUCCESS'
                  ? 'check-circle'
                  : 'information'
              }
              onPress={() => markAsRead(notif.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
});
