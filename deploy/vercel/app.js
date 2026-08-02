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
        setServerStatus("live", "Live");
        updateDot("dot-ws", "on");
        addLog("SYSTEM", "WebSocket connected");
    };
    ws.onclose = () => {
        wsConnected = false;
        setServerStatus("offline", "Offline");
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

function setServerStatus(stateClass, text) {
    document.querySelectorAll(".server-status").forEach(el => {
        el.className = "server-status " + stateClass;
        el.innerHTML = `<div class="indicator"></div> ${text}`;
    });
}

// Wakeup call logic for HF Spaces
async function triggerWakeup() {
    setServerStatus("waking", "Waking Up…");
    try {
        await fetch("/api/status", { method: "HEAD" });
    } catch (e) {
        // Will be handled by ws.onopen when it eventually connects
    }
}

document.addEventListener("DOMContentLoaded", () => {
    triggerWakeup();
    initApp();
});
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

/* --- LEGACY UI FUNCTIONS --- */
let cameraStream = null;
let autoCapInterval = null;
let trajectoryTrail = [];
const MAX_TRAIL = 50;
let overrideLevel = "acknowledge";
let lastJG = 0;
let hasLaunched = false;

function updateGauge(jg, conf, trust) {
    const val = typeof jg === "number" ? jg : 0;
    lastJG = val;

    // Needle rotation: 0° → -90deg (left), 30° → +90deg (right)
    const angle = -90 + (Math.min(val, 30) / 30) * 180;
    const needle = document.getElementById("gauge-needle");
    needle.style.transform = `rotate(${angle}deg)`;

    // Color the value
    const valEl = document.getElementById("jg-value");
    valEl.textContent = fmtNum(val) + "°";
    if (val <= 5) { valEl.style.color = "var(--green)"; valEl.style.textShadow = "0 0 20px rgba(16,185,129,0.4)"; }
    else if (val <= 15) { valEl.style.color = "var(--amber)"; valEl.style.textShadow = "0 0 20px rgba(245,158,11,0.4)"; }
    else { valEl.style.color = "var(--red)"; valEl.style.textShadow = "0 0 20px rgba(239,68,68,0.4)"; }

    // Confidence tag
    const confEl = document.getElementById("jg-conf-tag");
    confEl.textContent = (conf ?? "—").toUpperCase();
    confEl.className = "tag " + (conf === "high" ? "green" : conf === "moderate" ? "amber" : conf === "low" ? "red" : "cyan");

    // Trust indicator
    const trustEl = document.getElementById("jg-trust");
    if (trust === true) { trustEl.innerHTML = '<span style="color:var(--green)">✓ Trustworthy</span>'; }
    else if (trust === false) { trustEl.innerHTML = '<span style="color:var(--red)">✗ Untrustworthy</span>'; }
    else { trustEl.textContent = "—"; }
}

function drawTrajectory() {
    const canvas = document.getElementById("traj-canvas");
    if (!canvas) return; const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = W / 40; // ±20m maps to full canvas

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#060a10";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(30, 41, 59, 0.6)";
    ctx.lineWidth = 0.5;
    for (let i = -20; i <= 20; i += 5) {
        const px = cx + i * scale;
        const py = cy - i * scale;
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#334155";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("X", W - 10, cy - 4);
    ctx.fillText("Y", cx + 10, 12);

    // Keepout zone (10m radius, dashed red circle)
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Keepout label
    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("KEEPOUT 10m", cx, cy - 10 * scale - 6);

    // Target station at center
    ctx.save();
    ctx.translate(cx, cy);
    // Draw a small station icon (cross + circle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
    // Solar panels
    ctx.fillStyle = "rgba(0, 212, 255, 0.15)";
    ctx.fillRect(-18, -3, 10, 6);
    ctx.fillRect(8, -3, 10, 6);
    ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
    ctx.strokeRect(-18, -3, 10, 6);
    ctx.strokeRect(8, -3, 10, 6);
    ctx.restore();

    // Trail
    for (let i = 0; i < trajectoryTrail.length; i++) {
        const p = trajectoryTrail[i];
        const px = cx + p[0] * scale;
        const py = cy - p[1] * scale; // Y inverted for screen coords
        const alpha = 0.1 + (i / trajectoryTrail.length) * 0.7;
        const radius = 1.5 + (i / trajectoryTrail.length) * 2;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.fill();

        // Line connecting trail dots
        if (i > 0) {
            const prev = trajectoryTrail[i - 1];
            ctx.beginPath();
            ctx.moveTo(cx + prev[0] * scale, cy - prev[1] * scale);
            ctx.lineTo(px, py);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Current position (last in trail)
    if (trajectoryTrail.length > 0) {
        const cur = trajectoryTrail[trajectoryTrail.length - 1];
        const px = cx + cur[0] * scale;
        const py = cy - cur[1] * scale;

        // Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
        grad.addColorStop(0, "rgba(0, 212, 255, 0.5)");
        grad.addColorStop(1, "rgba(0, 212, 255, 0)");
        ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        // Dot
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#00d4ff"; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
        ctx.stroke();

        // Distance readout
        const dist = Math.sqrt(cur[0] * cur[0] + cur[1] * cur[1] + (cur[2] || 0) * (cur[2] || 0));
        document.getElementById("traj-dist").textContent = `Distance: ${dist.toFixed(2)} m`;
    }
}

async function toggleCamera() {
    const video = document.getElementById("cam-video");
    const btn = document.getElementById("btn-cam-toggle");
    const badge = document.getElementById("cam-badge");
    const captureBtn = document.getElementById("btn-capture");

    if (cameraStream) {
        // Stop
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
        video.srcObject = null;
        btn.textContent = "▶ Start Camera";
        badge.className = "cam-badge off";
        badge.textContent = "OFF";
        captureBtn.disabled = true;
        if (autoCapInterval) { clearInterval(autoCapInterval); autoCapInterval = null; }
        document.getElementById("chk-auto").checked = false;
    } else {
        // Start
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            video.srcObject = cameraStream;
            btn.textContent = "■ Stop Camera";
            badge.className = "cam-badge live";
            badge.textContent = "● LIVE";
            captureBtn.disabled = false;
        } catch (err) {
            addLog("SYSTEM", "Camera error: " + err.message);
        }
    }
}

async function captureAndAnalyze() {
    const video = document.getElementById("cam-video");
    const canvas = document.getElementById("cam-canvas");
    if (!cameraStream) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    if (!canvas) return; const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    await sendFrameToAPI(base64);
}

async function sendFrameToAPI(base64Data) {
    const timeEl = document.getElementById("cam-inference-time");
    timeEl.textContent = "Analyzing…";
    const t0 = performance.now();

    try {
        const r = await fetch("/api/perception/frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Data })
        });
        const d = await r.json();
        const dt = (performance.now() - t0).toFixed(0);
        timeEl.textContent = `Last inference: ${dt} ms`;
        if (d.error) {
            addLog("SYSTEM", "Frame analysis error: " + d.error);
        } else {
            addLog("SYSTEM", `Frame analyzed (${dt}ms)`);
        }
    } catch (err) {
        timeEl.textContent = "Inference failed";
        addLog("SYSTEM", "Frame POST failed: " + err.message);
    }
}

function toggleAutoCapture() {
    const checked = document.getElementById("chk-auto").checked;
    if (checked && cameraStream) {
        autoCapInterval = setInterval(captureAndAnalyze, 3000);
        addLog("SYSTEM", "Auto-capture enabled (3s interval)");
    } else {
        if (autoCapInterval) { clearInterval(autoCapInterval); autoCapInterval = null; }
    }
}

async function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        await sendFrameToAPI(base64);
    };
    reader.readAsDataURL(file);
}

async function startOrch() {
    const btn = document.getElementById("btn-start");
    btn.disabled = true;
    btn.textContent = "Starting…";
    try {
        const r = await fetch("/api/orchestrator/start", { method: "POST" });
        const d = await r.json();
        if (d.error) {
            addLog("SYSTEM", "Error: " + d.error);
            btn.disabled = false;
        } else {
            updateDot("dot-orch", "on");
            document.getElementById("btn-stop").disabled = false;
        }
    } catch (e) {
        addLog("SYSTEM", "Failed to start: " + e.message);
        btn.disabled = false;
    }
    btn.textContent = "▶ Start Orchestrator";
}

async function stopOrch() {
    try {
        await fetch("/api/orchestrator/stop", { method: "POST" });
        updateDot("dot-orch", "off");
        document.getElementById("btn-start").disabled = false;
        document.getElementById("btn-stop").disabled = true;
    } catch (e) {
        addLog("SYSTEM", "Failed to stop: " + e.message);
    }
}

async function runScenario() {
    const name = document.getElementById("scenario-select").value;
    const btn = document.getElementById("btn-scenario");
    btn.disabled = true;
    try {
        const r = await fetch(`/api/scenario/${name}`, { method: "POST" });
        const d = await r.json();
        if (d.error) {
            addLog("SYSTEM", "Scenario error: " + d.error);
            btn.disabled = false;
        } else {
            updateDot("dot-scenario", "on");
            document.getElementById("stat-scenario").textContent = name;
        }
    } catch (e) {
        addLog("SYSTEM", "Scenario failed: " + e.message);
        btn.disabled = false;
    }
}

function setOverrideLevel(level, btnEl) {
    overrideLevel = level;
    document.querySelectorAll(".override-btn").forEach(b => b.classList.remove("selected"));
    if (btnEl) btnEl.classList.add("selected");
}

async function sendOverride() {
    const action = document.getElementById("override-action").value;
    const rationale = document.getElementById("override-rationale").value;
    const statusEl = document.getElementById("override-status");

    if (overrideLevel !== "acknowledge" && !rationale.trim()) {
        statusEl.textContent = "⚠ Rationale required for L2–L4";
        statusEl.style.color = "var(--red)";
        return;
    }

    try {
        const r = await fetch("/api/override", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                level: overrideLevel,
                action: action,
                rationale: rationale,
                operator: "commander"
            })
        });
        const d = await r.json();
        if (d.error) {
            statusEl.textContent = "✗ " + d.error;
            statusEl.style.color = "var(--red)";
        } else {
            statusEl.textContent = `✓ Override: ${overrideLevel.toUpperCase()} → ${action}`;
            statusEl.style.color = "var(--green)";
            document.getElementById("override-rationale").value = "";
        }
    } catch (e) {
        statusEl.textContent = "✗ " + e.message;
        statusEl.style.color = "var(--red)";
    }
}

function addChatMsg(sender, text, route) {
    const el = document.getElementById("chat-log");
    const div = document.createElement("div");
    div.className = "chat-msg " + (sender === "YOU" ? "user" : "system");
    const routeTag = route ? ` <span class="chat-route">[${route}]</span>` : "";
    div.innerHTML = `<strong>${sender}:</strong>${routeTag} ${text.replace(/\n/g, "<br>")}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
}

function launchRocket() {
    if (hasLaunched) return;
    hasLaunched = true;
    
    const rocketCont = document.getElementById("intro-rocket");
    const rocketSvg = document.getElementById("rocket-svg");
    const overlay = document.getElementById("intro-overlay");
    const flame = document.getElementById("flame");
    
    document.querySelector(".intro-text").style.opacity = "0";
    
    flame.setAttribute("opacity", "1");
    const flicker = setInterval(() => {
        flame.setAttribute("opacity", Math.random() * 0.5 + 0.5);
    }, 50);

    rocketSvg.classList.add("vibrate");
    
    let smokeInterval = setInterval(() => {
        const p = document.createElement("div");
        p.className = "smoke-particle";
        const size = Math.random() * 60 + 40;
        p.style.width = size + "px";
        p.style.height = size + "px";
        const dx = (Math.random() - 0.5) * 300 + "px";
        const dy = (Math.random() * 150) + "px";
        const scale = Math.random() * 3 + 2;
        p.style.setProperty("--dx", dx);
        p.style.setProperty("--dy", dy);
        p.style.setProperty("--scale", scale);
        p.style.animation = `puff ${Math.random() * 0.5 + 1}s ease-out forwards`;
        rocketCont.appendChild(p);
        setTimeout(() => p.remove(), 2000);
    }, 30);

    setTimeout(() => {
        rocketSvg.classList.remove("vibrate");
        rocketCont.classList.add("launch");
        setTimeout(() => {
            clearInterval(smokeInterval);
            clearInterval(flicker);
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 1000);
        }, 800);
    }, 1500);
}


document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', async (e) => {
            if (e.key !== 'Enter') return;
            const text = e.target.value.trim();
            if (!text) return;
            e.target.value = '';
            addChatMsg('YOU', text, '');
            try {
                const r = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text })
                });
                const d = await r.json();
                addChatMsg('ORBITAL', d.response, d.route);
            } catch (err) {
                addChatMsg('ERROR', err.message, 'error');
            }
        });
    }
});
