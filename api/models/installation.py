from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InstallationBase(BaseModel):
    """
    Base model for Installation.
    """
    address: str = Field(..., min_length=3, max_length=255)
    customer_name: str = Field(..., min_length=2, max_length=100)
    installation_date: Optional[datetime] = None
    last_inspection: Optional[datetime] = None

class InstallationCreate(InstallationBase):
    """
    Model for creating a new installation.
    """
    id: str = Field(..., min_length=3, max_length=50)

class InstallationUpdate(BaseModel):
    """
    Model for updating an existing installation.
    Alle felter er valgfri, da vi kun opdaterer de felter, der er angivet.
    """
    address: Optional[str] = Field(None, min_length=3, max_length=255)
    customer_name: Optional[str] = Field(None, min_length=2, max_length=100)
    installation_date: Optional[datetime] = None
    last_inspection: Optional[datetime] = None

class InstallationResponse(InstallationBase):
    """
    Model for installation response.
    """
    id: str

    class Config:
        orm_mode = True  # Tillader konvertering fra ORM modeller