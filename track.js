// Get DOM elements
const atsStatusDiv = document.getElementById("ats-status");
const batteryLevelDiv = document.getElementById("battery-level");
const batteryStatusDiv = document.getElementById("battery-status");
const batteryPercentageDiv = document.getElementById("battery-percentage");
const motorSpeedText = document.getElementById("motor-speed");
const flowRateText = document.getElementById("flow-rate");
const buzzerDiv = document.getElementById("buzzer");

// Battery parameters
const MAX_BATTERY = 100; // percent
const CHARGE_RATE = 0.5; // % per minute charging rate
const DISCHARGE_RATE = 1; // % per minute discharging rate
let batteryLevel = 50; // Starting battery level %

/** Motor parameters */
const frequency = 50; // Hz
const poles = 5;
const rpm = (120 * frequency) / poles; // motor speed (static)

/** Flow parameters */
const diameterCm = 5;    // Pipe diameter
const velocity = 10;      // Flow velocity in m/s

const radiusM = (diameterCm / 100) / 2;   // convert cm to meters and divide by 2
const area = Math.PI * radiusM * radiusM; // cross-sectional area (m²)
const flowRateM3s = area * velocity;      // flow in cubic meters per second (m³/s)
const flowRateLps = flowRateM3s * 1000;   // flow in liters per second (L/s)

/**
 * Check if current time is within peak hours (10:00 AM to 6:00 PM)
 * @param {Date} now - current date/time
 * @returns {boolean} true if peak hours
 */
function isPeakHours(now) {
  const startPeak = new Date(now);
  startPeak.setHours(10, 0, 0, 0);
  const endPeak = new Date(now);
  endPeak.setHours(18, 0, 0, 0);

  return now >= startPeak && now < endPeak;
}

/**
 * Update ATS status bar text and style based on peak hours
 * @param {Date} now
 */
function updateATSStatus(now) {
  if (isPeakHours(now)) {
    atsStatusDiv.textContent = "ATS Switch is in: BESS Mode (Battery supplying source)";
    atsStatusDiv.classList.add("bess-mode");
    atsStatusDiv.classList.remove("grid-mode");
  } else {
    atsStatusDiv.textContent = "ATS Switch is in: Grid Mode (Grid supplying power)";
    atsStatusDiv.classList.add("grid-mode");
    atsStatusDiv.classList.remove("bess-mode");
  }
}

/**
 * Update battery charge level and styling
 * @param {Date} now
 */
function updateBattery(now) {
  if (isPeakHours(now)) {
    // Discharging during peak hours
    batteryLevel -= DISCHARGE_RATE / 60; // per second update
    if (batteryLevel < 0) batteryLevel = 0;

    batteryStatusDiv.textContent = "Battery Status: Discharging";
    batteryLevelDiv.style.background = "linear-gradient(180deg, #f44336, #9b1c0f)";
  } else {
    // Charging during non-peak hours
    batteryLevel += CHARGE_RATE / 60;
    if (batteryLevel > MAX_BATTERY) batteryLevel = MAX_BATTERY;

    batteryStatusDiv.textContent = "Battery Status: Charging";
    batteryLevelDiv.style.background = "linear-gradient(180deg, #4CAF50, #087f23)";
  }

  batteryLevelDiv.style.height = `${batteryLevel}%`;
  batteryPercentageDiv.textContent = `Battery Level: ${batteryLevel.toFixed(1)}%`;
}

/**
 * Display motor speed with unit
 */
function updateMotorSpeed() {
  motorSpeedText.innerHTML = `${rpm.toFixed(0)} <span class="unit">RPM</span>`;
}

/**
 * Display flow rate with unit and update buzzer status & style
 */
function updateFlowRate() {
  flowRateText.innerHTML = `${flowRateLps.toFixed(2)} <span class="unit">L/s</span>`;

  if (flowRateLps > 5) {
    buzzerDiv.textContent = "🚨 Flow Limit Exceeded!";
    buzzerDiv.classList.add("buzzer-status-alert");
    buzzerDiv.classList.remove("buzzer-status-safe");
  } else {
    buzzerDiv.textContent = "SAFE";
    buzzerDiv.classList.add("buzzer-status-safe");
    buzzerDiv.classList.remove("buzzer-status-alert");
  }
}

/**
 * Main update function to refresh all data and UI every second
 */
function updateAll() {
  const now = new Date();

  updateATSStatus(now);
  updateBattery(now);
  updateMotorSpeed();
  updateFlowRate();
}

// Initialize and update every 1 second
updateAll();
setInterval(updateAll, 1000);
