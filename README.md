Task Manager API

This project is a simple task management system built with FastAPI, PostgreSQL, and a React frontend.
It demonstrates user authentication with JWT, role-based access control (user vs admin), and full CRUD operations for tasks.

The project was created as part of a backend developer assignment to showcase API design, authentication, database integration, and frontend interaction.

Tech Stack
Layer            Technology
Backend          Python 3.11, FastAPI, SQLAlchemy
Database         PostgreSQL (Neon Serverless)
Authentication   JWT (python-jose), bcrypt
Frontend         React + Vite
API Docs         Swagger UI

Project Structure
task-manager-project/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── tasks.py
│   │   │   │   └── users.py
│   │   │   ├── deps.py
│   │   │   └── router.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   └── models.py
│   │   │
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
Setup Instructions
Prerequisites

Make sure the following are installed:

Python 3.11+

PostgreSQL

Node.js 18+

1. Database Setup

Create a PostgreSQL database:

CREATE DATABASE taskdb;
2. Backend Setup

i) Navigate to the backend folder:

cd backend

ii) Create a virtual environment:

python -m venv venv

iii) Activate the environment:

Windows:

venv\Scripts\activate

Mac/Linux:

source venv/bin/activate

iv) Install dependencies:

pip install -r requirements.txt

v) Copy the environment file:

cp .env.example .env

vi) Edit .env and add your PostgreSQL credentials and a secret key.

vii) Start the server:

uvicorn app.main:app --reload

The backend will run at:

http://localhost:8000
3. Frontend Setup

i) Navigate to the frontend folder:

cd frontend

ii) Install dependencies:

npm install

iii) Run the frontend:

npm run dev

The frontend will run at:

http://localhost:5173
API Endpoints

All endpoints are prefixed with:

/api/v1
Base API URL

http://localhost:8000/api/v1

Authentication
Method	Endpoint	Description
POST	/api/v1/auth/register	Register a new user
POST	/api/v1/auth/login	Login and receive JWT token
Tasks
Method	Endpoint	Description
POST	/api/v1/tasks	Create a new task
GET	/api/v1/tasks	List tasks
GET	/api/v1/tasks/{id}	Get a specific task
PUT	/api/v1/tasks/{id}	Update a task
DELETE	/api/v1/tasks/{id}	Delete a task

Regular users can manage their own tasks, while admins can access all tasks.

Users
Method	Endpoint	Description
GET	/api/v1/users/me	Get current user profile
GET	/api/v1/users	List all users (admin only)
PATCH	/api/v1/users/{id}/deactivate	Deactivate a user (admin only)
API Documentation

FastAPI automatically generates API documentation.

Swagger UI:

http://localhost:8000/docs

ReDoc:

http://localhost:8000/redoc
Role-Based Access Control
Action	                User	Admin
Register / Login        ✓	     ✓
Create Task	            ✓      	 ✓
View Own Tasks	        ✓	     ✓
View All Tasks	        ✗      	 ✓
Edit/Delete Own Tasks	✓	     ✓
Edit/Delete Any Task	✗    	 ✓
View All Users	        ✗	     ✓

**To promote a user to admin:

UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';
Security

Basic security practices implemented in the project:

1. Passwords hashed using bcrypt

2. Authentication handled using JWT tokens

3. Request validation using Pydantic

4. SQLAlchemy ORM prevents SQL injection

5. CORS configured for frontend access

Database Schema

Users table:

users
  id
  email
  username
  hashed_password
  role
  is_active
  created_at

Tasks table:

tasks
  id
  title
  description
  status
  owner_id
  created_at
  updated_at
Scalability

The project is designed with a modular structure so components like authentication, users, and tasks can be separated into independent services if needed.

More details are included in SCALABILITY.md.
