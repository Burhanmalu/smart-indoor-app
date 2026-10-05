// ==========================================
// Halls Screen — Switch & Manage Spaces (Polished UI/UX)
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
import { useHallStore, useEnvironmentStore } from '../../src/stores';
import { calculateIAQScore, getStatusColor } from '../../src/utils/helpers';

export default function HallsModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { halls, selectedHallId, selectHall, addHall } = useHallStore();
  const allEnv = useEnvironmentStore((s) => s.data);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBuilding, setNewBuilding] = useState('Science & Tech Wing');
  const [newCapacity, setNewCapacity] = useState('45');

  const handleSelect = (id: string) => {
    selectHall(id);
    router.back();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newId = `hall_${Date.now()}`;
    addHall({
      id: newId,
      name: newName,
      building: newBuilding,
      floor: 1,
      type: 'CLASSROOM',
      capacity: parseInt(newCapacity, 10) || 40,
      area: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    selectHall(newId);
    setIsAdding(false);
    setNewName('');
    router.back();
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>Select Monitored Space</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsAdding(!isAdding)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primaryGhost }]}
        >
          <MaterialCommunityIcons
            name={isAdding ? 'minus' : 'plus'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {isAdding && (
          <View style={[styles.addFormCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>Add New Zone / Hall</Text>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>SPACE NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="e.g. Innovation Lab 102"
              placeholderTextColor={theme.colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>BUILDING</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={newBuilding}
              onChangeText={setNewBuilding}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>CAPACITY (SEATS)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={newCapacity}
              onChangeText={setNewCapacity}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.saveBtnText}>Add & Monitor Space</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.list}>
          {halls.map((hall) => {
            const isSelected = hall.id === selectedHallId;
            const env = allEnv[hall.id];
            const iaq = calculateIAQScore(env?.temperature ?? 24, env?.humidity ?? 50, env?.co2 ?? 600);

            return (
              <TouchableOpacity
                key={hall.id}
                onPress={() => handleSelect(hall.id)}
                style={[
                  styles.hallItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.hallItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryGhost }]}>
                    <MaterialCommunityIcons name="domain" size={24} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{hall.name}</Text>
                    <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
                      {hall.building} • Capacity: {hall.capacity}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <View style={[styles.iaqPill, { backgroundColor: getStatusColor(iaq.status) + '20' }]}>
                    <Text style={[styles.iaqPillText, { color: getStatusColor(iaq.status) }]}>
                      IAQ {iaq.score}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.primary} />
                  )}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  addFormCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  hallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
  },
  hallItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iaqPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  iaqPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
