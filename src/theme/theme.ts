// ==========================================
// Theme System — Light & Dark Mode Tokens
// ==========================================

export interface ThemeColors {
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGhost: string;

  // Accent
  accent: string;
  accentLight: string;

  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  critical: string;
  criticalLight: string;
  info: string;
  infoLight: string;

  // Background
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardElevated: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderLight: string;
  divider: string;

  // Navigation
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  statusBar: string;

  // Misc
  overlay: string;
  skeleton: string;
  shadow: string;
  inputBackground: string;
  placeholder: string;

  // Metric specific
  temperature: string;
  humidity: string;
  co2: string;
  light: string;
  occupancy: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeTypography {
  h1: { fontSize: number; fontWeight: string; lineHeight: number };
  h2: { fontSize: number; fontWeight: string; lineHeight: number };
  h3: { fontSize: number; fontWeight: string; lineHeight: number };
  h4: { fontSize: number; fontWeight: string; lineHeight: number };
  body: { fontSize: number; fontWeight: string; lineHeight: number };
  bodySmall: { fontSize: number; fontWeight: string; lineHeight: number };
  caption: { fontSize: number; fontWeight: string; lineHeight: number };
  label: { fontSize: number; fontWeight: string; lineHeight: number };
  metric: { fontSize: number; fontWeight: string; lineHeight: number };
  metricUnit: { fontSize: number; fontWeight: string; lineHeight: number };
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
  shadow: {
    sm: object;
    md: object;
    lg: object;
  };
}

// ---- Shared Design Tokens ----

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius: ThemeBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const typography: ThemeTypography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  metric: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  metricUnit: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
};

// ---- Light Theme ----

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#0A84FF',
    primaryLight: '#E8F4FD',
    primaryDark: '#0066CC',
    primaryGhost: 'rgba(10, 132, 255, 0.08)',

    accent: '#00BCD4',
    accentLight: '#E0F7FA',

    success: '#34C759',
    successLight: '#E8F9EE',
    warning: '#FF9500',
    warningLight: '#FFF4E6',
    critical: '#FF3B30',
    criticalLight: '#FFEBEA',
    info: '#5856D6',
    infoLight: '#EEEEFF',

    background: '#F2F4F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',

    text: '#1A1D26',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    border: '#E5E7EB',
    borderLight: '#F0F1F3',
    divider: '#F0F1F3',

    tabBar: '#FFFFFF',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#9CA3AF',
    statusBar: '#F2F4F7',

    overlay: 'rgba(0, 0, 0, 0.5)',
    skeleton: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.08)',
    inputBackground: '#F7F8FA',
    placeholder: '#C4C9D4',

    temperature: '#FF6B35',
    humidity: '#0A84FF',
    co2: '#34C759',
    light: '#FFD60A',
    occupancy: '#AF52DE',
  },
  spacing,
  borderRadius,
  typography,
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

// ---- Dark Theme ----

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    primaryLight: '#1A2A3D',
    primaryDark: '#409CFF',
    primaryGhost: 'rgba(10, 132, 255, 0.12)',

    accent: '#00BCD4',
    accentLight: '#0D3D44',

    success: '#30D158',
    successLight: '#0D3520',
    warning: '#FF9F0A',
    warningLight: '#3D2E0A',
    critical: '#FF453A',
    criticalLight: '#3D1512',
    info: '#5E5CE6',
    infoLight: '#1E1D3D',

    background: '#0D0F14',
    surface: '#1C1E26',
    surfaceElevated: '#252830',
    card: '#1C1E26',
    cardElevated: '#252830',

    text: '#F2F4F7',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    textInverse: '#1A1D26',

    border: '#2C2F38',
    borderLight: '#23262E',
    divider: '#23262E',

    tabBar: '#1C1E26',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#6B7280',
    statusBar: '#0D0F14',

    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#2C2F38',
    shadow: 'rgba(0, 0, 0, 0.3)',
    inputBackground: '#252830',
    placeholder: '#4B5058',

    temperature: '#FF6B35',
    humidity: '#0A84FF',
    co2: '#30D158',
    light: '#FFD60A',
    occupancy: '#BF5AF2',
  },
  spacing,
  borderRadius,
  typography,
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
