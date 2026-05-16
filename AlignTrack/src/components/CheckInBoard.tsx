import React, { useState } from 'react';
import type { Goal, Role } from '../types/index';

interface CheckInBoardProps {
  goals: Goal[];
  role: Role;
  onUpdateGoal: (goal: Goal) => void;
}

export default function CheckInBoard({ goals, role, onUpdateGoal }: CheckInBoardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Goal>>({});

  // The Phase 2 Calculation Engine
  const calculateScore = (target: string, actual: string | undefined, uom: string): number => {
    if (actual === undefined || actual === '') return 0;
    
    const t = parseFloat(target);
    const a = parseFloat(actual);

    switch (uom) {
      case 'Zero-based':
        return a === 0 ? 100 : 0;
      case 'Timeline':
        // For timelines, if an actual date is provided, we'll consider it 100% for the demo
        return actual ? 100 : 0;
      case 'Numeric':
      case '%':
      default:
        // Standard "Higher is Better" calculation (Achievement ÷ Target)
        if (isNaN(t) || isNaN(a) || t === 0) return 0;
        const score = Math.round((a / t) * 100);
        return score > 100 ? 100 : score; // Cap at 100%
    }
  };

  const startUpdate = (goal: Goal) => {
    setEditingId(goal.id);
    setEditForm(goal);
  };

  const saveUpdate = () => {
    onUpdateGoal(editForm as Goal);
    setEditingId(null);
  };

  return (
    <div className="card" style={{ borderTop: '5px solid #0056b3' }}>
      <h2>Quarterly Check-In Dashboard</h2>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        {role === 'Employee' 
          ? "Log your actual achievements against your planned targets." 
          : "Review team progress and provide structured feedback."}
      </p>

      {goals.map((goal) => {
        const score = calculateScore(goal.target, goal.actualAchievement, goal.uom);
        
        return (
          <div key={goal.id} className="goal-item" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{goal.title} ({goal.weightage}%)</h3>
              <span style={{ 
                background: goal.progressStatus === 'Completed' ? '#28a745' : goal.progressStatus === 'On Track' ? '#17a2b8' : '#6c757d', 
                color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', height: 'fit-content' 
              }}>
                {goal.progressStatus || 'Not Started'}
              </span>
            </div>
            
            <p style={{ margin: '5px 0' }}><strong>Target:</strong> {goal.target} {goal.uom !== 'Numeric' && goal.uom !== 'Timeline' ? goal.uom : ''}</p>
            
            {/* System Computed Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <div className="progress-bar-container" style={{ flex: 1, margin: 0 }}>
                <div className="progress-bar" style={{ width: `${score}%`, background: score === 100 ? '#28a745' : '#007bff' }}></div>
              </div>
              <span style={{ fontWeight: 'bold', width: '50px' }}>{score}%</span>
            </div>

            {/* Check-In Edit Form */}
            {editingId === goal.id ? (
              <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #ccc' }}>
                
                {role === 'Employee' && (
                  <>
                    <div className="form-group">
                      <label>Actual Achievement</label>
                      <input 
                        type={goal.uom === 'Timeline' ? 'date' : 'number'}
                        value={editForm.actualAchievement || ''} 
                        onChange={e => setEditForm({...editForm, actualAchievement: e.target.value})} 
                        placeholder="Enter actual number/date"
                      />
                    </div>
                    <div className="form-group">
                      <label>Progress Status</label>
                      <select 
                        value={editForm.progressStatus || 'Not Started'} 
                        onChange={e => setEditForm({...editForm, progressStatus: e.target.value as any})}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="On Track">On Track</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </>
                )}

                {role === 'Manager' && (
                  <div className="form-group">
                    <label>Manager Check-In Comment</label>
                    <textarea 
                      rows={3}
                      value={editForm.managerComment || ''} 
                      onChange={e => setEditForm({...editForm, managerComment: e.target.value})} 
                      placeholder="Enter feedback for this quarter..."
                    />
                  </div>
                )}

                <button onClick={saveUpdate} style={{ background: '#28a745', marginRight: '10px' }}>Save Update</button>
                <button onClick={() => setEditingId(null)} style={{ background: '#6c757d' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0' }}><strong>Actual Achievement:</strong> {goal.actualAchievement || '—'}</p>
                {goal.managerComment && (
                  <p style={{ margin: '5px 0', color: '#0056b3' }}><strong>Manager Feedback:</strong> {goal.managerComment}</p>
                )}
                
                <button 
                  onClick={() => startUpdate(goal)} 
                  style={{ background: '#ffc107', color: '#000', marginTop: '10px', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {role === 'Employee' ? 'Update Progress' : 'Add Manager Comment'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}