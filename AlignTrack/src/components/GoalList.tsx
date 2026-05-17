import { useState } from 'react';
import type { Goal, Role, SheetStatus } from '../types/index';

interface GoalListProps {
  goals: Goal[];
  onRemoveGoal: (id: string) => void;
  onUpdateGoal: (goal: Goal) => void;
  role: Role;
  sheetStatus: SheetStatus;
}

export default function GoalList({ goals, onRemoveGoal, onUpdateGoal, role, sheetStatus }: GoalListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Goal>>({});

  if (goals.length === 0) return <div className="card"><p>No goals added yet.</p></div>;

  // Locks the sheet if approved, or if the employee is waiting for manager review
  const isLocked = sheetStatus === 'Approved' || (role === 'Employee' && sheetStatus === 'Submitted');

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditForm(goal);
  };

  const saveEdit = () => {
    if (editForm.weightage && editForm.weightage < 10) {
        alert("Minimum weightage per goal is 10%");
        return;
    }
    onUpdateGoal(editForm as Goal);
    setEditingId(null);
  };

  return (
    <div className="card">
      <h2>{role === 'Manager' ? "Team Member's Goal Sheet" : "Your Goal Sheet"}</h2>
      
      {goals.map((goal) => (
        <div key={goal.id} className="goal-item" style={{ borderLeft: goal.isShared ? '5px solid #17a2b8' : '1px solid #eee' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>
                {goal.title} {goal.isShared && <span style={{ fontSize: '12px', background: '#17a2b8', color: 'white', padding: '3px 8px', borderRadius: '12px', marginLeft: '10px' }}>Shared KPI</span>}
              </h3>
              <p><strong>Thrust Area:</strong> {goal.thrustArea}</p>
            </div>

            {/* Hide remove button if locked, if viewing as manager, or if it's a shared KPI */}
            {!isLocked && role === 'Employee' && !goal.isShared && (
              <button style={{ background: '#d9534f', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => onRemoveGoal(goal.id)}>Remove</button>
            )}
          </div>

          {/* Inline Edit Form */}
          {editingId === goal.id ? (
            <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #ccc' }}>
              
              <div className="form-group">
                <label>Target</label>
                <input
                  value={editForm.target}
                  // BRD: Shared KPIs have read-only targets for employees
                  disabled={goal.isShared && role === 'Employee'} 
                  onChange={e => setEditForm({...editForm, target: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Weightage (%)</label>
                <input
                  type="number"
                  min="10"
                  value={editForm.weightage}
                  onChange={e => setEditForm({...editForm, weightage: Number(e.target.value)})}
                />
              </div>

              <button onClick={saveEdit} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Save Changes</button>
              <button onClick={() => setEditingId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Target:</strong> {goal.target}</p>
              <p><strong>Measurement Type:</strong> {goal.uom}</p>
              <p><strong>Weightage:</strong> <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{goal.weightage}%</span></p>
              
              {/* Show edit button if the sheet is not locked */}
              {!isLocked && (
                 <button onClick={() => startEdit(goal)} style={{ background: '#ffc107', color: '#000', marginTop: '10px', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {role === 'Employee' ? 'Edit / Adjust Weightage' : 'Inline Edit (Manager)'}
                 </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}