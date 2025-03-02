from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from enum import Enum

class TestStatus(Enum):
    PASS = "Godkendt"
    FAIL = "Ikke godkendt"
    WARNING = "Advarsel"

class TestType(Enum):
    RCD = "HPFI"
    INSULATION = "Isolationsmodstand"
    CONTINUITY = "Kontinuitet"
    SHORT_CIRCUIT = "Kortslutningsstrøm"
    GROUND_SPIKE = "Jordspyd"

@dataclass
class TestResult:
    test_type: TestType
    value: float
    unit: str
    status: TestStatus
    timestamp: datetime = datetime.now()
    notes: Optional[str] = None
    image_path: Optional[str] = None

@dataclass
class Installation:
    id: str
    address: str
    customer_name: str
    installation_date: Optional[datetime] = None
    last_inspection: Optional[datetime] = None 
    tests: List[TestResult] = None
    
    def __post_init__(self):
        if self.tests is None:
            self.test = []
    
    def add_test(self, test: TestResult):
        self.test.append(test)
        self.last_inspection = datetime.now()
        
   