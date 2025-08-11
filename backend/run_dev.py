#!/usr/bin/env python
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Remove existing database file if it exists (for development only)
    db_file = "artison.db"
    if os.path.exists(db_file):
        print(f"Removing existing database file: {db_file}")
        os.remove(db_file)
    
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
