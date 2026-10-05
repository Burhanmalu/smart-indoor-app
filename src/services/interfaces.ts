// ==========================================
// Service Interfaces — Contracts for all services
// ==========================================

import {
  AuthCredentials,
  AuthSession,
  User,
  Hall,
  EnvironmentData,
  EnvironmentHistory,
  DeviceState,
  ACState,
  FanState,
  CurtainState,
  AutomationRule,
  AutomationEvent,
  AppNotification,
  AnalyticsData,
  CameraStatus,
  SystemStatus,
  TimePeriod,
  DemoScenario,
  ControlMode,
} from '../models/types';

// --- Auth ---
export interface IAuthService {
  login(credentials: AuthCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  refreshToken(token: string): Promise<AuthSession>;
  getCurrentUser(): Promise<User | null>;
}

// --- Hall ---
export interface IHallService {
  getHalls(): Promise<Hall[]>;
  getHall(id: string): Promise<Hall>;
  createHall(hall: Omit<Hall, 'id'>): Promise<Hall>;
  updateHall(id: string, updates: Partial<Hall>): Promise<Hall>;
  deleteHall(id: string): Promise<void>;
}

// --- Environment ---
export interface IEnvironmentService {
  getCurrentData(hallId: string): Promise<EnvironmentData>;
  getHistory(
    hallId: string,
    metric: string,
    period: TimePeriod
  ): Promise<EnvironmentHistory>;
}

// --- Device ---
export interface IDeviceService {
  getDeviceState(hallId: string): Promise<DeviceState>;
  updateAC(hallId: string, updates: Partial<ACState>): Promise<DeviceState>;
  updateFan(hallId: string, updates: Partial<FanState>): Promise<DeviceState>;
  updateCurtain(hallId: string, updates: Partial<CurtainState>): Promise<DeviceState>;
  setControlMode(hallId: string, device: string, mode: ControlMode): Promise<DeviceState>;
}

// --- Automation ---
export interface IAutomationService {
  getRules(): Promise<AutomationRule[]>;
  updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule>;
  toggleRule(id: string): Promise<AutomationRule>;
  getEvents(hallId: string): Promise<AutomationEvent[]>;
}

// --- Notification ---
export interface INotificationService {
  getNotifications(): Promise<AppNotification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  clearAll(): Promise<void>;
}

// --- Analytics ---
export interface IAnalyticsService {
  getAnalytics(hallId: string, period: TimePeriod): Promise<AnalyticsData>;
}

// --- Camera ---
export interface ICameraService {
  getStatus(hallId: string): Promise<CameraStatus>;
}

// --- Realtime ---
export interface IRealtimeService {
  connect(): void;
  disconnect(): void;
  onEnvironmentUpdate(callback: (data: EnvironmentData) => void): () => void;
  onDeviceUpdate(callback: (data: DeviceState) => void): () => void;
  onNotification(callback: (data: AppNotification) => void): () => void;
  isConnected(): boolean;
}

// --- Demo ---
export interface IDemoService {
  activateScenario(scenario: DemoScenario): void;
  resetScenario(): void;
  getScenarioData(scenario: DemoScenario): {
    environment: Partial<EnvironmentData>;
    devices?: Partial<DeviceState>;
  };
}
