// ==========================================
// Controls Screen — Smart Actuators & Comfort Settings (Polished UI/UX)
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useHallStore, useDeviceStore, useAutomationStore } from '../../src/stores';
import { services } from '../../src/services/mockServices';
import { ACMode, FanSpeed, ControlMode } from '../../src/models/types';
import { HallSelector } from '../../src/components';

export default function ControlsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { halls, selectedHallId, selectHall, getSelectedHall } = useHallStore();
  const deviceState = useDeviceStore((s) => s.devices[selectedHallId || 'hall_01']);
  const { isActive: isAutomationActive, setActive: setAutomationActive } = useAutomationStore();

  const currentHall = getSelectedHall() || halls[0];
  const hallId = selectedHallId || 'hall_01';

  const ac = deviceState?.ac || {
    power: true,
    mode: 'COOL' as ACMode,
    targetTemp: 22,
    fanSpeed: 'AUTO' as FanSpeed,
    swing: true,
    controlMode: 'AUTO' as ControlMode,
  };

  const fan = deviceState?.fan || {
    power: true,
    speed: 3,
    oscillate: true,
    controlMode: 'AUTO' as ControlMode,
  };

  const curtain = deviceState?.curtain || {
    position: 70,
    targetPosition: 70,
    controlMode: 'AUTO' as ControlMode,
  };

  const isACOn = (ac.status ? ac.status === 'ON' : true) && (ac.power !== false);
  const isFanOn = (fan.status ? fan.status === 'ON' : true) && (fan.power !== false);

  // AC Actions
  const handleACTempChange = (delta: number) => {
    const newTemp = Math.min(30, Math.max(16, (ac.targetTemp || ac.temperature || 24) + delta));
    services.device.setACTemperature(hallId, newTemp);
    useDeviceStore.getState().updateAC(hallId, { targetTemp: newTemp, temperature: newTemp } as any);
  };

  const handleACMode = (mode: ACMode) => {
    services.device.setACMode(hallId, mode);
    useDeviceStore.getState().updateAC(hallId, { mode });
  };

  const handleACFanSpeed = (speed: FanSpeed) => {
    services.device.setACFanSpeed(hallId, speed);
    useDeviceStore.getState().updateAC(hallId, { fanSpeed: speed });
  };

  const handleACPower = (power: boolean) => {
    services.device.setACPower(hallId, power);
    useDeviceStore.getState().updateAC(hallId, { power, status: power ? 'ON' : 'OFF' } as any);
  };

  // Fan Actions
  const handleFanPower = (power: boolean) => {
    services.device.setFanPower(hallId, power);
    useDeviceStore.getState().updateFan(hallId, { power, status: power ? 'ON' : 'OFF' } as any);
  };

  const handleFanSpeed = (speed: number) => {
    services.device.setFanSpeed(hallId, speed);
    useDeviceStore.getState().updateFan(hallId, { speed } as any);
  };

  const handleFanOscillate = (oscillate: boolean) => {
    services.device.setFanOscillation(hallId, oscillate);
    useDeviceStore.getState().updateFan(hallId, { oscillate } as any);
  };

  // Curtain Actions
  const handleCurtainPos = (position: number) => {
    services.device.setCurtainPosition(hallId, position);
    useDeviceStore.getState().updateCurtain(hallId, { position, targetPosition: position } as any);
  };

  const handleDeviceMode = (device: 'ac' | 'fan' | 'curtain', mode: ControlMode) => {
    services.device.setControlMode(hallId, device, mode);
    useDeviceStore.getState().setControlMode(hallId, device, mode);
  };

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
            <Text style={[styles.title, { color: theme.colors.text }]}>Actuator Controls</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {currentHall.name} • Automated & Manual Overrides
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

          <TouchableOpacity
            onPress={() => router.push('/demo' as any)}
            style={[styles.themeBtn, { backgroundColor: theme.colors.primaryGhost }]}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
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

        {/* Global AI Automation Banner */}
        <View style={[styles.masterCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.masterRow}>
            <View style={[styles.masterIconBg, { backgroundColor: theme.colors.primaryGhost }]}>
              <MaterialCommunityIcons name="brain" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.masterTitle, { color: theme.colors.text }]}>
                Autonomous AI Comfort Engine
              </Text>
              <Text style={[styles.masterDesc, { color: theme.colors.textSecondary }]}>
                {isAutomationActive
                  ? 'AI dynamically adjusts AC, Fan & Curtains'
                  : 'Manual Override Mode Active'}
              </Text>
            </View>
            <Switch
              value={isAutomationActive}
              onValueChange={setAutomationActive}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* ================= AC SECTION ================= */}
        <View style={[styles.controlCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="air-conditioner" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Air Conditioning</Text>
            </View>
            <View style={styles.headerRightControls}>
              <TouchableOpacity
                onPress={() => handleDeviceMode('ac', ac.controlMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                style={[
                  styles.modeBadge,
                  { backgroundColor: ac.controlMode === 'AUTO' ? theme.colors.primaryGhost : theme.colors.warningLight },
                ]}
              >
                <Text style={[styles.modeBadgeText, { color: ac.controlMode === 'AUTO' ? theme.colors.primary : theme.colors.warning }]}>
                  {ac.controlMode}
                </Text>
              </TouchableOpacity>
              <Switch
                value={isACOn}
                onValueChange={handleACPower}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          {isACOn ? (
            <View style={styles.cardBody}>
              {/* Temperature Dial Controller */}
              <View style={styles.tempControllerRow}>
                <TouchableOpacity
                  onPress={() => handleACTempChange(-1)}
                  style={[styles.tempBtn, { backgroundColor: theme.colors.inputBackground }]}
                  disabled={(ac.targetTemp || ac.temperature || 24) <= 16}
                >
                  <MaterialCommunityIcons name="minus" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={styles.tempDisplayBox}>
                  <Text style={[styles.targetTempNum, { color: theme.colors.text }]}>
                    {ac.targetTemp || ac.temperature || 24}
                  </Text>
                  <Text style={[styles.targetTempUnit, { color: theme.colors.textSecondary }]}>°C</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleACTempChange(1)}
                  style={[styles.tempBtn, { backgroundColor: theme.colors.inputBackground }]}
                  disabled={(ac.targetTemp || ac.temperature || 24) >= 30}
                >
                  <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Quick Presets */}
              <View style={styles.presetRow}>
                {[18, 20, 22, 24, 26].map((temp) => {
                  const curTemp = ac.targetTemp || ac.temperature || 24;
                  return (
                    <TouchableOpacity
                      key={temp}
                      onPress={() => {
                        services.device.setACTemperature(hallId, temp);
                        useDeviceStore.getState().updateAC(hallId, { targetTemp: temp, temperature: temp } as any);
                      }}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: curTemp === temp ? theme.colors.primary : theme.colors.inputBackground,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: curTemp === temp ? '#FFF' : theme.colors.textSecondary },
                        ]}
                      >
                        {temp}°
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* AC Mode Selection */}
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>AC MODE</Text>
              <View style={styles.buttonGroup}>
                {(['COOL', 'HEAT', 'FAN', 'DRY', 'AUTO'] as ACMode[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleACMode(mode)}
                    style={[
                      styles.groupBtn,
                      {
                        backgroundColor: ac.mode === mode ? theme.colors.primary : theme.colors.inputBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        { color: ac.mode === mode ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fan Speed Selection */}
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary, marginTop: 14 }]}>
                FAN SPEED
              </Text>
              <View style={styles.buttonGroup}>
                {(['AUTO', 'LOW', 'MEDIUM', 'HIGH', 'TURBO'] as FanSpeed[]).map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    onPress={() => handleACFanSpeed(spd)}
                    style={[
                      styles.groupBtn,
                      {
                        backgroundColor: ac.fanSpeed === spd ? theme.colors.primary : theme.colors.inputBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        { color: ac.fanSpeed === spd ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {spd}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.cardBody, { paddingVertical: 12 }]}>
              <Text style={[styles.standbyText, { color: theme.colors.textTertiary }]}>
                Air Conditioning in Standby • Turn switch ON to configure
              </Text>
            </View>
          )}
        </View>

        {/* ================= FAN SECTION ================= */}
        <View style={[styles.controlCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="fan" size={24} color="#007AFF" />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Ventilation Fan</Text>
            </View>
            <View style={styles.headerRightControls}>
              <TouchableOpacity
                onPress={() => handleDeviceMode('fan', fan.controlMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                style={[
                  styles.modeBadge,
                  { backgroundColor: fan.controlMode === 'AUTO' ? theme.colors.primaryGhost : theme.colors.warningLight },
                ]}
              >
                <Text style={[styles.modeBadgeText, { color: fan.controlMode === 'AUTO' ? theme.colors.primary : theme.colors.warning }]}>
                  {fan.controlMode}
                </Text>
              </TouchableOpacity>
              <Switch
                value={isFanOn}
                onValueChange={handleFanPower}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          {isFanOn ? (
            <View style={styles.cardBody}>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>SPEED LEVEL</Text>
              <View style={styles.buttonGroup}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => handleFanSpeed(lvl)}
                    style={[
                      styles.groupBtn,
                      {
                        backgroundColor: (fan.speed ?? 2) === lvl ? '#007AFF' : theme.colors.inputBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        { color: (fan.speed ?? 2) === lvl ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      Level {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.toggleOptionRow}>
                <Text style={[styles.toggleOptionText, { color: theme.colors.text }]}>Oscillation Swing</Text>
                <Switch
                  value={fan.oscillate ?? true}
                  onValueChange={handleFanOscillate}
                  trackColor={{ false: '#767577', true: '#007AFF' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          ) : (
            <View style={[styles.cardBody, { paddingVertical: 12 }]}>
              <Text style={[styles.standbyText, { color: theme.colors.textTertiary }]}>
                Ventilation Fan in Standby • Turn switch ON to configure
              </Text>
            </View>
          )}
        </View>

        {/* ================= CURTAIN SECTION ================= */}
        <View style={[styles.controlCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="blinds" size={24} color="#FF9500" />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Motorized Curtains</Text>
            </View>
            <View style={styles.headerRightControls}>
              <TouchableOpacity
                onPress={() => handleDeviceMode('curtain', curtain.controlMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                style={[
                  styles.modeBadge,
                  { backgroundColor: curtain.controlMode === 'AUTO' ? theme.colors.primaryGhost : theme.colors.warningLight },
                ]}
              >
                <Text style={[styles.modeBadgeText, { color: curtain.controlMode === 'AUTO' ? theme.colors.primary : theme.colors.warning }]}>
                  {curtain.controlMode}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.curtainPositionDisplay}>
              <Text style={[styles.curtainPercentNum, { color: theme.colors.text }]}>
                {curtain.position}%
              </Text>
              <Text style={[styles.curtainStateLabel, { color: theme.colors.textSecondary }]}>
                {curtain.position === 0 ? 'Closed' : curtain.position === 100 ? 'Fully Open' : 'Partially Open'}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              {[
                { label: 'Close', val: 0 },
                { label: '25%', val: 25 },
                { label: '50%', val: 50 },
                { label: '75%', val: 75 },
                { label: 'Open', val: 100 },
              ].map((pos) => (
                <TouchableOpacity
                  key={pos.val}
                  onPress={() => handleCurtainPos(pos.val)}
                  style={[
                    styles.groupBtn,
                    {
                      backgroundColor: curtain.position === pos.val ? '#FF9500' : theme.colors.inputBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.groupBtnText,
                      { color: curtain.position === pos.val ? '#FFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    flex: 1,
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
  scrollContent: {
    padding: 16,
  },
  masterCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  masterIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  masterDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  controlCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  tempControllerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  tempBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempDisplayBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  targetTempNum: {
    fontSize: 52,
    fontWeight: '800',
  },
  targetTempUnit: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 2,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  groupBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  toggleOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  curtainPositionDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  curtainPercentNum: {
    fontSize: 44,
    fontWeight: '800',
  },
  curtainStateLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standbyText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
