# Task Manager API

A full-stack task management system built with FastAPI, PostgreSQL, and React.
Demonstrates JWT authentication, role-based access control, and full CRUD operations — deployed and production-ready.

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://task-manager-primetrade.vercel.app |
| API (Swagger UI) | https://task-manager-primetrade.onrender.com/docs |
| GitHub | https://github.com/Abigna2/task_manager_primetrade |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Neon Serverless) |
| Authentication | JWT (python-jose), bcrypt |
| Frontend | React + Vite |
| API Docs | Swagger UI |
| Deployment | Render (backend), Vercel (frontend) |
| Container | Docker + Docker Compose |

---

## Project Structure

```
task-manager-project/
│
├── project/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── tasks.py
│   │   │   │   │   └── users.py
│   │   │   │   ├── deps.py
│   │   │   │   └── router.py
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   └── security.py
│   │   │   ├── db/
│   │   │   │   └── session.py
│   │   │   ├── models/
│   │   │   │   └── models.py
│   │   │   ├── schemas/
│   │   │   │   └── schemas.py
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
├── docker-compose.example.yml
└── README.md
```

---

## Quick Start (Docker)

The easiest way to run locally:

```bash
# 1. Clone the repo
git clone https://github.com/Abigna2/task_manager_primetrade
cd task-manager-project

# 2. Copy the example compose file and add your credentials
cp docker-compose.example.yml docker-compose.yml
# Edit docker-compose.yml and fill in DATABASE_URL and SECRET_KEY

# 3. Run with Docker
docker-compose up --build
```

API runs at: http://localhost:10000/docs

---

## Manual Setup (Without Docker)

### Prerequisites
- Python 3.11+
- PostgreSQL
- Node.js 18+

### Backend Setup

```bash
cd project/backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials

uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
cd project/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

All endpoints prefixed with `/api/v1`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register a new user |
| POST | /api/v1/auth/login | Login and receive JWT token |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/tasks | Create a new task |
| GET | /api/v1/tasks | List tasks |
| GET | /api/v1/tasks/{id} | Get a specific task |
| PUT | /api/v1/tasks/{id} | Update a task |
| DELETE | /api/v1/tasks/{id} | Delete a task |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/users/me | Get current user profile |
| GET | /api/v1/users | List all users (admin only) |

---

## Role-Based Access Control

| Action | User | Admin |
|---|---|---|
| Register / Login | ✓ | ✓ |
| Create Task | ✓ | ✓ |
| View Own Tasks | ✓ | ✓ |
| View All Tasks | ✗ | ✓ |
| Edit/Delete Own Tasks | ✓ | ✓ |
| Edit/Delete Any Task | ✗ | ✓ |
| View All Users | ✗ | ✓ |

To promote a user to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Security

- Passwords hashed using bcrypt
- Authentication via JWT tokens
- Request validation using Pydantic schemas
- SQLAlchemy ORM prevents SQL injection
- CORS configured for frontend access only

---

## Database Schema

```
users
  id, email, username, hashed_password, role, is_active, created_at

tasks
  id, title, description, status, owner_id, created_at, updated_at
```

---

## Scalability

See [SCALABILITY.md](./SCALABILITY.md) for full details on horizontal scaling, caching, microservices architecture, and Docker deployment strategies.