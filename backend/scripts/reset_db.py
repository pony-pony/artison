"""
Reset database and create test data
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.db import engine, Base, SessionLocal
from app.domains.auth.models import User
from app.domains.creator.models import CreatorProfile
from app.domains.payment.models import StripeAccount  # Import payment models
from app.core.security import get_password_hash
from datetime import datetime
import uuid

def reset_database():
    """Drop all tables and recreate them"""
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Database reset complete!")

def create_test_data():
    """Create test users and profiles"""
    db = SessionLocal()
    
    try:
        # Create test creator
        creator = User(
            id=str(uuid.uuid4()),
            username="testcreator",
            email="creator@example.com",
            hashed_password=get_password_hash("testpass123"),
            is_creator=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(creator)
        
        # Create creator profile
        profile = CreatorProfile(
            user_id=creator.id,
            display_name="Test Creator",
            bio="I'm a test creator account for development.",
            created_at=datetime.utcnow()
        )
        db.add(profile)
        
        # Create test supporter
        supporter = User(
            id=str(uuid.uuid4()),
            username="testsupporter",
            email="supporter@example.com",
            hashed_password=get_password_hash("testpass123"),
            is_creator=False,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(supporter)
        
        db.commit()
        
        print("Test data created successfully!")
        print("\nTest Accounts:")
        print("Creator: creator@example.com / testpass123")
        print("Supporter: supporter@example.com / testpass123")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if input("This will DELETE all data. Continue? (y/n): ").lower() == 'y':
        reset_database()
        create_test_data()
    else:
        print("Cancelled.")
