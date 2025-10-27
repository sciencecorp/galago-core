import typing as t
from contextlib import asynccontextmanager
import logging
import os
import subprocess
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.models.db_session import SessionLocal, LogsSessionLocal, Base, LogBase, inventory_engine
from db.initializers import initialize_database
from .exceptions import setup_exception_handlers
from .routers import (
    inventory,
    workcells,
    tools,
    nests,
    plates,
    wells,
    reagents,
    scripts,
    script_folders,
    variables,
    labware,
    settings,
    logs,
    protocols,
    hotels,
    forms,
    robot_arm
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"


def stamp_fresh_database() -> None:
    """Stamp a fresh database with the latest Alembic migration version."""
    try:
        # Check if alembic_version table exists
        with inventory_engine.connect() as conn:
            result = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'")
            has_alembic_table = result.fetchone() is not None
        
        if not has_alembic_table:
            # This is a fresh database - stamp it with the current migration version
            logging.info("Fresh database detected. Stamping with latest migration version...")
            
            # Get the db directory (where alembic.ini is located)
            db_dir = os.path.dirname(os.path.abspath(__file__))
            
            result = subprocess.run(
                ["python", "-m", "alembic", "stamp", "head"],
                cwd=db_dir,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logging.info("Database stamped successfully with latest migration.")
            else:
                logging.warning(f"Could not stamp database. Error: {result.stderr}")
        else:
            logging.info("Existing database with migration history detected.")
            
    except Exception as e:
        logging.warning(f"Could not check/stamp database with Alembic: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI) -> t.AsyncGenerator[None, None]:
    try:
        # Create all tables
        Base.metadata.create_all(bind=SessionLocal().get_bind())
        LogBase.metadata.create_all(bind=LogsSessionLocal().get_bind())
        
        # Stamp fresh database with Alembic if needed
        stamp_fresh_database()
        
        # Initialize database with default data
        db = SessionLocal()
        try:
            initialize_database(db)
            logging.info("Database initialization complete (excluding tool-specific defaults).")
        finally:
            db.close()
    except Exception as e:
        logging.error(e)
        raise e
    
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Inventory API", lifespan=lifespan, root_path="/api")
    
    # CORS middleware
    origins = ["http://localhost:3010", "http://127.0.0.1:3010"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    
    # Setup exception handlers
    setup_exception_handlers(app)
    
    # Health check endpoint
    @app.get("/health")
    def health_check() -> t.Dict[str, str]:
        return {"status": "ok"}
    
    app.include_router(inventory.router, tags=["inventory"])
    app.include_router(workcells.router, prefix="/workcells", tags=["workcells"])
    app.include_router(tools.router, prefix="/tools", tags=["tools"])
    app.include_router(nests.router, prefix="/nests", tags=["nests"])
    app.include_router(plates.router, prefix="/plates", tags=["plates"])
    app.include_router(wells.router, prefix="/wells", tags=["wells"])
    app.include_router(reagents.router, prefix="/reagents", tags=["reagents"])
    app.include_router(scripts.router, prefix="/scripts", tags=["scripts"])
    app.include_router(script_folders.router, prefix="/script-folders", tags=["script-folders"])
    app.include_router(variables.router, prefix="/variables", tags=["variables"])
    app.include_router(labware.router, prefix="/labware", tags=["labware"])
    app.include_router(settings.router, prefix="/settings", tags=["settings"])
    app.include_router(logs.router, prefix="/logs", tags=["logs"])
    app.include_router(protocols.router, prefix="/protocols", tags=["protocols"])
    app.include_router(hotels.router, prefix="/hotels", tags=["hotels"])
    app.include_router(forms.router, prefix="/forms", tags=["forms"])
    app.include_router(robot_arm.router, prefix="/robot-arm", tags=["robot-arm"])
    
    return app


app = create_app()