// ==========================================
// Camera Screen — AI Vision & Laptop Webcam Stream (Polished UI/UX)
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '../../src/hooks/useTheme';
import { useHallStore, useEnvironmentStore } from '../../src/stores';
import { getOccupancyPercentage } from '../../src/utils/helpers';
import { HallSelector } from '../../src/components';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { halls, selectedHallId, selectHall, getSelectedHall } = useHallStore();
  const envData = useEnvironmentStore((s) => s.data[selectedHallId || 'hall_01']);

  // Auto-detect laptop IP from Expo hostUri (e.g., 192.168.1.12)
  const defaultHost = Constants.expoConfig?.hostUri
    ? Constants.expoConfig.hostUri.split(':')[0]
    : '192.168.1.12';

  const [backendIp, setBackendIp] = useState<string>(defaultHost);
  const [showIpConfig, setShowIpConfig] = useState<boolean>(false);
  const [useLaptopWebcam, setUseLaptopWebcam] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [thermalMode, setThermalMode] = useState(false);
  const [liveImageBase64, setLiveImageBase64] = useState<string | null>(null);
  const [peopleCountLive, setPeopleCountLive] = useState<number>(1);
  const [latencyLive, setLatencyLive] = useState<number>(18);
  const [webcamStatus, setWebcamStatus] = useState<string>('CONNECTING');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const currentHall = getSelectedHall() || halls[0];
  const targetHallId = selectedHallId || 'hall-01';
  const occupancy = useLaptopWebcam ? peopleCountLive : (envData?.occupancy ?? 18);
  const capacity = currentHall?.capacity ?? 60;
  const occupancyPct = getOccupancyPercentage(occupancy, capacity);

  const backendUrl = `http://${backendIp}:8000`;

  // Fetch live camera feed from Python backend
  const fetchCameraFeed = async () => {
    try {
      setIsCapturing(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${backendUrl}/api/halls/${targetHallId}/camera`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setPeopleCountLive(data.people_detected ?? 0);
        setLatencyLive(data.inference_time_ms ?? 18);
        setWebcamStatus(data.status ?? 'ONLINE');
        if (data.image_base64) {
          setLiveImageBase64(data.image_base64);
        }
      } else {
        setWebcamStatus('OFFLINE');
      }
    } catch (err) {
      setWebcamStatus('OFFLINE');
    } finally {
      setIsCapturing(false);
    }
  };

  // Poll video frames from Python backend
  useEffect(() => {
    let interval: any;
    if (useLaptopWebcam) {
      fetchCameraFeed();
      interval = setInterval(fetchCameraFeed, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [useLaptopWebcam, targetHallId, backendIp]);

  const toggleWebcamSource = async () => {
    const nextVal = !useLaptopWebcam;
    setUseLaptopWebcam(nextVal);
    try {
      await fetch(`${backendUrl}/api/halls/${targetHallId}/camera/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: nextVal ? 'webcam' : 'mock' }),
      });
      fetchCameraFeed();
    } catch (e) {
      // Offline fallback
    }
  };

  // Simulated bounding boxes for virtual mode
  const mockBoxes = [
    { id: 1, top: '25%', left: '20%', width: '18%', height: '35%', conf: '96%' },
    { id: 2, top: '30%', left: '42%', width: '16%', height: '32%', conf: '94%' },
    { id: 3, top: '28%', left: '65%', width: '17%', height: '34%', conf: '98%' },
    { id: 4, top: '55%', left: '32%', width: '22%', height: '38%', conf: '91%' },
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
            <MaterialCommunityIcons name="close" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/EnviroSync_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>AI Vision Stream</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {currentHall.name} • {useLaptopWebcam ? 'Laptop Webcam' : 'YOLOv8 Edge Vision'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowIpConfig(!showIpConfig)}
          style={[
            styles.ipSetupBtn,
            {
              backgroundColor: showIpConfig ? theme.colors.primary : theme.colors.inputBackground,
              borderColor: theme.colors.borderLight,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="tune"
            size={16}
            color={showIpConfig ? '#FFF' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.ipSetupText,
              { color: showIpConfig ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            IP Setup
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* IP Host Config Box if needed */}
        {showIpConfig && (
          <View style={[styles.ipConfigCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MaterialCommunityIcons name="ip-network" size={18} color={theme.colors.primary} />
              <Text style={[styles.ipLabel, { color: theme.colors.text, marginBottom: 0 }]}>
                Backend IP Configuration
              </Text>
            </View>
            <View style={styles.ipRow}>
              <TextInput
                style={[styles.ipInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={backendIp}
                onChangeText={setBackendIp}
                placeholder="192.168.1.12"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={fetchCameraFeed}
                style={[styles.ipSaveBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.ipSaveText}>Test</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.ipHint, { color: theme.colors.textTertiary }]}>
              Server: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
            </Text>
          </View>
        )}

        {/* Hall Selector */}
        <HallSelector
          halls={halls.map((h) => ({ id: h.id, name: h.name }))}
          selectedId={selectedHallId}
          onSelect={(id) => selectHall(id)}
        />

        {/* Stream Source Segmented Switcher */}
        <View style={[styles.segmentedContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.borderLight }]}>
          <TouchableOpacity
            onPress={() => {
              setUseLaptopWebcam(true);
              fetchCameraFeed();
            }}
            style={[
              styles.segmentedTab,
              useLaptopWebcam && { backgroundColor: theme.colors.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="laptop"
              size={16}
              color={useLaptopWebcam ? '#FFF' : theme.colors.textSecondary}
            />
            <Text style={[styles.segmentedText, { color: useLaptopWebcam ? '#FFF' : theme.colors.textSecondary }]}>
              Laptop Webcam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setUseLaptopWebcam(false)}
            style={[
              styles.segmentedTab,
              !useLaptopWebcam && { backgroundColor: theme.colors.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="robot"
              size={16}
              color={!useLaptopWebcam ? '#FFF' : theme.colors.textSecondary}
            />
            <Text style={[styles.segmentedText, { color: !useLaptopWebcam ? '#FFF' : theme.colors.textSecondary }]}>
              AI Simulation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Video / Stream Viewport Container */}
        <View style={[styles.viewportCard, { backgroundColor: thermalMode ? '#1a0933' : '#0B1120', borderColor: theme.colors.borderLight }]}>
          {useLaptopWebcam && liveImageBase64 ? (
            // Live Laptop Webcam Frame Stream
            <Image
              source={{ uri: liveImageBase64 }}
              style={styles.webcamImage}
              resizeMode="contain"
            />
          ) : useLaptopWebcam && webcamStatus === 'OFFLINE' ? (
            <View style={styles.centerLoading}>
              <View style={[styles.wifiOffCircle, { backgroundColor: '#FF950015' }]}>
                <MaterialCommunityIcons name="wifi-off" size={32} color="#FF9500" />
              </View>
              <Text style={{ color: '#FFF', marginTop: 10, fontSize: 13, fontWeight: '700' }}>
                Cannot Reach {backendIp}:8000
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
                Python server is offline or unreachable on this Wi-Fi network.
              </Text>

              <View style={styles.offlineActionRow}>
                <TouchableOpacity
                  onPress={fetchCameraFeed}
                  style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Retry</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setUseLaptopWebcam(false)}
                  style={[styles.retryBtn, { backgroundColor: theme.colors.inputBackground, borderWidth: 1, borderColor: theme.colors.borderLight }]}
                >
                  <MaterialCommunityIcons name="robot" size={14} color={theme.colors.text} />
                  <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 12 }}>Use AI Sim</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : useLaptopWebcam ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: '#FFF', marginTop: 10, fontSize: 12, fontWeight: '600' }}>
                Connecting to Laptop Webcam ({backendIp}:8000)...
              </Text>
            </View>
          ) : (
            // Simulated Camera Room Perspective
            <View style={styles.roomPerspective}>
              <View style={[styles.boardArea, { borderColor: '#374151' }]}>
                <MaterialCommunityIcons name="projector-screen-outline" size={36} color="#4B5563" />
              </View>
              <View style={styles.desksGrid}>
                <View style={[styles.deskRow, { backgroundColor: '#1F2937' }]} />
                <View style={[styles.deskRow, { backgroundColor: '#1F2937' }]} />
                <View style={[styles.deskRow, { backgroundColor: '#1F2937' }]} />
              </View>
            </View>
          )}

          {/* AI Bounding Boxes Overlay for Simulated Mode */}
          {!useLaptopWebcam &&
            showBoundingBoxes &&
            mockBoxes.map((box) => (
              <View
                key={box.id}
                style={[
                  styles.boundingBox,
                  {
                    top: box.top as any,
                    left: box.left as any,
                    width: box.width as any,
                    height: box.height as any,
                    borderColor: thermalMode ? '#FF3B30' : '#34C759',
                  },
                ]}
              >
                <View style={[styles.boxLabel, { backgroundColor: thermalMode ? '#FF3B30' : '#34C759' }]}>
                  <Text style={styles.boxLabelText}>Person {box.conf}</Text>
                </View>
              </View>
            ))}

          {/* Stream Overlay HUD */}
          <View style={styles.streamHudTop}>
            <View style={styles.hudPill}>
              <View style={[styles.liveDot, { backgroundColor: useLaptopWebcam && liveImageBase64 ? '#34C759' : '#007AFF' }]} />
              <Text style={styles.hudPillText}>
                {useLaptopWebcam ? 'Laptop Cam • 15 FPS' : 'AI Simulation • 15 FPS'}
              </Text>
            </View>
            <View style={styles.hudPill}>
              <MaterialCommunityIcons name="chip" size={13} color="#34C759" />
              <Text style={styles.hudPillText}>{latencyLive.toFixed(0)}ms Latency</Text>
            </View>
          </View>

          <View style={styles.streamHudBottom}>
            <Text style={styles.hudTimeText}>
              {new Date().toISOString().replace('T', ' ').substring(0, 19)}
            </Text>
            <Text style={styles.hudCameraId}>
              {useLaptopWebcam ? 'DEVICE-0 (WEBCAM)' : 'EDGE-YOLO-01'} • {currentHall.name}
            </Text>
          </View>
        </View>

        {/* View Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={() => setShowBoundingBoxes(!showBoundingBoxes)}
            style={[
              styles.controlToggle,
              {
                backgroundColor: showBoundingBoxes ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="vector-square"
              size={18}
              color={showBoundingBoxes ? '#FFF' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.controlToggleText,
                { color: showBoundingBoxes ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Bounding Boxes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setThermalMode(!thermalMode)}
            style={[
              styles.controlToggle,
              {
                backgroundColor: thermalMode ? '#FF9500' : theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="fire"
              size={18}
              color={thermalMode ? '#FFF' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.controlToggleText,
                { color: thermalMode ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Heatmap Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Occupancy Stats Summary */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Real-Time Occupancy Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricBox, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>PEOPLE DETECTED</Text>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{occupancy}</Text>
            </View>

            <View style={[styles.metricBox, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>TOTAL CAPACITY</Text>
              <Text style={[styles.metricVal, { color: theme.colors.text }]}>{capacity}</Text>
            </View>

            <View style={[styles.metricBox, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>CROWD DENSITY</Text>
              <Text style={[styles.metricVal, { color: occupancyPct > 80 ? '#FF3B30' : '#34C759' }]}>
                {occupancyPct}%
              </Text>
            </View>
          </View>

          {/* Privacy Preservation Notice */}
          <View style={[styles.privacyBox, { backgroundColor: theme.colors.primaryGhost, borderColor: theme.colors.primary + '30' }]}>
            <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.primary} />
            <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>Privacy-Preserving AI:</Text> No facial identification, biometric recording, or individual identity tracking. Head count & spatial distribution only.
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
    flex: 1,
    gap: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  backBtn: {
    padding: 6,
    marginRight: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  ipSetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  ipSetupText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  ipConfigCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  ipLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  ipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  ipInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  ipSaveBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ipSaveText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ipHint: {
    fontSize: 11,
    marginTop: 6,
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewportCard: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  webcamImage: {
    width: '100%',
    height: '100%',
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  wifiOffCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  roomPerspective: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardArea: {
    width: '70%',
    height: 70,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  desksGrid: {
    width: '85%',
    gap: 12,
  },
  deskRow: {
    height: 18,
    borderRadius: 4,
    opacity: 0.6,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 6,
  },
  boxLabel: {
    position: 'absolute',
    top: -18,
    left: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  boxLabelText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
  },
  streamHudTop: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streamHudBottom: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000A0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hudPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hudTimeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#000000A0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  hudCameraId: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#000000A0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  controlToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  controlToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
