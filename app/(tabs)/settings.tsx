// ==========================================
// Settings Screen — Automation Rules & Preferences (Polished UI/UX)
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useAuthStore,
  useAutomationStore,
  useConnectionStore,
} from '../../src/stores';
import { SectionHeader } from '../../src/components';
import { simulationManager } from '../../src/services/simulationManager';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { rules, toggleRule } = useAutomationStore();
  const { systemStatus } = useConnectionStore();

  const handleLogout = () => {
    logout();
    router.replace('/login' as any);
  };

  const handleResetSimulation = () => {
    simulationManager.resetDemo();
    Alert.alert('Simulation Reset', 'All environmental metrics and actuator states returned to nominal baseline.');
  };

  const getActionBadge = (device: string, property: string, value: any) => {
    let icon = 'robot';
    let label = `${device.toUpperCase()} ${property}: ${value}`;

    if (device === 'ac') {
      icon = 'air-conditioner';
      label = property === 'mode' ? `AC Mode ${value}` : property === 'targetTemp' ? `AC ${value}°C` : `AC ${value}`;
    } else if (device === 'fan') {
      icon = 'fan';
      label = property === 'speed' ? `Fan Speed ${value}` : `Fan ${value}`;
    } else if (device === 'curtain') {
      icon = 'blinds';
      label = `Curtains ${value}%`;
    }

    return (
      <View key={`${device}_${property}_${value}`} style={[styles.actionChip, { backgroundColor: theme.colors.primaryGhost }]}>
        <MaterialCommunityIcons name={icon as any} size={13} color={theme.colors.primary} />
        <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>{label}</Text>
      </View>
    );
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
        <View style={styles.headerTitleRow}>
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Settings & System</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Automation Rules, IoT Gateway & Preferences
            </Text>
          </View>
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
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.borderLight,
              ...theme.shadow.sm as any,
            },
          ]}
        >
          <View style={styles.profileLeft}>
            <View style={[styles.avatarBg, { backgroundColor: theme.colors.primaryGhost, borderColor: theme.colors.primary + '30' }]}>
              <MaterialCommunityIcons name="account-tie" size={32} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.name || 'Dr. Rajesh Sharma'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                {user?.email || 'admin@envirosync.in'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.primaryGhost }]}>
                <View style={[styles.roleDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                  {user?.role?.replace('_', ' ') || 'FACILITY DIRECTOR'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: theme.colors.critical + '15' }]}>
            <MaterialCommunityIcons name="logout" size={18} color={theme.colors.critical} />
          </TouchableOpacity>
        </View>

        {/* AI Automation Rules */}
        <SectionHeader title="AI Autonomous Rules" />
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          {rules.map((rule, idx) => (
            <View
              key={rule.id}
              style={[
                styles.ruleRow,
                idx > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
              ]}
            >
              <View style={styles.ruleInfo}>
                <View style={styles.ruleTitleRow}>
                  <Text style={[styles.ruleName, { color: theme.colors.text }]}>{rule.name}</Text>
                </View>

                {rule.condition && (
                  <View style={[styles.conditionBadge, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="lightning-bolt" size={12} color="#FF9500" />
                    <Text style={[styles.conditionText, { color: theme.colors.textSecondary }]}>
                      IF {rule.condition.metric} {rule.condition.operator} {rule.condition.value}
                    </Text>
                  </View>
                )}

                <View style={styles.actionsWrap}>
                  {rule.actions && rule.actions.length > 0 ? (
                    rule.actions.map((a) => getActionBadge(a.device, a.property, a.value))
                  ) : (
                    <View style={[styles.actionChip, { backgroundColor: theme.colors.inputBackground }]}>
                      <MaterialCommunityIcons name="bell-ring-outline" size={12} color={theme.colors.textSecondary} />
                      <Text style={[styles.actionChipText, { color: theme.colors.textSecondary }]}>Health Alert</Text>
                    </View>
                  )}
                </View>
              </View>

              <Switch
                value={rule.enabled}
                onValueChange={() => toggleRule(rule.id)}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </View>

        {/* Hardware & IoT Connectivity */}
        <SectionHeader title="IoT Node Mesh & Gateways" />
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: theme.colors.primaryGhost }]}>
                <MaterialCommunityIcons name="chip" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>ESP32 Controller Gateway</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textTertiary }]}>IP: 192.168.1.142 • UART Active</Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#34C75918' }]}>
              <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.statusPillText, { color: '#34C759' }]}>Online</Text>
            </View>
          </View>

          <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: '#007AFF18' }]}>
                <MaterialCommunityIcons name="server-network" size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>MQTT & WebSocket Broker</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textTertiary }]}>broker.envirosync.local:1883</Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#34C75918' }]}>
              <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.statusPillText, { color: '#34C759' }]}>Connected</Text>
            </View>
          </View>

          <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: '#FF950018' }]}>
                <MaterialCommunityIcons name="cctv" size={20} color="#FF9500" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Vision AI Edge Inference</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textTertiary }]}>YOLOv8-Nano • 15 FPS / 28ms</Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#34C75918' }]}>
              <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.statusPillText, { color: '#34C759' }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* Preferences & Demo Simulation */}
        <SectionHeader title="Application Preferences" />
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: theme.colors.inputBackground }]}>
                <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/demo' as any)}
            style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: theme.colors.primaryGhost }]}>
                <MaterialCommunityIcons name="play-box-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>AI Scenario Simulator</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetSimulation}
            style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.nodeIconBg, { backgroundColor: theme.colors.warning + '18' }]}>
                <MaterialCommunityIcons name="restore" size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.warning }]}>Reset Demo Simulation</Text>
            </View>
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.warning} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary, fontWeight: '700' }]}>
            EnviroSync AI Platform
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary, marginTop: 2 }]}>
            BEE & ISHRAE Standard • India Edition v1.0.0
          </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 5,
  },
  roleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 12,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleName: {
    fontSize: 15,
    fontWeight: '700',
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nodeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  footerLogo: {
    width: 36,
    height: 36,
    borderRadius: 9,
    marginBottom: 8,
    opacity: 0.85,
  },
  footerText: {
    fontSize: 12,
  },
});
