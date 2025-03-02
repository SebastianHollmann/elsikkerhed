import sqlite3
import logging
from typing import Optional
from models import Installation, TestResult

def save_installation(conn, installation: Installation) -> bool:
    """
    Save an installation to the database.
    
    Args:
        conn: SQLite database connection
        installation: Installation object to save
        
    Returns:
        bool: True if successful, False otherwise
    """
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT OR REPLACE INTO installations VALUES (?, ?, ?, ?, ?)",
            (
                installation.id,
                installation.address,
                installation.customer_name,
                installation.installation_date,
                installation.last_inspection
            )
        )
        conn.commit()
        return True
    except sqlite3.Error as e:
        logging.error(f"Error saving installation: {e}")
        conn.rollback()
        return False

def save_test_result(conn, test: TestResult, installation_id: str) -> bool:
    """
    Save a test result to the database.
    
    Args:
        conn: SQLite database connection
        test: TestResult object to save
        installation_id: ID of the installation this test belongs to
        
    Returns:
        bool: True if successful, False otherwise
    """
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO test_results (installation_id, test_type, value, unit, status, timestamp, notes, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                installation_id,
                test.test_type.value,
                test.value,
                test.unit,
                test.status.value,
                test.timestamp.isoformat(),
                test.notes,
                test.image_path
            )       
        )
        conn.commit()
        return True
    except sqlite3.Error as e:
        logging.error(f"Error saving test result: {e}")
        conn.rollback()
        return False

def get_installation(conn, installation_id: str) -> Optional[Installation]:
    """
    Get an installation by ID.
    
    Args:
        conn: SQLite database connection
        installation_id: ID of the installation to retrieve
        
    Returns:
        Optional[Installation]: Installation object if found, None otherwise
    """
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM installations WHERE id = ?", (installation_id,))
        row = cursor.fetchone()
        if row:
            return Installation(
                id=row[0],
                address=row[1],
                customer_name=row[2],
                installation_date=row[3],
                last_inspection=row[4]
            )
        return None
    except sqlite3.Error as e:
        logging.error(f"Error retrieving installation: {e}")
        return None
