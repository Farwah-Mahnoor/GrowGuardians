import psycopg2
from psycopg2 import Error
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        # Support both individual environment variables and DATABASE_URL
        database_url = os.getenv('DATABASE_URL')
        
        if database_url:
            # Parse the DATABASE_URL
            parsed = urlparse(database_url)
            self.host = parsed.hostname
            self.user = parsed.username
            self.password = parsed.password
            self.database = parsed.path[1:]  # Remove leading slash
            self.port = parsed.port or 5432
        else:
            # Fall back to individual environment variables
            self.host = os.getenv('DB_HOST', 'localhost')
            self.user = os.getenv('DB_USER', 'postgres')
            self.password = os.getenv('DB_PASSWORD', 'password')
            self.database = os.getenv('DB_NAME', 'growguardians')
            self.port = int(os.getenv('DB_PORT', 5432))
        
        self.connection = None

    def connect(self):
        """Create database and tables if they don't exist"""
        try:
            # Connect to PostgreSQL
            self.connection = psycopg2.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            
            if self.connection:
                print(f"✅ Connected to PostgreSQL database: {self.database}")
                self.create_tables()
                return self.connection
                
        except Error as e:
            print(f"❌ Error connecting to PostgreSQL: {e}")
            return None

    def create_tables(self):
        """Create all necessary tables"""
        try:
            cursor = self.connection.cursor()

            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    surname VARCHAR(100) NOT NULL,
                    mobile_number VARCHAR(15) UNIQUE NOT NULL,
                    email VARCHAR(150),
                    province VARCHAR(100),
                    district VARCHAR(100),
                    tehsil VARCHAR(100) NOT NULL,
                    village VARCHAR(100),
                    address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # OTP codes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS otp_codes (
                    id SERIAL PRIMARY KEY,
                    mobile_number VARCHAR(15) NOT NULL,
                    otp_code VARCHAR(6) NOT NULL,
                    purpose VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_used BOOLEAN DEFAULT FALSE
                )
            """)
            
            # Create indexes for otp_codes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_codes(mobile_number)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at)
            """)

            # Disease reports table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS disease_reports (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL,
                    image_path VARCHAR(255) NOT NULL,
                    is_healthy BOOLEAN NOT NULL,
                    disease_name VARCHAR(200) NOT NULL,
                    confidence_score DECIMAL(5,2),
                    diagnosis_details TEXT,
                    treatment_tips TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            # Create index for disease_reports
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_disease_user ON disease_reports(user_id)
            """)

            # Ratings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ratings (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            # Create indexes for ratings
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rating_user ON ratings(user_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rating_score ON ratings(rating)
            """)

            self.connection.commit()
            print("✅ All tables created successfully")
            cursor.close()

        except Error as e:
            print(f"❌ Error creating tables: {e}")
            self.connection.rollback()

    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("PostgreSQL connection closed")

# Initialize database
try:
    db = Database()
    db.connect()
except Exception as e:
    print(f"❌ Failed to initialize database: {e}")
    print("⚠️  Application will start but database operations may fail")
    db = Database()  # Create instance even if connection fails
