# CaterConnect

**Your Catering Grocery List, Digitally Connected.**

A full-stack web application connecting catering professionals with grocery store owners. Catering professionals create digital grocery ingredient lists per event, generate PDFs, and submit orders directly to grocery stores.

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python + Django + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)

---

## Prerequisites

Before running the project, ensure you have installed:

- Python 3.10+ → [Download](https://www.python.org/downloads/)
- Node.js 18+ → [Download](https://nodejs.org/)
- PostgreSQL 14+ → [Download](https://www.postgresql.org/download/)

---

## Quick Start

### Step 1: Set up PostgreSQL

Create a database named `caterconnect`:

```sql
CREATE DATABASE caterconnect;
CREATE USER postgres WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE caterconnect TO postgres;
```

### Step 2: Run the Setup Script

Double-click `setup.bat` or run it in Command Prompt:

```
setup.bat
```

This will:
1. Create a Python virtual environment
2. Install all Python packages
3. Create your `.env` file (edit it with your DB credentials)
4. Run database migrations (creates all tables + seeds 70+ Gujarati grocery items)
5. Create an admin superuser
6. Install all Node.js packages

### Step 3: Edit the .env file

Open `backend/.env` and set your PostgreSQL credentials:

```
DEBUG=True
SECRET_KEY=your-secret-key-change-this
DB_NAME=caterconnect
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5432
```

### Step 4: Start the Application

Double-click `start.bat` or run in two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## User Roles

| Role | Description | Default Login |
|------|-------------|--------------|
| Admin | Full system access | admin@caterconnect.com (set during setup) |
| Catering Professional | Creates grocery lists, submits orders | Register at /register |
| Grocery Store Owner | Receives and processes orders | Register at /register |

---

## Project Structure

```
CaterConnect/
├── backend/                    # Django backend
│   ├── accounts/               # User auth + profiles
│   ├── catering/               # Catering events
│   ├── grocery/                # Grocery items + categories
│   ├── orders/                 # Orders + status workflow
│   ├── stores/                 # Grocery store profiles
│   ├── pdf_export/             # PDF generation
│   └── caterconnect/           # Django project settings
├── frontend/                   # React frontend
│   └── src/
│       ├── pages/              # All page components
│       ├── components/         # Reusable UI components
│       ├── api/                # Axios API calls
│       ├── store/              # Zustand state
│       └── hooks/              # Custom React hooks
├── setup.bat                   # First-time setup
└── start.bat                   # Start both servers
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login + get JWT tokens |
| GET | /api/auth/me/ | Current user profile |
| GET | /api/grocery/categories/ | All grocery categories with items |
| GET | /api/grocery/items/ | All grocery items (with search/filter) |
| GET/POST | /api/orders/ | List/create orders |
| GET | /api/orders/{id}/pdf/ | Download order as PDF |
| POST | /api/orders/{id}/status/ | Update order status |
| POST | /api/orders/{id}/duplicate/ | Duplicate an order |
| GET | /api/stores/ | List all grocery stores |

---

## Order Status Workflow

```
Pending → Accepted → Preparing → Ready → Completed
                 ↘ Rejected
```

Catering user can also Cancel a pending order.

---

## Features

- ✅ 70+ pre-loaded Gujarati grocery items across 5 categories
- ✅ Ingredient selection with quantity + unit (kg, gram, litre, ml, piece, packet, dozen)
- ✅ Custom grocery item support
- ✅ Professional PDF generation
- ✅ Order submission to specific grocery stores
- ✅ Real-time order status tracking
- ✅ Order duplication for repeat events
- ✅ Role-based access control
- ✅ Admin panel for item management
- ✅ Mobile-responsive design
