// ==========================================
// Spaces / Rooms Screen — Multi-Zone Overview (Polished UI/UX)
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useHallStore, useEnvironmentStore, useDeviceStore } from '../../src/stores';
import { calculateIAQScore, getStatusColor } from '../../src/utils/helpers';
import { HallType } from '../../src/models/types';

export default function RoomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { halls, selectedHallId, selectHall } = useHallStore();
  const allEnvData = useEnvironmentStore((s) => s.data);
  const allDevices = useDeviceStore((s) => s.devices);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | HallType>('ALL');

  const filterOptions: ('ALL' | HallType)[] = [
    'ALL',
    'CLASSROOM',
    'LECTURE_HALL',
    'MEETING_ROOM',
    'CONFERENCE_HALL',
    'OFFICE',
  ];

  const filteredHalls = halls.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedFilter === 'ALL' || h.type === selectedFilter;
    return matchesSearch && matchesType;
  });

  const totalOccupants = halls.reduce((sum, h) => {
    const d = allEnvData[h.id];
    return sum + (d?.occupancy || 0);
  }, 0);

  const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);

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
            <Text style={[styles.title, { color: theme.colors.text }]}>Building Spaces</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {halls.length} Monitored Zones • {totalOccupants}/{totalCapacity} Total Occupants
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.scenarioBtn, { backgroundColor: theme.colors.inputBackground }]}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={18}
              color={isDark ? '#FFD60A' : '#FF9500'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/demo' as any)}
            style={[styles.scenarioBtn, { backgroundColor: theme.colors.primaryGhost }]}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search rooms, halls or buildings..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setSelectedFilter(opt)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedFilter === opt ? theme.colors.primary : theme.colors.card,
                  borderColor: selectedFilter === opt ? theme.colors.primary : theme.colors.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedFilter === opt ? '#FFF' : theme.colors.textSecondary },
                ]}
              >
                {opt === 'ALL' ? 'All Spaces' : opt.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Space Cards */}
        <View style={styles.hallsList}>
          {filteredHalls.map((hall) => {
            const env = allEnvData[hall.id] || {
              temperature: 24,
              humidity: 50,
              co2: 600,
              light: 500,
              occupancy: 0,
            };
            const devices = allDevices[hall.id];
            const isSelected = hall.id === selectedHallId;
            const iaq = calculateIAQScore(env.temperature, env.humidity, env.co2);

            return (
              <TouchableOpacity
                key={hall.id}
                activeOpacity={0.7}
                onPress={() => {
                  selectHall(hall.id);
                  router.push('/(tabs)' as any);
                }}
                style={[
                  styles.hallCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.hallCardHeader}>
                  <View style={styles.hallTitleGroup}>
                    <View style={[styles.hallIconBg, { backgroundColor: theme.colors.primaryGhost }]}>
                      <MaterialCommunityIcons
                        name={
                          hall.type === 'CLASSROOM'
                            ? 'school-outline'
                            : hall.type === 'LECTURE_HALL'
                              ? 'theater'
                              : hall.type === 'LABORATORY'
                                ? 'flask-outline'
                                : 'domain'
                        }
                        size={22}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View>
                      <Text style={[styles.hallName, { color: theme.colors.text }]}>{hall.name}</Text>
                      <Text style={[styles.hallLocation, { color: theme.colors.textTertiary }]}>
                        {hall.building} • Floor {hall.floor}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.iaqBadgeSmall, { backgroundColor: getStatusColor(iaq.status) + '20' }]}>
                    <Text style={[styles.iaqBadgeText, { color: getStatusColor(iaq.status) }]}>
                      IAQ {iaq.score}
                    </Text>
                  </View>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="thermometer" size={16} color={theme.colors.temperature} />
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {env.temperature.toFixed(1)}°C
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="water-percent" size={16} color={theme.colors.humidity} />
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {env.humidity.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="molecule-co2" size={16} color={theme.colors.co2} />
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {env.co2} ppm
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.occupancy} />
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {env.occupancy}/{hall.capacity}
                    </Text>
                  </View>
                </View>

                {/* Footer / Actuators state */}
                <View style={[styles.hallCardFooter, { borderTopColor: theme.colors.borderLight }]}>
                  <View style={styles.deviceIndicators}>
                    <View style={styles.devPill}>
                      <MaterialCommunityIcons
                        name="air-conditioner"
                        size={14}
                        color={devices?.ac.power ? theme.colors.primary : theme.colors.textTertiary}
                      />
                      <Text style={[styles.devPillText, { color: devices?.ac.power ? theme.colors.text : theme.colors.textTertiary }]}>
                        {devices?.ac.power ? `${devices.ac.targetTemp}°C` : 'Off'}
                      </Text>
                    </View>
                    <View style={styles.devPill}>
                      <MaterialCommunityIcons
                        name="fan"
                        size={14}
                        color={devices?.fan.power ? '#007AFF' : theme.colors.textTertiary}
                      />
                      <Text style={[styles.devPillText, { color: devices?.fan.power ? theme.colors.text : theme.colors.textTertiary }]}>
                        {devices?.fan.power ? `Spd ${devices.fan.speed}` : 'Off'}
                      </Text>
                    </View>
                    <View style={styles.devPill}>
                      <MaterialCommunityIcons
                        name="blinds"
                        size={14}
                        color={(devices?.curtain.position ?? 0) > 0 ? '#FF9500' : theme.colors.textTertiary}
                      />
                      <Text style={[styles.devPillText, { color: (devices?.curtain.position ?? 0) > 0 ? theme.colors.text : theme.colors.textTertiary }]}>
                        {devices?.curtain.position}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActionRow}>
                    {isSelected && (
                      <View style={[styles.currentSelectedBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.currentSelectedText}>Active</Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
                  </View>
                </View>
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
  scenarioBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hallsList: {
    gap: 12,
  },
  hallCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  hallTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hallIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hallName: {
    fontSize: 16,
    fontWeight: '700',
  },
  hallLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  iaqBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  iaqBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  hallCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  deviceIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
  },
  devPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentSelectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentSelectedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
