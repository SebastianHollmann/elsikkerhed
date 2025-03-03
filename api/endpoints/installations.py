from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import sqlite3
import logging
import sys
import os
from datetime import datetime

# Tilføj projektets rodmappe til Python's path, så vi kan importere fra src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importér config og databaseværktøjer
from config import DB_PATH
from api.models.installation import InstallationCreate, InstallationResponse, InstallationUpdate
from src.models import Installation
from src.data.db import save_installation, get_installation

# Importér authentication dependencies
from api.endpoints.auth import get_current_active_user, User

router = APIRouter()

def get_db_connection():
    """
    Opretter en forbindelse til SQLite-databasen.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        logging.error(f"Fejl ved oprettelse af database forbindelse: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Databasefejl"
        )

@router.post("/", response_model=InstallationResponse, status_code=status.HTTP_201_CREATED)
async def create_installation(
    installation: InstallationCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Opretter en ny installation.
    """
    try:
        conn = get_db_connection()
        
        # Konverter fra Pydantic model til domain model
        new_installation = Installation(
            id=installation.id,
            address=installation.address,
            customer_name=installation.customer_name,
            installation_date=installation.installation_date,
            last_inspection=installation.last_inspection
        )
        
        # Gem installationen
        success = save_installation(conn, new_installation)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kunne ikke gemme installationen"
            )
        
        # Luk forbindelsen
        conn.close()
        
        # Konverter tilbage til response model
        return InstallationResponse(
            id=new_installation.id,
            address=new_installation.address,
            customer_name=new_installation.customer_name,
            installation_date=new_installation.installation_date,
            last_inspection=new_installation.last_inspection
        )
        
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Installation med ID '{installation.id}' eksisterer allerede"
        )
    except Exception as e:
        logging.error(f"Fejl ved oprettelse af installation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/{installation_id}", response_model=InstallationResponse)
async def read_installation(
    installation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Henter en specifik installation baseret på ID.
    """
    try:
        conn = get_db_connection()
        installation = get_installation(conn, installation_id)
        conn.close()
        
        if installation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation med ID '{installation_id}' ikke fundet"
            )
            
        return InstallationResponse(
            id=installation.id,
            address=installation.address,
            customer_name=installation.customer_name,
            installation_date=installation.installation_date,
            last_inspection=installation.last_inspection
        )
        
    except Exception as e:
        logging.error(f"Fejl ved hentning af installation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/", response_model=List[InstallationResponse])
async def list_installations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """
    Henter en liste af installationer med paginering.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hent installationer med paginering
        cursor.execute(
            "SELECT id, address, customer_name, installation_date, last_inspection FROM installations LIMIT ? OFFSET ?",
            (limit, skip)
        )
        rows = cursor.fetchall()
        
        installations = []
        for row in rows:
            installations.append(InstallationResponse(
                id=row[0],
                address=row[1],
                customer_name=row[2],
                installation_date=row[3],
                last_inspection=row[4]
            ))
            
        conn.close()
        return installations
        
    except Exception as e:
        logging.error(f"Fejl ved hentning af installationer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.put("/{installation_id}", response_model=InstallationResponse)
async def update_installation(
    installation_id: str,
    installation_update: InstallationUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Opdaterer en eksisterende installation.
    """
    try:
        conn = get_db_connection()
        
        # Tjek om installationen eksisterer
        existing_installation = get_installation(conn, installation_id)
        if existing_installation is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation med ID '{installation_id}' ikke fundet"
            )
        
        # Opdater felter, hvis de er inkluderet i update
        cursor = conn.cursor()
        update_fields = {}
        update_values = []
        
        if installation_update.address is not None:
            update_fields["address"] = installation_update.address
        if installation_update.customer_name is not None:
            update_fields["customer_name"] = installation_update.customer_name
        if installation_update.installation_date is not None:
            update_fields["installation_date"] = installation_update.installation_date
        if installation_update.last_inspection is not None:
            update_fields["last_inspection"] = installation_update.last_inspection
        
        # Hvis der er felter at opdatere
        if update_fields:
            query = "UPDATE installations SET "
            query += ", ".join([f"{key} = ?" for key in update_fields.keys()])
            query += " WHERE id = ?"
            
            values = list(update_fields.values())
            values.append(installation_id)
            
            cursor.execute(query, values)
            conn.commit()
        
        # Hent den opdaterede installation
        updated_installation = get_installation(conn, installation_id)
        conn.close()
        
        return InstallationResponse(
            id=updated_installation.id,
            address=updated_installation.address,
            customer_name=updated_installation.customer_name,
            installation_date=updated_installation.installation_date,
            last_inspection=updated_installation.last_inspection
        )
        
    except Exception as e:
        logging.error(f"Fejl ved opdatering af installation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.delete("/{installation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_installation(
    installation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Sletter en installation.
    """
    try:
        conn = get_db_connection()
        
        # Tjek om installationen eksisterer
        existing_installation = get_installation(conn, installation_id)
        if existing_installation is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation med ID '{installation_id}' ikke fundet"
            )
        
        # Slet installationen
        cursor = conn.cursor()
        cursor.execute("DELETE FROM installations WHERE id = ?", (installation_id,))
        conn.commit()
        conn.close()
        
        return None
        
    except Exception as e:
        logging.error(f"Fejl ved sletning af installation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )