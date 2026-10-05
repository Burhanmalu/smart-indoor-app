// ==========================================
// Energy Screen — Power Consumption & AI Eco Savings (Polished UI/UX)
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useHallStore, useDeviceStore } from '../../src/stores';
import { HallSelector, SectionHeader } from '../../src/components';

export default function EnergyScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { halls, selectedHallId, selectHall, getSelectedHall } = useHallStore();
  const deviceState = useDeviceStore((s) => s.devices[selectedHallId || 'hall_01']);

  const [timeframe, setTimeframe] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');

  const currentHall = getSelectedHall() || halls[0];

  // Dynamic calculations based on active devices
  const isACOn = deviceState?.ac.power ?? true;
  const isFanOn = deviceState?.fan.power ?? true;

  const currentKw = (isACOn ? 2.4 : 0.2) + (isFanOn ? 0.35 : 0.05) + 0.15;
  const dailyKwh = timeframe === 'DAY' ? 24.8 : timeframe === 'WEEK' ? 168.4 : 682.0;
  const energySavedKwh = (dailyKwh * 0.28).toFixed(1);
  const costSavedDollars = (parseFloat(energySavedKwh) * 0.18).toFixed(2);
  const co2AvoidedKg = (parseFloat(energySavedKwh) * 0.42).toFixed(1);

  // Hourly consumption mock bars
  const hourlyBars = [
    { hour: '00:00', kwh: 0.4 },
    { hour: '04:00', kwh: 0.3 },
    { hour: '08:00', kwh: 1.8 },
    { hour: '12:00', kwh: 3.2 },
    { hour: '16:00', kwh: 2.9 },
    { hour: '20:00', kwh: 1.4 },
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
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Energy & Eco Analytics</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              AI Automated Load Shedding & Efficiency
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: theme.colors.inputBackground }]}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={18}
              color={isDark ? '#FFD60A' : '#FF9500'}
            />
          </TouchableOpacity>

          <View style={[styles.ecoBadge, { backgroundColor: '#34C75920' }]}>
            <MaterialCommunityIcons name="leaf" size={16} color="#34C759" />
            <Text style={styles.ecoBadgeText}>-28% Eco</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hall Selector */}
        <HallSelector
          halls={halls.map((h) => ({ id: h.id, name: h.name }))}
          selectedId={selectedHallId}
          onSelect={(id) => selectHall(id)}
        />

        {/* Timeframe Selector */}
        <View style={[styles.timeframeRow, { backgroundColor: theme.colors.inputBackground }]}>
          {(['DAY', 'WEEK', 'MONTH'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => setTimeframe(tf)}
              style={[
                styles.timeframeTab,
                timeframe === tf && { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.timeframeText,
                  { color: timeframe === tf ? '#FFF' : theme.colors.textSecondary },
                ]}
              >
                {tf === 'DAY' ? 'Today' : tf === 'WEEK' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Big Metric Banner */}
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>CURRENT POWER LOAD</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiNumber, { color: theme.colors.text }]}>
              {currentKw.toFixed(2)}
            </Text>
            <Text style={[styles.kpiUnit, { color: theme.colors.textTertiary }]}>kW</Text>
          </View>
          <Text style={[styles.kpiSub, { color: '#34C759' }]}>
            ⚡ Optimal Efficiency • Real-time ESP32 CT clamp monitoring
          </Text>
        </View>

        {/* Savings Grid */}
        <View style={styles.savingsGrid}>
          <View style={[styles.savingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF9500" />
            <Text style={[styles.savingVal, { color: theme.colors.text }]}>{energySavedKwh} kWh</Text>
            <Text style={[styles.savingTitle, { color: theme.colors.textSecondary }]}>Energy Saved</Text>
          </View>

          <View style={[styles.savingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="currency-usd" size={24} color="#34C759" />
            <Text style={[styles.savingVal, { color: theme.colors.text }]}>${costSavedDollars}</Text>
            <Text style={[styles.savingTitle, { color: theme.colors.textSecondary }]}>Cost Reduced</Text>
          </View>

          <View style={[styles.savingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="molecule-co2" size={24} color={theme.colors.co2} />
            <Text style={[styles.savingVal, { color: theme.colors.text }]}>{co2AvoidedKg} kg</Text>
            <Text style={[styles.savingTitle, { color: theme.colors.textSecondary }]}>CO₂ Offset</Text>
          </View>
        </View>

        {/* Consumption Bar Chart Simulation */}
        <SectionHeader title="Power Load Profile (24h)" />
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.barsContainer}>
            {hourlyBars.map((bar) => {
              const heightPct = Math.min(100, Math.round((bar.kwh / 3.5) * 100));
              return (
                <View key={bar.hour} style={styles.barCol}>
                  <Text style={[styles.barValText, { color: theme.colors.textTertiary }]}>{bar.kwh}k</Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.colors.inputBackground }]}>
                    <View style={[styles.barFill, { height: `${heightPct}%`, backgroundColor: theme.colors.primary }]} />
                  </View>
                  <Text style={[styles.barHourText, { color: theme.colors.textSecondary }]}>{bar.hour}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Load Breakdown by Subsystem */}
        <SectionHeader title="Subsystem Breakdown" />
        <View style={[styles.breakdownCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <MaterialCommunityIcons name="air-conditioner" size={20} color={theme.colors.primary} />
              <Text style={[styles.breakdownName, { color: theme.colors.text }]}>HVAC / Air Conditioner</Text>
            </View>
            <Text style={[styles.breakdownPct, { color: theme.colors.text }]}>68% (1.8 kW)</Text>
          </View>
          <View style={[styles.breakdownBarBg, { backgroundColor: theme.colors.inputBackground }]}>
            <View style={[styles.breakdownBarFill, { width: '68%', backgroundColor: theme.colors.primary }]} />
          </View>

          <View style={[styles.breakdownItem, { marginTop: 14 }]}>
            <View style={styles.breakdownLeft}>
              <MaterialCommunityIcons name="fan" size={20} color="#007AFF" />
              <Text style={[styles.breakdownName, { color: theme.colors.text }]}>Ventilation Fans</Text>
            </View>
            <Text style={[styles.breakdownPct, { color: theme.colors.text }]}>18% (0.4 kW)</Text>
          </View>
          <View style={[styles.breakdownBarBg, { backgroundColor: theme.colors.inputBackground }]}>
            <View style={[styles.breakdownBarFill, { width: '18%', backgroundColor: '#007AFF' }]} />
          </View>

          <View style={[styles.breakdownItem, { marginTop: 14 }]}>
            <View style={styles.breakdownLeft}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FF9500" />
              <Text style={[styles.breakdownName, { color: theme.colors.text }]}>Lighting & Sensors</Text>
            </View>
            <Text style={[styles.breakdownPct, { color: theme.colors.text }]}>14% (0.3 kW)</Text>
          </View>
          <View style={[styles.breakdownBarBg, { backgroundColor: theme.colors.inputBackground }]}>
            <View style={[styles.breakdownBarFill, { width: '14%', backgroundColor: '#FF9500' }]} />
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ecoBadgeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  timeframeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  kpiCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  kpiNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  kpiUnit: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 6,
  },
  kpiSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  savingsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  savingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  savingVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  savingTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 10,
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 7,
  },
  barHourText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
  },
  breakdownCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownPct: {
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
