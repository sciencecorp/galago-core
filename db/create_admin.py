#!/usr/bin/env python3
"""
Script to create an admin user in the Galago database.
This script can be run to ensure an admin account is always available.
"""

import os
import sys
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add the parent directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import the required modules from the application
from db.models.db_session import SessionLocal
from db import crud, schemas

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def create_admin_user(db: Session, username: str, email: str, password: str) -> None:
    """Create an admin user in the database."""
    # Check if user already exists
    db_user = crud.get_user_by_username(db, username=username)
    if db_user:
        print(f"User '{username}' already exists.")
        return

    db_user_email = crud.get_user_by_email(db, email=email)
    if db_user_email:
        print(f"Email '{email}' is already registered.")
        return

    # Create the user
    user_create = schemas.UserCreate(
        username=username, email=email, password=password, is_admin=True
    )

    # Add the user to the database
    user = crud.create_user(db=db, user=user_create)
    print(f"Admin user '{username}' created successfully with ID: {user.id}")


def main():
    """Main function to create an admin user."""
    # Default values
    default_username = "admin"
    default_email = "admin@galago.com"
    default_password = "admin123"

    # Get values from environment variables or use defaults
    username = os.environ.get("ADMIN_USERNAME", default_username)
    email = os.environ.get("ADMIN_EMAIL", default_email)
    password = os.environ.get("ADMIN_PASSWORD", default_password)

    # Create a database session
    db = SessionLocal()
    try:
        create_admin_user(db, username, email, password)
    finally:
        db.close()


if __name__ == "__main__":
    main()
