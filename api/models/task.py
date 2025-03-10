from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    """Base model for Tasks."""
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    status: str = Field(..., description="Status for opgaven")
    priority: str = Field(..., description="Prioritet for opgaven")
    installation_id: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    estimated_hours: Optional[float] = None
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    """Model for creating a new task."""
    id: Optional[str] = None  # Valgfrit ID, genereres ellers automatisk

class TaskUpdate(BaseModel):
    """Model for updating an existing task."""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    installation_id: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None

class TaskResponse(TaskBase):
    """Model for task response."""
    id: str
    created_date: datetime
    completed_date: Optional[datetime] = None
    actual_hours: Optional[float] = None

    class Config:
        from_attributes = True