// ==========================================
// Application Constants
// ==========================================

import { ApiConfig, Hall, AutomationRule, User } from '../models/types';

// --- API Configuration ---
export const API_CONFIG: ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
  mqttUrl: process.env.EXPO_PUBLIC_MQTT_URL || 'mqtt://localhost:1883',
  timeout: 10000,
};

// --- API Endpoints ---
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  HALLS: '/halls',
  HALL_ENVIRONMENT: (id: string) => `/halls/${id}/environment`,
  HALL_OCCUPANCY: (id: string) => `/halls/${id}/occupancy`,
  HALL_DEVICES: (id: string) => `/halls/${id}/devices`,
  DEVICE: (id: string) => `/devices/${id}`,
  AUTOMATION_RULES: '/automation/rules',
  AUTOMATION_RULE: (id: string) => `/automation/rules/${id}`,
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  CAMERA_STATUS: '/camera/status',
} as const;

// --- Storage Keys ---
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_SESSION: 'auth_session',
  SELECTED_HALL: 'selected_hall',
  THEME_MODE: 'theme_mode',
  REMEMBER_ME: 'remember_me',
  USER_EMAIL: 'user_email',
  AUTO_REFRESH: 'auto_refresh',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  DEMO_SETTINGS: 'demo_settings',
} as const;

// --- Sensor Ranges ---
export const SENSOR_RANGES = {
  temperature: { min: 16, max: 40, normalMin: 22, normalMax: 28, unit: '°C' },
  humidity: { min: 20, max: 95, normalMin: 40, normalMax: 65, unit: '%' },
  co2: { min: 350, max: 2500, normalMin: 400, normalMax: 1000, unit: 'ppm' },
  light: { min: 0, max: 1500, normalMin: 200, normalMax: 750, unit: 'lux' },
} as const;

// --- Default Thresholds ---
export const DEFAULT_THRESHOLDS = {
  temperatureHigh: 28,
  temperatureLow: 18,
  humidityHigh: 70,
  co2High: 1000,
  occupancyHigh: 70,
  occupancyLow: 10,
  lightLow: 150,
} as const;

// --- Demo Default Values ---
export const DEMO_DEFAULTS = {
  temperature: 26,
  humidity: 55,
  co2: 600,
  light: 420,
  occupancy: 30,
  capacity: 60,
} as const;

// --- Simulation Config ---
export const SIMULATION_CONFIG = {
  updateInterval: 3000, // ms
  maxVariation: {
    temperature: 0.3,
    humidity: 0.5,
    co2: 15,
    light: 10,
    occupancy: 2,
  },
  smoothing: 0.7, // higher = smoother transitions
} as const;

// --- Mock Users ---
export const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'admin@example.com': {
    user: {
      id: 'usr_admin_001',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      assignedHalls: ['hall_01'],
    },
    password: 'Admin@123',
  },
  'user@example.com': {
    user: {
      id: 'usr_user_001',
      name: 'Standard User',
      email: 'user@example.com',
      role: 'USER',
      assignedHalls: ['hall_01'],
    },
    password: 'User@123',
  },
};

// --- Mock Halls ---
export const MOCK_HALLS: Hall[] = [
  {
    id: 'hall_01',
    name: 'Hall 01',
    capacity: 60,
    status: 'ACTIVE',
    temperatureThreshold: 28,
    co2Threshold: 1000,
    occupancyThreshold: 70,
    building: 'Science & Tech Wing',
    floor: 1,
    type: 'CLASSROOM',
  },
];

// --- Default Automation Rules ---
export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule_01',
    name: 'High Temperature Response',
    trigger: 'HIGH_TEMPERATURE',
    condition: { metric: 'temperature', operator: '>', value: 28 },
    actions: [
      { device: 'ac', property: 'status', value: 'ON' },
      { device: 'ac', property: 'mode', value: 'COOLING' },
      { device: 'fan', property: 'speed', value: 'HIGH' },
      { device: 'fan', property: 'status', value: 'ON' },
    ],
    enabled: true,
    priority: 1,
  },
  {
    id: 'rule_02',
    name: 'High Occupancy Response',
    trigger: 'HIGH_OCCUPANCY',
    condition: { metric: 'occupancy_percentage', operator: '>', value: 70 },
    actions: [
      { device: 'ac', property: 'status', value: 'ON' },
      { device: 'fan', property: 'status', value: 'ON' },
      { device: 'fan', property: 'speed', value: 'HIGH' },
    ],
    enabled: true,
    priority: 2,
  },
  {
    id: 'rule_03',
    name: 'Low Occupancy — Energy Saving',
    trigger: 'LOW_OCCUPANCY',
    condition: { metric: 'occupancy_percentage', operator: '<', value: 10 },
    actions: [
      { device: 'fan', property: 'speed', value: 'LOW' },
    ],
    enabled: true,
    priority: 3,
  },
  {
    id: 'rule_04',
    name: 'High CO₂ Alert',
    trigger: 'HIGH_CO2',
    condition: { metric: 'co2', operator: '>', value: 1000 },
    actions: [],
    enabled: true,
    priority: 1,
  },
];

// --- Chart Colors ---
export const CHART_COLORS = {
  temperature: '#FF6B35',
  humidity: '#0A84FF',
  co2: '#34C759',
  light: '#FFD60A',
  occupancy: '#AF52DE',
  grid: '#E5E7EB',
  gridDark: '#2C2F38',
} as const;

// --- Refresh Intervals ---
export const REFRESH_INTERVALS = {
  environment: 3000,
  devices: 5000,
  notifications: 10000,
  analytics: 30000,
  camera: 2000,
} as const;
