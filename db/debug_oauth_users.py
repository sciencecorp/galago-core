#!/usr/bin/env python3
"""
Debug script to check OAuth user creation in the database.
Run this script to verify if OAuth users are being stored correctly.
"""

import os
import sys
from sqlalchemy.orm import Session

# Add the parent directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import the required modules from the application
from db.models.db_session import SessionLocal
from db import crud
from db.models.settings_models import User


def debug_oauth_users():
    """Debug OAuth user creation."""
    db = SessionLocal()
    try:
        # Get all users
        all_users = crud.get_users(db, skip=0, limit=1000)
        print(f"Total users in database: {len(all_users)}")
        
        # Check for users that might be OAuth users (those without manually set usernames)
        oauth_pattern_users = []
        manual_users = []
        
        for user in all_users:
            print(f"User: {user.username} | Email: {user.email} | Admin: {user.is_admin} | Active: {user.is_active}")
            
            # OAuth users typically have usernames like "user_1", "user_2" or email prefixes
            if "_" in user.username or "@" not in user.username:
                oauth_pattern_users.append(user)
            else:
                manual_users.append(user)
        
        print(f"\nPotential OAuth users: {len(oauth_pattern_users)}")
        for user in oauth_pattern_users:
            print(f"  - {user.username} ({user.email})")
        
        print(f"\nManual users: {len(manual_users)}")
        for user in manual_users:
            print(f"  - {user.username} ({user.email})")
        
        # Check database directly
        raw_users = db.query(User).all()
        print(f"\nDirect database query: {len(raw_users)} users found")
        
    finally:
        db.close()


if __name__ == "__main__":
    debug_oauth_users() 