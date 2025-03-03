from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import sys

# Tilføj projektets rodmappe til Python's path, så vi kan importere fra src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Konfigurer logging
from config import LOG_LEVEL, LOG_FORMAT, APP_NAME, APP_VERSION
logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)

# Opret FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="API til ElSikkerhed applikationen",
    version=APP_VERSION
)

# Tilføj CORS middleware for at tillade cross-origin requests
# Dette er nødvendigt for at frontend kan kommunikere med API'et
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I produktion bør dette erstattes med specifikke domæner
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importér og inkludér router endpoints
from api.endpoints import auth, installations, tests

# Tilføj de forskellige endpoints til app
app.include_router(auth.router, prefix="/auth", tags=["Autentificering"])
app.include_router(installations.router, prefix="/installations", tags=["Installationer"])
app.include_router(tests.router, prefix="/tests", tags=["Tests"])

@app.get("/", tags=["Root"])
async def root():
    """
    Rod-endepunkt, returnerer en velkomstbesked.
    """
    return {
        "message": f"Velkommen til {APP_NAME} API",
        "version": APP_VERSION,
        "docs_url": "/docs",
        "endpoints": [
            "/auth", 
            "/installations", 
            "/tests"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)