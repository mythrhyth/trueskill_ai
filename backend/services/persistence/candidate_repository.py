import json
import logging
from .db_connection import get_db_connection

logger = logging.getLogger("trueskill_persistence")


def serialize_json_field(val) -> str:
    """Helper to serialize dict/list fields to JSON strings."""
    if val is None:
        return json.dumps([])
    if isinstance(val, (list, dict)):
        return json.dumps(val)
    return str(val)


def deserialize_json_field(val):
    """Helper to deserialize JSON strings back to python dict/list."""
    if not val:
        return []
    try:
        # If it is already a dictionary/list, return as is
        if isinstance(val, (dict, list)):
            return val
        return json.loads(val)
    except Exception:
        return val


def save_candidate_result(data: dict) -> bool:
    """
    Saves or updates a candidate result record in the database.
    Uses UPSERT logic to handle conflict on candidate_id.
    """
    try:
        candidate_id = data.get("candidate_id")
        if not candidate_id:
            logger.error("Cannot save candidate result: 'candidate_id' is missing.")
            return False

        name = data.get("name", "Unknown Candidate")
        email = data.get("email", "unknown@example.com")
        role = data.get("role", "Software Engineer")
        extracted_skills = serialize_json_field(data.get("extracted_skills", []))
        validated_skills = serialize_json_field(data.get("validated_skills", []))
        score = float(data.get("score", 0.0))
        matched_roles = serialize_json_field(data.get("matched_roles", []))
        analysis_summary = serialize_json_field(data.get("analysis_summary", {}))
        authenticity_metrics = serialize_json_field(data.get("authenticity_metrics", {}))

        with get_db_connection() as (conn, is_postgres):
            placeholder = "%s" if is_postgres else "?"
            
            # Construct the UPSERT SQL
            query = f"""
            INSERT INTO candidate_results (
                candidate_id, name, email, role, extracted_skills, validated_skills, score, matched_roles, analysis_summary, authenticity_metrics
            ) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
            ON CONFLICT(candidate_id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                extracted_skills = EXCLUDED.extracted_skills,
                validated_skills = EXCLUDED.validated_skills,
                score = EXCLUDED.score,
                matched_roles = EXCLUDED.matched_roles,
                analysis_summary = EXCLUDED.analysis_summary,
                authenticity_metrics = EXCLUDED.authenticity_metrics,
                created_at = CURRENT_TIMESTAMP
            """
            
            cursor = conn.cursor()
            try:
                cursor.execute(query, (
                    candidate_id,
                    name,
                    email,
                    role,
                    extracted_skills,
                    validated_skills,
                    score,
                    matched_roles,
                    analysis_summary,
                    authenticity_metrics
                ))
                conn.commit()
            finally:
                cursor.close()
                
            logger.info(f"Saved candidate result successfully for candidate_id: {candidate_id}")
            return True
    except Exception as e:
        logger.error(f"Failed to save candidate result to database: {e}", exc_info=True)
        return False


def get_candidate_result(candidate_id: str) -> dict:
    """
    Retrieves a candidate result record from the database by candidate_id.
    """
    try:
        with get_db_connection() as (conn, is_postgres):
            placeholder = "%s" if is_postgres else "?"
            query = f"""
            SELECT 
                candidate_id, name, email, role, extracted_skills, validated_skills, 
                score, matched_roles, analysis_summary, authenticity_metrics, created_at 
            FROM candidate_results 
            WHERE candidate_id = {placeholder}
            """
            
            cursor = conn.cursor()
            try:
                cursor.execute(query, (candidate_id,))
                row = cursor.fetchone()
                if row:
                    # Parse timestamp if it is returned as datetime object or string
                    created_at_val = row[10]
                    if hasattr(created_at_val, "isoformat"):
                        created_at_val = created_at_val.isoformat()
                    else:
                        created_at_val = str(created_at_val)
                        
                    return {
                        "candidate_id": row[0],
                        "name": row[1],
                        "email": row[2],
                        "role": row[3],
                        "extracted_skills": deserialize_json_field(row[4]),
                        "validated_skills": deserialize_json_field(row[5]),
                        "score": row[6],
                        "matched_roles": deserialize_json_field(row[7]),
                        "analysis_summary": deserialize_json_field(row[8]),
                        "authenticity_metrics": deserialize_json_field(row[9]),
                        "created_at": created_at_val
                    }
            finally:
                cursor.close()
    except Exception as e:
        logger.error(f"Failed to get candidate result from database: {e}", exc_info=True)
    return None
 
 
def list_candidate_results() -> list:
    """
    Lists all candidate results from the database ordered by creation date descending.
    """
    results = []
    try:
        with get_db_connection() as (conn, is_postgres):
            query = """
            SELECT 
                candidate_id, name, email, role, extracted_skills, validated_skills, 
                score, matched_roles, analysis_summary, authenticity_metrics, created_at 
            FROM candidate_results 
            ORDER BY created_at DESC
            """
            cursor = conn.cursor()
            try:
                cursor.execute(query)
                rows = cursor.fetchall()
                for row in rows:
                    created_at_val = row[10]
                    if hasattr(created_at_val, "isoformat"):
                        created_at_val = created_at_val.isoformat()
                    else:
                        created_at_val = str(created_at_val)
 
                    results.append({
                        "candidate_id": row[0],
                        "name": row[1],
                        "email": row[2],
                        "role": row[3],
                        "extracted_skills": deserialize_json_field(row[4]),
                        "validated_skills": deserialize_json_field(row[5]),
                        "score": row[6],
                        "matched_roles": deserialize_json_field(row[7]),
                        "analysis_summary": deserialize_json_field(row[8]),
                        "authenticity_metrics": deserialize_json_field(row[9]),
                        "created_at": created_at_val
                    })
            finally:
                cursor.close()
    except Exception as e:
        logger.error(f"Failed to list candidate results from database: {e}", exc_info=True)
    return results


def delete_candidate_result(candidate_id: str) -> bool:
    """
    Deletes a candidate result from the database by candidate_id.
    """
    try:
        with get_db_connection() as (conn, is_postgres):
            placeholder = "%s" if is_postgres else "?"
            query = f"DELETE FROM candidate_results WHERE candidate_id = {placeholder}"
            cursor = conn.cursor()
            try:
                cursor.execute(query, (candidate_id,))
                conn.commit()
                return True
            finally:
                cursor.close()
    except Exception as e:
        logger.error(f"Failed to delete candidate result: {e}", exc_info=True)
    return False
