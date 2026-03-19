from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.db.session import Base, engine

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="""
## Task Manager REST API

A scalable REST API with JWT authentication and role-based access control.

### Features
- 🔐 **JWT Authentication** – Secure token-based auth
- 👥 **Role-Based Access** – `user` and `admin` roles
- ✅ **Task CRUD** – Full create/read/update/delete for tasks
- 🛡️ **Input Validation** – Pydantic schemas on all endpoints
- 📄 **API Versioning** – All routes under `/api/v1`
    """,
    version="1.0.0",
    contact={"name": "Task Manager API"},
    license_info={"name": "MIT"},
)

# CORS – allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://task-manager-primetrade.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(api_router)


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}
