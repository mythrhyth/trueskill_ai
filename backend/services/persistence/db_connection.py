import os
import sqlite3
import logging
from contextlib import contextmanager

logger = logging.getLogger("trueskill_persistence")
logger.setLevel(logging.INFO)

# Optional psycopg2 import for PostgreSQL support
psycopg2 = None
try:
    import psycopg2
except ImportError:
    logger.warning("psycopg2 not installed. PostgreSQL support will not be available.")

DATABASE_URL = os.environ.get("DATABASE_URL")


def is_postgres_configured() -> bool:
    """Check if PostgreSQL is configured in environment variables."""
    return bool(DATABASE_URL and (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")))


@contextmanager
def get_db_connection():
    """
    Context manager to obtain a database connection.
    Yields (conn, is_postgres).
    Falls back to a local SQLite database if PostgreSQL connection fails or is not configured.
    """
    conn = None
    is_postgres = False

    if is_postgres_configured() and psycopg2:
        try:
            conn = psycopg2.connect(DATABASE_URL)
            is_postgres = True
            logger.info("Connected to PostgreSQL database successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}. Falling back to SQLite.")

    if conn is None:
        # Resolve path to local SQLite database in the persistence service directory
        db_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(db_dir, "trueskill.db")
        try:
            conn = sqlite3.connect(db_path)
            is_postgres = False
            logger.info(f"Connected to local SQLite database at {db_path}.")
        except Exception as e:
            logger.critical(f"Failed to initialize SQLite database: {e}")
            raise e

    try:
        yield conn, is_postgres
    finally:
        if conn:
            conn.close()


def initialize_db():
    """
    Safely initializes the database table if it doesn't already exist.
    """
    ddl = """
    CREATE TABLE IF NOT EXISTS candidate_results (
        candidate_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        role VARCHAR(255),
        extracted_skills TEXT,
        validated_skills TEXT,
        score REAL,
        matched_roles TEXT,
        analysis_summary TEXT,
        authenticity_metrics TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    try:
        with get_db_connection() as (conn, is_postgres):
            cursor = conn.cursor()
            try:
                cursor.execute(ddl)
                conn.commit()

                # For SQLite, check and alter table if columns are missing
                if not is_postgres:
                    cursor.execute("PRAGMA table_info(candidate_results)")
                    columns = [col[1] for col in cursor.fetchall()]
                    if "email" not in columns:
                        cursor.execute("ALTER TABLE candidate_results ADD COLUMN email VARCHAR(255)")
                        conn.commit()
                    if "role" not in columns:
                        cursor.execute("ALTER TABLE candidate_results ADD COLUMN role VARCHAR(255)")
                        conn.commit()

                # Seed mock candidate IDs with high quality real user names, emails, and roles
                seeded_candidates = {
                    "req_109fsc3": ("Rahul Agarwal", "rahul.agarwal@example.com", "Lead Backend Engineer"),
                    "req_qf2o6dc": ("Priya Sharma", "priya.sharma@example.com", "Frontend Architect"),
                    "req_9bl5b33": ("Amit Mehta", "amit.mehta@example.com", "Machine Learning Engineer"),
                    "req_12345": ("Unknown User", "unknown@example.com", "Software Engineer"),
                    "req_xcs9nee": ("Rohan Das", "rohan.das@example.com", "Full Stack Developer"),
                    "req_88pb5sl": ("Neha Gupta", "neha.gupta@example.com", "DevOps Specialist"),
                    "req_3dgyzjp": ("Vikram Singh", "vikram.singh@example.com", "Security Engineer"),
                    "req_t549q9j": ("Aditi Rao", "aditi.rao@example.com", "Product Manager"),
                    "req_xlals0e": ("Siddharth Nair", "siddharth.nair@example.com", "Mobile Engineer"),
                    "req_gxa8gk7": ("Ananya Patel", "ananya.patel@example.com", "Data Scientist"),
                    "req_fny7tvv": ("Karan Malhotra", "karan.malhotra@example.com", "Cloud Architect"),
                    "req_m23levx": ("Tanvi Joshi", "tanvi.joshi@example.com", "QA Engineer"),
                    "req_7kh7ooa": ("Varun Verma", "varun.verma@example.com", "UI/UX Developer"),
                    "req_jd51q6o": ("Divya Reddy", "divya.reddy@example.com", "System Engineer")
                }

                for cid, (name, email, role) in seeded_candidates.items():
                    if is_postgres:
                        cursor.execute("""
                            UPDATE candidate_results 
                            SET name = %s, email = %s, role = %s 
                            WHERE candidate_id = %s
                        """, (name, email, role, cid))
                    else:
                        cursor.execute("""
                            UPDATE candidate_results 
                            SET name = ?, email = ?, role = ? 
                            WHERE candidate_id = ?
                        """, (name, email, role, cid))
                conn.commit()

            finally:
                cursor.close()
            logger.info("Database table 'candidate_results' initialized and seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}", exc_info=True)


# Auto-initialize database on module import
initialize_db()
