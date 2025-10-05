
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models import User, Transaction
from app.utils.hashing import hash_password

def init_db():
    print("Creating database tables...")
    db = None
    try:
        # Drop existing database file if it exists
        db_path = os.path.join(os.path.dirname(__file__), "fraud_app.db")
        try:
            if os.path.exists(db_path):
                os.remove(db_path)
                print("Removed existing database.")
        except PermissionError:
            print("Warning: Could not remove existing database file. It may be in use.")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")

        # Create a new DB session
        db = SessionLocal()
        
        try:
            # Create test users
            test_users = [
                {
                    "name": "Test User",
                    "email": "test@example.com",
                    "username": "testuser",
                    "password": "test123",
                    "credits": 100
                },
                {
                    "name": "Admin User",
                    "email": "admin@example.com",
                    "username": "admin",
                    "password": "admin123",
                    "credits": 1000
                }
            ]
            
            for user_data in test_users:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    username=user_data["username"],
                    password_hash=hash_password(user_data["password"]),
                    credits=user_data["credits"],
                    last_credit_reset=datetime.utcnow()
                )
                db.add(user)
            
            db.commit()
            print("\nTest users created successfully:")
            for user in test_users:
                print(f"\nUsername: {user['username']}")
                print(f"Email: {user['email']}")
                print(f"Password: {user['password']}")
                
        except Exception as e:
            print(f"Error creating test users: {e}")
            db.rollback()
            raise
            
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()