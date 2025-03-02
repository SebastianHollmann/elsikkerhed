from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from enum import Enum

class TestStatus(Enum):
    PASS = "Godkendt"
    FAIL = "Ikke godkendt"
    WARNING = "Advarsel"

class TestType(Enum):
    RCD = "RCD Test"
    ISOLATION = "Isolationstest"
    CONTINUITY = "Kontinuitetstest"
    EARTHING = "Jordingstest"
    SHORT_CIRCUIT = "Kortslutningstest"

@dataclass
class TestResult:
    test_type: TestType
    value: float
    unit: str
    status: TestStatus
    notes: Optional[str] = None
    image_path: Optional[str] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

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
            self.tests = []
    
    def add_test(self, test: TestResult):
        """
        Add a test result to this installation.
        
        Args:
            test: A TestResult object to add
        
        Raises:
            TypeError: If test is not a TestResult object
        """
        if not isinstance(test, TestResult):
            raise TypeError("Test must be a TestResult object")
            
        self.tests.append(test)
        self.last_inspection = datetime.now()
        
   