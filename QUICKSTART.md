# 🚀 WebSec CTF — Beginner Quickstart Guide (Step-by-Step)

Welcome to **WebSec CTF**! This guide walks you through downloading, setting up, and running the entire cybersecurity training platform on your personal computer in just a few minutes.

No complex database setup or programming environment configuration is required.

---

## 📋 What You Need First (Prerequisites)

Before starting, ensure your computer has these two free tools installed:

1. **[Git](https://git-scm.com/downloads)** — Used to download the project.
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — Runs the entire platform (database, backend, frontend, and challenges) inside lightweight containers.
   > **Important**: Make sure Docker Desktop is **opened and running** (look for the whale icon in your system tray/taskbar).

---

## 💻 Step-by-Step Installation

### Step 1: Open Your Terminal
- **Windows**: Press `Win + X` and select **Terminal** or **PowerShell**.
- **macOS / Linux**: Open your **Terminal** application.

---

### Step 2: Download (Clone) the Repository
Copy and paste this command into your terminal:

```bash
git clone https://github.com/Sekthorn/CTF-Platform-.git
```

Then navigate into the project directory:

```bash
cd CTF-Platform-
```

---

### Step 3: Create Your Settings File (`.env`)
The platform needs a settings file. A pre-configured template called `.env.example` is already provided. Simply make a copy called `.env`:

- **On Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

- **On macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

*(You don't need to change anything inside `.env` to run locally — default values work right away!)*

---

### Step 4: Start the Platform (The Magic Command)
Run this single command:

```bash
docker compose up -d --build
```

#### What Docker is doing automatically behind the scenes:
1. 🗄️ Starts **MySQL 8.4** database and **Redis 7.4** cache.
2. 📦 Applies all database migrations (`prisma migrate deploy`).
3. 🌱 Seeds all **63 CTF Challenges** across 11 OWASP categories.
4. 📚 Seeds all **63 Defense Guides** into the Security Knowledge Library.
5. 🚀 Starts the **React Frontend** and **NestJS Backend API** behind an Nginx reverse proxy.

> ⏱️ *Note: The first time you run this, Docker downloads the necessary images. It takes 2–3 minutes depending on your internet connection. Future startups take only 5 seconds!*

---

### Step 5: Open the Platform in Your Browser
Once the command finishes, open your favorite web browser (Chrome, Edge, Firefox, Brave) and go to:

👉 **[http://localhost](http://localhost)**

---

### Step 6: Log In and Start Hacking!

Use either of these pre-seeded accounts to sign in:

| Account Type | Email / Username | Password | Purpose |
|---|---|---|---|
| **Student / Researcher** | `student@websec.ctf` *(or `student_hacker`)* | `StudentPass2026!` | Solve challenges, submit flags, earn points on the leaderboard, and read educational defense dossiers. |
| **Root Administrator** | `admin@websec.ctf` *(or `admin`)* | `AdminSecurePass2026!` | Manage users, view platform metrics, inspect backend logs, and create new challenges. |

---

## 🛠️ Daily Commands You Need to Know

### 1. Stopping the Platform (When You're Done)
```bash
docker compose down
```
> ✅ **Safe**: This stops the containers while keeping your solved challenges, user score, and database progress completely safe.

### 2. Starting Again Next Time
```bash
docker compose up -d
```
*(No need to re-download or rebuild; starts instantly).*

### 3. Checking System Status
To see if all containers are healthy:
```bash
docker compose ps
```

### 4. Viewing Real-Time Logs
If you want to watch what the backend is doing:
```bash
docker compose logs -f backend
```
*(Press `Ctrl + C` to stop watching logs).*

---

## ❓ Troubleshooting & FAQs

### Problem 1: "Cannot connect to the Docker daemon"
- **Reason**: Docker Desktop is not turned on.
- **Fix**: Open the **Docker Desktop** app from your Start Menu / Applications folder. Wait 30 seconds until the bottom-left icon turns green, then re-run the command.

### Problem 2: "Port 80 is already in use"
- **Reason**: Another web server (like IIS, Skype, or Apache) is using Port 80 on your machine.
- **Fix**:
  1. Open the `.env` file in Notepad or VS Code.
  2. Change line 21: `FRONTEND_PORT=80` to `FRONTEND_PORT=8080`.
  3. Save the file.
  4. Run `docker compose up -d`.
  5. Access the platform at **[http://localhost:8080](http://localhost:8080)**.

### Problem 3: Kali Linux — "Cannot connect to the Docker daemon at podman.sock"
- **Reason**: Kali Linux has **Podman** installed instead of standard Docker, and its background socket service is not started.
- **Quick Fix (Option A - Enable Podman socket)**:
  ```bash
  systemctl --user enable --now podman.socket
  docker compose up -d --build
  ```
- **Recommended Fix (Option B - Install standard Docker on Kali)**:
  ```bash
  sudo apt update
  sudo apt install -y docker.io docker-compose-v2
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER
  newgrp docker
  docker compose up -d --build
  ```

### Problem 4: I want to reset everything back to fresh state
If you want to wipe the database and restart from zero:
```bash
docker compose down -v
docker compose up -d --build
```
*(Warning: `-v` deletes the database volume and re-seeds fresh accounts).*

---

## 👨‍💻 Support & Author

- **Author**: SEK Thorn ([@Sekthorn](https://github.com/Sekthorn))
- **Repository**: [https://github.com/Sekthorn/CTF-Platform-](https://github.com/Sekthorn/CTF-Platform-)
- **License**: MIT License
