import uvicorn
import logging
import os
import sys

# Opsæt logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def main():
    """
    Starter FastAPI-serveren.
    """
    logging.info("Starter ElSikkerhed API...")
    
    # Kør serveren med live reload
    uvicorn.run(
        "api.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()