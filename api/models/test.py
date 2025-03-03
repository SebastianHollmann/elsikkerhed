from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TestBase(BaseModel):
    """
    Base model for Test results.
    """
    test_type: str = Field(..., description="Type af test")
    value: float = Field(..., description="Testens måleværdi")
    unit: str = Field(..., description="Måleenheden for værdien")
    notes: Optional[str] = Field(None, description="Supplerende bemærkninger til testen")
    image_path: Optional[str] = Field(None, description="Sti til billede af testresultatet")

class TestCreate(TestBase):
    """
    Model for creating a new test result.
    """
    installation_id: str = Field(..., description="ID på installationen denne test tilhører")

class TestUpdate(BaseModel):
    """
    Model for updating an existing test result.
    """
    value: Optional[float] = Field(None, description="Ny måleværdi")
    unit: Optional[str] = Field(None, description="Ny måleenhed")
    status: Optional[str] = Field(None, description="Ny status (Godkendt/Ikke godkendt/Advarsel)")
    notes: Optional[str] = Field(None, description="Nye bemærkninger")
    image_path: Optional[str] = Field(None, description="Ny sti til billede")

class TestResponse(TestBase):
    """
    Model for test response.
    """
    id: int
    installation_id: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True  # Tillader konvertering fra ORM modeller (tidligere orm_mode)