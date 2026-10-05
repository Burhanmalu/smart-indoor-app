// ==========================================
// Demo Screen — Interactive AI Scenario Simulator (Polished UI/UX)
// ==========================================

import React from 'react';
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
import { useDemoStore, useHallStore, useEnvironmentStore, useDeviceStore } from '../../src/stores';
import { simulationManager } from '../../src/services/simulationManager';
import { DemoScenario } from '../../src/models/types';
import { HallSelector } from '../../src/components';

export default function DemoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { halls, selectedHallId, selectHall, getSelectedHall } = useHallStore();
  const { isActive, currentScenario } = useDemoStore();
  const envData = useEnvironmentStore((s) => s.data[selectedHallId || 'hall_01']);
  const deviceState = useDeviceStore((s) => s.devices[selectedHallId || 'hall_01']);

  const currentHall = getSelectedHall() || halls[0];

  const handleTriggerScenario = (scenarioKey: DemoScenario) => {
    simulationManager.activateScenario(scenarioKey);
  };

  const handleReset = () => {
    simulationManager.resetDemo();
  };

  const scenariosList: {
    key: DemoScenario;
    title: string;
    description: string;
    icon: string;
    color: string;
    expectedAction: string;
    sensorValues: string;
  }[] = [
    {
      key: 'HIGH_TEMP',
      title: 'Indian Summer Heatwave',
      description: 'Simulates intense summer peak with ambient temp at 41°C and indoor surging to 32.5°C.',
      icon: 'fire',
      color: theme.colors.critical,
      expectedAction: 'AI sets AC to 22°C (BEE Compliant), TURBO Fan, and closes blinds to reject heat.',
      sensorValues: 'Temp: 32.5°C • Hum: 42% • CO₂: 600 ppm',
    },
    {
      key: 'HIGH_CO2',
      title: 'Full Seminar Hall / CPCB Alert',
      description: 'Simulates crowded auditorium with CO₂ spiking to 1450 ppm violating CPCB indoor norms.',
      icon: 'molecule-co2',
      color: theme.colors.warning,
      expectedAction: 'AI revs Ventilation Fan to Level 5 and issues health alert.',
      sensorValues: 'CO₂: 1450 ppm • Occupants: 55/60 • Temp: 26.2°C',
    },
    {
      key: 'EMPTY_ROOM',
      title: 'Vacant Space / DISCOM Saver',
      description: 'Class concludes and room empties (0 occupants detected by YOLOv8 Vision Edge AI).',
      icon: 'account-off-outline',
      color: '#34C759',
      expectedAction: 'AI cuts phantom load, turning AC off and minimizing ventilation.',
      sensorValues: 'Occupants: 0 • Temp: 25°C • CO₂: 420 ppm',
    },
    {
      key: 'HIGH_HUMIDITY',
      title: 'Monsoon Humidity (Rainy Season)',
      description: 'Simulates heavy monsoon conditions with indoor relative humidity soaring to 82%.',
      icon: 'water-alert',
      color: '#007AFF',
      expectedAction: 'AI switches AC to DRY mode and engages exhaust fans for ISHRAE comfort.',
      sensorValues: 'Hum: 82% • Temp: 27°C • CO₂: 550 ppm',
    },
    {
      key: 'HIGH_SUNLIGHT',
      title: 'Afternoon Tropical Solar Glare',
      description: 'Simulates direct tropical sunlight flooding classroom windows (>980 lux).',
      icon: 'white-balance-sunny',
      color: '#FF9500',
      expectedAction: 'AI automatically lowers motorized smart blinds to 0% (Closed).',
      sensorValues: 'Light: 980 lux • Temp: 28°C • Occupants: 25',
    },
    {
      key: 'NORMAL',
      title: 'ISHRAE / BEE Nominal Baseline',
      description: 'Optimal indoor parameters within ISHRAE & BEE 24°C thermal comfort envelope.',
      icon: 'check-circle-outline',
      color: theme.colors.primary,
      expectedAction: 'Balanced low-power maintenance mode.',
      sensorValues: 'Temp: 24.5°C • Hum: 50% • CO₂: 580 ppm',
    },
  ];

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
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>AI Scenario Simulator</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Inject hardware test cases & verify AI responses
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleReset} style={[styles.resetBtn, { backgroundColor: theme.colors.inputBackground }]}>
          <MaterialCommunityIcons name="restore" size={18} color={theme.colors.text} />
          <Text style={[styles.resetBtnText, { color: theme.colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hall Selector */}
        <HallSelector
          halls={halls.map((h) => ({ id: h.id, name: h.name }))}
          selectedId={selectedHallId}
          onSelect={(id) => selectHall(id)}
        />

        {/* Live Feedback Summary */}
        <View style={[styles.statusBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.statusBannerRow}>
            <View>
              <Text style={[styles.bannerSub, { color: theme.colors.textSecondary }]}>ACTIVE SCENARIO</Text>
              <Text style={[styles.bannerTitle, { color: isActive ? theme.colors.primary : theme.colors.text }]}>
                {isActive ? currentScenario.replace('_', ' ') : 'Live Continuous Simulation'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)' as any)}
              style={[styles.viewDashBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.viewDashText}>View Dashboard</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.bannerTelemetry, { color: theme.colors.textTertiary }]}>
            Current: {envData?.temperature?.toFixed(1) ?? '24.0'}°C • {envData?.humidity?.toFixed(0) ?? '50'}% • {envData?.co2 ?? '600'} ppm • AC: {deviceState?.ac.power ? `${deviceState.ac.targetTemp}°C` : 'Off'}
          </Text>
        </View>

        {/* Scenarios Grid */}
        <View style={styles.scenariosList}>
          {scenariosList.map((sc) => {
            const isCurrent = isActive && currentScenario === sc.key;
            return (
              <TouchableOpacity
                key={sc.key}
                activeOpacity={0.7}
                onPress={() => handleTriggerScenario(sc.key)}
                style={[
                  styles.scenarioCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isCurrent ? sc.color : theme.colors.borderLight,
                    borderWidth: isCurrent ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.scenarioCardHeader}>
                  <View style={styles.scenarioHeaderLeft}>
                    <View style={[styles.scenarioIconBg, { backgroundColor: sc.color + '15' }]}>
                      <MaterialCommunityIcons name={sc.icon as any} size={24} color={sc.color} />
                    </View>
                    <View>
                      <Text style={[styles.scenarioTitle, { color: theme.colors.text }]}>{sc.title}</Text>
                      <Text style={[styles.sensorValues, { color: sc.color }]}>{sc.sensorValues}</Text>
                    </View>
                  </View>

                  {isCurrent && (
                    <View style={[styles.activePill, { backgroundColor: sc.color }]}>
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.scenarioDesc, { color: theme.colors.textSecondary }]}>
                  {sc.description}
                </Text>

                <View style={[styles.actionExpectedBox, { backgroundColor: theme.colors.inputBackground }]}>
                  <MaterialCommunityIcons name="robot" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionExpectedText, { color: theme.colors.text }]}>
                    {sc.expectedAction}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleTriggerScenario(sc.key)}
                  style={[
                    styles.triggerBtn,
                    {
                      backgroundColor: isCurrent ? sc.color : theme.colors.primaryGhost,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.triggerBtnText,
                      { color: isCurrent ? '#FFF' : theme.colors.primary },
                    ]}
                  >
                    {isCurrent ? 'Scenario Running (Tap to Retrigger)' : 'Simulate This Scenario'}
                  </Text>
                  <MaterialCommunityIcons
                    name="play"
                    size={18}
                    color={isCurrent ? '#FFF' : theme.colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  statusBanner: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  viewDashBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDashText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerTelemetry: {
    fontSize: 11,
    fontWeight: '600',
  },
  scenariosList: {
    gap: 14,
  },
  scenarioCard: {
    borderRadius: 20,
    padding: 16,
  },
  scenarioCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scenarioHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scenarioIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sensorValues: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scenarioDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionExpectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  actionExpectedText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  triggerBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  triggerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
