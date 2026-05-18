from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import datetime

import schemas
from database import get_db

app = FastAPI(title="AlignTrack API - Firebase Edition")

# Get our Firebase Firestore instance
db = get_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "success", "message": "AlignTrack API is running on Firebase Cloud!"}

# --- GOAL ENDPOINTS (FIREBASE) ---

@app.get("/goals", response_model=List[schemas.GoalResponse])
def get_goals():
    goals_ref = db.collection("goals")
    docs = goals_ref.stream()
    
    goals = []
    for doc in docs:
        goals.append(doc.to_dict())
    return goals

@app.post("/goals", response_model=schemas.GoalResponse)
def create_goal(goal: schemas.GoalCreate):
    goal_dict = goal.model_dump()
    # Use the React-generated ID as the Firebase Document ID
    db.collection("goals").document(goal.id).set(goal_dict)
    return goal_dict

@app.put("/goals/{goal_id}", response_model=schemas.GoalResponse)
def update_goal(goal_id: str, updated_goal: schemas.GoalCreate):
    doc_ref = db.collection("goals").document(goal_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_dict = updated_goal.model_dump()
    doc_ref.update(goal_dict)
    return goal_dict

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: str):
    doc_ref = db.collection("goals").document(goal_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    doc_ref.delete()
    return {"message": "Goal deleted successfully"}

# --- AUDIT LOG ENDPOINTS (FIREBASE) ---

@app.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs():
    # Fetch logs and order by newest first
    logs_ref = db.collection("audit_logs").order_by("timestamp", direction="DESCENDING")
    docs = logs_ref.stream()
    
    logs = []
    for doc in docs:
        logs.append(doc.to_dict())
    return logs

@app.post("/audit-logs", response_model=schemas.AuditLogResponse)
def create_audit_log(log: schemas.AuditLogCreate):
    log_dict = log.model_dump()
    
    # Since we dropped SQLAlchemy, we inject the timestamp manually in Python
    log_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc)
    
    db.collection("audit_logs").document(log.id).set(log_dict)
    return log_dream