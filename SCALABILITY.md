# Scalability Note

## Current Architecture

The application currently follows a **monolithic architecture**, but it is designed with a **modular structure** that allows components to be separated into independent services if the system grows.
 
```
Client → FastAPI API → PostgreSQL (Neon)
```

The backend is implemented using **FastAPI**, which supports asynchronous request handling and high concurrency. The database is hosted on **Neon (serverless PostgreSQL)**, which provides automatic scaling for storage and compute resources.

---

## Scalability Strategies

### 1. Stateless Authentication

Authentication is implemented using **JWT tokens**, which makes the API stateless.
Because no session data is stored on the server, multiple API instances can run behind a load balancer.

```
Client
  └─→ Load Balancer
        ├─→ FastAPI Instance 1
        ├─→ FastAPI Instance 2
        └─→ FastAPI Instance 3
              └─→ PostgreSQL
```

This enables **horizontal scaling** of the backend when traffic increases.

---

### 2. Database Scaling

The database layer can scale through several strategies:

* **Read replicas** to handle large volumes of read queries.
* **Connection pooling** using tools such as PgBouncer to efficiently manage database connections.
* **Indexing** on frequently queried fields such as `email`, `username`, and `owner_id`.

These techniques help maintain performance under high load.

---

### 3. Caching Layer

Frequently accessed data (for example task lists or user profiles) can be cached using **Redis**.

Benefits of caching include:

* Reduced load on the database
* Faster response times
* Temporary storage with TTL (time-to-live) expiration

Libraries such as **fastapi-cache2** can integrate Redis caching with FastAPI endpoints.

---

### 4. Modular Service Architecture

The backend is structured in separate modules:

| Module     | Responsibility                 |
| ---------- | ------------------------------ |
| `auth.py`  | Authentication and login logic |
| `users.py` | User management                |
| `tasks.py` | Task CRUD operations           |

This structure allows the application to evolve into **microservices** if needed, where each module can run as an independent service.

---

### 5. Background Job Processing

Long-running operations such as:

* sending email notifications
* exporting reports
* processing heavy data operations

can be handled using **background workers**.

Technologies such as **Celery with Redis** can process these tasks asynchronously so the API remains responsive.

---

### 6. Containerized Deployment

The system can be deployed using **Docker containers**, enabling consistent environments across development and production.

Example architecture:

* FastAPI backend containers deployed on **AWS ECS or Kubernetes**
* Managed PostgreSQL database using **Neon or AWS RDS**
* Frontend hosted via **Vercel or a CDN**
* An **API Gateway** to manage routing, authentication, and rate limiting

---

## Summary

| Concern                  | Solution                                          |
| ------------------------ | ------------------------------------------------- |
| Stateless authentication | JWT tokens                                        |
| Horizontal scaling       | Multiple FastAPI instances behind a load balancer |
| Database load            | Read replicas and connection pooling              |
| Performance optimization | Redis caching                                     |
| Long-running operations  | Background workers (Celery + Redis)               |
| Deployment               | Docker-based containerized infrastructure         |
