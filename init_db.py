import sqlite3
import logging
import os
from config import DB_PATH

# Konfigurer logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')

def init_database():
    """
    Initialiserer databasen manuelt.
    """
    # Kontroller om databasefilen allerede eksisterer
    if os.path.exists(DB_PATH):
        logging.info(f"Databasefil {DB_PATH} eksisterer allerede.")
        create_new = input("Vil du slette den eksisterende database og oprette en ny? (j/n): ").lower()
        if create_new != 'j':
            logging.info("Afbryder database-initialisering.")
            return
        else:
            logging.info(f"Sletter eksisterende databasefil {DB_PATH}.")
            os.remove(DB_PATH)
    
    # Opret forbindelse til databasen (opretter filen, hvis den ikke findes)
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Opret tabeller
        logging.info("Opretter tabeller...")
        
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
        logging.info(f"Database initialiseret korrekt i {DB_PATH}")
        
        # Test database forbindelsen med en simpel indsættelse
        cursor.execute("INSERT INTO installations VALUES (?, ?, ?, ?, ?)", 
                      ("TEST-DB", "Testadresse 1", "Test Kunde", None, None))
        conn.commit()
        logging.info("Test-installation oprettet. Database fungerer korrekt.")
        
        conn.close()
        
    except sqlite3.Error as e:
        logging.error(f"Fejl ved initialisering af database: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    init_database()