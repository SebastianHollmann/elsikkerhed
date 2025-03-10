from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import sqlite3
import logging
import sys
import os
from datetime import datetime
import uuid

# Tilføj projektets rodmappe til Python's path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import konfiguration og værktøjer
from config import DB_PATH
from api.models.task import TaskCreate, TaskResponse, TaskUpdate
from src.models import Task, TaskStatus, TaskPriority
from src.data.db import get_installation

# Import authentication
from api.endpoints.auth import get_current_active_user, User

router = APIRouter()

def get_db_connection():
    """Opretter forbindelse til SQLite-databasen."""
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        logging.error(f"Fejl ved database forbindelse: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Databasefejl"
        )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Opretter en ny opgave."""
    try:
        conn = get_db_connection()
        
        # Tjek om installationen eksisterer
        if task.installation_id:
            installation = get_installation(conn, task.installation_id)
            if installation is None:
                conn.close()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Installation med ID '{task.installation_id}' ikke fundet"
                )
        
        # Generer et unikt ID
        task_id = task.id if task.id else f"TASK-{uuid.uuid4().hex[:8].upper()}"
        
        # Opret task objekt
        new_task = Task(
            id=task_id,
            title=task.title,
            description=task.description,
            status=TaskStatus(task.status),
            priority=TaskPriority(task.priority),
            installation_id=task.installation_id,
            created_date=datetime.now(),
            due_date=task.due_date,
            completed_date=None,
            assigned_to=task.assigned_to,
            estimated_hours=task.estimated_hours,
            actual_hours=None,
            notes=task.notes
        )
        
        # Gem i database
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO tasks (
                id, title, description, status, priority, installation_id,
                created_date, due_date, completed_date, assigned_to,
                estimated_hours, actual_hours, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                new_task.id,
                new_task.title,
                new_task.description,
                new_task.status.value,
                new_task.priority.value,
                new_task.installation_id,
                new_task.created_date.isoformat(),
                new_task.due_date.isoformat() if new_task.due_date else None,
                new_task.completed_date.isoformat() if new_task.completed_date else None,
                new_task.assigned_to,
                new_task.estimated_hours,
                new_task.actual_hours,
                new_task.notes
            )
        )
        conn.commit()
        conn.close()
        
        # Returner respons
        return TaskResponse(
            id=new_task.id,
            title=new_task.title,
            description=new_task.description,
            status=new_task.status.value,
            priority=new_task.priority.value,
            installation_id=new_task.installation_id,
            created_date=new_task.created_date,
            due_date=new_task.due_date,
            completed_date=new_task.completed_date,
            assigned_to=new_task.assigned_to,
            estimated_hours=new_task.estimated_hours,
            actual_hours=new_task.actual_hours,
            notes=new_task.notes
        )
    except Exception as e:
        logging.error(f"Fejl ved oprettelse af opgave: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def read_task(
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Henter en specifik opgave baseret på ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """SELECT id, title, description, status, priority, installation_id,
                    created_date, due_date, completed_date, assigned_to,
                    estimated_hours, actual_hours, notes
                FROM tasks WHERE id = ?""",
            (task_id,)
        )
        row = cursor.fetchone()
        
        if row is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opgave med ID '{task_id}' ikke fundet"
            )
        
        conn.close()
        
        return TaskResponse(
            id=row[0],
            title=row[1],
            description=row[2],
            status=row[3],
            priority=row[4],
            installation_id=row[5],
            created_date=datetime.fromisoformat(row[6]) if row[6] else None,
            due_date=datetime.fromisoformat(row[7]) if row[7] else None,
            completed_date=datetime.fromisoformat(row[8]) if row[8] else None,
            assigned_to=row[9],
            estimated_hours=row[10],
            actual_hours=row[11],
            notes=row[12]
        )
    except Exception as e:
        logging.error(f"Fejl ved hentning af opgave: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    installation_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Henter en liste af opgaver med mulighed for filtrering."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Byg query med filtrering
        query = """SELECT id, title, description, status, priority, installation_id,
                        created_date, due_date, completed_date, assigned_to,
                        estimated_hours, actual_hours, notes
                   FROM tasks WHERE 1=1"""
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if installation_id:
            query += " AND installation_id = ?"
            params.append(installation_id)
            
        if assigned_to:
            query += " AND assigned_to = ?"
            params.append(assigned_to)
            
        query += " ORDER BY created_date DESC LIMIT ? OFFSET ?"
        params.extend([limit, skip])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        tasks = []
        for row in rows:
            tasks.append(TaskResponse(
                id=row[0],
                title=row[1],
                description=row[2],
                status=row[3],
                priority=row[4],
                installation_id=row[5],
                created_date=datetime.fromisoformat(row[6]) if row[6] else None,
                due_date=datetime.fromisoformat(row[7]) if row[7] else None,
                completed_date=datetime.fromisoformat(row[8]) if row[8] else None,
                assigned_to=row[9],
                estimated_hours=row[10],
                actual_hours=row[11],
                notes=row[12]
            ))
            
        conn.close()
        return tasks
    except Exception as e:
        logging.error(f"Fejl ved hentning af opgaver: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Opdaterer en eksisterende opgave."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tjek om opgaven eksisterer
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        if cursor.fetchone() is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opgave med ID '{task_id}' ikke fundet"
            )
        
        # Byg update query baseret på de felter, der er angivet
        update_fields = {}
        params = []
        
        # Gå gennem alle egenskaber i opdateringen
        for key, value in task_update.dict(exclude_unset=True).items():
            update_fields[key] = value
            params.append(value)
        
        # Særlig håndtering for completed_date - sæt det automatisk hvis status ændres til COMPLETED
        if task_update.status == TaskStatus.COMPLETED.value:
            if 'completed_date' not in update_fields or update_fields['completed_date'] is None:
                update_fields['completed_date'] = datetime.now().isoformat()
                params.append(update_fields['completed_date'])
        
        # Hvis der er felter at opdatere
        if update_fields:
            query = "UPDATE tasks SET "
            query += ", ".join([f"{key} = ?" for key in update_fields.keys()])
            query += " WHERE id = ?"
            params.append(task_id)
            
            cursor.execute(query, params)
            conn.commit()
        
        # Hent den opdaterede opgave
        cursor.execute(
            """SELECT id, title, description, status, priority, installation_id,
                    created_date, due_date, completed_date, assigned_to,
                    estimated_hours, actual_hours, notes
                FROM tasks WHERE id = ?""",
            (task_id,)
        )
        row = cursor.fetchone()
        conn.close()
        
        return TaskResponse(
            id=row[0],
            title=row[1],
            description=row[2],
            status=row[3],
            priority=row[4],
            installation_id=row[5],
            created_date=datetime.fromisoformat(row[6]) if row[6] else None,
            due_date=datetime.fromisoformat(row[7]) if row[7] else None,
            completed_date=datetime.fromisoformat(row[8]) if row[8] else None,
            assigned_to=row[9],
            estimated_hours=row[10],
            actual_hours=row[11],
            notes=row[12]
        )
    except Exception as e:
        logging.error(f"Fejl ved opdatering af opgave: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Sletter en opgave."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tjek om opgaven eksisterer
        cursor.execute("SELECT id FROM tasks WHERE id = ?", (task_id,))
        if cursor.fetchone() is None:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opgave med ID '{task_id}' ikke fundet"
            )
        
        # Slet opgaven
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        conn.close()
        
        return None
    except Exception as e:
        logging.error(f"Fejl ved sletning af opgave: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Serverfejl: {str(e)}"
        )