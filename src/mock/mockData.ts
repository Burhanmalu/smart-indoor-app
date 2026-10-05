// ==========================================
// Mock Data Generator — Realistic sensor simulation
// ==========================================

import {
  EnvironmentData,
  DeviceState,
  CameraStatus,
  AnalyticsData,
  SystemStatus,
  AppNotification,
  DemoScenario,
} from '../models/types';
import { DEMO_DEFAULTS, SIMULATION_CONFIG, MOCK_HALLS } from '../constants/config';
import { clamp, generateId, simulateGradualChange } from '../utils/helpers';

// Internal state for gradual simulation
const sensorState: Record<string, EnvironmentData> = {};

/**
 * Initialize sensor state for a hall
 */
export function initializeSensorData(hallId: string, capacity: number): EnvironmentData {
  const data: EnvironmentData = {
    hallId,
    temperature: Number((DEMO_DEFAULTS.temperature + (Math.random() - 0.5) * 2).toFixed(1)),
    humidity: Number((DEMO_DEFAULTS.humidity + (Math.random() - 0.5) * 5).toFixed(1)),
    co2: Math.round(DEMO_DEFAULTS.co2 + (Math.random() - 0.5) * 50),
    light: Math.round(DEMO_DEFAULTS.light + (Math.random() - 0.5) * 30),
    occupancy: Math.round(capacity * (DEMO_DEFAULTS.occupancy / 100)),
    capacity,
    timestamp: new Date().toISOString(),
  };
  sensorState[hallId] = data;
  return data;
}

/**
 * Get or initialize sensor data for a hall
 */
export function getSensorData(hallId: string): EnvironmentData {
  if (!sensorState[hallId]) {
    const hall = MOCK_HALLS.find((h) => h.id === hallId);
    return initializeSensorData(hallId, hall?.capacity || 60);
  }
  return { ...sensorState[hallId] };
}

/**
 * Simulate a gradual sensor update (realistic random walk)
 */
export function simulateSensorUpdate(hallId: string): EnvironmentData {
  const current = getSensorData(hallId);
  const mv = SIMULATION_CONFIG.maxVariation;

  const updated: EnvironmentData = {
    hallId,
    temperature: Number(simulateGradualChange(current.temperature, DEMO_DEFAULTS.temperature, mv.temperature, 16, 40).toFixed(1)),
    humidity: Number(simulateGradualChange(current.humidity, DEMO_DEFAULTS.humidity, mv.humidity, 20, 95).toFixed(1)),
    co2: Math.round(simulateGradualChange(current.co2, DEMO_DEFAULTS.co2, mv.co2, 350, 2500)),
    light: Math.round(simulateGradualChange(current.light, DEMO_DEFAULTS.light, mv.light, 0, 1500)),
    occupancy: Math.round(clamp(current.occupancy + Math.round((Math.random() - 0.5) * mv.occupancy), 0, current.capacity)),
    capacity: current.capacity,
    timestamp: new Date().toISOString(),
  };

  sensorState[hallId] = updated;
  return updated;
}

/**
 * Override sensor data for demo scenarios
 */
export function overrideSensorData(hallId: string, overrides: Partial<EnvironmentData>): EnvironmentData {
  const current = getSensorData(hallId);
  const updated = { ...current, ...overrides, timestamp: new Date().toISOString() };
  sensorState[hallId] = updated;
  return updated;
}

/**
 * Get default device state for a hall
 */
export function getDefaultDeviceState(hallId: string): DeviceState {
  return {
    hallId,
    ac: {
      status: 'ON',
      temperature: 24,
      targetTemp: 24,
      mode: 'COOLING',
      fanSpeed: 'AUTO',
      controlMode: 'AUTO',
    } as any,
    fan: {
      status: 'ON',
      speed: 2,
      oscillate: true,
      controlMode: 'AUTO',
    } as any,
    curtain: {
      status: 'OPEN',
      position: 80,
      targetPosition: 80,
      controlMode: 'AUTO',
    } as any,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get demo scenario overrides
 */
export function getDemoScenarioData(
  scenario: DemoScenario,
  hallId: string,
  capacity: number
): { environment: Partial<EnvironmentData>; description: string } {
  switch (scenario) {
    case 'HIGH_TEMPERATURE':
      return {
        environment: { temperature: 30, humidity: 62, co2: 700 },
        description: 'Simulating high temperature scenario (30°C)',
      };
    case 'HIGH_OCCUPANCY':
      return {
        environment: { occupancy: Math.round(capacity * 0.85) },
        description: 'Simulating high occupancy scenario (85%)',
      };
    case 'HIGH_CO2':
      return {
        environment: { co2: 1600 },
        description: 'Simulating high CO₂ scenario (1600 ppm)',
      };
    case 'LOW_OCCUPANCY':
      return {
        environment: { occupancy: Math.round(capacity * 0.05) },
        description: 'Simulating low occupancy scenario (5%)',
      };
    case 'NORMAL':
    default:
      return {
        environment: {
          temperature: DEMO_DEFAULTS.temperature,
          humidity: DEMO_DEFAULTS.humidity,
          co2: DEMO_DEFAULTS.co2,
          light: DEMO_DEFAULTS.light,
          occupancy: Math.round(capacity * (DEMO_DEFAULTS.occupancy / 100)),
        },
        description: 'Normal operating conditions',
      };
  }
}

/**
 * Generate mock history data for charts
 */
export function generateHistoryData(
  hallId: string,
  metric: string,
  period: string
): { timestamp: string; value: number }[] {
  const now = Date.now();
  let points: number;
  let intervalMs: number;
  let baseValue: number;
  let variance: number;

  switch (period) {
    case '1H':
      points = 60;
      intervalMs = 60000;
      break;
    case '6H':
      points = 72;
      intervalMs = 300000;
      break;
    case '24H':
      points = 96;
      intervalMs = 900000;
      break;
    case '7D':
      points = 168;
      intervalMs = 3600000;
      break;
    default:
      points = 60;
      intervalMs = 60000;
  }

  switch (metric) {
    case 'temperature':
      baseValue = 25;
      variance = 3;
      break;
    case 'humidity':
      baseValue = 55;
      variance = 10;
      break;
    case 'co2':
      baseValue = 600;
      variance = 200;
      break;
    case 'light':
      baseValue = 400;
      variance = 150;
      break;
    default:
      baseValue = 50;
      variance = 10;
  }

  const data: { timestamp: string; value: number }[] = [];
  let currentValue = baseValue;

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now - (points - i) * intervalMs).toISOString();
    // Smooth random walk
    currentValue += (Math.random() - 0.5) * variance * 0.1;

    // Add time-of-day variation for temperature and light
    if (metric === 'temperature' || metric === 'light') {
      const hour = new Date(timestamp).getHours();
      const dayFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.3;
      currentValue += dayFactor;
    }

    currentValue = clamp(currentValue, baseValue - variance, baseValue + variance);

    data.push({
      timestamp,
      value: metric === 'co2' || metric === 'light'
        ? Math.round(currentValue)
        : Number(currentValue.toFixed(1)),
    });
  }

  return data;
}

/**
 * Generate mock camera status
 */
export function getMockCameraStatus(hallId: string, occupancy: number): CameraStatus {
  return {
    hallId,
    status: 'ONLINE',
    peopleDetected: occupancy,
    occupancyPercentage: 0, // Will be calculated
    lastDetection: new Date().toISOString(),
  };
}

/**
 * Generate mock analytics data
 */
export function getMockAnalytics(hallId: string): AnalyticsData {
  return {
    hallId,
    period: '24H',
    occupancy: {
      average: 45,
      peak: 78,
      minimum: 8,
    },
    environment: {
      averageTemperature: 25.4,
      averageHumidity: 56,
      averageCo2: 620,
    },
    devices: {
      acUsageHours: 6.5,
      fanUsageHours: 10.2,
      curtainActivityCount: 14,
    },
    automationEvents: 12,
  };
}

/**
 * Get mock system status
 */
export function getMockSystemStatus(): SystemStatus {
  return {
    sensors: 'ONLINE',
    camera: 'ONLINE',
    esp32: 'ONLINE',
    network: 'ONLINE',
    automation: 'ACTIVE',
  };
}

/**
 * Reset all sensor data to defaults
 */
export function resetAllSensorData(): void {
  for (const hallId of Object.keys(sensorState)) {
    const hall = MOCK_HALLS.find((h) => h.id === hallId);
    initializeSensorData(hallId, hall?.capacity || 60);
  }
}
