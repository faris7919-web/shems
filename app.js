// SHEMS - main script

// The hardware is not connected yet, so every reading is 0 and the home runs on the grid.
// When the SHEMS controller is ready, set this to true and fill the readings from it.
const SYSTEM_ONLINE = false;

// The battery can supply at most 60 W, so the total load must stay under this
const BATTERY_CAPACITY = 60;

// The three critical loads
const loads = [
  { id: 1, name: "Medical Device", info: "Equipment for a patient at home", emoji: "🩺", on: false, current: 0, power: 0 },
  { id: 2, name: "Refrigerator", info: "Keeps food and medicine cold", emoji: "🧊", on: false, current: 0, power: 0 },
  { id: 3, name: "Air Conditioner", info: "Keeps the room cool", emoji: "❄️", on: false, current: 0, power: 0 },
];

// "grid" normally, "battery" when the ATS switches during an outage
let powerSource = "grid";

// SMS alerts that were sent
let alerts = [];

// ---------- Saving on the phone ----------

function saveData() {
  const data = { on: loads.map((load) => load.on), alerts: alerts };
  localStorage.setItem("shems", JSON.stringify(data));
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem("shems"));
  if (!saved) return;
  loads.forEach((load, i) => (load.on = saved.on[i]));
  alerts = saved.alerts;
}

// ---------- Showing the data ----------

function showPowerSource() {
  document.getElementById("gridBox").classList.toggle("active", powerSource === "grid");
  document.getElementById("batteryBox").classList.toggle("active", powerSource === "battery");

  let text = "Running on grid power.";
  if (powerSource === "battery") text = "Grid power lost. The ATS switched the home to the battery.";
  if (!SYSTEM_ONLINE) text = "Running on grid power (system offline).";
  document.getElementById("sourceText").textContent = text;
}

function showLoads() {
  let html = "";
  for (const load of loads) {
    html += `
      <div class="load">
        <div class="emoji">${load.emoji}</div>
        <div class="load-info">
          <b>Load ${load.id}: ${load.name}</b>
          <small>${load.info}</small>
          <div class="readings">
            <div>${load.current.toFixed(2)} <span>A</span></div>
            <div>${load.power} <span>W</span></div>
            <div>${load.on ? "ON" : "OFF"}</div>
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${load.on ? "checked" : ""} ${SYSTEM_ONLINE ? "" : "disabled"}
            onchange="toggleLoad(${load.id})" aria-label="Turn ${load.name} on or off">
          <span class="slider" onclick="offlineMessage()"></span>
        </label>
      </div>`;
  }
  document.getElementById("loads").innerHTML = html;
}

function showLoadManagement() {
  let total = 0;
  for (const load of loads) total += load.power;

  const percent = (total / BATTERY_CAPACITY) * 100;
  const bar = document.getElementById("loadBar");
  bar.style.width = Math.min(percent, 100) + "%";
  bar.classList.toggle("high", percent >= 80 && percent <= 100);
  bar.classList.toggle("over", percent > 100);

  let text = "Total load is safe.";
  if (percent >= 80) text = "Warning: total load is close to the battery limit.";
  if (percent > 100) text = "Overload! Total load is above the 60 W battery capacity.";
  if (!SYSTEM_ONLINE) text = "No readings while the system is offline.";

  document.getElementById("totalPower").textContent = total;
  document.getElementById("loadText").textContent = text;
}

function showAlerts() {
  const list = document.getElementById("alertList");
  if (alerts.length === 0) {
    list.innerHTML = '<li class="empty">No alerts yet.</li>';
    return;
  }
  list.innerHTML = alerts.map((alert) => `<li>📩 ${alert}</li>`).join("");
}

function showAll() {
  document.getElementById("offlineWarning").style.display = SYSTEM_ONLINE ? "none" : "block";
  document.getElementById("footerStatus").textContent = SYSTEM_ONLINE ? "System online" : "System offline";
  showPowerSource();
  showLoadManagement();
  showLoads();
  showAlerts();
}

// ---------- Buttons ----------

function toggleLoad(id) {
  const load = loads.find((l) => l.id === id);
  load.on = !load.on;
  saveData();
  showAll();
  showToast(`${load.name} turned ${load.on ? "on" : "off"}`);
}

function offlineMessage() {
  if (!SYSTEM_ONLINE) showToast("System offline - can't control loads yet");
}

function resetAll() {
  if (!confirm("Reset SHEMS? All loads will be turned off and the alert list will be cleared.")) return;
  loads.forEach((load) => {
    load.on = false;
    load.current = 0;
    load.power = 0;
  });
  alerts = [];
  powerSource = "grid";
  localStorage.removeItem("shems");
  showAll();
  showToast("SHEMS has been reset");
}

// Small message at the bottom of the screen
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ---------- Start ----------

document.getElementById("resetButton").addEventListener("click", resetAll);

try {
  loadData();
} catch (error) {
  localStorage.removeItem("shems");
}
showAll();

// Hide the splash screen after one second (only the first time the app opens)
const splash = document.getElementById("splash");
if (sessionStorage.getItem("splashShown")) {
  splash.style.display = "none";
} else {
  sessionStorage.setItem("splashShown", "yes");
  setTimeout(() => splash.classList.add("hide"), 1000);
}

// The service worker lets the app open without internet after the first visit
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
