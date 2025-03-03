from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
import sqlite3
import logging
import sys
import os
from datetime import datetime
import uuid

# Tilføj projektets rodmappe til Python's path, så vi kan importere fra src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importér config og databaseværktøjer
from config import DB_PATH
from api.models.test import TestCreate, TestResponse, TestUpdate
from src.models import TestResult, TestType, TestStatus
from src.data.db import save_test_result, get_installation
from src.tests import validate_rcd_test

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

@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
async def create_test(
    test: TestCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Opretter et nyt testresultat for en installation.
    """
    try:
        conn = get_db_connection()
        
        # Tjek om installationen eksisterer
        installation = get_installation(conn, test.installation_id)
        if installation is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation med ID '{test.installation_id}' ikke fundet"
            )
        
        # Valider testværdien baseret på testtypen
        test_status = TestStatus.PASS  # Standard værdi
        
        # Hvis det er en RCD test, validerer vi den
        if test.test_type == TestType.RCD.value:
            try:
                rated_current = float(test.notes.split("mA")[0].strip()) if test.notes and "mA" in test.notes else 30
                test_status = validate_rcd_test(test.value, rated_current)
            except Exception as e:
                logging.warning(f"Kunne ikke validere RCD test: {e}")
                # Fortsæt med standard status hvis validering fejler
        
        # Konverter fra Pydantic model til domain model
        new_test = TestResult(
            test_type=TestType(test.test_type),
            value=test.value,
            unit=test.unit,
            status=test_status,
            notes=test.notes,
            image_path=test.image_path,
            timestamp=datetime.now()
        )
        
        # Gem testen
        success = save_test_result(conn, new_test, test.installation_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kunne ikke gemme testresultatet"
            )
        
        # Få ID'et for den nyligt indsatte test
        cursor = conn.cursor()
        cursor.execute("SELECT last_insert_rowid()")
        test_id = cursor.fetchone()[0]
        
        conn.close()
        
        # Konverter tilbage til response model
        return TestResponse(
            id=test_id,
            installation_id=test.installation_id,
            test_type=new_test.test_type.value,
            value=new_test.value,
            unit=new_test.unit,
            status=new_test.status.value,
            notes=new_test.notes,
            image_path=new_test.image_path,
            timestamp=new_test.timestamp
        )
        
    except Exception as e:
        logging.error(f"Fejl ved oprettelse af test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/{test_id}", response_model=TestResponse)
async def read_test(
    test_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Henter et specifikt testresultat baseret på ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, installation_id, test_type, value, unit, status, timestamp, notes, image_path FROM test_results WHERE id = ?",
            (test_id,)
        )
        row = cursor.fetchone()
        
        if row is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test med ID '{test_id}' ikke fundet"
            )
        
        conn.close()
        
        return TestResponse(
            id=row[0],
            installation_id=row[1],
            test_type=row[2],
            value=row[3],
            unit=row[4],
            status=row[5],
            timestamp=datetime.fromisoformat(row[6]) if row[6] else None,
            notes=row[7],
            image_path=row[8]
        )
        
    except Exception as e:
        logging.error(f"Fejl ved hentning af test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/", response_model=List[TestResponse])
async def list_all_tests(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """
    Henter en liste af alle testresultater med paginering.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hent tests med paginering
        cursor.execute(
            "SELECT id, installation_id, test_type, value, unit, status, timestamp, notes, image_path FROM test_results LIMIT ? OFFSET ?",
            (limit, skip)
        )
        rows = cursor.fetchall()
        
        tests = []
        for row in rows:
            tests.append(TestResponse(
                id=row[0],
                installation_id=row[1],
                test_type=row[2],
                value=row[3],
                unit=row[4],
                status=row[5],
                timestamp=datetime.fromisoformat(row[6]) if row[6] else None,
                notes=row[7],
                image_path=row[8]
            ))
            
        conn.close()
        return tests
        
    except Exception as e:
        logging.error(f"Fejl ved hentning af tests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/installation/{installation_id}", response_model=List[TestResponse])
async def list_tests_by_installation(
    installation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Henter alle testresultater for en specifik installation.
    """
    try:
        conn = get_db_connection()
        
        # Tjek om installationen eksisterer
        installation = get_installation(conn, installation_id)
        if installation is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation med ID '{installation_id}' ikke fundet"
            )
        
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, installation_id, test_type, value, unit, status, timestamp, notes, image_path FROM test_results WHERE installation_id = ?",
            (installation_id,)
        )
        rows = cursor.fetchall()
        
        tests = []
        for row in rows:
            tests.append(TestResponse(
                id=row[0],
                installation_id=row[1],
                test_type=row[2],
                value=row[3],
                unit=row[4],
                status=row[5],
                timestamp=datetime.fromisoformat(row[6]) if row[6] else None,
                notes=row[7],
                image_path=row[8]
            ))
        
        conn.close()
        return tests
        
    except Exception as e:
        logging.error(f"Fejl ved hentning af tests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: int,
    test_update: TestUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Opdaterer et eksisterende testresultat.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tjek om testen eksisterer
        cursor.execute("SELECT * FROM test_results WHERE id = ?", (test_id,))
        existing_test = cursor.fetchone()
        if existing_test is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test med ID '{test_id}' ikke fundet"
            )
        
        # Byg update query baseret på de angivne felter
        update_fields = {}
        update_values = []
        
        if test_update.value is not None:
            update_fields["value"] = test_update.value
        if test_update.unit is not None:
            update_fields["unit"] = test_update.unit
        if test_update.status is not None:
            update_fields["status"] = test_update.status
        if test_update.notes is not None:
            update_fields["notes"] = test_update.notes
        if test_update.image_path is not None:
            update_fields["image_path"] = test_update.image_path
        
        # Hvis der er felter at opdatere
        if update_fields:
            query = "UPDATE test_results SET "
            query += ", ".join([f"{key} = ?" for key in update_fields.keys()])
            query += " WHERE id = ?"
            
            values = list(update_fields.values())
            values.append(test_id)
            
            cursor.execute(query, values)
            conn.commit()
        
        # Hent den opdaterede test
        cursor.execute(
            "SELECT id, installation_id, test_type, value, unit, status, timestamp, notes, image_path FROM test_results WHERE id = ?",
            (test_id,)
        )
        row = cursor.fetchone()
        conn.close()
        
        return TestResponse(
            id=row[0],
            installation_id=row[1],
            test_type=row[2],
            value=row[3],
            unit=row[4],
            status=row[5],
            timestamp=datetime.fromisoformat(row[6]) if row[6] else None,
            notes=row[7],
            image_path=row[8]
        )
        
    except Exception as e:
        logging.error(f"Fejl ved opdatering af test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Sletter et testresultat.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tjek om testen eksisterer
        cursor.execute("SELECT id FROM test_results WHERE id = ?", (test_id,))
        if cursor.fetchone() is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test med ID '{test_id}' ikke fundet"
            )
        
        # Slet testen
        cursor.execute("DELETE FROM test_results WHERE id = ?", (test_id,))
        conn.commit()
        conn.close()
        
        return None
        
    except Exception as e:
        logging.error(f"Fejl ved sletning af test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_test_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload af billeddata for testresultater.
    """
    try:
        # Generere et unikt filnavn
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Opret mappen til testbilleder, hvis den ikke findes
        image_dir = os.path.join("static", "test_images")
        os.makedirs(image_dir, exist_ok=True)
        
        # Gem filen
        file_path = os.path.join(image_dir, unique_filename)
        with open(file_path, "wb") as image_file:
            content = await file.read()
            image_file.write(content)
        
        # Returner filstien som kan bruges til test-resultatet
        return {
            "image_path": file_path,
            "filename": unique_filename
        }
        
    except Exception as e:
        logging.error(f"Fejl ved upload af billede: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )