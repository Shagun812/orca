# 🐋 ORCA - Maritime Intelligence Platform Complete Setup Guide

Welcome to **ORCA**! This guide is written specifically for beginners. Follow these step-by-step instructions carefully, and you will have the entire platform running on your computer in just a few minutes. 

---

## 🛑 Step 1: Install Required Software (Prerequisites)
Before running the code, you need to install a few foundational tools. If you already have these, you can skip to Step 2.

1. **Docker Desktop** (Runs our databases)
   - Download and install from [Docker's official website](https://www.docker.com/products/docker-desktop).
   - *Note: Leave it running in the background.*
2. **Node.js** (Runs our frontend website)
   - Download the "LTS" (Long Term Support) version from [Nodejs.org](https://nodejs.org/).
   - Just click through the standard installer.
3. **Rust** (Runs our backend server)
   - Go to [rustup.rs](https://rustup.rs/).
   - Follow the instructions to download and install the Rust compiler.
4. **Python & uv** (Runs our AI/ML service)
   - Install Python from [python.org](https://python.org).
   - Install `uv` (a super-fast Python package manager) by opening your terminal and running: 
     ```bash
     pip install uv
     ```

---

## 🧠 Step 2: Start the AI/ML Service
ORCA uses a Python AI service to analyze satellite images. We need to set this up first using `uv`.

1. Open your terminal and navigate to this **main `orca` folder**:
   ```bash
   cd path/to/orca
   ```
2. Create a virtual environment using `uv`:
   ```bash
   uv venv
   ```
3. Activate the virtual environment:
   - **On Windows**:
     ```bash
     .venv\Scripts\activate
     ```
   - **On Mac/Linux**:
     ```bash
     source .venv/bin/activate
     ```
4. Install the required AI packages extremely fast using `uv`:
   ```bash
   uv pip install -r requirements.txt
   ```
5. Start the ML service:
   ```bash
   uvicorn app.main:app --reload
   ```
   *(Or simply double-click the `start-ml-service.bat` file if you are on Windows!)*
6. **Leave this terminal window open!**

---

## 🛠️ Step 3: Start the Databases
ORCA uses a database to store cases and a memory cache to process data fast. We use Docker to spin these up instantly without any complex setup.

1. Open a **new** terminal window.
2. Navigate to the `orca/WEBSITE` folder.
   ```bash
   cd path/to/orca/WEBSITE
   ```
3. Run the following command:
   ```bash
   docker-compose up -d
   ```
   *What this does: It downloads and starts the PostgreSQL database and Redis server in the background.*

---

## ⚙️ Step 4: Start the Backend Server
The backend is the "brain" of the platform, written in Rust. It talks to the database and processes our data.

1. Keep your terminal open and navigate into the `backend` folder:
   ```bash
   cd backend
   ```
2. Start the server by running:
   ```bash
   cargo run
   ```
   *What this does: The first time you run this, it will download necessary packages and compile the code. This might take a few minutes. When it finishes, it will say the server is listening/running.*
3. **Leave this terminal window open!** If you close it, the backend turns off.

---

## 🎨 Step 5: Start the Frontend Interface
The frontend is the beautiful user interface you see in your browser.

1. Open a **brand new** Terminal window.
2. Navigate to the `orca/WEBSITE/frontend` folder:
   ```bash
   cd path/to/orca/WEBSITE/frontend
   ```
3. Install the required website packages by running:
   ```bash
   npm install
   ```
4. Start the website by running:
   ```bash
   npm run dev
   ```
   *What this does: It boots up a local web server for the user interface.*
5. **Leave this terminal window open!**

---

## 🚀 Step 6: Launch the App!
You're done! 

1. Open your favorite web browser (Chrome, Safari, Edge, etc.).
2. In the address bar at the top, type:
   ```text
   http://localhost:5173
   ```
3. Hit Enter. You should now see the beautiful ORCA Landing Page!

---

### 💡 Troubleshooting
* **"Command not found"**: If your terminal says it doesn't recognize `cargo`, `npm`, `uv`, or `docker`, make sure you installed the software in Step 1 and **restarted your computer** so the terminal recognizes them.
* **Database errors**: Make sure Docker Desktop application is currently open and running on your computer before typing `docker-compose up -d`.
