#!/usr/bin/env python3
"""
Script to create an initial admin user for the Galago application.
Run this script after setting up the database to create the first admin account.
"""

import os
import sys
import argparse
import getpass
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Add the current directory to the path so we can import modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    # First try the direct import
    from db.models.db_session import SessionLocal, Base
    from db.auth import get_password_hash
    from db.models.settings_models import User
except ImportError:
    try:
        # Try importing without the 'db.' prefix (in case script is run from db directory)
        from models.db_session import SessionLocal, Base
        from auth import get_password_hash
        from models.settings_models import User
    except ImportError:
        print("Error: Failed to import required modules.")
        print("Make sure you're running this script from the root directory or the db directory.")
        print("Current path:", os.getcwd())
        print("Python path:", sys.path)
        sys.exit(1)

def create_admin_user(username, email, password, db_session):
    """Create a new admin user in the database."""
    # Check if the user already exists
    existing_user = db_session.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        if existing_user.username == username:
            print(f"Error: Username '{username}' already exists.")
        else:
            print(f"Error: Email '{email}' already exists.")
        return False
    
    # Create new admin user
    hashed_password = get_password_hash(password)
    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        is_admin=True,
        is_active=True
    )
    
    try:
        db_session.add(new_user)
        db_session.commit()
        print(f"Admin user '{username}' created successfully!")
        return True
    except IntegrityError as e:
        db_session.rollback()
        print(f"Error creating user: {e}")
        return False
    except Exception as e:
        db_session.rollback()
        print(f"Unexpected error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Create an admin user for Galago")
    parser.add_argument("--username", help="Admin username")
    parser.add_argument("--email", help="Admin email")
    parser.add_argument("--password", help="Admin password (not recommended, use interactive mode)")
    args = parser.parse_args()
    
    # Initialize database session
    db = SessionLocal()
    
    try:
        # Get username
        username = args.username
        while not username:
            username = input("Enter admin username: ").strip()
            if not username:
                print("Username cannot be empty.")
        
        # Get email
        email = args.email
        while not email:
            email = input("Enter admin email: ").strip()
            if not email or '@' not in email:
                print("Please enter a valid email address.")
                email = None
        
        # Get password
        password = args.password
        while not password:
            password = getpass.getpass("Enter admin password: ")
            if not password:
                print("Password cannot be empty.")
            elif len(password) < 8:
                print("Password must be at least 8 characters long.")
                password = None
            else:
                confirm_password = getpass.getpass("Confirm password: ")
                if password != confirm_password:
                    print("Passwords do not match.")
                    password = None
        
        # Create the admin user
        success = create_admin_user(username, email, password, db)
        
        if success:
            print("Admin user created successfully!")
            print("You can now log in with these credentials.")
        else:
            print("Failed to create admin user.")
    
    finally:
        db.close()

if __name__ == "__main__":
    main() 