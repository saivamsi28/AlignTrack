from fastapi import FastAPI
import models
from database import engine

# This line looks at models.py and creates aligntrack.db if it doesn't exist.
models.Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI(title="AlignTrack API")

@app.get("/")
def read_root():
    return {"status": "success", "message": "AlignTrack Backend is running and Database is created!"}