from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .routers import health, categories, products, sources


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Ceva Bun API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(categories.router, prefix="/v1")
    app.include_router(sources.router, prefix="/v1")
    app.include_router(products.router, prefix="/v1")

    return app


app = create_app()

