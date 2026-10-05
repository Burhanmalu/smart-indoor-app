// ==========================================
// Dashboard Screen — Live Monitoring & AI Control (Polished UI/UX)
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useHallStore,
  useEnvironmentStore,
  useDeviceStore,
  useAutomationStore,
  useNotificationStore,
  useDemoStore,
  useConnectionStore,
} from '../../src/stores';
import {
  MetricCard,
  OccupancyCard,
  DeviceCard,
  SectionHeader,
  TimelineCard,
  HallSelector,
} from '../../src/components';
import { calculateIAQScore, getMetricStatus, getStatusColor } from '../../src/utils/helpers';
import { services } from '../../src/services/mockServices';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Store bindings
  const { halls, selectedHallId, selectHall, getSelectedHall, updateHallOccupancy } = useHallStore();
  const envData = useEnvironmentStore((s) => s.data[selectedHallId || 'hall_01']);
  const deviceState = useDeviceStore((s) => s.devices[selectedHallId || 'hall_01']);
  const { events, isActive: isAutomationActive, rules } = useAutomationStore();
  const { unreadCount } = useNotificationStore();
  const { isActive: isDemoActive, currentScenario } = useDemoStore();
  const { isOnline } = useConnectionStore();

  const defaultHost = Constants.expoConfig?.hostUri
    ? Constants.expoConfig.hostUri.split(':')[0]
    : '192.168.1.12';
  const backendUrl = `http://${defaultHost}:8000`;

  const targetHallId = selectedHallId || 'hall-01';

  // Fetch real-time live data from Python backend
  const fetchLiveBackendData = async () => {
    try {
      // 1. Fetch Real-Time Camera Occupancy
      const camRes = await fetch(`${backendUrl}/api/halls/${targetHallId}/camera`, {
        signal: AbortSignal.timeout(2000),
      });
      if (camRes.ok) {
        const camData = await camRes.json();
        const liveCount = camData.people_detected ?? 0;
        
        // Update stores with actual live occupancy
        updateHallOccupancy(targetHallId, liveCount);
        useEnvironmentStore.getState().updateMetric(targetHallId, 'occupancy', liveCount);
      }

      // 2. Fetch Real-Time Live Sensor Telemetry
      const envRes = await fetch(`${backendUrl}/api/halls/${targetHallId}/environment`, {
        signal: AbortSignal.timeout(2000),
      });
      if (envRes.ok) {
        const envJson = await envRes.json();
        useEnvironmentStore.getState().setEnvironmentData(targetHallId, {
          temperature: envJson.temperature ?? 24.0,
          humidity: envJson.humidity ?? 50.0,
          co2: envJson.co2 ?? 600.0,
          light: envJson.light ?? 450.0,
          occupancy: envJson.occupancy ?? useEnvironmentStore.getState().data[targetHallId]?.occupancy ?? 0,
        });
      }
    } catch (e) {
      // Offline fallback
    }
  };

  // Sync real live data periodically
  useEffect(() => {
    fetchLiveBackendData();
    const timer = setInterval(fetchLiveBackendData, 2000);
    return () => clearInterval(timer);
  }, [targetHallId]);

  const currentHall = getSelectedHall() || halls[0];

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveBackendData().finally(() => {
      setRefreshing(false);
    });
  };

  // Fallback defaults if not yet initialized
  const temperature = envData?.temperature ?? 24.5;
  const humidity = envData?.humidity ?? 52;
  const co2 = envData?.co2 ?? 650;
  const light = envData?.light ?? 480;
  const occupancy = envData?.occupancy ?? 0;
  const capacity = currentHall?.capacity ?? 60;
  const occupancyPct = Math.min(100, Math.round((occupancy / capacity) * 100));

  const iaq = calculateIAQScore(temperature, humidity, co2);

  // Handle Quick Device Toggle
  const handleToggleAC = () => {
    if (!selectedHallId || !deviceState) return;
    const newPower = !deviceState.ac.power;
    services.device.setACPower(selectedHallId, newPower);
    useDeviceStore.getState().updateAC(selectedHallId, { power: newPower });
  };

  const handleToggleFan = () => {
    if (!selectedHallId || !deviceState) return;
    const newPower = !deviceState.fan.power;
    services.device.setFanPower(selectedHallId, newPower);
    useDeviceStore.getState().updateFan(selectedHallId, { power: newPower });
  };

  const handleToggleCurtain = () => {
    if (!selectedHallId || !deviceState) return;
    const nextPos = deviceState.curtain.position > 50 ? 0 : 100;
    services.device.setCurtainPosition(selectedHallId, nextPos);
    useDeviceStore.getState().updateCurtain(selectedHallId, { position: nextPos });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : theme.colors.background }]}>
      {/* Top Header with Insets */}
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
          <View style={styles.headerBrandRow}>
            <Image
              source={require('../../assets/EnviroSync_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={[styles.appTitle, { color: theme.colors.text }]}>EnviroSync AI</Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#34C759' : '#FF3B30' }]} />
            <Text style={[styles.onlineText, { color: theme.colors.textSecondary }]}>
              {isOnline ? 'IoT Mesh Active' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/demo' as any)}
            style={[
              styles.demoBtn,
              { backgroundColor: isDemoActive ? theme.colors.primary : theme.colors.primaryGhost },
            ]}
          >
            <MaterialCommunityIcons
              name="play-speed"
              size={16}
              color={isDemoActive ? '#FFF' : theme.colors.primary}
            />
            <Text
              style={[
                styles.demoBtnText,
                { color: isDemoActive ? '#FFF' : theme.colors.primary },
              ]}
            >
              {isDemoActive ? currentScenario : 'AI Demo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={20}
              color={isDark ? '#FFD60A' : '#FF9500'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/notifications' as any)}
            style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.critical }]}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Hall / Room Switcher Chips */}
        <View style={styles.hallSelectorContainer}>
          <HallSelector
            halls={halls.map((h) => ({ id: h.id, name: h.name }))}
            selectedId={selectedHallId}
            onSelect={(id) => selectHall(id)}
          />
        </View>

        {/* Indoor Air Quality (IAQ) & Comfort Score Card */}
        <View style={[styles.iaqCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.iaqHeader}>
            <View>
              <Text style={[styles.iaqCardTitle, { color: theme.colors.textSecondary }]}>
                INDOOR AIR QUALITY & COMFORT
              </Text>
              <Text style={[styles.iaqStatusText, { color: getStatusColor(iaq.status) }]}>
                {iaq.status} Comfort
              </Text>
            </View>
            <View style={[styles.iaqScoreBadge, { backgroundColor: getStatusColor(iaq.status) + '18' }]}>
              <Text style={[styles.iaqScoreNumber, { color: getStatusColor(iaq.status) }]}>
                {iaq.score}
              </Text>
              <Text style={[styles.iaqScoreMax, { color: theme.colors.textTertiary }]}>/100</Text>
            </View>
          </View>

          <View style={styles.iaqProgressBarBg}>
            <View
              style={[
                styles.iaqProgressBarFill,
                {
                  width: `${iaq.score}%`,
                  backgroundColor: getStatusColor(iaq.status),
                },
              ]}
            />
          </View>

          <View style={styles.iaqDetailsRow}>
            <View style={styles.iaqPill}>
              <MaterialCommunityIcons name="thermostat" size={15} color={theme.colors.temperature} />
              <Text style={[styles.iaqPillText, { color: theme.colors.textSecondary }]}>
                Temp {temperature.toFixed(1)}°C
              </Text>
            </View>
            <View style={styles.iaqPill}>
              <MaterialCommunityIcons name="water-percent" size={15} color={theme.colors.humidity} />
              <Text style={[styles.iaqPillText, { color: theme.colors.textSecondary }]}>
                Hum {humidity.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.iaqPill}>
              <MaterialCommunityIcons name="molecule-co2" size={15} color={theme.colors.co2} />
              <Text style={[styles.iaqPillText, { color: theme.colors.textSecondary }]}>
                CO₂ {co2} ppm
              </Text>
            </View>
          </View>
        </View>

        {/* Environmental Metrics Grid */}
        <SectionHeader
          title="Live Sensor Readings"
          action="Analytics"
          onAction={() => router.push('/analytics' as any)}
        />
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <MetricCard
              icon="thermometer"
              label="Temperature"
              value={temperature}
              unit="°C"
              status={getMetricStatus('temperature', temperature)}
              color={theme.colors.temperature}
              onPress={() => router.push('/analytics' as any)}
            />
            <MetricCard
              icon="water-percent"
              label="Humidity"
              value={humidity}
              unit="%"
              status={getMetricStatus('humidity', humidity)}
              color={theme.colors.humidity}
              onPress={() => router.push('/analytics' as any)}
            />
          </View>
          <View style={styles.metricRow}>
            <MetricCard
              icon="molecule-co2"
              label="CO₂ Concentration"
              value={co2}
              unit="ppm"
              status={getMetricStatus('co2', co2)}
              color={theme.colors.co2}
              onPress={() => router.push('/analytics' as any)}
            />
            <MetricCard
              icon="white-balance-sunny"
              label="Ambient Light"
              value={light}
              unit="lux"
              status={getMetricStatus('light', light)}
              color={theme.colors.light}
              onPress={() => router.push('/analytics' as any)}
            />
          </View>
        </View>

        {/* AI Vision & Occupancy */}
        <SectionHeader
          title="Vision AI & Occupancy"
          action="Live Feed"
          onAction={() => router.push('/camera' as any)}
        />
        <OccupancyCard
          current={occupancy}
          capacity={capacity}
          percentage={occupancyPct}
          status={occupancyPct > 80 ? 'CRITICAL' : occupancyPct > 50 ? 'WARNING' : 'OPTIMAL'}
          onViewCamera={() => router.push('/camera' as any)}
        />

        {/* Connected Smart Devices / Actuators */}
        <SectionHeader
          title="Connected Actuators"
          action="Full Controls"
          onAction={() => router.push('/controls' as any)}
        />
        <View style={styles.devicesGrid}>
          <DeviceCard
            icon="air-conditioner"
            name="Smart AC"
            isOn={deviceState?.ac.power ?? true}
            statusText={
              deviceState?.ac.power
                ? `${deviceState.ac.targetTemp}°C • ${deviceState.ac.fanSpeed}`
                : 'Turned Off'
            }
            controlMode={deviceState?.ac.controlMode ?? 'AUTO'}
            color={theme.colors.primary}
            onPress={handleToggleAC}
          />
          <DeviceCard
            icon="fan"
            name="Vent Fan"
            isOn={deviceState?.fan.power ?? true}
            statusText={
              deviceState?.fan.power
                ? `Speed ${deviceState.fan.speed}/5 • ${deviceState.fan.oscillate ? 'Oscillating' : 'Direct'}`
                : 'Idle'
            }
            controlMode={deviceState?.fan.controlMode ?? 'AUTO'}
            color="#007AFF"
            onPress={handleToggleFan}
          />
          <DeviceCard
            icon="blinds"
            name="Curtains"
            isOn={(deviceState?.curtain.position ?? 0) > 0}
            statusText={
              (deviceState?.curtain.position ?? 0) === 0
                ? 'Closed (0%)'
                : (deviceState?.curtain.position ?? 0) === 100
                  ? 'Open (100%)'
                  : `${deviceState?.curtain.position}% Open`
            }
            controlMode={deviceState?.curtain.controlMode ?? 'AUTO'}
            color="#FF9500"
            onPress={handleToggleCurtain}
          />
        </View>

        {/* AI Automation Engine Events Feed */}
        <SectionHeader
          title="AI Automation Activity"
          action={`${rules.filter((r) => r.enabled).length} Rules Active`}
        />
        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <View style={[styles.emptyEventsBox, { backgroundColor: theme.colors.card }]}>
              <MaterialCommunityIcons name="robot-outline" size={32} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyEventsText, { color: theme.colors.textSecondary }]}>
                AI Engine is running. No threshold events triggered recently.
              </Text>
            </View>
          ) : (
            events.slice(0, 4).map((evt) => (
              <TimelineCard
                key={evt.id}
                time={new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                title={evt.ruleName || 'Automation Triggered'}
                description={evt.description || (evt as any).reason || 'Rule threshold reached.'}
                icon="robot"
                color={theme.colors.primary}
              />
            ))
          )}
        </View>
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
    flex: 1,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  appTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  hallSelectorContainer: {
    marginBottom: 12,
  },
  iaqCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  iaqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iaqCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  iaqStatusText: {
    fontSize: 18,
    fontWeight: '800',
  },
  iaqScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iaqScoreNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  iaqScoreMax: {
    fontSize: 12,
    fontWeight: '600',
  },
  iaqProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  iaqProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  iaqDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  iaqPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
  },
  iaqPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricsGrid: {
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  devicesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  eventsContainer: {
    marginTop: 4,
  },
  emptyEventsBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEventsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
