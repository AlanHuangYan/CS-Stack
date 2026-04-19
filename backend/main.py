from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.directions import router as directions_router
from backend.routes.subdirections import router as subdirections_router
from backend.routes.courses import router as courses_router
from backend.routes.users import router as users_router

app = FastAPI(title="CS-Stack API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(directions_router, prefix="/api/directions", tags=["directions"])
app.include_router(subdirections_router, prefix="/api/subdirections", tags=["subdirections"])
app.include_router(courses_router, prefix="/api/courses", tags=["courses"])
app.include_router(users_router, prefix="/api/users", tags=["users"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
