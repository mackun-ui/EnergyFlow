# EnergyFlow GH
### Community Renewable Energy Management System for Rural Ghana.

EnergyFlow GH is a web-based platform designed to help rural Ghanaian communities manage renewable energy more efficiently. It provides real-time monitoring of solar energy generation and consumption, intelligent priority-based scheduling of energy distribution, and detailed reporting tools, all built specifically for community-scale deployments where resources are limited and equitable access to electricity matters.

Built with React, NOde.js/Express, and PostgreSQL.

#### Link to deployed application: [public link here]

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

> **Note:** The script requires PostgreSQL to be running and accessible via the default `postgres` user. If you set a custom username during PostgreSQL installation, open `setup.js` and replace `postgres` with your username in the `execSync` commands.

--- 

### Step 3: Update Your Database Password

Once the setup script finishes, open the newly created `server/.env` file:

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

## Step 4: Seed the Database

This command populates the database with sample users, facilities, energy metrics, supply schedules, and audit logs so the application has data to display:

```bash
cd server
npm run seed
```

You should see the following printed in the terminal:
```
Seeding database
Connected to EnergyFlow database
Users seeded
Facilities seeded
Energy metrics seeded
Supply schedules seeded
Audit logs seeded
Database seeded successfully!
```

### Default user accounts created by the seed

| Username | Password | Role |
|----------|----------|------|
| admin_kofi | admin123 | Admin |
| provider_ama | provider123 | Energy Provider |
| manager_kwame | manager123 | Community Manager |
| resident_abena | resident123 | Resident |

---

## Step 5: Run the Application

You will need two terminal windows running simultaneously, one for the backend and one for the frontend. 

### Terminal 1: Start the backend

```bash
cd server 
npm run dev
```

You should see:

```
EnergyFlow server running on port 5000
COnnected to EnergyFlow database
```

### Terminal 2: Start the frontend

```bash
cd client
npm run dev
```

You should see:

```
VITE ready in Xms
Local: http://localhost:5173/
```

---

## Step 6: Open the Application

Open your browser and go to: 

http://localhost:5173

You will be redirected to the login page. Use any of the default accounts from Step 4 to log in.

---

## Features

### Energy Monitoring Dashboard
- Real-time display of solar energy production and community consumption
- Battery storage level indications with colour-coded status
- Outage detection and facility status cards
- 24-hour production vs consumption line chart

### Energy Scheduling and Allocation
- Facility priority management (High / Medium / Normal)
- Supply schedule creation and editing
- Low energy protocol that automatically suspends non-critical facilities during low battery periods

### Reports and Analytics
- Daily usage reports with bar charts per facility
- Allocation summaries grouped by priority level across daily, weekly, and monthly periods
- Audit logs showing all system actions with timestamps (admin only)

### User Management (Admin only)
- Create, view, and manage user accounts
- Assign and update user roles
- Deactivate accounts

---

## User Roles and Permissions

| Feature | Admin | Energy Provider | Community Manager | Resident |
|---------|-------|----------------|-------------------|----------|
| View Dashboard | yes | yes | yes | yes |
| View Schedules | yes | yes | yes | yes |
| Create/Edit Schedules | yes | yes | no | no |
| Update Facility Priority | yes | no | no | no |
| Apply Low Energy Protocol | yes | yes | no | no |
| View Reports | yes | yes | yes | yes |
| View Audit Logs | yes | no | no | no |
| Manage Users | yes | no | no | no |

---

## Tech Stack

### Frontend
- React 18 (Vite)
- React Router DOM
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register a new user | Public |
| POST | /api/auth/login | Login and receive JWT token | Public |
| GET | /api/auth/me | Get current logged in user | Authenticated |

### Energy Monitoring
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/energy/latest | Get latest metrics for all facilities | Authenticated |
| GET | /api/energy/summary | Get community-wide energy summary | Authenticated |
| GET | /api/energy/outages | Get outage status for all facilities | Authenticated |
| GET | /api/energy/history/:facilityId | Get historical metrics for a facility | Authenticated |

### Scheduling
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/schedules/facilities | Get all facilities with priority levels | Authenticated |
| PATCH | /api/schedules/facilities/:id/priority | Update facility priority | Admin |
| GET | /api/schedules | Get all supply schedules | Authenticated |
| POST | /api/schedules | Create a new supply schedule | Admin, Energy Provider |
| PATCH | /api/schedules/:id | Update a supply schedule | Admin, Energy Provider |
| POST | /api/schedules/low-energy-protocol | Apply low energy protocol | Admin, Energy Provider |

### Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/reports/daily | Generate daily usage report | Authenticated |
| GET | /api/reports/allocation | Get allocation summary | Authenticated |
| GET | /api/reports/audit-logs | Get system audit logs | Admin |

### User Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | Get all users | Admin |
| POST | /api/users | Create a new user | Admin |
| PATCH | /api/users/:id/role | Update user role | Admin |
| PATCH | /api/users/:id/deactivate | Deactivate user account | Admin |

---

## Troubleshooting

**psql command not found**
PostgreSQL is not added to your PATH. Go to System Environment Variables, find PATH, and add `C:\Program Files\PostgreSQL\17\bin` (replace 17 with your installed version).

**Database connection error**
Check that your `.env` file exists in the `server/` folder and that `DB_PASSWORD` matches the password you set during PostgreSQL installation.

**Seeding error — client password must be a string**
Your `DB_PASSWORD` in the `.env` file is missing or blank. Open the file and make sure the password is filled in with no quotes around it.

**Chart not loading on dashboard**
The seed data has expired. Run `npm run seed` again in the server folder to generate fresh timestamps, then refresh the browser.

**Port 5000 already in use**
Another process is using port 5000. Either stop that process or change the PORT value in your `.env` file to `5001` and restart the server.

---

## Project Context

EnergyFlow was built as part of the African Leadership University (ALU) Introduction to Software Engineering course. It addresses the real-world challenge of poor energy management in rural Ghanaian communities powered by solar mini-grids, where approximately 3.7 million people still lack reliable electricity access despite having renewable energy infrastructure in place.

The system simulates energy data in Version 1.0. Future versions will integrate with real IoT sensors and expand to additional communities across Ghana.

---

*Prepared by Manuelle Aseye Ackun | African Leadership University | 2026*