
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.models import User, Transaction
from app.utils.hashing import hash_password

def init_db():
    print("Creating database tables...")
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    # Create a new DB session
    db = Session(engine)

    # Create a default user for testing
    db: Session = next(get_db())
    try:
        # Check if default user already exists
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not existing_user:
            default_user = User(
                name="Admin User",
                email="admin@example.com",
                username="admin",
                password_hash=hash_password("password123"),
                credits=100
            )
            db.add(default_user)
            db.commit()
            print("Default user created: admin@example.com / password123")
        else:
            print("Default user already exists")
    except Exception as e:
        print(f"Error creating default user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()