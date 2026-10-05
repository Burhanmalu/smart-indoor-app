# EnviroSync AI — Smart Indoor Environment Monitoring & Automated Comfort Control System

**EnviroSync AI** is a professional, production-grade mobile application built with **React Native**, **TypeScript**, and **Expo Router**. Designed for classrooms, lecture halls, conference rooms, labs, and office spaces, EnviroSync delivers autonomous comfort management and real-time environmental telemetry powered by an edge AI inference and rule evaluation engine.

---

## 🌟 Key Capabilities

### 1. 📊 Real-Time Environmental Telemetry
* **Indoor Air Quality (IAQ) Scoring**: Dynamic 0–100 composite index calculated from ASHRAE 55 thermal comfort and air quality formulas.
* **Ambient Parameters**: Real-time tracking of Temperature (°C), Relative Humidity (%), CO₂ Concentration (ppm), and Ambient Light (lux).
* **Multi-Zone Space Management**: Switch between classrooms, auditoriums, meeting rooms, and labs with dedicated occupancy counters.

### 2. 👁 AI Vision Occupancy Detection
* **Real-time Occupancy Tracking**: Vision AI inference overlays simulated camera feeds with bounding boxes, confidence tags, and FPS telemetry.
* **Spatial Density Mapping**: Front, Middle, and Back zone density distribution analysis.
* **Privacy-First Design**: Edge-level head and occupancy extraction without capturing identifiable biometric data.

### 3. ❄ Smart Comfort Actuator Control
* **Inverter Air Conditioning (AC)**: Power toggle, precision temperature stepper (16°C – 30°C), AC modes (`COOL`, `HEAT`, `FAN`, `DRY`, `AUTO`), and multi-speed fans.
* **Ventilation Fan**: 5-level speed modulation and oscillation controls.
* **Motorized Curtains**: Position steppers (`0% Closed` to `100% Fully Open`) and automatic glare protection.
* **Smart Mode Switching**: Seamless transition between `AUTO` (AI-controlled) and `MANUAL` (user override) states.

### 4. 🧠 Autonomous AI Rule Engine
The built-in rule engine evaluates real-time telemetry every cycle:
* **High Temperature Mitigation**: `Temp > 28°C` → Sets AC to 20°C with TURBO fan speed.
* **CO₂ Flush Automation**: `CO₂ > 1000 ppm` → Sets Ventilation Fan to maximum Level 5 and issues a health alert.
* **Eco Vacancy Mode**: `Occupancy == 0` → Automatically shuts off HVAC and fans to eliminate phantom energy drain.
* **High Humidity Dehumidification**: `Humidity > 70%` → Switches AC to DRY mode.
* **Solar Glare Shielding**: `Light > 750 lux` → Closes motorized curtains to reduce heat load.

### 5. ⚡ Power & Eco Analytics
* **Real-time Power Load**: Live kW draw computed from active actuators.
* **Energy Savings Estimation**: Daily/weekly/monthly kWh savings, cost reductions ($), and avoided CO₂ footprint.
* **Subsystem Breakdown**: Visualizing HVAC, Ventilation, and Lighting consumption ratios.

### 6. 🎮 Interactive AI Demo Simulator
Inject extreme scenarios with single-tap controls to test system reactions:
1. **Heat Spike / Overheating** (`Temp = 32.5°C`)
2. **Crowded Hall / High CO₂** (`CO₂ = 1450 ppm`)
3. **Vacant Space / Eco Mode** (`Occupancy = 0`)
4. **Monsoon / High Humidity** (`Humidity = 78%`)
5. **Intense Solar Glare** (`Light = 980 lux`)
6. **Nominal Baseline** (`Balanced nominal conditions`)

---

## 🏗 Architecture & Codebase Structure

```text
smart-indoor-app/
├── app/                        # Expo Router Screen Structure
│   ├── _layout.tsx             # Root Shell (ThemeProvider, QueryClient, Gestures)
│   ├── index.tsx               # App Bootstrap & Auth Router
│   ├── (tabs)/                 # Main Bottom Tab Navigation
│   │   ├── _layout.tsx         # Tab Bar Configuration
│   │   ├── index.tsx           # Live Monitoring & AI Dashboard
│   │   ├── rooms.tsx           # Multi-Space Zone Manager
│   │   ├── controls.tsx        # Smart Actuators (AC, Fan, Curtains)
│   │   ├── energy.tsx          # Power Consumption & Eco Savings
│   │   └── settings.tsx        # Automation Rules, Hardware & Preferences
│   ├── login/index.tsx         # Role-based Authentication & Demo Login
│   ├── notifications/index.tsx # Real-Time Alert Center with Severity Filtering
│   ├── camera/index.tsx        # AI Live Stream, Bounding Boxes & Density
│   ├── analytics/index.tsx     # Historical Curves & Statistical Telemetry
│   ├── halls/index.tsx         # Zone Switcher & Space Creation Modal
│   └── demo/index.tsx          # Interactive AI Scenario Simulator
├── src/
│   ├── components/             # Reusable UI Components (Cards, Badges, Pickers)
│   ├── constants/              # Configuration Tokens, Default Rules & Mock Spaces
│   ├── hooks/                  # Custom Hooks (useTheme, useDimensions)
│   ├── mock/                   # Mock Sensor Generators & Time Series Data
│   ├── models/                 # TypeScript Interfaces & Data Contracts
│   ├── services/               # AutomationEngine, SimulationManager, MockServices
│   ├── stores/                 # Zustand State Stores (Auth, Hall, Device, Alerts)
│   ├── theme/                  # Dark & Light Design Tokens, HSL Palettes & Shadows
│   └── utils/                  # IAQ Calculations, Status Enums & Number Formatters
├── package.json
└── tsconfig.json
```

---

## 🔌 Hardware & IoT Integration (ESP32 / MQTT / REST)

The codebase follows a service-abstraction pattern. To transition from mock simulation to real physical IoT hardware:

```text
Mobile App (Zustand Stores)
        ↓
services/interfaces.ts (IDeviceService, IEnvironmentService, ICameraService)
        ↓
┌───────────────────────┴───────────────────────┐
↓                                               ↓
mockServices.ts (Mock Testing)           realMqttServices.ts (Production Hardware)
                                                ↓
                                    MQTT Broker / REST API
                                                ↓
                                      ESP32 Controller Gateway
                                                ↓
                                DHT22 + NDIR CO₂ + Relay/IR + ESP32-CAM
```

### Supported MQTT Topics (Standard Payload):
* **Telemetry Subscription**: `envirosync/{hall_id}/telemetry`
  ```json
  { "temperature": 24.5, "humidity": 52.0, "co2": 650, "light": 480, "occupancy": 18 }
  ```
* **Actuator Control Publish**: `envirosync/{hall_id}/actuators/ac/set`
  ```json
  { "power": true, "mode": "COOL", "targetTemp": 22, "fanSpeed": "AUTO" }
  ```

---

## 🚀 Running the App

### Prerequisites:
- Node.js (v18+)
- Expo Go app on Android/iOS (or Android Studio Emulator)

### Commands:
```bash
# Navigate to the app directory
cd smart-indoor-app

# Start the Expo development server
npx expo start

# Open on Android emulator or connected device
npx expo start --android

# Open on Web browser
npx expo start --web
```
