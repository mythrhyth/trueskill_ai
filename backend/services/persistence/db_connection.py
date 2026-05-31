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
                import json
                seeded_candidates = [
                    {
                        "candidate_id": "req_gxa8gk7",
                        "name": "Sarah Jenkins",
                        "email": "sarah.jenkins@example.com",
                        "role": "Lead Data Scientist",
                        "score": 8.9,
                        "validated_skills": json.dumps([
                            {"name": "Python", "validated_score": 9.5},
                            {"name": "PyTorch", "validated_score": 9.0},
                            {"name": "SQL", "validated_score": 8.5},
                            {"name": "Pandas", "validated_score": 8.5},
                            {"name": "Scikit-Learn", "validated_score": 8.0},
                            {"name": "TensorFlow", "validated_score": 8.0}
                        ]),
                        "extracted_skills": json.dumps(["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "TensorFlow"]),
                        "matched_roles": json.dumps([{"role": "Lead Data Scientist", "similarity": 0.88}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 9.1}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Proven record of deploying machine learning models into live production environments.",
                                "Expertise in predictive forecasting and recommendation algorithms.",
                                "Strong mathematical foundation in statistical modeling."
                            ],
                            "weaknesses": [
                                "Less experience in frontend dashboard design.",
                                "Prefers standardizing on PyTorch rather than proprietary toolkits."
                            ],
                            "recommendations": [
                                "Highly recommended for senior ML and data leadership positions."
                            ],
                            "location": "London, UK",
                            "experience": "7+ years",
                            "notice_period": "1 Month Notice",
                            "elevator_pitch": "Hello, I'm Sarah. I specialize in bringing machine learning models from research into production. Over the past 7 years, I have worked with retail and logistics companies to build predictive analytics models, demand forecasting systems, and search recommendation algorithms. I enjoy translating complex business data into actionable product features.",
                            "photos": ["/photos/sarah_jenkins_1.png", "/photos/sarah_jenkins_2.png"],
                            "likes_count": 28
                        })
                    },
                    {
                        "candidate_id": "req_m23levx",
                        "name": "Shanti Priya",
                        "email": "shanti.priya@example.com",
                        "role": "Senior QA Analyst",
                        "score": 9.4,
                        "validated_skills": json.dumps([
                            {"name": "Java", "validated_score": 9.6},
                            {"name": "Python", "validated_score": 9.2},
                            {"name": "Selenium", "validated_score": 9.5},
                            {"name": "JavaScript", "validated_score": 8.8},
                            {"name": "JIRA", "validated_score": 9.0}
                        ]),
                        "extracted_skills": json.dumps(["Java", "Python", "Selenium", "JavaScript", "JIRA", "API Testing"]),
                        "matched_roles": json.dumps([{"role": "Senior QA Analyst", "similarity": 0.92}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 9.6}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "10+ years of extensive fintech QA experience.",
                                "Expertise in automation scripting with Selenium and Playwright.",
                                "Strong proficiency in API testing and agile methodologies."
                            ],
                            "weaknesses": [
                                "Minimal experience with cloud deployment automation (DevOps)."
                            ],
                            "recommendations": [
                                "Excellent QA lead candidate for compliance-heavy financial systems."
                            ],
                            "location": "New Delhi, India",
                            "experience": "10+ years",
                            "notice_period": "Available Now",
                            "elevator_pitch": "Hi, I'm Shanti Priya. I hold a Bachelor's degree in Computer Applications from Delhi University, completed in 2012. I've worked as a QA Analyst in the fintech sector for over 10 years, specializing in end-to-end functional testing, regression suites, and automation scripting. My key skills include Selenium, JIRA, API testing, Agile methodology, and defect lifecycle management. I'm ISTQB certified and now eager to contribute to an innovative organization that values precision, speed, and continuous improvement in software delivery.",
                            "photos": ["/photos/shanti_priya_1.png", "/photos/shanti_priya_2.png"],
                            "likes_count": 33
                        })
                    },
                    {
                        "candidate_id": "req_xcs9nee",
                        "name": "Aravind Kumar",
                        "email": "aravind.kumar@example.com",
                        "role": "Senior Backend Engineer",
                        "score": 9.2,
                        "validated_skills": json.dumps([
                            {"name": "Python", "validated_score": 9.4},
                            {"name": "Django", "validated_score": 9.2},
                            {"name": "PostgreSQL", "validated_score": 9.0},
                            {"name": "Redis", "validated_score": 8.5},
                            {"name": "Docker", "validated_score": 8.8}
                        ]),
                        "extracted_skills": json.dumps(["Python", "Django", "PostgreSQL", "Redis", "Docker", "FastAPI", "AWS"]),
                        "matched_roles": json.dumps([{"role": "Senior Backend Engineer", "similarity": 0.94}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 9.5}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Strong backend architecture skills with Python and FastAPI/Django.",
                                "Significant experience with database tuning and high-concurrency systems.",
                                "Highly collaborative developer with strong mentorship experience."
                            ],
                            "weaknesses": [
                                "Limited experience building CSS or JavaScript frontend code."
                            ],
                            "recommendations": [
                                "Highly recommended for high-load system design and REST/gRPC API development."
                            ],
                            "location": "Bangalore, India",
                            "experience": "6+ years",
                            "notice_period": "Available Now",
                            "elevator_pitch": "Hi, I'm Aravind. I'm a backend specialist who loves designing scalable APIs, database schemas, and microservices architectures. I have spent the last 6 years building backend systems that handle millions of requests daily, optimizing queries, and setting up CI/CD pipelines. I am passionate about clean code, performance tuning, and robust systems.",
                            "photos": ["/photos/aravind_kumar_1.png", "/photos/aravind_kumar_2.png"],
                            "likes_count": 19
                        })
                    },
                    {
                        "candidate_id": "req_qf2o6dc",
                        "name": "Elena Rostova",
                        "email": "elena.rostova@example.com",
                        "role": "Senior Full Stack Engineer",
                        "score": 8.7,
                        "validated_skills": json.dumps([
                            {"name": "React", "validated_score": 9.2},
                            {"name": "Node.js", "validated_score": 8.8},
                            {"name": "TypeScript", "validated_score": 9.0},
                            {"name": "Next.js", "validated_score": 8.5}
                        ]),
                        "extracted_skills": json.dumps(["TypeScript", "React", "Node.js", "Next.js", "TailwindCSS", "MongoDB"]),
                        "matched_roles": json.dumps([{"role": "Senior Full Stack Engineer", "similarity": 0.90}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 8.9}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Exceptional design-to-code implementation fidelity.",
                                "Proficient in both frontend states and backend server-side React frameworks.",
                                "Active open source contributor to component libraries."
                            ],
                            "weaknesses": [
                                "Prefers working in JavaScript/TypeScript environments over Java/C# backend stacks."
                            ],
                            "recommendations": [
                                "Recommended for customer-facing product teams and startup environments."
                            ],
                            "location": "Prague, Czech Republic",
                            "experience": "5+ years",
                            "notice_period": "2 Weeks Notice",
                            "elevator_pitch": "Hello, I'm Elena. I build responsive, accessible, and fast web applications from scratch. With over 5 years of full stack experience, I bridge the gap between pixel-perfect design and backend business logic. I enjoy working on modern web architectures using React and Node.js, and I'm a strong advocate for user-centered UI/UX design.",
                            "photos": ["/photos/elena_rostova_1.png", "/photos/elena_rostova_2.png"],
                            "likes_count": 15
                        })
                    },
                    {
                        "candidate_id": "req_88pb5sl",
                        "name": "Marcus Chen",
                        "email": "marcus.chen@example.com",
                        "role": "Lead DevOps Engineer",
                        "score": 9.1,
                        "validated_skills": json.dumps([
                            {"name": "Kubernetes", "validated_score": 9.5},
                            {"name": "Terraform", "validated_score": 9.2},
                            {"name": "AWS", "validated_score": 9.0},
                            {"name": "Docker", "validated_score": 8.8}
                        ]),
                        "extracted_skills": json.dumps(["Kubernetes", "Terraform", "AWS", "Docker", "Jenkins", "Go", "Bash"]),
                        "matched_roles": json.dumps([{"role": "Lead DevOps Engineer", "similarity": 0.89}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 9.3}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Extensive experience in infrastructure as code (IaC) and cloud scaling.",
                                "Certified Kubernetes Administrator (CKA) with strong container security audit skills.",
                                "Proven cost-optimization record saving $100k+ annually."
                            ],
                            "weaknesses": [
                                "Less interest in traditional Windows server administration."
                            ],
                            "recommendations": [
                                "Excellent lead for companies undergoing cloud migration or microservices containerization."
                            ],
                            "location": "San Francisco, CA",
                            "experience": "8+ years",
                            "notice_period": "3 Months Notice",
                            "elevator_pitch": "I'm Marcus, an infrastructure engineer who views server management as code. Over the past 8 years, I've designed and managed multi-region cloud infrastructures on AWS, reduced cloud spend by 30%, and automated deployment pipelines for enterprise scale. I specialize in Kubernetes orchestration and GitOps practices.",
                            "photos": ["/photos/marcus_chen_1.png", "/photos/marcus_chen_2.png"],
                            "likes_count": 42
                        })
                    },
                    {
                        "candidate_id": "req_xlals0e",
                        "name": "Amara Okafor",
                        "email": "amara.okafor@example.com",
                        "role": "Senior Mobile Engineer",
                        "score": 8.5,
                        "validated_skills": json.dumps([
                            {"name": "Swift", "validated_score": 9.0},
                            {"name": "Kotlin", "validated_score": 8.8},
                            {"name": "React Native", "validated_score": 8.5}
                        ]),
                        "extracted_skills": json.dumps(["Swift", "Kotlin", "React Native", "Flutter", "Firebase", "GraphQL"]),
                        "matched_roles": json.dumps([{"role": "Senior Mobile Engineer", "similarity": 0.85}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 8.8}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Published cross-platform apps with 50k+ active installations.",
                                "Strong mastery of Swift/Kotlin native bindings.",
                                "Excellent understanding of mobile security and caching paradigms."
                            ],
                            "weaknesses": [
                                "Prefers React Native over Flutter for cross-platform applications."
                            ],
                            "recommendations": [
                                "Highly recommended for mobile product development teams in consumer tech."
                            ],
                            "location": "Lagos, Nigeria",
                            "experience": "4+ years",
                            "notice_period": "Available Now",
                            "elevator_pitch": "Hi, I'm Amara. I build high-performance mobile experiences for iOS and Android. Over my 4-year career, I have published multiple apps in the App Store and Google Play Store, focused on smooth animations, offline-first syncing, and secure user authentication. I enjoy working in cross-functional agile teams.",
                            "photos": [
                                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop&q=80",
                                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
                            ],
                            "likes_count": 24
                        })
                    },
                    {
                        "candidate_id": "req_7kh7ooa",
                        "name": "Yuki Tanaka",
                        "email": "yuki.tanaka@example.com",
                        "role": "Senior Frontend UI Engineer",
                        "score": 8.8,
                        "validated_skills": json.dumps([
                            {"name": "JavaScript", "validated_score": 9.2},
                            {"name": "CSS/SASS", "validated_score": 9.5},
                            {"name": "React", "validated_score": 8.8},
                            {"name": "Figma", "validated_score": 8.5}
                        ]),
                        "extracted_skills": json.dumps(["JavaScript", "CSS/SASS", "Figma", "React", "WebGL", "Three.js"]),
                        "matched_roles": json.dumps([{"role": "Senior Frontend UI Engineer", "similarity": 0.91}]),
                        "authenticity_metrics": json.dumps({"score_breakdown": {"authenticity": 9.0}}),
                        "analysis_summary": json.dumps({
                            "strengths": [
                                "Strong eye for typography, layout, and motion design.",
                                "Advanced skills in vector/WebGL animations and SVG morphing.",
                                "Expert in semantic markup and WCAG AA accessibility compliance."
                            ],
                            "weaknesses": [
                                "Prefers working on UI/design systems rather than backend API endpoints."
                            ],
                            "recommendations": [
                                "Highly recommended for frontend teams working on complex design systems and visualization tools."
                            ],
                            "location": "Tokyo, Japan",
                            "experience": "6+ years",
                            "notice_period": "1 Month Notice",
                            "elevator_pitch": "Hello, I'm Yuki. I combine engineering with creativity to build immersive, interactive, and beautiful experiences on the web. I have 6 years of experience working closely with design teams to translate interactive wireframes into clean, performant React layouts. I specialize in creative coding, CSS animations, and 3D web graphics.",
                            "photos": [
                                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                            ],
                            "likes_count": 27
                        })
                    }
                ]

                for cand in seeded_candidates:
                    cid = cand["candidate_id"]
                    if is_postgres:
                        cursor.execute("DELETE FROM candidate_results WHERE candidate_id = %s", (cid,))
                        cursor.execute("""
                            INSERT INTO candidate_results (
                                candidate_id, name, email, role, extracted_skills, validated_skills, 
                                score, matched_roles, authenticity_metrics, analysis_summary
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            cid, cand["name"], cand["email"], cand["role"], cand["extracted_skills"],
                            cand["validated_skills"], cand["score"], cand["matched_roles"],
                            cand["authenticity_metrics"], cand["analysis_summary"]
                        ))
                    else:
                        cursor.execute("DELETE FROM candidate_results WHERE candidate_id = ?", (cid,))
                        cursor.execute("""
                            INSERT INTO candidate_results (
                                candidate_id, name, email, role, extracted_skills, validated_skills, 
                                score, matched_roles, authenticity_metrics, analysis_summary
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            cid, cand["name"], cand["email"], cand["role"], cand["extracted_skills"],
                            cand["validated_skills"], cand["score"], cand["matched_roles"],
                            cand["authenticity_metrics"], cand["analysis_summary"]
                        ))
                conn.commit()

            finally:
                cursor.close()
            logger.info("Database table 'candidate_results' initialized and seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}", exc_info=True)


# Auto-initialize database on module import
initialize_db()
