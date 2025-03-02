import logging
import sqlite3
from datetime import datetime
from models import Installation, TestResult, TestType, TestStatus
from config import DB_PATH

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    """Main entry point for the application."""
    # Forbind til database
    try:
        conn = sqlite3.connect(DB_PATH)
        
        # Initaliser database
        init_database(conn)
        
        # Start brugergrænsefladen når den er lavet 
        # start_ui
        
        # Midlertidig test-kode
        test_app(conn)
        
        # Luk forbindelse
        conn.close()
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")

def init_database(conn):
    """
    Initialize database schema if tables don't exist.
    
    Args:
        conn: SQLite database connection object
    """
    cursor = conn.cursor()
    
    try:
        # Opret tabeller hvis de ikke eksisterer
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS installations (
            id TEXT PRIMARY KEY,
            address TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            installation_date TEXT,
            last_inspection TEXT
        )                              
        ''')
        
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            installation_id TEXT,
            test_type TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            notes TEXT,
            image_path TEXT,
            FOREIGN KEY (installation_id) REFERENCES installations (id)
        )                    
        ''')
        
        conn.commit()
        logging.info("Database initialized successfully")
    except sqlite3.Error as e:
        logging.error(f"Error initializing database: {e}")
        conn.rollback()
    
def test_app(conn):
    """Test function to demonstrate application functionality."""
    try:
        # Test-kode
        new_installation = Installation(
            id="INST-001",
            address="Eksempelvej 123, 8000 Aarhus C",
            customer_name="Jens Jensen"
        )

        # Gem installation i database
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO installations VALUES (?, ?, ?, ?, ?)",
            (
                new_installation.id,
                new_installation.address,
                new_installation.customer_name,
                new_installation.installation_date,
                new_installation.last_inspection
            )
        )
        
        # RCD Test
        rcd_test = TestResult(
            test_type=TestType.RCD,
            value=250.0,
            unit="ms",
            status=TestStatus.PASS,
            notes="30 mA Type A"
        )
        
        # Tilføj test til installation
        new_installation.add_test(rcd_test)
        
        # Gem i database
        cursor.execute(
            "INSERT INTO test_results (installation_id, test_type, value, unit, status, timestamp, notes, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                new_installation.id,
                rcd_test.test_type.value,
                rcd_test.value,
                rcd_test.unit,
                rcd_test.status.value,
                rcd_test.timestamp.isoformat(),
                rcd_test.notes,
                rcd_test.image_path
            )       
        )
        
        conn.commit()
        logging.info(f"Installation og test gemt for {new_installation.customer_name}")
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        conn.rollback()
    except Exception as e:
        logging.error(f"Error: {e}")

if __name__ == "__main__":
    main()