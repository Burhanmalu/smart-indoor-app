// ==========================================
// Mock Service Implementations
// ==========================================

import {
  IAuthService,
  IEnvironmentService,
  IDeviceService,
  IHallService,
  IAutomationService,
  INotificationService,
  IAnalyticsService,
  ICameraService,
  IDemoService,
  IRealtimeService,
} from './interfaces';
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
  TimePeriod,
  DemoScenario,
  ControlMode,
} from '../models/types';
import { MOCK_USERS, MOCK_HALLS, DEFAULT_AUTOMATION_RULES } from '../constants/config';
import {
  getSensorData,
  simulateSensorUpdate,
  overrideSensorData,
  getDefaultDeviceState,
  getDemoScenarioData,
  generateHistoryData,
  getMockCameraStatus,
  getMockAnalytics,
  initializeSensorData,
  resetAllSensorData,
} from '../mock/mockData';
import { delay, generateId, getOccupancyPercentage } from '../utils/helpers';

// ============= Mock Auth Service =============
export class MockAuthService implements IAuthService {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    await delay(800); // simulate network delay
    const entry = MOCK_USERS[credentials.email.toLowerCase()];
    if (!entry || entry.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }
    return {
      user: entry.user,
      token: `mock_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async logout(): Promise<void> {
    await delay(300);
  }

  async refreshToken(token: string): Promise<AuthSession> {
    await delay(300);
    return {
      user: MOCK_USERS['admin@example.com'].user,
      token: `mock_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }
}

// ============= Mock Hall Service =============
export class MockHallService implements IHallService {
  private halls: Hall[] = [...MOCK_HALLS];

  async getHalls(): Promise<Hall[]> {
    await delay(300);
    return [...this.halls];
  }

  async getHall(id: string): Promise<Hall> {
    await delay(200);
    const hall = this.halls.find((h) => h.id === id);
    if (!hall) throw new Error(`Hall ${id} not found`);
    return { ...hall };
  }

  async createHall(hall: Omit<Hall, 'id'>): Promise<Hall> {
    await delay(400);
    const newHall: Hall = { ...hall, id: generateId('hall') };
    this.halls.push(newHall);
    initializeSensorData(newHall.id, newHall.capacity);
    return newHall;
  }

  async updateHall(id: string, updates: Partial<Hall>): Promise<Hall> {
    await delay(300);
    const index = this.halls.findIndex((h) => h.id === id);
    if (index === -1) throw new Error(`Hall ${id} not found`);
    this.halls[index] = { ...this.halls[index], ...updates };
    return { ...this.halls[index] };
  }

  async deleteHall(id: string): Promise<void> {
    await delay(300);
    this.halls = this.halls.filter((h) => h.id !== id);
  }
}

// ============= Mock Environment Service =============
export class MockEnvironmentService implements IEnvironmentService {
  async getCurrentData(hallId: string): Promise<EnvironmentData> {
    return getSensorData(hallId);
  }

  async getHistory(
    hallId: string,
    metric: string,
    period: TimePeriod
  ): Promise<EnvironmentHistory> {
    await delay(400);
    return {
      hallId,
      metric: metric as any,
      data: generateHistoryData(hallId, metric, period),
      period,
    };
  }
}

// ============= Mock Device Service =============
export class MockDeviceService implements IDeviceService {
  private deviceStates: Record<string, DeviceState> = {};

  getOrInit(hallId: string): DeviceState {
    if (!this.deviceStates[hallId]) {
      this.deviceStates[hallId] = getDefaultDeviceState(hallId);
    }
    return { ...this.deviceStates[hallId] };
  }

  async getDeviceState(hallId: string): Promise<DeviceState> {
    return this.getOrInit(hallId);
  }

  async updateAC(hallId: string, updates: Partial<ACState>): Promise<DeviceState> {
    const state = this.getOrInit(hallId);
    state.ac = { ...state.ac, ...updates, controlMode: 'MANUAL' };
    state.timestamp = new Date().toISOString();
    this.deviceStates[hallId] = state;
    return { ...state };
  }

  async updateFan(hallId: string, updates: Partial<FanState>): Promise<DeviceState> {
    const state = this.getOrInit(hallId);
    state.fan = { ...state.fan, ...updates, controlMode: 'MANUAL' };
    state.timestamp = new Date().toISOString();
    this.deviceStates[hallId] = state;
    return { ...state };
  }

  async updateCurtain(hallId: string, updates: Partial<CurtainState>): Promise<DeviceState> {
    const state = this.getOrInit(hallId);
    state.curtain = { ...state.curtain, ...updates, controlMode: 'MANUAL' };
    state.timestamp = new Date().toISOString();
    this.deviceStates[hallId] = state;
    return { ...state };
  }

  async setControlMode(hallId: string, device: string, mode: ControlMode): Promise<DeviceState> {
    const state = this.getOrInit(hallId);
    if (device === 'ac' || device === 'fan' || device === 'curtain') {
      state[device].controlMode = mode;
    }
    state.timestamp = new Date().toISOString();
    this.deviceStates[hallId] = state;
    return { ...state };
  }

  async setACPower(hallId: string, power: boolean): Promise<DeviceState> {
    return this.updateAC(hallId, { power });
  }

  async setACTemperature(hallId: string, targetTemp: number): Promise<DeviceState> {
    return this.updateAC(hallId, { targetTemp });
  }

  async setACMode(hallId: string, mode: ACMode): Promise<DeviceState> {
    return this.updateAC(hallId, { mode });
  }

  async setACFanSpeed(hallId: string, fanSpeed: FanSpeed): Promise<DeviceState> {
    return this.updateAC(hallId, { fanSpeed });
  }

  async setFanPower(hallId: string, power: boolean): Promise<DeviceState> {
    return this.updateFan(hallId, { power });
  }

  async setFanSpeed(hallId: string, speed: number): Promise<DeviceState> {
    return this.updateFan(hallId, { speed });
  }

  async setFanOscillation(hallId: string, oscillate: boolean): Promise<DeviceState> {
    return this.updateFan(hallId, { oscillate });
  }

  async setCurtainPosition(hallId: string, position: number): Promise<DeviceState> {
    return this.updateCurtain(hallId, { position, targetPosition: position });
  }

  // Used by automation engine to apply actions
  applyAutomationAction(hallId: string, device: string, property: string, value: any): void {
    const state = this.getOrInit(hallId);
    if (device === 'ac' || device === 'fan' || device === 'curtain') {
      const deviceObj = state[device] as any;
      if (deviceObj.controlMode !== 'MANUAL') {
        deviceObj[property] = value;
        deviceObj.controlMode = 'AUTO';
        state.timestamp = new Date().toISOString();
        this.deviceStates[hallId] = state;
      }
    }
  }

  resetDevices(hallId: string): void {
    this.deviceStates[hallId] = getDefaultDeviceState(hallId);
  }
}

// ============= Mock Automation Service =============
export class MockAutomationService implements IAutomationService {
  private rules: AutomationRule[] = [...DEFAULT_AUTOMATION_RULES];
  private events: AutomationEvent[] = [];

  async getRules(): Promise<AutomationRule[]> {
    return [...this.rules];
  }

  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Rule ${id} not found`);
    this.rules[index] = { ...this.rules[index], ...updates };
    return { ...this.rules[index] };
  }

  async toggleRule(id: string): Promise<AutomationRule> {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Rule ${id} not found`);
    this.rules[index].enabled = !this.rules[index].enabled;
    return { ...this.rules[index] };
  }

  async getEvents(hallId: string): Promise<AutomationEvent[]> {
    return this.events.filter((e) => e.hallId === hallId);
  }

  addEvent(event: AutomationEvent): void {
    this.events = [event, ...this.events].slice(0, 50);
  }
}

// ============= Mock Notification Service =============
export class MockNotificationService implements INotificationService {
  private notifications: AppNotification[] = [];

  async getNotifications(): Promise<AppNotification[]> {
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.read = true));
  }

  async clearAll(): Promise<void> {
    this.notifications = [];
  }

  addNotification(notification: AppNotification): void {
    this.notifications = [notification, ...this.notifications].slice(0, 100);
  }
}

// ============= Mock Analytics Service =============
export class MockAnalyticsService implements IAnalyticsService {
  async getAnalytics(hallId: string, period: TimePeriod): Promise<AnalyticsData> {
    await delay(500);
    return getMockAnalytics(hallId);
  }
}

// ============= Mock Camera Service =============
export class MockCameraService implements ICameraService {
  async getStatus(hallId: string): Promise<CameraStatus> {
    const envData = getSensorData(hallId);
    const status = getMockCameraStatus(hallId, envData.occupancy);
    status.occupancyPercentage = getOccupancyPercentage(envData.occupancy, envData.capacity);
    return status;
  }
}

// ============= Mock Demo Service =============
export class MockDemoService implements IDemoService {
  activateScenario(scenario: DemoScenario): void {
    // This is handled by the simulation manager
  }

  resetScenario(): void {
    resetAllSensorData();
  }

  getScenarioData(scenario: DemoScenario) {
    const data = getDemoScenarioData(scenario, 'hall_01', 60);
    return { environment: data.environment };
  }
}

// ============= Service Provider (Singleton Factory) =============
class ServiceProvider {
  private static instance: ServiceProvider;
  
  readonly auth: MockAuthService;
  readonly hall: MockHallService;
  readonly environment: MockEnvironmentService;
  readonly device: MockDeviceService;
  readonly automation: MockAutomationService;
  readonly notification: MockNotificationService;
  readonly analytics: MockAnalyticsService;
  readonly camera: MockCameraService;
  readonly demo: MockDemoService;

  private constructor() {
    this.auth = new MockAuthService();
    this.hall = new MockHallService();
    this.environment = new MockEnvironmentService();
    this.device = new MockDeviceService();
    this.automation = new MockAutomationService();
    this.notification = new MockNotificationService();
    this.analytics = new MockAnalyticsService();
    this.camera = new MockCameraService();
    this.demo = new MockDemoService();
  }

  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}

export const services = ServiceProvider.getInstance();
