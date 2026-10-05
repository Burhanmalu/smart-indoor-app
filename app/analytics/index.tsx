// ==========================================
// Analytics Screen — Historical Metrics & Trends (Polished UI/UX)
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
import { useHallStore, useEnvironmentStore } from '../../src/stores';
import { HallSelector } from '../../src/components';

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { halls, selectedHallId, selectHall, getSelectedHall } = useHallStore();
  const envData = useEnvironmentStore((s) => s.data[selectedHallId || 'hall_01']);

  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'co2' | 'light' | 'occupancy'>('temperature');
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D'>('1H');

  const currentHall = getSelectedHall() || halls[0];

  const curTemp = envData?.temperature ?? 24.5;
  const curHum = envData?.humidity ?? 52;
  const curCO2 = envData?.co2 ?? 650;
  const curLight = envData?.light ?? 480;
  const curOcc = envData?.occupancy ?? 18;

  const metricConfig = {
    temperature: {
      name: 'Temperature',
      unit: '°C',
      color: theme.colors.temperature,
      icon: 'thermometer',
      current: curTemp,
      min: 21.2,
      max: 27.8,
      avg: 24.1,
      target: '22 - 25 °C',
      ideal: 'Optimal thermal comfort zone maintained by smart inverter AC',
    },
    humidity: {
      name: 'Relative Humidity',
      unit: '%',
      color: theme.colors.humidity,
      icon: 'water-percent',
      current: curHum,
      min: 44,
      max: 62,
      avg: 51,
      target: '40 - 60 %',
      ideal: 'Healthy range preventing respiratory strain and mold development',
    },
    co2: {
      name: 'CO₂ Concentration',
      unit: 'ppm',
      color: theme.colors.co2,
      icon: 'molecule-co2',
      current: curCO2,
      min: 480,
      max: 920,
      avg: 640,
      target: '< 800 ppm',
      ideal: 'Fresh air flow prevents cognitive fatigue and drowsiness',
    },
    light: {
      name: 'Ambient Illuminance',
      unit: 'lux',
      color: theme.colors.light,
      icon: 'white-balance-sunny',
      current: curLight,
      min: 310,
      max: 750,
      avg: 490,
      target: '400 - 600 lux',
      ideal: 'Regulated by motorized curtains to minimize glare and maximize daylight',
    },
    occupancy: {
      name: 'Live Occupants',
      unit: 'people',
      color: theme.colors.occupancy,
      icon: 'account-group',
      current: curOcc,
      min: 0,
      max: currentHall?.capacity || 60,
      avg: 22,
      target: `Max ${currentHall?.capacity || 60}`,
      ideal: 'Vision AI accurately monitors room density to calibrate ventilation',
    },
  };

  const activeCfg = metricConfig[selectedMetric];

  // Generate simulated chart points
  const points = [
    { t: '10:00', v: activeCfg.avg - 1.2 },
    { t: '10:15', v: activeCfg.avg - 0.4 },
    { t: '10:30', v: activeCfg.avg + 1.8 },
    { t: '10:45', v: activeCfg.avg + 0.8 },
    { t: '11:00', v: activeCfg.current },
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
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Environmental Analytics</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {currentHall.name} • Sensor Telemetry
            </Text>
          </View>
        </View>
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

        {/* Metric Switcher Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricTabsScroll}>
          {(['temperature', 'humidity', 'co2', 'light', 'occupancy'] as const).map((mKey) => {
            const isSel = selectedMetric === mKey;
            const cfg = metricConfig[mKey];
            return (
              <TouchableOpacity
                key={mKey}
                onPress={() => setSelectedMetric(mKey)}
                style={[
                  styles.metricTab,
                  {
                    backgroundColor: isSel ? cfg.color : theme.colors.card,
                    borderColor: isSel ? cfg.color : theme.colors.borderLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={cfg.icon as any}
                  size={16}
                  color={isSel ? '#FFF' : cfg.color}
                />
                <Text style={[styles.metricTabText, { color: isSel ? '#FFF' : theme.colors.text }]}>
                  {cfg.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main Trend & Stat Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={[styles.curMetricLabel, { color: theme.colors.textSecondary }]}>
                CURRENT {activeCfg.name.toUpperCase()}
              </Text>
              <View style={styles.metricValRow}>
                <Text style={[styles.metricBigNum, { color: theme.colors.text }]}>
                  {typeof activeCfg.current === 'number' && selectedMetric === 'temperature'
                    ? activeCfg.current.toFixed(1)
                    : activeCfg.current}
                </Text>
                <Text style={[styles.metricUnitText, { color: theme.colors.textTertiary }]}>
                  {activeCfg.unit}
                </Text>
              </View>
            </View>

            <View style={styles.timeRangeSelector}>
              {(['1H', '6H', '24H', '7D'] as const).map((tr) => (
                <TouchableOpacity
                  key={tr}
                  onPress={() => setTimeRange(tr)}
                  style={[
                    styles.trChip,
                    timeRange === tr && { backgroundColor: activeCfg.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.trText,
                      { color: timeRange === tr ? '#FFF' : theme.colors.textTertiary },
                    ]}
                  >
                    {tr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sparkline Curve Simulation */}
          <View style={styles.chartArea}>
            <View style={styles.chartGridLines}>
              <View style={[styles.gridLine, { borderColor: theme.colors.borderLight }]} />
              <View style={[styles.gridLine, { borderColor: theme.colors.borderLight }]} />
              <View style={[styles.gridLine, { borderColor: theme.colors.borderLight }]} />
            </View>

            <View style={styles.chartBars}>
              {points.map((pt, i) => (
                <View key={i} style={styles.chartBarItem}>
                  <View
                    style={[
                      styles.chartDot,
                      {
                        backgroundColor: activeCfg.color,
                        bottom: `${Math.min(90, Math.max(10, ((pt.v - activeCfg.min) / (activeCfg.max - activeCfg.min || 1)) * 100))}%`,
                      },
                    ]}
                  />
                  <Text style={[styles.chartTimeText, { color: theme.colors.textTertiary }]}>
                    {pt.t}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Ideal Range Footnote */}
          <View style={[styles.idealBanner, { backgroundColor: activeCfg.color + '15' }]}>
            <MaterialCommunityIcons name="information" size={18} color={activeCfg.color} />
            <Text style={[styles.idealBannerText, { color: theme.colors.text }]}>
              Target: {activeCfg.target} • {activeCfg.ideal}
            </Text>
          </View>
        </View>

        {/* Statistical Summary Grid */}
        <View style={styles.statsSummaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textTertiary }]}>MINIMUM</Text>
            <Text style={[styles.summaryVal, { color: theme.colors.text }]}>
              {activeCfg.min} {activeCfg.unit}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textTertiary }]}>AVERAGE</Text>
            <Text style={[styles.summaryVal, { color: activeCfg.color }]}>
              {activeCfg.avg} {activeCfg.unit}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textTertiary }]}>MAXIMUM</Text>
            <Text style={[styles.summaryVal, { color: theme.colors.text }]}>
              {activeCfg.max} {activeCfg.unit}
            </Text>
          </View>
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
  scrollContent: {
    padding: 16,
  },
  metricTabsScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  metricTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  metricTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  curMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  metricBigNum: {
    fontSize: 38,
    fontWeight: '800',
  },
  metricUnitText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 10,
    padding: 2,
  },
  trChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartArea: {
    height: 140,
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'center',
  },
  chartGridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  gridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
    alignItems: 'flex-end',
    position: 'relative',
  },
  chartBarItem: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
    width: 40,
  },
  chartDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chartTimeText: {
    fontSize: 10,
    marginTop: 4,
  },
  idealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  idealBannerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '800',
  },
});
