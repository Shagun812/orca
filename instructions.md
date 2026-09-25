# ORCA - Maritime Intelligence Platform Complete Setup Guide

Welcome to **ORCA**! This guide covers how to set up the entire platform locally, run the models, and host the services (Frontend, Backend, and AI Engine).

---

## Step 1: Install Required Software (Prerequisites)

1. **Docker Desktop** (Runs our databases)
   - Download and install from [Docker's official website](https://www.docker.com/products/docker-desktop).
   - *Note: Leave it running in the background.*
2. **Node.js** (Runs our frontend website)
   - Download the "LTS" version from [Nodejs.org](https://nodejs.org/).
3. **Rust** (Runs our backend server)
   - Go to [rustup.rs](https://rustup.rs/) and install.
4. **Python & uv** (Runs our AI/ML service)
   - Install Python.
   - Install `uv` by opening your terminal and running: `pip install uv`

---

## Step 2: Clone the Repository
Clone the monorepo that contains all three services:
```bash
git clone https://github.com/Shagun812/orca.git
cd orca
```

---

## Step 3: Start the Databases (Docker)

Our Rust Backend relies on PostgreSQL and PostGIS to store investigations, jobs, and spatial data.

1. Navigate to the folder containing `docker-compose.yml` (currently `WEBSITE`):
   ```bash
   cd WEBSITE
   docker-compose up -d
   ```
*(Note: Make sure Docker Desktop is running before you execute this!)*

---

## Step 4: Run the AI/ML Engine (Python)

ORCA uses a Python FastAPI service for attribution ranking, drift forecasting, and spill detection models.

1. Navigate to the `orca-ai` directory:
   ```bash
   cd orca-ai
   ```
2. Create and activate a virtual environment:
   ```bash
   uv venv
   # On Windows:
   .venv\Scripts\activate
   # On Mac/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies and start the service on port 8000:
   ```bash
   uv pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
*(Leave this terminal window open!)*

---

## Step 5: Run the Backend Server (Rust)

The Rust backend securely orchestrates telemetry data and proxies requests to the ML service.

1. Open a new terminal and navigate to the `orca-backend` directory:
   ```bash
   cd orca-backend
   ```
2. Start the server on port 3000:
   ```bash
   # Set the environment variable so it doesn't conflict with frontend
   # On Windows (PowerShell):
   $env:PORT=3000; cargo run
   # On Mac/Linux:
   PORT=3000 cargo run
   ```
*(Leave this terminal window open!)*

---

## Step 6: Run the Frontend (React + Vite)

The frontend is a dynamic, high-performance UI built with React.

1. Open a new terminal and navigate to the `orca-frontend` directory:
   ```bash
   cd orca-frontend
   ```
2. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser and go to `http://localhost:5173` to launch ORCA!

---

## Hosting Guide

If you want to host ORCA publicly, here is how you can deploy each service from the monorepo:

### 1. Hosting the Frontend (Vercel)
- The frontend is production-ready and has zero build errors.
- Go to [Vercel](https://vercel.com/), connect your GitHub account, and select the `Shagun812/orca` repository.
- **Important**: In the Vercel project settings, set the **Root Directory** to `orca-frontend`. 
- Vercel will automatically detect Vite and run `npm run build`. 
- Set any required Environment Variables (like your deployed Backend API URL) in the Vercel Dashboard before hitting Deploy.

### 2. Hosting the Backend (Render / Railway / AWS)
- You can host the Rust backend on platforms like Render or Railway.
- Connect your GitHub repo, set the root directory to `orca-backend`.
- Provide the database connection string (`DATABASE_URL`) from a managed PostgreSQL database (e.g., Supabase, Neon, or Render Postgres).

### 3. Hosting the AI/ML Engine (Google Cloud Run / AWS EC2)
- Since the AI engine requires running ML models and geographic algorithms, it is best containerized using the provided `Dockerfile` inside `orca-ai`.
- You can deploy the Docker image to **Google Cloud Run**, **Railway**, or host it directly on an **AWS EC2** instance.
- Ensure the Rust backend's environment variables are updated to point to this deployed ML service URL instead of `http://127.0.0.1:8000`.
