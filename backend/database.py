import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '12345')
        self.database = os.getenv('DB_NAME', 'growguardians')
        self.connection = None

    def connect(self):
        """Create database and tables if they don't exist"""
        try:
            # First connect without database to create it
            connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password
            )
            
            if connection.is_connected():
                cursor = connection.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
                print(f"✅ Database '{self.database}' created or already exists")
                cursor.close()
                connection.close()

            # Now connect to the database
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            
            if self.connection.is_connected():
                print(f"✅ Connected to MySQL database: {self.database}")
                self.create_tables()
                return self.connection
                
        except Error as e:
            print(f"❌ Error connecting to MySQL: {e}")
            return None

    def create_tables(self):
        """Create all necessary tables"""
        try:
            cursor = self.connection.cursor()

            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
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
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)

            # OTP codes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS otp_codes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    mobile_number VARCHAR(15) NOT NULL,
                    otp_code VARCHAR(6) NOT NULL,
                    purpose VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_used BOOLEAN DEFAULT FALSE,
                    INDEX idx_mobile (mobile_number),
                    INDEX idx_expires (expires_at)
                )
            """)

            # Disease reports table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS disease_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    image_path VARCHAR(255) NOT NULL,
                    is_healthy BOOLEAN NOT NULL,
                    disease_name VARCHAR(200) NOT NULL,
                    confidence_score DECIMAL(5,2),
                    diagnosis_details TEXT,
                    treatment_tips TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id)
                )
            """)

            # Ratings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ratings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_rating (rating)
                )
            """)

            self.connection.commit()
            print("✅ All tables created successfully")
            cursor.close()

        except Error as e:
            print(f"❌ Error creating tables: {e}")

    def close(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed")

# Initialize database
db = Database()
db.connect()
