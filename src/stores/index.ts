// ==========================================
// Zustand Stores
// ==========================================

import { create } from 'zustand';
import {
  User,
  Hall,
  EnvironmentData,
  DeviceState,
  AutomationRule,
  AutomationEvent,
  AppNotification,
  AnalyticsData,
  CameraStatus,
  SystemStatus,
  ConnectionState,
  DemoScenario,
  ACState,
  FanState,
  CurtainState,
  ControlMode,
} from '../models/types';
import { DEMO_DEFAULTS, MOCK_HALLS, DEFAULT_AUTOMATION_RULES } from '../constants/config';

// ============= Auth Store =============
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User, token: string, remember?: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  rememberMe: false,
  isLoading: false,
  error: null,

  setUser: (user, token, remember = false) =>
    set({ user, token, isAuthenticated: true, rememberMe: remember, error: null }),
  setRememberMe: (rememberMe) => set({ rememberMe }),
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false, rememberMe: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Hall Store =============
interface HallState {
  halls: Hall[];
  selectedHallId: string | null;
  isLoading: boolean;
  error: string | null;

  setHalls: (halls: Hall[]) => void;
  selectHall: (hallId: string) => void;
  addHall: (hall: Hall) => void;
  updateHall: (hallId: string, updates: Partial<Hall>) => void;
  deleteHall: (hallId: string) => void;
  getSelectedHall: () => Hall | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHallStore = create<HallState>((set, get) => ({
  halls: MOCK_HALLS,
  selectedHallId: 'hall_01',
  isLoading: false,
  error: null,

  setHalls: (halls) => set({ halls }),
  selectHall: (hallId) => set({ selectedHallId: hallId }),
  addHall: (hall) => set((state) => ({ halls: [...state.halls, hall] })),
  updateHall: (hallId, updates) =>
    set((state) => ({
      halls: state.halls.map((h) => (h.id === hallId ? { ...h, ...updates } : h)),
    })),
  deleteHall: (hallId) =>
    set((state) => ({
      halls: state.halls.filter((h) => h.id !== hallId),
      selectedHallId:
        state.selectedHallId === hallId
          ? state.halls.find((h) => h.id !== hallId)?.id || null
          : state.selectedHallId,
    })),
  getSelectedHall: () => {
    const state = get();
    return state.halls.find((h) => h.id === state.selectedHallId);
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Environment Store =============
interface EnvironmentState {
  data: Record<string, EnvironmentData>;
  history: Record<string, { timestamp: string; value: number }[]>;
  isLoading: boolean;
  error: string | null;

  setEnvironmentData: (hallId: string, data: EnvironmentData) => void;
  addHistoryPoint: (
    hallId: string,
    metric: string,
    point: { timestamp: string; value: number }
  ) => void;
  getDataForHall: (hallId: string) => EnvironmentData | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  data: {},
  history: {},
  isLoading: false,
  error: null,

  setEnvironmentData: (hallId, data) =>
    set((state) => ({
      data: { ...state.data, [hallId]: data },
    })),
  addHistoryPoint: (hallId, metric, point) =>
    set((state) => {
      const key = `${hallId}_${metric}`;
      const existing = state.history[key] || [];
      const updated = [...existing, point].slice(-200); // keep last 200 points
      return { history: { ...state.history, [key]: updated } };
    }),
  getDataForHall: (hallId) => get().data[hallId],
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Device Store =============
interface DeviceStoreState {
  devices: Record<string, DeviceState>;
  isLoading: boolean;
  error: string | null;

  setDeviceState: (hallId: string, state: DeviceState) => void;
  updateAC: (hallId: string, updates: Partial<ACState>) => void;
  updateFan: (hallId: string, updates: Partial<FanState>) => void;
  updateCurtain: (hallId: string, updates: Partial<CurtainState>) => void;
  setControlMode: (hallId: string, device: 'ac' | 'fan' | 'curtain', mode: ControlMode) => void;
  getDevicesForHall: (hallId: string) => DeviceState | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: {},
  isLoading: false,
  error: null,

  setDeviceState: (hallId, deviceState) =>
    set((state) => ({
      devices: { ...state.devices, [hallId]: deviceState },
    })),
  updateAC: (hallId, updates) =>
    set((state) => {
      const current = state.devices[hallId];
      if (!current) return state;
      return {
        devices: {
          ...state.devices,
          [hallId]: {
            ...current,
            ac: { ...current.ac, ...updates, controlMode: 'MANUAL' as ControlMode },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }),
  updateFan: (hallId, updates) =>
    set((state) => {
      const current = state.devices[hallId];
      if (!current) return state;
      return {
        devices: {
          ...state.devices,
          [hallId]: {
            ...current,
            fan: { ...current.fan, ...updates, controlMode: 'MANUAL' as ControlMode },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }),
  updateCurtain: (hallId, updates) =>
    set((state) => {
      const current = state.devices[hallId];
      if (!current) return state;
      return {
        devices: {
          ...state.devices,
          [hallId]: {
            ...current,
            curtain: { ...current.curtain, ...updates, controlMode: 'MANUAL' as ControlMode },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }),
  setControlMode: (hallId, device, mode) =>
    set((state) => {
      const current = state.devices[hallId];
      if (!current) return state;
      return {
        devices: {
          ...state.devices,
          [hallId]: {
            ...current,
            [device]: { ...current[device], controlMode: mode },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }),
  getDevicesForHall: (hallId) => get().devices[hallId],
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Automation Store =============
interface AutomationState {
  rules: AutomationRule[];
  events: AutomationEvent[];
  isActive: boolean;
  isLoading: boolean;
  error: string | null;

  setRules: (rules: AutomationRule[]) => void;
  toggleRule: (ruleId: string) => void;
  updateRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  addEvent: (event: AutomationEvent) => void;
  clearEvents: () => void;
  setActive: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAutomationStore = create<AutomationState>((set) => ({
  rules: DEFAULT_AUTOMATION_RULES,
  events: [],
  isActive: true,
  isLoading: false,
  error: null,

  setRules: (rules) => set({ rules }),
  toggleRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      ),
    })),
  updateRule: (ruleId, updates) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, ...updates } : r
      ),
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),
  clearEvents: () => set({ events: [] }),
  setActive: (isActive) => set({ isActive }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Notification Store =============
interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  addNotification: (notification) =>
    set((state) => {
      const updated = [notification, ...state.notifications].slice(0, 100);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Analytics Store =============
interface AnalyticsState {
  data: Record<string, AnalyticsData>;
  isLoading: boolean;
  error: string | null;

  setAnalytics: (hallId: string, analytics: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: {},
  isLoading: false,
  error: null,

  setAnalytics: (hallId, analytics) =>
    set((state) => ({
      data: { ...state.data, [hallId]: analytics },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Camera Store =============
interface CameraState {
  status: Record<string, CameraStatus>;
  isLoading: boolean;
  error: string | null;

  setCameraStatus: (hallId: string, status: CameraStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  status: {},
  isLoading: false,
  error: null,

  setCameraStatus: (hallId, status) =>
    set((state) => ({
      status: { ...state.status, [hallId]: status },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============= Connection Store =============
interface ConnectionStoreState {
  systemStatus: SystemStatus;
  isOnline: boolean;

  setSystemStatus: (status: Partial<SystemStatus>) => void;
  setConnectionState: (
    component: keyof SystemStatus,
    state: ConnectionState | 'ACTIVE' | 'INACTIVE'
  ) => void;
  setOnline: (online: boolean) => void;
}

export const useConnectionStore = create<ConnectionStoreState>((set) => ({
  systemStatus: {
    sensors: 'ONLINE',
    camera: 'ONLINE',
    esp32: 'ONLINE',
    network: 'ONLINE',
    automation: 'ACTIVE',
  },
  isOnline: true,

  setSystemStatus: (status) =>
    set((state) => ({
      systemStatus: { ...state.systemStatus, ...status },
    })),
  setConnectionState: (component, connectionState) =>
    set((state) => ({
      systemStatus: { ...state.systemStatus, [component]: connectionState },
    })),
  setOnline: (isOnline) => set({ isOnline }),
}));

// ============= Demo Store =============
interface DemoState {
  isActive: boolean;
  currentScenario: DemoScenario;

  setActive: (active: boolean) => void;
  setScenario: (scenario: DemoScenario) => void;
  reset: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isActive: false,
  currentScenario: 'NORMAL',

  setActive: (isActive) => set({ isActive }),
  setScenario: (currentScenario) => set({ currentScenario, isActive: true }),
  reset: () => set({ isActive: false, currentScenario: 'NORMAL' }),
}));
