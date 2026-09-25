# ORCA --- Local Setup & Startup Guide

This guide is for a developer who has cloned ORCA and wants to get the
project running locally.

It focuses only on:

-   Installing prerequisites
-   Cloning the repository
-   Setting up Python dependencies
-   Starting PostgreSQL + PostGIS
-   Starting the Rust backend
-   Starting the Python AI service
-   Starting the React frontend
-   Running the services together
-   Testing the services
-   Authentication
-   Troubleshooting
-   Stopping and restarting the project

------------------------------------------------------------------------

# 1. Prerequisites

ORCA requires:

-   Git
-   Node.js + npm
-   Rust + Cargo
-   Python 3.12
-   `uv`
-   PostgreSQL with PostGIS
-   Podman or Docker

On Fedora/Linux, check what is already installed:

``` bash
git --version
node --version
npm --version
rustc --version
cargo --version
python3 --version
uv --version
podman --version
```

If Git is missing:

``` bash
sudo dnf install git
```

If Rust is missing:

``` bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

Python 3.12 is recommended.

------------------------------------------------------------------------

# 2. Clone the Repository

Choose a directory for the project:

``` bash
cd ~/Desktop
```

Clone ORCA:

``` bash
git clone https://github.com/Shagun812/orca.git
```

Enter the repository:

``` bash
cd ~/Desktop/orca
```

Verify:

``` bash
git status
```

------------------------------------------------------------------------

# 3. Set Up the Python Environment

The Python dependencies should be installed in a project-specific
virtual environment.

From the repository root:

``` bash
cd ~/Desktop/orca
```

Create the environment:

``` bash
uv venv --python 3.12
```

Activate it:

``` bash
source .venv/bin/activate
```

Verify:

``` bash
python --version
which python
```

The Python executable should point inside:

``` text
~/Desktop/orca/.venv/
```

Install the project's Python dependencies:

``` bash
uv pip install -r requirements.txt
```

Test the important packages:

``` bash
python -c "import torch, cv2, shapely, sklearn, xgboost, pandas, fastapi, ultralytics; print('ORCA Python environment OK')"
```

Expected:

``` text
ORCA Python environment OK
```

------------------------------------------------------------------------

# 4. Start PostgreSQL + PostGIS

The Rust backend requires PostgreSQL and the **PostGIS extension**.

A normal PostgreSQL image such as:

``` text
postgres:16
```

is not sufficient.

Use the PostGIS image.

## Using Podman

Check:

``` bash
podman --version
```

Create the ORCA database container:

``` bash
podman run --name orca-postgres \
  -e POSTGRES_USER=orca \
  -e POSTGRES_PASSWORD=orca \
  -e POSTGRES_DB=orca \
  -p 5432:5432 \
  -d docker.io/postgis/postgis:16-3.5
```

Check that it is running:

``` bash
podman ps
```

You should see:

``` text
orca-postgres
```

with:

``` text
0.0.0.0:5432->5432/tcp
```

The local database credentials are:

``` text
Host:     127.0.0.1
Port:     5432
Database: orca
User:     orca
Password: orca
```

------------------------------------------------------------------------

# 5. If the Database Container Already Exists

You do not need to recreate the database every time.

Start it with:

``` bash
podman start orca-postgres
```

Check:

``` bash
podman ps
```

If you need to inspect the database logs:

``` bash
podman logs orca-postgres
```

------------------------------------------------------------------------

# 6. Start the Rust Backend

Open a new terminal.

Go to the backend:

``` bash
cd ~/Desktop/orca/orca-backend
```

Set the database connection:

``` bash
export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
```

Set the backend port:

``` bash
export PORT=3000
```

Start the backend:

``` bash
cargo run
```

The first compilation may take a while.

Warnings such as:

``` text
unused imports
unused variable
struct is never constructed
method is never used
```

are compiler warnings and do not necessarily mean the backend failed.

A successful startup should reach:

``` text
Running `target/debug/backend`
```

without a subsequent panic.

Keep this terminal open.

------------------------------------------------------------------------

# 7. Verify the Backend

Open another terminal.

Check whether port 3000 is listening:

``` bash
ss -ltnp | grep :3000
```

A successful result should contain:

``` text
LISTEN ... 0.0.0.0:3000 ... backend
```

You can also test:

``` bash
curl -i http://localhost:3000
```

A `404` response does not necessarily mean the backend is broken. It can
simply mean the `/` route is not defined.

The important check is that the Rust process is listening on port 3000.

------------------------------------------------------------------------

# 8. Start the Python AI Service

The AI service is required for functionality that depends on ORCA's
ML/geospatial models.

Open another terminal.

Go to the project:

``` bash
cd ~/Desktop/orca
```

Activate the Python environment:

``` bash
source .venv/bin/activate
```

Enter the AI service:

``` bash
cd orca-ai
```

Start FastAPI:

``` bash
uvicorn app.main:app --reload --port 8000
```

Keep this terminal open.

The AI service should be available at:

``` text
http://localhost:8000
```

FastAPI documentation is normally available at:

``` text
http://localhost:8000/docs
```

Test it:

``` bash
curl -i http://localhost:8000
```

If the root route is not defined, use:

``` text
http://localhost:8000/docs
```

------------------------------------------------------------------------

# 9. Start the Frontend

Open another terminal.

Go to the frontend:

``` bash
cd ~/Desktop/orca/orca-frontend
```

Install frontend dependencies:

``` bash
npm install
```

Start Vite:

``` bash
npm run dev
```

Vite should display a local URL similar to:

``` text
http://localhost:5173
```

Open that URL in your browser.

``` text
http://localhost:5173
```

Keep this terminal open.

------------------------------------------------------------------------

# 10. Recommended Startup Order

Start the services in this order:

## Terminal 1 --- Database

``` bash
podman start orca-postgres
```

If the container has never been created:

``` bash
podman run --name orca-postgres \
  -e POSTGRES_USER=orca \
  -e POSTGRES_PASSWORD=orca \
  -e POSTGRES_DB=orca \
  -p 5432:5432 \
  -d docker.io/postgis/postgis:16-3.5
```

## Terminal 2 --- AI service

``` bash
cd ~/Desktop/orca
source .venv/bin/activate
cd orca-ai
uvicorn app.main:app --reload --port 8000
```

## Terminal 3 --- Backend

``` bash
cd ~/Desktop/orca/orca-backend

export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
export PORT=3000

cargo run
```

## Terminal 4 --- Frontend

``` bash
cd ~/Desktop/orca/orca-frontend
npm run dev
```

Then open:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 11. Minimal Startup

If you only need the frontend and backend and do not need ML
functionality, you can run:

### Terminal 1

``` bash
podman start orca-postgres
```

### Terminal 2

``` bash
cd ~/Desktop/orca/orca-backend

export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
export PORT=3000

cargo run
```

### Terminal 3

``` bash
cd ~/Desktop/orca/orca-frontend
npm run dev
```

Then open:

``` text
http://localhost:5173
```

The AI service can be started later if an ORCA feature requires it.

------------------------------------------------------------------------

# 12. Authentication

ORCA includes registration and login.

Backend endpoints:

``` text
POST /api/v1/auth/register
POST /api/v1/auth/login
```

The frontend contains login and registration pages.

If the registration page is available in the frontend, use it normally.

If registration fails, first verify:

``` bash
ss -ltnp | grep :3000
```

and confirm that PostgreSQL is running:

``` bash
podman ps
```

Then inspect the browser's developer console/network tab for the failed
API request.

------------------------------------------------------------------------

# 13. Check All Running Services

Run:

``` bash
ss -ltnp | grep -E ':3000|:5173|:5432|:8000'
```

When the complete stack is running, you should have:

``` text
5432  PostgreSQL + PostGIS
8000  Python/FastAPI
3000  Rust backend
5173  React/Vite frontend
```

The main application is:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 14. Common Problems

## `docker: command not found`

On Fedora, Docker is not required if Podman is available.

Check:

``` bash
podman --version
```

Use Podman for the local PostgreSQL/PostGIS container.

------------------------------------------------------------------------

## Podman asks which registry to use

Do not use an unqualified image such as:

``` bash
postgres:16
```

Specify the full image:

``` bash
docker.io/postgis/postgis:16-3.5
```

------------------------------------------------------------------------

## `orca-postgres` already exists

If the existing container is the correct PostGIS container:

``` bash
podman start orca-postgres
```

If it is an incorrect PostgreSQL container and contains no data you
need:

``` bash
podman rm -f orca-postgres
```

Then recreate it:

``` bash
podman run --name orca-postgres \
  -e POSTGRES_USER=orca \
  -e POSTGRES_PASSWORD=orca \
  -e POSTGRES_DB=orca \
  -p 5432:5432 \
  -d docker.io/postgis/postgis:16-3.5
```

------------------------------------------------------------------------

## `DATABASE_URL environment variable must be set`

Run:

``` bash
export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
```

Then:

``` bash
cargo run
```

------------------------------------------------------------------------

## `extension "postgis" is not available`

You are using a plain PostgreSQL image.

Remove the old container:

``` bash
podman rm -f orca-postgres
```

Use:

``` bash
docker.io/postgis/postgis:16-3.5
```

instead.

------------------------------------------------------------------------

## `connection refused` from Rust

Check:

``` bash
podman ps
```

If PostgreSQL is stopped:

``` bash
podman start orca-postgres
```

Check its logs:

``` bash
podman logs orca-postgres
```

------------------------------------------------------------------------

## Port 5432 is already in use

Check:

``` bash
ss -ltnp | grep :5432
```

If another PostgreSQL instance is already using 5432, either stop it or
map ORCA to another host port.

Example:

``` bash
-p 5433:5432
```

Then change:

``` bash
export DATABASE_URL="postgres://orca:orca@127.0.0.1:5433/orca"
```

------------------------------------------------------------------------

## Port 3000 is already in use

Check:

``` bash
ss -ltnp | grep :3000
```

You can run the backend on another port:

``` bash
export PORT=3001
cargo run
```

The frontend must then use the corresponding backend URL.

------------------------------------------------------------------------

## Port 5173 is already in use

Vite normally chooses another available port.

Run:

``` bash
npm run dev
```

and use the URL printed in the terminal.

------------------------------------------------------------------------

## `npm install` fails

Check:

``` bash
node --version
npm --version
```

Then retry:

``` bash
npm install
```

Avoid deleting `package-lock.json` unless there is a specific reason to
regenerate the lockfile.

------------------------------------------------------------------------

## `cargo run` takes a long time

The first Rust build can take several minutes because Cargo compiles all
required dependencies.

Later runs are normally much faster.

------------------------------------------------------------------------

## Rust shows warnings

Warnings such as:

``` text
unused imports
unused variable
dead code
```

are not necessarily errors.

Look for:

``` text
error:
```

or:

``` text
thread 'main' panicked
```

Those indicate an actual failure.

------------------------------------------------------------------------

# 15. Stopping ORCA

## Stop frontend

In the frontend terminal:

``` text
Ctrl+C
```

## Stop backend

In the backend terminal:

``` text
Ctrl+C
```

## Stop AI service

In the AI terminal:

``` text
Ctrl+C
```

## Stop PostgreSQL

``` bash
podman stop orca-postgres
```

------------------------------------------------------------------------

# 16. Starting ORCA Again

The database container does not need to be recreated.

Start it:

``` bash
podman start orca-postgres
```

Then start the backend:

``` bash
cd ~/Desktop/orca/orca-backend

export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
export PORT=3000

cargo run
```

Start the AI service if needed:

``` bash
cd ~/Desktop/orca
source .venv/bin/activate
cd orca-ai
uvicorn app.main:app --reload --port 8000
```

Start the frontend:

``` bash
cd ~/Desktop/orca/orca-frontend
npm run dev
```

Open:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 17. Useful Commands

## Check database

``` bash
podman ps
```

## Database logs

``` bash
podman logs orca-postgres
```

## Check backend

``` bash
ss -ltnp | grep :3000
```

## Check AI service

``` bash
ss -ltnp | grep :8000
```

## Check frontend

``` bash
ss -ltnp | grep :5173
```

## Check all ORCA ports

``` bash
ss -ltnp | grep -E ':3000|:5173|:5432|:8000'
```

## Git status

``` bash
cd ~/Desktop/orca
git status
```

## Pull repository updates

``` bash
git pull
```

------------------------------------------------------------------------

# 18. Quick Start --- Copy/Paste Version

Assuming all prerequisites are already installed:

### First-time setup

``` bash
cd ~/Desktop

git clone https://github.com/Shagun812/orca.git

cd orca

uv venv --python 3.12
source .venv/bin/activate

uv pip install -r requirements.txt

podman run --name orca-postgres \
  -e POSTGRES_USER=orca \
  -e POSTGRES_PASSWORD=orca \
  -e POSTGRES_DB=orca \
  -p 5432:5432 \
  -d docker.io/postgis/postgis:16-3.5
```

Then use three/four terminals.

### Backend

``` bash
cd ~/Desktop/orca/orca-backend
export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
export PORT=3000
cargo run
```

### AI

``` bash
cd ~/Desktop/orca
source .venv/bin/activate
cd orca-ai
uvicorn app.main:app --reload --port 8000
```

### Frontend

``` bash
cd ~/Desktop/orca/orca-frontend
npm install
npm run dev
```

Open:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 19. Subsequent Starts

Once the first-time setup is complete, you do NOT need to clone or
reinstall dependencies.

Start PostgreSQL:

``` bash
podman start orca-postgres
```

Start backend:

``` bash
cd ~/Desktop/orca/orca-backend
export DATABASE_URL="postgres://orca:orca@127.0.0.1:5432/orca"
export PORT=3000
cargo run
```

Start AI when needed:

``` bash
cd ~/Desktop/orca
source .venv/bin/activate
cd orca-ai
uvicorn app.main:app --reload --port 8000
```

Start frontend:

``` bash
cd ~/Desktop/orca/orca-frontend
npm run dev
```

Open:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 20. Expected Final State

For the complete local environment:

``` text
PostgreSQL + PostGIS → localhost:5432
Python/FastAPI       → localhost:8000
Rust backend         → localhost:3000
React/Vite frontend  → localhost:5173
```

For frontend/backend development only:

``` text
PostgreSQL + PostGIS → localhost:5432
Rust backend         → localhost:3000
React/Vite frontend  → localhost:5173
```

The application is accessed through:

``` text
http://localhost:5173
```

Keep the terminal running for each service while using the application.
