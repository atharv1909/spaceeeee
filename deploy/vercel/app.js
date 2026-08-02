// ═══════════════════════════════════════════════════════════════════════
// SHARED STATE & WS
// ═══════════════════════════════════════════════════════════════════════
let ws = null;
let wsConnected = false;
let eventCount = 0;

// Chart Instances
let jensenChart = null;
let anomalyChart = null;
let actionChart = null;

const WS_URL = location.protocol === "https:" ? "wss://" + location.host + "/ws" : "ws://" + location.host + "/ws";

function initApp() {
    connectWS();
    initCharts();
    fetchStatus();
    checkModelStatus();
    setInterval(fetchStatus, 5000);
    setInterval(checkModelStatus, 10000);
}

function connectWS() {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
        wsConnected = true;
        updateDot("dot-ws", "on");
        addLog("SYSTEM", "WebSocket connected");
    };
    ws.onclose = () => {
        wsConnected = false;
        updateDot("dot-ws", "off");
        addLog("SYSTEM", "WebSocket disconnected — reconnecting in 3s…");
        setTimeout(connectWS, 3000);
    };
    ws.onmessage = (e) => {
        try {
            handleMessage(JSON.parse(e.data));
        } catch (err) {
            console.warn("WS parse error:", err);
        }
    };
}
setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
}, 30000);

// ═══════════════════════════════════════════════════════════════════════
// CHARTS INITIALIZATION (CHART.JS)
// ═══════════════════════════════════════════════════════════════════════
function initCharts() {
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Perception - Jensen Gain Line Chart
    const ctxPerc = document.getElementById('chart-perception');
    if (ctxPerc) {
        jensenChart = new Chart(ctxPerc, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Jensen Gain (°)', data: [], borderColor: '#FF6F00', backgroundColor: 'rgba(255, 111, 0, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 30 } } }
        });
    }

    // 2. Cognition - Radar Chart
    const ctxCog = document.getElementById('chart-cognition');
    if (ctxCog) {
        anomalyChart = new Chart(ctxCog, {
            type: 'radar',
            data: {
                labels: ['Thermal', 'Pose', 'Sensor', 'System', 'Navigation'],
                datasets: [{ label: 'Anomaly Influence', data: [0, 0, 0, 0, 0], backgroundColor: 'rgba(255, 61, 0, 0.2)', borderColor: '#FF3D00', pointBackgroundColor: '#FF3D00' }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
        });
    }

    // 3. Action - Counterfactuals Bar Chart
    const ctxAct = document.getElementById('chart-action');
    if (ctxAct) {
        actionChart = new Chart(ctxAct, {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Evaluation Score', data: [], backgroundColor: '#FFB300' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════
// DATA HANDLING (REAL DATA FROM WS)
// ═══════════════════════════════════════════════════════════════════════
function handleMessage(msg) {
    if (msg.type === "initial_state") {
        if (msg.latest) {
            if (msg.latest.perception) updatePerception(msg.latest.perception);
            if (msg.latest.cognition) updateCognition(msg.latest.cognition);
            if (msg.latest.action) updateAction(msg.latest.action);
        }
    }
    else if (msg.type === "redis_message") {
        const ch = msg.channel;
        const d = msg.data;
        if (ch === "perception.out") updatePerception(d);
        else if (ch === "cognition.out") updateCognition(d);
        else if (ch === "action.out") updateAction(d);
        addLog(ch, JSON.stringify(d).substring(0, 50) + "...");
    }
}

function updatePerception(d) {
    const valEl = document.getElementById("jg-value");
    if (valEl) valEl.textContent = (d.jensen_gain || 0).toFixed(2) + "°";
    
    // Update Chart
    if (jensenChart && d.jensen_gain !== undefined) {
        const now = new Date().toLocaleTimeString();
        jensenChart.data.labels.push(now);
        jensenChart.data.datasets[0].data.push(d.jensen_gain);
        if (jensenChart.data.labels.length > 20) { jensenChart.data.labels.shift(); jensenChart.data.datasets[0].data.shift(); }
        jensenChart.update('none');
    }
}

function updateCognition(d) {
    const el = document.getElementById("cog-rec");
    if (el) el.textContent = d.recommended_action || "—";

    if (anomalyChart && d.anomaly_type) {
        let idx = anomalyChart.data.labels.indexOf(d.anomaly_type);
        if (idx === -1) idx = 3; // default to System
        anomalyChart.data.datasets[0].data[idx] = (d.novelty_score || 0.5) * 100;
        anomalyChart.update();
    }
}

function updateAction(d) {
    const el = document.getElementById("act-primary");
    if (el) el.textContent = d.primary_action || "—";

    if (actionChart) {
        const labels = [d.primary_action || "Primary"];
        const data = [d.primary_score || 0];
        if (d.alternatives) {
            d.alternatives.forEach(a => {
                labels.push(a.action);
                data.push(a.score);
            });
        }
        actionChart.data.labels = labels;
        actionChart.data.datasets[0].data = data;
        actionChart.update();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// API UTILS
// ═══════════════════════════════════════════════════════════════════════
async function fetchStatus() {
    try {
        const r = await fetch("/api/status");
        const d = await r.json();
        const el = document.getElementById("stat-decisions");
        if (el) el.textContent = d.decision_count || 0;
        updateDot("dot-orch", d.orchestrator_running ? "on" : "off");
    } catch (e) { }
}

async function checkModelStatus() {
    try {
        const r = await fetch("/api/model/status");
        const d = await r.json();
        updateDot("dot-model", d.loaded ? "on" : "off");
    } catch (e) { }
}

function updateDot(id, state) {
    const el = document.getElementById(id);
    if (el) el.className = "dot " + state;
}

function addLog(channel, text) {
    const el = document.getElementById("event-log");
    if (!el) return;
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
    const div = document.createElement("div");
    div.className = "log-entry";
    div.innerHTML = `<span class="log-time">${time}</span> <span class="log-ch">${channel}</span> ${text}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    while (el.children.length > 100) el.removeChild(el.firstChild);
}

// Start app when DOM loaded
document.addEventListener("DOMContentLoaded", initApp);
