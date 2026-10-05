// ==========================================
// Core Data Models & TypeScript Interfaces
// ==========================================

// --- Authentication & Users ---

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedHalls: string[];
  avatar?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// --- Halls ---

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  temperatureThreshold: number;
  co2Threshold: number;
  occupancyThreshold: number;
  humidityThreshold?: number;
  lightThreshold?: number;
}

// --- Environment ---

export interface EnvironmentData {
  hallId: string;
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  occupancy: number;
  capacity: number;
  timestamp: string;
}

export type MetricStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'GOOD' | 'LOW' | 'HIGH';

export interface MetricInfo {
  value: number;
  unit: string;
  status: MetricStatus;
  label: string;
  icon: string;
}

export interface EnvironmentHistory {
  hallId: string;
  metric: 'temperature' | 'humidity' | 'co2' | 'light';
  data: { timestamp: string; value: number }[];
  period: TimePeriod;
}

export type TimePeriod = '1H' | '6H' | '24H' | '7D';

// --- Devices ---

export type ACMode = 'COOLING' | 'FAN' | 'AUTO' | 'OFF';
export type FanSpeed = 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH';
export type CurtainStatus = 'OPEN' | 'CLOSED' | 'STOPPED';
export type ControlMode = 'AUTO' | 'MANUAL';

export interface ACState {
  status: 'ON' | 'OFF';
  temperature: number;
  mode: ACMode;
  fanSpeed: 'LOW' | 'MEDIUM' | 'HIGH' | 'AUTO';
  controlMode: ControlMode;
}

export interface FanState {
  status: 'ON' | 'OFF';
  speed: FanSpeed;
  controlMode: ControlMode;
}

export interface CurtainState {
  status: CurtainStatus;
  position: number; // 0-100
  controlMode: ControlMode;
}

export interface DeviceState {
  hallId: string;
  ac: ACState;
  fan: FanState;
  curtain: CurtainState;
  timestamp: string;
}

// --- Automation ---

export type AutomationTrigger =
  | 'HIGH_TEMPERATURE'
  | 'LOW_TEMPERATURE'
  | 'HIGH_OCCUPANCY'
  | 'LOW_OCCUPANCY'
  | 'HIGH_CO2'
  | 'HIGH_HUMIDITY'
  | 'LOW_LIGHT';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==';
    value: number;
  };
  actions: AutomationAction[];
  enabled: boolean;
  hallId?: string; // null = applies to all halls
  priority: number;
}

export interface AutomationAction {
  device: 'ac' | 'fan' | 'curtain';
  property: string;
  value: string | number | boolean;
}

export interface AutomationEvent {
  id: string;
  hallId: string;
  ruleId: string;
  ruleName: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  timestamp: string;
  description: string;
}

// --- Notifications ---

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
export type NotificationCategory = 'ENVIRONMENT' | 'OCCUPANCY' | 'DEVICES' | 'SYSTEM' | 'AUTOMATION';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
  hallId?: string;
  icon?: string;
}

// --- Camera ---

export interface CameraStatus {
  hallId: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  peopleDetected: number;
  occupancyPercentage: number;
  lastDetection: string;
  frameUrl?: string;
}

// --- Analytics ---

export interface AnalyticsData {
  hallId: string;
  period: TimePeriod;
  occupancy: {
    average: number;
    peak: number;
    minimum: number;
  };
  environment: {
    averageTemperature: number;
    averageHumidity: number;
    averageCo2: number;
  };
  devices: {
    acUsageHours: number;
    fanUsageHours: number;
    curtainActivityCount: number;
  };
  automationEvents: number;
}

// --- System Status ---

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'CONNECTING';

export interface SystemStatus {
  sensors: ConnectionState;
  camera: ConnectionState;
  esp32: ConnectionState;
  network: ConnectionState;
  automation: 'ACTIVE' | 'INACTIVE';
}

// --- Demo ---

export type DemoScenario =
  | 'NORMAL'
  | 'HIGH_TEMPERATURE'
  | 'HIGH_OCCUPANCY'
  | 'HIGH_CO2'
  | 'LOW_OCCUPANCY';

// --- API ---

export interface ApiConfig {
  baseUrl: string;
  wsUrl?: string;
  mqttUrl?: string;
  timeout: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// --- Theme ---

export type ThemeMode = 'light' | 'dark' | 'system';
