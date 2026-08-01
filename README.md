<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,25:1a0a2e,50:2d1b4e,75:4a1942,100:ff69b4&height=250&section=header&text=🌸%20SYMBIOSIS%20🛸&fontSize=45&fontColor=FFB7C5&fontAlignY=35&desc=Synchronous%20Multi-modal%20Belief%20Integration%20with%20Orbital%20Self-Interpretability&descSize=16&descColor=00F0FF&descAlignY=55&animation=twinkling" width="100%" />
</div>

<div align="center">
  <br>
  
  <h1><a href="https://github.com/atharv1909/spacecraft_autonomy">Spacecraft Autonomy</a></h1>
  <p><b>Next-Generation Mission Control Dashboard & Deep Learning Perception Engine</b></p>

  <div>
    <img src="https://img.shields.io/badge/Python-1a0a2e?style=for-the-badge&logo=python&logoColor=FFB7C5" />
    <img src="https://img.shields.io/badge/PyTorch-1a0a2e?style=for-the-badge&logo=pytorch&logoColor=FF69B4" />
    <img src="https://img.shields.io/badge/FastAPI-1a0a2e?style=for-the-badge&logo=fastapi&logoColor=00F0FF" />
    <img src="https://img.shields.io/badge/Redis-1a0a2e?style=for-the-badge&logo=redis&logoColor=FF69B4" />
    <img src="https://img.shields.io/badge/React-1a0a2e?style=for-the-badge&logo=react&logoColor=00F0FF" />
    <img src="https://img.shields.io/badge/Google_Cloud-1a0a2e?style=for-the-badge&logo=google-cloud&logoColor=FFB7C5" />
    <img src="https://img.shields.io/badge/Vercel-1a0a2e?style=for-the-badge&logo=vercel&logoColor=FFB7C5" />
    <img src="https://img.shields.io/badge/Docker-1a0a2e?style=for-the-badge&logo=docker&logoColor=00F0FF" />
  </div>
  <br>

  <a href="https://spacecraft-autonomy-222404104450.us-central1.run.app">
    <img src="https://img.shields.io/badge/🚀_Live_Mission_Control_API-Online_Now-FF69B4?style=for-the-badge&labelColor=1a0a2e" alt="Live Demo" />
  </a>
  
  <br><br>
  
  <a href="https://drive.google.com/file/d/1rGZc2U9Tka9Y5hptENpVN2ygPPBFtmC1/view?usp=sharing">
    <img src="https://img.shields.io/badge/📊_Presentation_Deck-View_PPT-FFB7C5?style=for-the-badge&labelColor=1a0a2e" alt="PPT" />
  </a>
  &nbsp;
  <a href="https://drive.google.com/file/d/1tRe4g0OSXEOo_8i0c-IFaLqd2fFTZo9F/view?usp=sharing">
    <img src="https://img.shields.io/badge/🎬_Demo_Video-Watch_Now-00F0FF?style=for-the-badge&labelColor=1a0a2e" alt="Demo Video" />
  </a>
  &nbsp;
  <a href="https://www.youtube.com/watch?v=SMy10IucqB8">
    <img src="https://img.shields.io/badge/▶️_YouTube-Watch_on_YT-FF69B4?style=for-the-badge&logo=youtube&logoColor=white&labelColor=1a0a2e" alt="YouTube" />
  </a>
</div>

<br>



## 🌸 Overview

When dealing with deep space autonomous docking, simply knowing the pose of a target satellite isn't enough—you need to know exactly how **trustworthy** that prediction is. 

This project addresses the critical challenge of **Synchronous Multi-modal Belief Integration with Orbital Self-Interpretability** for spacecraft. In deep-space proximity operations and habitat management, AI systems perform environment perception (pose estimation) and anomaly response (autonomous control) — but often operate as disconnected black boxes. This system bridges *"what the AI sees"* and *"why the AI acts"* to prevent fatal delays during communication blackouts (up to 20+ minutes for Mars missions).

The complete stack pairs a state-of-the-art deep learning perception engine with a strict, mathematically rigorous **Jensen Gain Uncertainty Monitor** utilizing Hopf Fibration grid anchors, a **Hyperdimensional Computing (HDC) Cognition Layer**, and a **Digital Twin** powered action engine — all coordinated by a multi-agent **Orchestrator** over a **Redis Pub/Sub** backbone.

In short: *If the neural network is guessing, the spacecraft refuses to dock.*

<div align="center"><code>⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆</code></div>

<br>

## ✨ Core Architecture — 6-Phase Multi-Agent System

### 🧠 Phase 1 · Perception Agent (`perception/`)
- **Model:** 101MB `PoseNet_ResNet50` — 6-DoF pose estimation (rotation + translation) from single RGB frames
- **Backbone:** `EfficientNet-B3` (default) / `ResNet-50` with `SiLU` activations and 0.3 dropout
- **Dual Output Heads:** Quaternion (4D) + Translation (3D)
- **Normalization:** Auto-detects real-world SunLAMP imagery vs. synthetic data to flawlessly normalize lighting across extreme space environments
- **Uncertainty:** Jensen Gain monitor evaluates prediction consistency across in-plane rotations via `HopfFibrationGrid` anchors on SO(3)

### 🛡️ Phase 2 · Cognition Agent (`cognition/`)
- **Hyperdimensional Computing (HDC)** engine with bipolar vectors in **D = 10,000 dimensions**
- **One-Shot Anomaly Detection** via k-NN similarity search in Associative Memory
- **Explainability Interface** — decomposes situation vectors into human-readable component influence percentages (pose, anomaly, mission phase, uncertainty)
- Pipeline: *Pose Encoding → Anomaly Encoding → Situation Binding → One-Shot Detection → Narrative Generation*

### ⚡ Phase 3 · Action Agent (`action/`)
- **Digital Twin** — uncertainty-aware Monte-Carlo propagation (100 ensembles) across 3 time horizons (tactical 1m, operational 10m, strategic 1h)
- **First-Principles Physics:** CWH orbital dynamics, quaternion attitude propagation, thermal/power/life-support models, thruster allocation via TAM pseudoinverse
- **Counterfactual Engine:** Evaluates 7 candidate actions (`ABORT`, `HOLD`, `PROCEED_SLOW`, `PROCEED_NORMAL`, `RECONFIGURE_POWER`, `ISOLATE_MODULE`, `EMERGENCY_VENT`)

### 🛰️ Phase 4 · Interface Agent (`interface/`)
A beautifully crafted mission control dashboard (FastAPI + WebSocket) handling live telemetry, inference metrics, and protocol overrides.
- **Armstrong Protocol:** 4-level human override system (`acknowledge` → `modify` → `replace` → `reject`) allowing mission control engineers to seamlessly override perception decisions dynamically if anomalies are detected in orbit
- **Real-time Camera Processing:** Upload frames for live `PoseNet_ResNet50` inference with Jensen Gain uncertainty scoring

### 🔗 Phase 5 · Orchestrator (`orchestrator/`)
- **Consensus Engine:** Weighted multi-agent voting (Perception 30% · Cognition 40% · Action 30%) with conflict resolution
- **State Manager:** Thread-safe shared state with stale-data detection (Perception: 2s, Cognition/Action: 5s)
- **Safety-First Ranking:** `ABORT > EMERGENCY_VENT > HOLD_POSITION > ... > PROCEED_NORMAL`
- **Armstrong Timeout:** 30-second escalation window; defaults to `HOLD_POSITION` if no human response

### 🧪 Phase 6 · Simulation Engine (`simulation/`)
- **Scenario Engine:** Scripted end-to-end test scenarios without real hardware
- **Pre-built Scenarios:** Nominal approach, thermal anomaly, perception challenge, perfect storm
- **Event Types:** Anomaly, perception challenge, power failure, communication loss

<div align="center"><code>⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆</code></div>

<br>

## 📡 Inter-Agent Communication

All agents communicate over a **Redis Pub/Sub** backbone with typed dataclass messages:

| Channel | Message Type | Direction |
|---|---|---|
| `perception.out` | `PoseEstimateMessage` | Agent → Orchestrator |
| `cognition.out` | `SituationVectorMessage` | Agent → Orchestrator |
| `action.out` | `ActionRecommendationMessage` | Agent → Orchestrator |
| `human.in` | `HumanOverrideMessage` | Dashboard → Orchestrator |
| `orchestrator.consensus` | `ConsensusActionMessage` | Orchestrator → All |
| `orchestrator.escalation` | `EscalationMessage` | Orchestrator → Dashboard |

<div align="center"><code>⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆</code></div>

<br>

## 🛡️ Uncertainty & Trust — Jensen Gain Monitor

Standard pose estimation networks suffer from symmetry ambiguity. This system mitigates that by actively rotating the input along $N$ planar orientations using a **Hopf Fibration grid** on SO(3) (default: 1024 anchors, mean gap ~3.8°), generating a normalized entropy curve:

| Jensen Gain | Confidence | Behavior |
|---|---|---|
| **< 25°** | 🌸 High | Stable internal feature maps. Prediction is rock solid. |
| **25° - 55°** | 🌙 Moderate | Acceptable prediction but handled with caution. |
| **> 55°** | 💫 Untrustworthy | Network instability detected. Override required. |

<div align="center"><code>⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆</code></div>

<br>

## 🚀 Live Deployments

- **Frontend Application:** Deployed via **Vercel** for instant Edge distribution.
- **Backend Inference API:** Deployed as a scalable, 2GiB Dockerized container on **Google Cloud Run** (CPU-only PyTorch + embedded Redis).

<div align="center"><code>⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆</code></div>

<br>

## 📂 Project Structure

```
spacecraft_autonomy/
├── perception/          # Phase 1: Pose Estimation & Uncertainty (ResNet-50 / EfficientNet-B3)
│   ├── models/          #   PoseNet, HopfFibrationGrid, JensenGainMonitor
│   └── checkpoints/     #   best.pt (101MB, Git LFS)
├── cognition/           # Phase 2: Hyperdimensional Cognition (HDC D=10,000)
├── action/              # Phase 3: Digital Twin & Counterfactual Engine
├── interface/           # Phase 4: FastAPI Dashboard + WebSocket Telemetry
├── orchestrator/        # Phase 5: Consensus Engine & Armstrong Protocol
├── simulation/          # Phase 6: Scenario Engine & Test Harnesses
├── backend/             # Backend API utilities
├── deploy/vercel/       # Vercel frontend deployment
├── Dockerfile           # Multi-stage Docker build (Python 3.11 + Redis)
└── DEVELOPER_DOCUMENTATION.docx  # Full developer reference
```

<div align="center"><code>⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆ ─────────────── ⋆｡˚ 🌸 ˚｡⋆</code></div>

<br>

## ⚙️ Installation & Usage

Because this repository contains a massive 101MB `.pt` Deep Learning model, **Git LFS** is required to clone it properly.

```bash
# 1. Install Git LFS
git lfs install

# 2. Clone the repository
git clone https://github.com/atharv1909/spacecraft_autonomy.git

# 3. Enter directory and setup environment
cd spacecraft_autonomy
python -m venv venv
source venv/bin/activate  # (or venv\Scripts\activate on Windows)

# 4. Install PyTorch (CPU-only build, same as the Dockerfile uses)
pip install torch==2.2.0+cpu torchvision==0.17.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# 5. Install the rest of the dependencies
pip install -r requirements_web.txt
```

> Skipping step 4 doesn't break anything (`timm` in requirements_web.txt
> pulls torch/torchvision transitively either way), but it silently
> downloads the default multi-GB CUDA build from PyPI instead of the small
> CPU-only build actually used in the Docker image — do step 4 first if you
> want your local setup to match production.

### Running Locally

```bash
# Start Redis (required for inter-agent communication)
redis-server --daemonize yes

# Start the web dashboard + perception backend
python interface/app.py

# Or with uvicorn for development (auto-reload)
uvicorn interface.app:app --host 0.0.0.0 --port 8000 --reload
```

The dashboard will be available at **http://localhost:8000**.

### Running Test Scenarios

```bash
# Trigger a scenario via the API (e.g., thermal anomaly at 5x speed)
curl -X POST "http://localhost:8000/api/scenario/thermal?speed=5.0"
```

<div align="center"><code>⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆ ─────────────── ⋆｡˚ ✿ ˚｡⋆</code></div>

<br>

## 🌸 Resources & Links

<div align="center">

| Resource | Link |
|---|---|
| 📊 **Presentation Deck** | [View PPT on Google Drive](https://drive.google.com/file/d/1rGZc2U9Tka9Y5hptENpVN2ygPPBFtmC1/view?usp=sharing) |
| 🎬 **Demo Video** | [Watch Demo on Google Drive](https://drive.google.com/file/d/1tRe4g0OSXEOo_8i0c-IFaLqd2fFTZo9F/view?usp=sharing) |
| ▶️ **YouTube Walkthrough** | [Watch on YouTube](https://www.youtube.com/watch?v=SMy10IucqB8) |
| 🚀 **Live API** | [Mission Control Dashboard](https://spacecraft-autonomy-222404104450.us-central1.run.app) |
| 📖 **Developer Docs** | [`DEVELOPER_DOCUMENTATION.docx`](./DEVELOPER_DOCUMENTATION.docx) |

</div>

<br>



<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff69b4,25:4a1942,50:2d1b4e,75:1a0a2e,100:0d1117&height=120&section=footer" width="100%" />
</div>
