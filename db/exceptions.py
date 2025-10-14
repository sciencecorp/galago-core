from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request, exc: IntegrityError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=400, 
            content={"message": "Integrity error", "detail": str(exc.orig)}
        )