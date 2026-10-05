// ==========================================
// Simulation Manager — Orchestrates mock real-time data
// ==========================================

import { services } from './mockServices';
import { automationEngine } from './automationEngine';
import {
  simulateSensorUpdate,
  overrideSensorData,
  getDemoScenarioData,
  getSensorData,
  initializeSensorData,
  resetAllSensorData,
} from '../mock/mockData';
import {
  useEnvironmentStore,
  useDeviceStore,
  useAutomationStore,
  useNotificationStore,
  useCameraStore,
  useConnectionStore,
  useHallStore,
  useDemoStore,
} from '../stores';
import { SIMULATION_CONFIG, MOCK_HALLS } from '../constants/config';
import { DemoScenario } from '../models/types';
import { getOccupancyPercentage } from '../utils/helpers';

class SimulationManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  /**
   * Start the real-time simulation loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initialize sensor data for all halls
    MOCK_HALLS.forEach((hall) => {
      initializeSensorData(hall.id, hall.capacity);
      const envData = getSensorData(hall.id);
      useEnvironmentStore.getState().setEnvironmentData(hall.id, envData);

      // Initialize device state
      const deviceState = services.device.getOrInit(hall.id);
      useDeviceStore.getState().setDeviceState(hall.id, deviceState);
    });

    // Set system status to online
    useConnectionStore.getState().setOnline(true);

    // Start simulation loop
    this.intervalId = setInterval(() => {
      this.tick();
    }, SIMULATION_CONFIG.updateInterval);

    // Run first tick immediately
    this.tick();
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Single simulation tick
   */
  private tick(): void {
    const selectedHallId = useHallStore.getState().selectedHallId;
    if (!selectedHallId) return;

    const demoState = useDemoStore.getState();

    // Update environment data
    let envData = (demoState.isActive && demoState.currentScenario !== 'NORMAL')
      ? getSensorData(selectedHallId)
      : simulateSensorUpdate(selectedHallId);

    // Retain real camera occupancy if present
    const currentStored = useEnvironmentStore.getState().data[selectedHallId];
    if (currentStored && currentStored.occupancy !== undefined) {
      envData = { ...envData, occupancy: currentStored.occupancy };
    }

    useEnvironmentStore.getState().setEnvironmentData(selectedHallId, envData);

    // Add to history
    const store = useEnvironmentStore.getState();
    const ts = new Date().toISOString();
    store.addHistoryPoint(selectedHallId, 'temperature', { timestamp: ts, value: envData.temperature });
    store.addHistoryPoint(selectedHallId, 'humidity', { timestamp: ts, value: envData.humidity });
    store.addHistoryPoint(selectedHallId, 'co2', { timestamp: ts, value: envData.co2 });
    store.addHistoryPoint(selectedHallId, 'light', { timestamp: ts, value: envData.light });

    // Get current device state
    const deviceState = services.device.getOrInit(selectedHallId);

    // Run automation engine
    const automationState = useAutomationStore.getState();
    if (automationState.isActive) {
      const result = automationEngine.evaluate(
        envData,
        deviceState,
        automationState.rules
      );

      // Apply automation actions to devices
      if (result.actions.length > 0) {
        for (const action of result.actions) {
          services.device.applyAutomationAction(
            selectedHallId,
            action.device,
            action.property,
            action.value
          );
        }
        // Update device store
        const updatedDevices = services.device.getOrInit(selectedHallId);
        useDeviceStore.getState().setDeviceState(selectedHallId, updatedDevices);
      }

      // Add automation events
      for (const event of result.events) {
        automationState.addEvent(event);
      }

      // Add notifications
      for (const notification of result.notifications) {
        useNotificationStore.getState().addNotification(notification);
      }
    }

    // Update device store (even without automation changes)
    const currentDevices = services.device.getOrInit(selectedHallId);
    useDeviceStore.getState().setDeviceState(selectedHallId, currentDevices);

    // Update camera status
    const cameraStatus = {
      hallId: selectedHallId,
      status: 'ONLINE' as const,
      peopleDetected: envData.occupancy,
      occupancyPercentage: getOccupancyPercentage(envData.occupancy, envData.capacity),
      lastDetection: new Date().toISOString(),
    };
    useCameraStore.getState().setCameraStatus(selectedHallId, cameraStatus);
  }

  /**
   * Activate a demo scenario
   */
  activateScenario(scenario: DemoScenario): void {
    const selectedHallId = useHallStore.getState().selectedHallId;
    if (!selectedHallId) return;

    const hall = MOCK_HALLS.find((h) => h.id === selectedHallId);
    const capacity = hall?.capacity || 60;

    // Reset automation cooldowns so rules fire immediately
    automationEngine.resetCooldowns();

    // Reset device modes to AUTO so automation can take effect
    const deviceState = services.device.getOrInit(selectedHallId);
    deviceState.ac.controlMode = 'AUTO';
    deviceState.fan.controlMode = 'AUTO';
    deviceState.curtain.controlMode = 'AUTO';

    const scenarioData = getDemoScenarioData(scenario, selectedHallId, capacity);

    // Override sensor data
    overrideSensorData(selectedHallId, scenarioData.environment);

    // Update environment store immediately
    const updatedEnv = getSensorData(selectedHallId);
    useEnvironmentStore.getState().setEnvironmentData(selectedHallId, updatedEnv);

    // Set demo state
    useDemoStore.getState().setScenario(scenario);

    // Run one automation tick immediately to process the scenario
    this.tick();
  }

  /**
   * Reset demo to normal
   */
  resetDemo(): void {
    const selectedHallId = useHallStore.getState().selectedHallId;
    if (!selectedHallId) return;

    // Reset sensor data
    resetAllSensorData();

    // Reset devices
    services.device.resetDevices(selectedHallId);

    // Reset automation cooldowns
    automationEngine.resetCooldowns();

    // Update stores
    const envData = getSensorData(selectedHallId);
    useEnvironmentStore.getState().setEnvironmentData(selectedHallId, envData);

    const deviceState = services.device.getOrInit(selectedHallId);
    useDeviceStore.getState().setDeviceState(selectedHallId, deviceState);

    // Reset demo state
    useDemoStore.getState().reset();

    // Clear automation events and notifications
    useAutomationStore.getState().clearEvents();
    useNotificationStore.getState().clearNotifications();
  }
}

export const simulationManager = new SimulationManager();
