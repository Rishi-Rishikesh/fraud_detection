import os
from sqlalchemy import create_engine, text

# Database path
db_path = os.path.join(os.path.dirname(__file__), "fraud_app.db")
engine = create_engine(f"sqlite:///{db_path}")

def add_is_admin_column():
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]

            if 'is_admin' not in columns:
                print("Adding is_admin column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                conn.commit()
                print("Column added successfully!")

                # Update the admin user
                conn.execute(text("""
                    UPDATE users
                    SET is_admin = 1
                    WHERE email = 'krishikesh2001@gmail.com'
                """))
                conn.commit()
                print("Admin user updated!")
            else:
                print("is_admin column already exists")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_is_admin_column()