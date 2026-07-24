# EnergyFlow GH
### Community Renewable Energy Management System for Rural Ghana.

EnergyFlow GH is a web-based platform designed to help rural Ghanaian communities manage renewable energy more efficiently. It provides real-time monitoring of solar energy generation and consumption, intelligent priority-based scheduling of energy distribution, and detailed reporting tools — all built specifically for community-scale deployments where resources are limited and equitable access to electricity matters.

Built with React, NOde.js/Express, and PostgreSQL.

---

## Project Structure

```
EnergyFlow/
├── client/ # React frontend (Vite)
└── server/ # Node.js/Express backend
```

---

## Prerequisites

Before setting up this project, make sure you have the following installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v8 or higher | Comes with Node.js |
| PostgreSQL | v14 or higher | https://www.postgresql.org/download |
| Git | Latest | https://git-scm.com/downloads |

To verify your installations, open a terminal and run:

```bash
node -v
npm -v
psql --version
git --version
```

Each command should print a version number. If any command is not recognised, revisit the installation for that tool. 

---

## Step 1: Clone the Repository

```bash 
git clone https://github.com/mackun-ui/EnergyFlow.git
cd EnergyFlow
```

---

## Step 2: Run the Setup Script

Navigate to the `server/` folder and run the setup script

```bash
cd server
node setup.js
```

This script will automatically:
- Create the `.env` configuration file
- Create the `energyflow` PostgreSQL database
- Apply the full database schema
- Install all backend dependencies
- Install all frontend dependencies

You should see a green checkmark next to each step as it completes.

> **Note:** The script requires PostreSQL to be running and accessible via the default `postgres` user. If you set a custom username during PostgreSQL installation, open `setup.js` and replace `postgres` with your username in the `execSync` commands.

--- 

### Step 3: Update Your Database Password

Once the setup script finishes, opone the newly created `server/.env` file:

```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=energyflow
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
JWT_SECRET=energyflow_secret_key_change_in_production
```
Replace `your_postgres_password_here` with the password you set when installing PostgreSQL and save the file.

> **This is the only manual step required after running the setup script.**
