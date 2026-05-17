from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="Employee") # Employee, Manager, Admin
    
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    goals = relationship("Goal", back_populates="owner")
    manager = relationship("User", remote_side=[id], backref="team_members")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, index=True) # Using UUID strings from React
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Phase 1: Planning
    thrust_area = Column(String)
    title = Column(String)
    description = Column(String)
    uom = Column(String) 
    target = Column(String)
    weightage = Column(Integer)
    is_shared = Column(Boolean, default=False)
    sheet_status = Column(String, default="Draft")
    
    # Phase 2: Tracking
    actual_achievement = Column(String, nullable=True)
    progress_status = Column(String, default="Not Started")
    manager_comment = Column(String, nullable=True)
    cycle = Column(String, default="Phase 1 (Setup)")

    owner = relationship("User", back_populates="goals")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)