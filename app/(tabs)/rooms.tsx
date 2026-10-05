// ==========================================
// Spaces / Rooms Screen — Multi-Zone Overview & Add Space
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
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useHallStore, useEnvironmentStore, useDeviceStore } from '../../src/stores';
import { calculateIAQScore, getStatusColor } from '../../src/utils/helpers';
import { HallType, Hall } from '../../src/models/types';
import { initializeSensorData, getSensorData } from '../../src/mock/mockData';
import { services } from '../../src/services/mockServices';

export default function RoomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { halls, selectedHallId, selectHall, addHall, deleteHall } = useHallStore();
  const allEnvData = useEnvironmentStore((s) => s.data);
  const allDevices = useDeviceStore((s) => s.devices);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | HallType>('ALL');

  // Modal & Form State for Adding New Space
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('Aryabhata Academic Block');
  const [floor, setFloor] = useState('2');
  const [capacity, setCapacity] = useState('60');
  const [type, setType] = useState<HallType>('CLASSROOM');

  const filterOptions: ('ALL' | HallType)[] = [
    'ALL',
    'CLASSROOM',
    'LECTURE_HALL',
    'MEETING_ROOM',
    'CONFERENCE_HALL',
    'LABORATORY',
    'OFFICE',
  ];

  const filteredHalls = halls.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.building ? h.building.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    const matchesType = selectedFilter === 'ALL' || h.type === selectedFilter;
    return matchesSearch && matchesType;
  });

  const totalOccupants = halls.reduce((sum, h) => {
    const d = allEnvData[h.id];
    return sum + (d?.occupancy || 0);
  }, 0);

  const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);

  const handleCreateSpace = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the space.');
      return;
    }

    const newId = `hall_${Date.now()}`;
    const cap = parseInt(capacity, 10) || 60;
    const floorNum = parseInt(floor, 10) || 1;

    const newSpace: Hall = {
      id: newId,
      name: name.trim(),
      capacity: cap,
      status: 'ACTIVE',
      temperatureThreshold: 26, // BEE Standard
      co2Threshold: 1000,       // CPCB Standard
      occupancyThreshold: 70,
      building: building.trim() || 'Aryabhata Academic Block',
      floor: floorNum,
      type,
    };

    addHall(newSpace);

    // Initialize environment & device stores for the new space
    initializeSensorData(newId, cap);
    const initialEnv = getSensorData(newId);
    useEnvironmentStore.getState().setEnvironmentData(newId, initialEnv);

    const initialDevice = services.device.getOrInit(newId);
    useDeviceStore.getState().setDeviceState(newId, initialDevice);

    selectHall(newId);
    setIsAddingModal(false);
    setName('');
    Alert.alert('Space Created', `${newSpace.name} has been added to monitored zones.`);
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
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.hallName, { color: theme.colors.text }]}>{hall.name}</Text>
                      <Text style={[styles.hallLocation, { color: theme.colors.textTertiary }]}>
                        {hall.building || 'Aryabhata Academic Block'} • Floor {hall.floor ?? 1}
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
                      {Math.round(env.co2)} ppm
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

          {/* Prominent Add Space Button Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAddingModal(true)}
            style={[
              styles.addSpaceCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.card,
                borderColor: theme.colors.primary + '60',
              },
            ]}
          >
            <View style={[styles.addIconCircle, { backgroundColor: theme.colors.primaryGhost }]}>
              <MaterialCommunityIcons name="plus-circle" size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.addCardTitle, { color: theme.colors.primary }]}>+ Add Monitored Space</Text>
            <Text style={[styles.addCardDesc, { color: theme.colors.textSecondary }]}>
              Deploy autonomous comfort control & IoT telemetry to a new hall, lab, or auditorium
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add New Space Modal */}
      <Modal
        visible={isAddingModal}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddingModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIconBox, { backgroundColor: theme.colors.primaryGhost }]}>
                  <MaterialCommunityIcons name="domain-plus" size={22} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Space</Text>
                  <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                    Configure room details & thresholds
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsAddingModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              {/* Quick Presets */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>QUICK PRESETS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {[
                  { name: 'Hall 02', building: 'Aryabhata Academic Block', floor: '2', capacity: '75', type: 'LECTURE_HALL' as HallType },
                  { name: 'IoT & AI Research Lab', building: 'Aryabhata Academic Block', floor: '3', capacity: '45', type: 'LABORATORY' as HallType },
                  { name: 'APJ Kalam Seminar Hall', building: 'Dr. Kalam Tech Centre', floor: '1', capacity: '120', type: 'CONFERENCE_HALL' as HallType },
                  { name: 'Smart Classroom 102', building: 'Aryabhata Academic Block', floor: '1', capacity: '60', type: 'CLASSROOM' as HallType },
                  { name: 'Executive Meeting Room', building: 'Administrative Tower', floor: '4', capacity: '20', type: 'MEETING_ROOM' as HallType },
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setName(preset.name);
                      setBuilding(preset.building);
                      setFloor(preset.floor);
                      setCapacity(preset.capacity);
                      setType(preset.type);
                    }}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: name === preset.name ? theme.colors.primaryGhost : theme.colors.inputBackground,
                        borderColor: name === preset.name ? theme.colors.primary : theme.colors.borderLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={name === preset.name ? 'check-circle' : 'plus-circle-outline'}
                      size={14}
                      color={name === preset.name ? theme.colors.primary : theme.colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: name === preset.name ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Space Name */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>SPACE / ROOM NAME</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
                placeholder="e.g. Hall 02, Seminar Hall 02, IoT Lab"
                placeholderTextColor={theme.colors.textTertiary}
                value={name}
                onChangeText={setName}
              />

              {/* Building / Block */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                BUILDING / COMPLEX
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
                placeholder="e.g. Aryabhata Academic Block, APJ Kalam Complex"
                placeholderTextColor={theme.colors.textTertiary}
                value={building}
                onChangeText={setBuilding}
              />

              {/* Space Type Selector */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                SPACE CLASSIFICATION
              </Text>
              <View style={styles.typeGrid}>
                {[
                  { key: 'CLASSROOM', label: 'Classroom', icon: 'school-outline' },
                  { key: 'LECTURE_HALL', label: 'Lecture Hall', icon: 'theater' },
                  { key: 'LABORATORY', label: 'Laboratory', icon: 'flask-outline' },
                  { key: 'MEETING_ROOM', label: 'Meeting Room', icon: 'account-group' },
                  { key: 'CONFERENCE_HALL', label: 'Auditorium', icon: 'domain' },
                  { key: 'OFFICE', label: 'Faculty Office', icon: 'briefcase-outline' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setType(item.key as HallType)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: type === item.key ? theme.colors.primary : theme.colors.inputBackground,
                        borderColor: type === item.key ? theme.colors.primary : theme.colors.borderLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={14}
                      color={type === item.key ? '#FFF' : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: type === item.key ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Floor & Capacity */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>FLOOR</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.borderLight,
                      },
                    ]}
                    placeholder="Floor number"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="number-pad"
                    value={floor}
                    onChangeText={setFloor}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                    MAX CAPACITY
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.borderLight,
                      },
                    ]}
                    placeholder="Occupants"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="number-pad"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>
              </View>

              {/* Indian Standards Note */}
              <View style={[styles.standardNoteBox, { backgroundColor: theme.colors.primaryGhost }]}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.standardNoteText, { color: theme.colors.primary }]}>
                  Auto-calibrated with BEE (26°C baseline) and CPCB (1000 ppm CO₂) indoor comfort standards.
                </Text>
              </View>

              {/* Submit & Cancel Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setIsAddingModal(false)}
                  style={[styles.cancelBtn, { borderColor: theme.colors.borderLight }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateSpace}
                  style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                  <Text style={styles.createBtnText}>Add Space</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    width: 36,
    height: 36,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hallsList: {
    gap: 14,
  },
  hallCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
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
    flex: 1,
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
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hallLocation: {
    fontSize: 12,
    fontWeight: '500',
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
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.08)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  hallCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
  },
  deviceIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 11,
    fontWeight: '700',
  },
  addSpaceCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  addIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  addCardDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  formScroll: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
  },
  standardNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  standardNoteText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
