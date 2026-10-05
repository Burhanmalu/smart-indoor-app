// ==========================================
// Automation Engine
// ==========================================

import {
  EnvironmentData,
  DeviceState,
  AutomationRule,
  AutomationAction,
  AutomationEvent,
  AppNotification,
} from '../models/types';
import { generateId, getOccupancyPercentage } from '../utils/helpers';

export interface AutomationResult {
  actions: AutomationAction[];
  events: AutomationEvent[];
  notifications: AppNotification[];
}

/**
 * Core Automation Engine
 * 
 * Evaluates environment data against automation rules
 * and produces device actions, events, and notifications.
 */
export class AutomationEngine {
  private lastTriggeredRules: Set<string> = new Set();
  private cooldownMs: number = 30000; // 30s cooldown per rule
  private lastTriggerTime: Record<string, number> = {};

  /**
   * Evaluate all rules against current environment data
   */
  evaluate(
    environmentData: EnvironmentData,
    deviceState: DeviceState,
    rules: AutomationRule[]
  ): AutomationResult {
    const result: AutomationResult = {
      actions: [],
      events: [],
      notifications: [],
    };

    const now = Date.now();
    const occupancyPercentage = getOccupancyPercentage(
      environmentData.occupancy,
      environmentData.capacity
    );

    for (const rule of rules) {
      if (!rule.enabled) continue;

      // Check cooldown
      const lastTrigger = this.lastTriggerTime[rule.id] || 0;
      if (now - lastTrigger < this.cooldownMs) continue;

      // Skip if device is in MANUAL mode for the targeted devices
      const isManualOverride = this.hasManualOverride(rule, deviceState);
      if (isManualOverride) continue;

      const metricValue = this.getMetricValue(
        rule.condition.metric,
        environmentData,
        occupancyPercentage
      );

      if (metricValue === null) continue;

      const triggered = this.evaluateCondition(
        metricValue,
        rule.condition.operator,
        rule.condition.value
      );

      if (triggered) {
        this.lastTriggerTime[rule.id] = now;

        // Add actions
        result.actions.push(...rule.actions);

        // Create automation event
        const event: AutomationEvent = {
          id: generateId('evt'),
          hallId: environmentData.hallId,
          ruleId: rule.id,
          ruleName: rule.name,
          trigger: rule.trigger,
          actions: rule.actions,
          timestamp: new Date().toISOString(),
          description: this.buildEventDescription(rule, metricValue),
        };
        result.events.push(event);

        // Create notification
        const notification = this.buildNotification(rule, metricValue, environmentData.hallId);
        result.notifications.push(notification);
      }
    }

    return result;
  }

  /**
   * Get the value of a metric from environment data
   */
  private getMetricValue(
    metric: string,
    data: EnvironmentData,
    occupancyPercentage: number
  ): number | null {
    switch (metric) {
      case 'temperature':
        return data.temperature;
      case 'humidity':
        return data.humidity;
      case 'co2':
        return data.co2;
      case 'light':
        return data.light;
      case 'occupancy':
        return data.occupancy;
      case 'occupancy_percentage':
        return occupancyPercentage;
      default:
        return null;
    }
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Check if any targeted device is in manual mode
   */
  private hasManualOverride(rule: AutomationRule, deviceState: DeviceState): boolean {
    for (const action of rule.actions) {
      const device = deviceState[action.device];
      if (device && device.controlMode === 'MANUAL') {
        return true;
      }
    }
    return false;
  }

  /**
   * Build a human-readable event description
   */
  private buildEventDescription(rule: AutomationRule, value: number): string {
    const actionDescriptions = rule.actions.map((a) => {
      const deviceName = a.device.toUpperCase();
      return `${deviceName} → ${a.property}: ${a.value}`;
    });

    let triggerDesc = '';
    switch (rule.trigger) {
      case 'HIGH_TEMPERATURE':
        triggerDesc = `High temperature detected (${value.toFixed(1)}°C)`;
        break;
      case 'HIGH_OCCUPANCY':
        triggerDesc = `High occupancy detected (${value}%)`;
        break;
      case 'LOW_OCCUPANCY':
        triggerDesc = `Low occupancy detected (${value}%)`;
        break;
      case 'HIGH_CO2':
        triggerDesc = `High CO₂ detected (${value} ppm)`;
        break;
      default:
        triggerDesc = `${rule.name} triggered`;
    }

    return `${triggerDesc}. ${actionDescriptions.join(', ')}`;
  }

  /**
   * Build a notification from a triggered rule
   */
  private buildNotification(
    rule: AutomationRule,
    value: number,
    hallId: string
  ): AppNotification {
    let title = '';
    let description = '';
    let severity: AppNotification['severity'] = 'WARNING';
    let category: AppNotification['category'] = 'AUTOMATION';

    switch (rule.trigger) {
      case 'HIGH_TEMPERATURE':
        title = 'High Temperature';
        description = `Temperature reached ${value.toFixed(1)}°C. AC set to Cooling, Fan set to High.`;
        severity = 'WARNING';
        category = 'ENVIRONMENT';
        break;
      case 'HIGH_OCCUPANCY':
        title = 'High Occupancy';
        description = `Occupancy reached ${value}%. AC and Fan adjusted automatically.`;
        severity = 'WARNING';
        category = 'OCCUPANCY';
        break;
      case 'LOW_OCCUPANCY':
        title = 'Low Occupancy — Energy Saving';
        description = `Occupancy dropped to ${value}%. Energy saving mode activated.`;
        severity = 'INFO';
        category = 'OCCUPANCY';
        break;
      case 'HIGH_CO2':
        title = 'Poor Air Quality';
        description = `CO₂ level reached ${value} ppm. Ventilation recommended.`;
        severity = 'CRITICAL';
        category = 'ENVIRONMENT';
        break;
      default:
        title = rule.name;
        description = `Automation rule triggered with value ${value}.`;
    }

    return {
      id: generateId('notif'),
      title,
      description,
      category,
      severity,
      timestamp: new Date().toISOString(),
      read: false,
      hallId,
    };
  }

  /**
   * Apply automation actions to device state
   */
  applyActions(
    currentState: DeviceState,
    actions: AutomationAction[]
  ): DeviceState {
    const newState = JSON.parse(JSON.stringify(currentState)) as DeviceState;

    for (const action of actions) {
      const device = newState[action.device];
      if (device) {
        (device as any)[action.property] = action.value;
        // Keep control mode as AUTO since this is automation-driven
        device.controlMode = 'AUTO';
        if (action.property === 'speed' && action.value !== 'OFF') {
          (device as any).status = 'ON';
        }
        if (action.property === 'status' && action.value === 'ON') {
          (device as any).status = 'ON';
        }
      }
    }

    newState.timestamp = new Date().toISOString();
    return newState;
  }

  /**
   * Reset cooldowns
   */
  resetCooldowns(): void {
    this.lastTriggerTime = {};
    this.lastTriggeredRules.clear();
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine();
