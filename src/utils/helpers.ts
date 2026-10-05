// ==========================================
// Utility Functions
// ==========================================

import { MetricStatus } from '../models/types';
import { SENSOR_RANGES, DEFAULT_THRESHOLDS } from '../constants/config';

/**
 * Get status for a temperature reading
 */
export function getTemperatureStatus(value: number): MetricStatus {
  if (value > 32) return 'CRITICAL';
  if (value > DEFAULT_THRESHOLDS.temperatureHigh) return 'WARNING';
  if (value < DEFAULT_THRESHOLDS.temperatureLow) return 'WARNING';
  return 'NORMAL';
}

/**
 * Get status for a humidity reading
 */
export function getHumidityStatus(value: number): MetricStatus {
  if (value > 80) return 'CRITICAL';
  if (value > DEFAULT_THRESHOLDS.humidityHigh) return 'WARNING';
  if (value < 30) return 'WARNING';
  return 'NORMAL';
}

/**
 * Get status for a CO₂ reading
 */
export function getCO2Status(value: number, threshold?: number): MetricStatus {
  const limit = threshold || DEFAULT_THRESHOLDS.co2High;
  if (value > limit * 1.5) return 'CRITICAL';
  if (value > limit) return 'WARNING';
  if (value < 600) return 'GOOD';
  return 'NORMAL';
}

/**
 * Get status for a light reading
 */
export function getLightStatus(value: number): MetricStatus {
  if (value < DEFAULT_THRESHOLDS.lightLow) return 'LOW';
  if (value > 800) return 'HIGH';
  return 'NORMAL';
}

/**
 * Get status for occupancy percentage
 */
export function getOccupancyStatus(percentage: number): MetricStatus {
  if (percentage > 90) return 'CRITICAL';
  if (percentage > DEFAULT_THRESHOLDS.occupancyHigh) return 'HIGH';
  if (percentage < DEFAULT_THRESHOLDS.occupancyLow) return 'LOW';
  return 'NORMAL';
}

/**
 * Get color for a metric status
 */
export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'GOOD':
    case 'NORMAL':
      return '#34C759';
    case 'WARNING':
    case 'HIGH':
      return '#FF9500';
    case 'CRITICAL':
      return '#FF3B30';
    case 'LOW':
      return '#0A84FF';
    default:
      return '#9CA3AF';
  }
}

/**
 * Format a number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

/**
 * Format a timestamp to time string
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format a timestamp to date string
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Simulate gradual value change (smooth random walk)
 */
export function simulateGradualChange(
  currentValue: number,
  targetValue: number,
  maxStep: number,
  min: number,
  max: number
): number {
  const direction = targetValue > currentValue ? 1 : -1;
  const step = Math.random() * maxStep * direction;
  const newValue = currentValue + step;
  return clamp(newValue, min, max);
}

/**
 * Get occupancy percentage
 */
export function getOccupancyPercentage(current: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.round((current / capacity) * 100);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get icon name for notification category
 */
export function getNotificationIcon(category: string): string {
  switch (category) {
    case 'ENVIRONMENT': return 'leaf';
    case 'OCCUPANCY': return 'account-group';
    case 'DEVICES': return 'devices';
    case 'SYSTEM': return 'cog';
    case 'AUTOMATION': return 'robot';
    default: return 'bell';
  }
}
