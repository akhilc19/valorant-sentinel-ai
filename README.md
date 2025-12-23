# 🦅 Valorant Sentinel AI

> **An Adaptive, Router-Based AI Coach that doesn't just read stats, it understands context.**

![Tech](https://img.shields.io/badge/stack-Next.js_|_Kestra_|_Python-black)

## 🌟 Introduction

Valorant Sentinel is not another static stat-tracker. It is an **Autonomous AI Agent System** designed to act like a real Tier-1 generic coach.

Most AI tools give you the same generic advice whether you lost 11-13 or 0-13.
**Sentinel is different.**

It uses a **Heuristic Router** to analyze your match context before saying a word.
- **Close Match (12-14)?** It becomes a **Tactical Coach**, focusing on round-level mistakes.
- **Tilt Loss (3-13)?** It switches to **Mental Coach** mode to prevent burnout.
- **Carried Win?** It humbles you with the **"Backpack"** persona.
- **Team Diff?** It validates your individual performance with the **Validator** persona.

### 🎥 Watch the Demo
[![Watch the Demo](https://img.youtube.com/vi/SuS5_E3E_rM/0.jpg)](https://youtu.be/SuS5_E3E_rM)

---

## 🏗️ Tech Stack

This project is built on a **Modern Data Orchestration** architecture.

| Component | Tech | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/) | Interactive UI, Dashboard, and Real-time Chat. |
| **Orchestration** | [![Kestra](https://img.shields.io/badge/Kestra-IO-purple)](https://kestra.io/) | Managing complex AI flows, API fetching, and State Management. |
| **Logic** | [![Python](https://img.shields.io/badge/Python-3.9-blue)](https://python.org/) | Data Science logic for Match Analysis and Heuristics. |
| **AI Engine** | **Ollama / LLMs** | Powering the context-aware generation. |
| **Deploy** | **Docker** | Containerized environment for reproducibility. |
| **Data Source** | **[HenrikDev API](https://github.com/Henrik-3/valorant-api)** | Unofficial Valorant API for match history and stats. |

---

## 📂 Project Structure
```bash
valorant-sentinel/
├── 📁 frontend/             # Next.js Application
│   ├── app/                 # App Router (Pages & API Routes)
│   └── components/          # UI Components (Cyberpunk aesthetic)
│
├── 📁 kestra/               # Backend Orchestration
│   ├── flows/               # YAML Flow Definitions (The "Brain")
│   │   ├── ai_match_analysis.yaml  # V3 Router Logic
│   │   └── dashboard.yaml          # Parallel Data Fetching
│   │
│   ├── scripts/             # Python Logic Scripts
│   │   ├── analyze_context.py      # The Heuristic Router 🧠
│   │   └── ai_match_generator.py   # LLM Interface
│   │
│   └── prompts/             # System Prompts (Personas)
│       ├── tactical.txt
│       ├── mental.txt
│       └── backpack.txt
```

---

## 🎮 Features

### 🌐 Global Region Support
Seamlessly track and analyze matches from any Valorant region:
- **Major Regions**: AP, NA, EU, BR, KR, LATAM.
- **Unified Interface**: Use the same dashboard regardless of where you play.

### 🧠 Intelligent Context Routing
The AI doesn't just look at stats; it looks at *context*.
- **Autonomous Mode**: Automatically detects the vibe of the match (e.g., Close Loss, Stomp Win, Tilt Game).
- **Heuristic Engine**: Routes the analysis to the most appropriate "Coach Persona" for the situation.

### 🎭 Adaptive Persona System
Different matches require different feedback styles:
- **The Tactical Coach**: For close losses (11-13). Focuses on economy, specific round mistakes, and positioning.
- **The Mental Coach**: For tilt losses (3-13). Focuses on mental reset, preventing burnout, and "go next" mentality.
- **The Backpack**: For carried wins. Humbles you when you win but played poorly.
- **The Validator**: For "Team Diff" losses. Validates your strong individual performance despite the loss.

### 💬 Interactive AI Chat
Don't just read a report—talk to your coach.
- **RAG-Powered**: The chat knows everything about the specific match you are discussing.
- **Deep Dives**: Ask "Why did I die in Round 4?" or "How was my economy management?"

---

## 📜 License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## ⚖️ Legal

Valorant Sentinel isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.