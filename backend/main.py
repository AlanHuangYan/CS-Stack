import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.logger import setup_logger
from backend.routes.directions import router as directions_router
from backend.routes.subdirections import router as subdirections_router
from backend.routes.courses import router as courses_router
from backend.routes.users import router as users_router
from backend.routes.paths import router as paths_router
from backend.routes.skilltree import router as skilltree_router
from backend.routes.xp import router as xp_router
from backend.routes.studyplan import router as studyplan_router
from backend.routes.admin import router as admin_router

logger = setup_logger()

app = FastAPI(title="CS-Stack API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("%s %s -> %d", request.method, request.url.path, response.status_code)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误"},
    )


app.include_router(directions_router, prefix="/api/directions", tags=["directions"])
app.include_router(subdirections_router, prefix="/api/subdirections", tags=["subdirections"])
app.include_router(courses_router, prefix="/api/courses", tags=["courses"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(paths_router, prefix="/api/paths", tags=["paths"])
app.include_router(skilltree_router, prefix="/api/skilltree", tags=["skilltree"])
app.include_router(xp_router, prefix="/api/xp", tags=["xp"])
app.include_router(studyplan_router, prefix="/api/studyplan", tags=["studyplan"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
