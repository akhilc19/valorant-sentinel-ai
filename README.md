# 🦅 Valorant Sentinel AI

> **An Adaptive, Router-Based AI Coach that doesn't just read stats—it understands context.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
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

---

## 🏗️ Tech Stack

This project is built on a **Modern Data Orchestration** architecture.

| Component | Tech | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/) | Interactive UI, Dashboard, and Real-time Chat. |
| **Orchestration** | [![Kestra](https://img.shields.io/badge/Kestra-IO-purple)](https://kestra.io/) | Managing complex AI flows, API fetching, and State Management. |
| **Logic** | [![Python](https://img.shields.io/badge/Python-3.9-blue)](https://python.org/) | Data Science logic for Match Analysis and Heuristics. |
| **AI Engine** | **Ollama / LLMs** | Powering the context-aware generation. |
| **Deploy** | **Docker** | Containerized environment for reproducibility. |

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

## 🧠 The Agent Router (V3 Architecture)

The core innovation of this project is the **File-Based State Machine** in Kestra.

1.  **Ingest**: Fetches raw match data from HenrikDev API.
2.  **Analyze**: Run `analyze_context.py` to calculate "Tilt Factor" and "Carry Score".
3.  **Route**: Writes a decision file (`decision.txt`) to disk.
4.  **Assemble**: Dynamically loads the correct `.txt` persona prompt based on the decision.
5.  **Generate**: Feeds the assembled context to the LLM.

*This ensures valid, context-aware advice 100% of the time, avoiding "hallucinated" coaching styles.*

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- [HenrikDev API Key](https://docs.henrikdev.xyz/valorant.html) (Free)
- A running Ollama instance (or generic OpenAI-compatible endpoint).

### 1. Setup Backend (Kestra)
```bash
cd kestra
# Create .env file with your API Keys
echo "HENRIK_API_KEY=your_key_here" >> .env
echo "OLLAMA_API_KEY=your_key_here" >> .env

# Start the Orchestration Engine
docker-compose up -d
```
> Kestra Dashboard will be available at `http://localhost:8080`

### 2. Setup Frontend
```bash
cd frontend
# Install dependencies
npm install

# Start Dev Server
npm run dev
```
> App will be available at `http://localhost:3000`

---

## 🎮 Features

### **Autonomous Mode**
The system automatically detects the vibe of the match.
- **Match**: Competitive, Abyss Map, 13-15 Loss.
- **Router**: "Close Match Detected" -> Activates **Tactical Coach**.
- **Advice**: Focused on economy management and specific round losses.

### **Manual Mode**
Want a specific review? You can force the agent persona.
- Select **"The Validator"** to see if you really played well despite the loss.
- Select **"The Backpack"** if you know you played poorly and want honest feedback.

---

## 🤝 Contributing

1.  **Fork** the repo.
2.  **Create** a feature branch (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes using conventional commits (`git commit -m 'feat: add new persona'`).
4.  **Push** to the branch.
5.  **Open** a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
