// ==========================================
// Reusable UI Components
// ==========================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Switch,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { MetricStatus, ConnectionState } from '../models/types';
import { getStatusColor, formatNumber } from '../utils/helpers';

// ============= MetricCard =============
interface MetricCardProps {
  icon: string;
  label: string;
  value: number;
  unit: string;
  status: MetricStatus;
  color: string;
  onPress?: () => void;
}

export function MetricCard({ icon, label, value, unit, status, color, onPress }: MetricCardProps) {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.metricCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.borderLight,
          ...theme.shadow.md as any,
        },
      ]}
      accessibilityLabel={`${label}: ${value} ${unit}, Status: ${status}`}
      accessibilityRole="button"
    >
      <View style={[styles.metricIconContainer, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color: theme.colors.text }]}>
          {formatNumber(value, unit === '°C' ? 1 : 0)}
        </Text>
        <Text style={[styles.metricUnit, { color: theme.colors.textTertiary }]}>{unit}</Text>
      </View>
      <StatusBadge status={status} />
    </TouchableOpacity>
  );
}

// ============= StatusBadge =============
interface StatusBadgeProps {
  status: MetricStatus | string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const color = getStatusColor(status as MetricStatus);
  const fontSize = size === 'small' ? 10 : 12;

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color, fontSize }]}>{status}</Text>
    </View>
  );
}

// ============= DeviceCard =============
interface DeviceCardProps {
  icon: string;
  name: string;
  isOn: boolean;
  statusText: string;
  controlMode: 'AUTO' | 'MANUAL';
  onPress?: () => void;
  color?: string;
}

export function DeviceCard({ icon, name, isOn, statusText, controlMode, onPress, color }: DeviceCardProps) {
  const { theme } = useTheme();
  const activeColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.deviceCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: isOn ? activeColor + '30' : theme.colors.borderLight,
          ...theme.shadow.sm as any,
        },
      ]}
      accessibilityLabel={`${name}: ${isOn ? 'On' : 'Off'}, ${statusText}, Mode: ${controlMode}`}
    >
      <View style={styles.deviceCardHeader}>
        <View style={[styles.deviceIconBg, { backgroundColor: isOn ? activeColor + '15' : theme.colors.inputBackground }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={isOn ? activeColor : theme.colors.textTertiary}
          />
        </View>
        <View style={[styles.deviceStatusDot, { backgroundColor: isOn ? '#34C759' : theme.colors.textTertiary }]} />
      </View>
      <Text style={[styles.deviceName, { color: theme.colors.text }]}>{name}</Text>
      <Text style={[styles.deviceStatus, { color: theme.colors.textSecondary }]}>{statusText}</Text>
      <View style={[styles.controlModeBadge, { backgroundColor: controlMode === 'AUTO' ? theme.colors.primaryGhost : theme.colors.warningLight }]}>
        <Text style={[styles.controlModeText, { color: controlMode === 'AUTO' ? theme.colors.primary : theme.colors.warning }]}>
          {controlMode}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============= OccupancyCard =============
interface OccupancyCardProps {
  current: number;
  capacity: number;
  percentage: number;
  status: MetricStatus;
  onViewCamera?: () => void;
}

export function OccupancyCard({ current, capacity, percentage, status, onViewCamera }: OccupancyCardProps) {
  const { theme } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: percentage / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.occupancyCard, { backgroundColor: theme.colors.card, ...theme.shadow.md as any }]}>
      <Text style={[styles.occupancyTitle, { color: theme.colors.textSecondary }]}>OCCUPANCY</Text>
      <View style={styles.occupancyContent}>
        <View style={styles.occupancyCircleContainer}>
          <View style={[styles.occupancyCircle, { borderColor: statusColor + '30' }]}>
            <Text style={[styles.occupancyValue, { color: theme.colors.text }]}>{current}</Text>
            <Text style={[styles.occupancyCapacity, { color: theme.colors.textTertiary }]}>/ {capacity}</Text>
          </View>
        </View>
        <View style={styles.occupancyDetails}>
          <View style={styles.occupancyDetailRow}>
            <MaterialCommunityIcons name="account-group" size={18} color={theme.colors.occupancy} />
            <Text style={[styles.occupancyDetailText, { color: theme.colors.text }]}>{current} People</Text>
          </View>
          <View style={styles.occupancyDetailRow}>
            <MaterialCommunityIcons name="seat" size={18} color={theme.colors.textTertiary} />
            <Text style={[styles.occupancyDetailText, { color: theme.colors.textSecondary }]}>Capacity: {capacity}</Text>
          </View>
          <View style={styles.occupancyDetailRow}>
            <MaterialCommunityIcons name="percent" size={18} color={statusColor} />
            <Text style={[styles.occupancyDetailText, { color: statusColor }]}>{percentage}%</Text>
            <StatusBadge status={status} />
          </View>
        </View>
      </View>
      {/* Progress bar */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.colors.inputBackground }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: statusColor,
              width: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {onViewCamera && (
        <TouchableOpacity onPress={onViewCamera} style={styles.viewCameraBtn}>
          <Text style={[styles.viewCameraText, { color: theme.colors.primary }]}>View Live Camera →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============= ConnectionStatusBar =============
interface ConnectionStatusBarProps {
  label: string;
  state: ConnectionState | 'ACTIVE' | 'INACTIVE';
}

export function ConnectionStatusIndicator({ label, state }: ConnectionStatusBarProps) {
  const { theme } = useTheme();
  const color =
    state === 'ONLINE' || state === 'ACTIVE'
      ? '#34C759'
      : state === 'CONNECTING'
      ? '#FF9500'
      : '#FF3B30';

  return (
    <View style={styles.connectionRow}>
      <Text style={[styles.connectionLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.connectionRight}>
        <View style={[styles.connectionDot, { backgroundColor: color }]} />
        <Text style={[styles.connectionState, { color }]}>
          {state === 'ONLINE' || state === 'ACTIVE' ? (state === 'ACTIVE' ? 'Active' : 'Online') : state === 'CONNECTING' ? 'Connecting' : 'Offline'}
        </Text>
      </View>
    </View>
  );
}

// ============= SectionHeader =============
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============= LoadingView =============
export function LoadingView({ message = 'Loading...' }: { message?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.centerView, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

// ============= ErrorView =============
export function ErrorView({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.centerView, { backgroundColor: theme.colors.background }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.critical} />
      <Text style={[styles.errorText, { color: theme.colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============= EmptyView =============
export function EmptyView({ message = 'No data available.', icon = 'inbox-outline' }: { message?: string; icon?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.centerView, { backgroundColor: theme.colors.background }]}>
      <MaterialCommunityIcons name={icon as any} size={48} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

// ============= TimelineCard =============
interface TimelineCardProps {
  time: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export function TimelineCard({ time, title, description, icon = 'robot', color }: TimelineCardProps) {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <View style={[styles.timelineCard, { backgroundColor: theme.colors.card, ...theme.shadow.sm as any }]}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIconBg, { backgroundColor: iconColor + '15' }]}>
          <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={[styles.timelineLine, { backgroundColor: theme.colors.borderLight }]} />
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTime, { color: theme.colors.textTertiary }]}>{time}</Text>
        <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}

// ============= NotificationCard =============
interface NotificationCardProps {
  icon: string;
  title: string;
  description: string;
  time: string;
  severity: string;
  read: boolean;
  onPress?: () => void;
}

export function NotificationCard({ icon, title, description, time, severity, read, onPress }: NotificationCardProps) {
  const { theme } = useTheme();
  const severityColor =
    severity === 'CRITICAL' ? theme.colors.critical :
    severity === 'WARNING' ? theme.colors.warning :
    severity === 'SUCCESS' ? theme.colors.success : theme.colors.info;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.notificationCard,
        {
          backgroundColor: read ? theme.colors.card : theme.colors.primaryGhost,
          borderLeftColor: severityColor,
          ...theme.shadow.sm as any,
        },
      ]}
    >
      <View style={[styles.notifIconBg, { backgroundColor: severityColor + '15' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={severityColor} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.notifDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>{description}</Text>
        <Text style={[styles.notifTime, { color: theme.colors.textTertiary }]}>{time}</Text>
      </View>
      {!read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
    </TouchableOpacity>
  );
}

// ============= HallSelector =============
interface HallSelectorProps {
  halls: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function HallSelector({ halls, selectedId, onSelect }: HallSelectorProps) {
  const { theme } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hallSelectorScroll}>
      {halls.map((hall) => (
        <TouchableOpacity
          key={hall.id}
          onPress={() => onSelect(hall.id)}
          style={[
            styles.hallChip,
            {
              backgroundColor: hall.id === selectedId ? theme.colors.primary : theme.colors.inputBackground,
              borderColor: hall.id === selectedId ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.hallChipText,
              { color: hall.id === selectedId ? '#FFF' : theme.colors.text },
            ]}
          >
            {hall.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ============= ModeSelector =============
interface ModeSelectorProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  color?: string;
}

export function ModeSelector({ options, selected, onSelect, color }: ModeSelectorProps) {
  const { theme } = useTheme();
  const activeColor = color || theme.colors.primary;
  return (
    <View style={[styles.modeSelector, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          style={[
            styles.modeOption,
            option === selected && { backgroundColor: activeColor },
          ]}
        >
          <Text
            style={[
              styles.modeOptionText,
              { color: option === selected ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============= Styles =============
const styles = StyleSheet.create({
  // MetricCard
  metricCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minWidth: 155,
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 3,
  },
  // StatusBadge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // DeviceCard
  deviceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 100,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 13,
    marginBottom: 8,
  },
  controlModeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  controlModeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // OccupancyCard
  occupancyCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  occupancyTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  occupancyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  occupancyCircleContainer: {
    marginRight: 20,
  },
  occupancyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupancyValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  occupancyCapacity: {
    fontSize: 14,
    fontWeight: '500',
  },
  occupancyDetails: {
    flex: 1,
  },
  occupancyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  occupancyDetailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  viewCameraBtn: {
    alignSelf: 'flex-end',
  },
  viewCameraText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Connection
  connectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  connectionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionState: {
    fontSize: 13,
    fontWeight: '600',
  },
  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Loading / Error / Empty
  centerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  // TimelineCard
  timelineCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  // NotificationCard
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  notifIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notifDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  // HallSelector
  hallSelectorScroll: {
    flexGrow: 0,
    marginVertical: 8,
  },
  hallChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  hallChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // ModeSelector
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { StarryBackground } from './StarryBackground';
