import { useState } from 'react';
import type { Goal, Role, Cycle, AuditLog } from '../types/index';

interface CheckInBoardProps {
  goals: Goal[];
  role: Role;
  onUpdateGoal: (goal: Goal) => void;
  currentCycle: Cycle;
  addAuditLog: (action: string) => void;
  auditLogs: AuditLog[];
}

export default function CheckInBoard({ goals, role, onUpdateGoal, currentCycle, addAuditLog, auditLogs }: CheckInBoardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Goal>>({});

  const calculateScore = (target: string, actual: string | undefined, uom: string): number => {
    if (actual === undefined || actual === '') return 0;
    
    const t = parseFloat(target);
    const a = parseFloat(actual);

    switch (uom) {
      case 'Zero':
        return a === 0 ? 100 : 0;
      
      case 'Timeline':
        if (!actual) return 0;
        return new Date(actual) <= new Date(target) ? 100 : 0;
      
      case 'Max (Numeric / %)':
        // Lower is better (Target ÷ Achievement)
        if (isNaN(t) || isNaN(a) || a === 0) return 0;
        const maxScore = Math.round((t / a) * 100);
        return maxScore > 100 ? 100 : maxScore;

      case 'Min (Numeric / %)':
      default:
        // Higher is better (Achievement ÷ Target)
        if (isNaN(t) || isNaN(a) || t === 0) return 0;
        const minScore = Math.round((a / t) * 100);
        return minScore > 100 ? 100 : minScore; 
    }
  };

  const saveUpdate = () => {
    onUpdateGoal(editForm as Goal);
    addAuditLog(`${role} updated tracking data for "${editForm.title}" during ${currentCycle}`);
    setEditingId(null);
  };

  const isTrackingLocked = currentCycle === 'Phase 1 (Setup)';

  return (
    <>
      <div className="card" style={{ borderTop: '5px solid #0056b3' }}>
        <h2>Quarterly Check-In Dashboard</h2>
        
        {isTrackingLocked ? (
           <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '4px', border: '1px solid #ffeeba', marginBottom: '15px' }}>
             ⚠️ Tracking is currently locked. Change the System Clock to an active Check-in window (Q1, Q2, etc.) to log achievements.
           </div>
        ) : null}

        {goals.map((goal) => {
          const score = calculateScore(goal.target, goal.actualAchievement, goal.uom);
          return (
            <div key={goal.id} className="goal-item" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{goal.title} ({goal.weightage}%)</h3>
                <span style={{ background: goal.progressStatus === 'Completed' ? '#28a745' : goal.progressStatus === 'On Track' ? '#17a2b8' : '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', height: 'fit-content' }}>
                  {goal.progressStatus || 'Not Started'}
                </span>
              </div>
              <p style={{ margin: '5px 0' }}><strong>Target:</strong> {goal.target}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <div className="progress-bar-container" style={{ flex: 1, margin: 0 }}>
                  <div className="progress-bar" style={{ width: `${score}%`, background: score === 100 ? '#28a745' : '#007bff' }}></div>
                </div>
                <span style={{ fontWeight: 'bold', width: '50px' }}>{score}%</span>
              </div>

              {editingId === goal.id ? (
                <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  {role === 'Employee' && (
                    <>
                      <div className="form-group">
                        <label>Actual Achievement</label>
                        <input type={goal.uom === 'Timeline' ? 'date' : 'number'} value={editForm.actualAchievement || ''} onChange={e => setEditForm({...editForm, actualAchievement: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Progress Status</label>
                        <select value={editForm.progressStatus || 'Not Started'} onChange={e => setEditForm({...editForm, progressStatus: e.target.value as any})}>
                          <option value="Not Started">Not Started</option><option value="On Track">On Track</option><option value="Completed">Completed</option>
                        </select>
                      </div>
                    </>
                  )}
                  {role === 'Manager' && (
                    <div className="form-group">
                      <label>Manager Check-In Comment</label>
                      <textarea rows={3} value={editForm.managerComment || ''} onChange={e => setEditForm({...editForm, managerComment: e.target.value})} />
                    </div>
                  )}
                  <button onClick={saveUpdate} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Save Update</button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                  <p style={{ margin: '5px 0' }}><strong>Actual Achievement:</strong> {goal.actualAchievement || '—'}</p>
                  {goal.managerComment && <p style={{ margin: '5px 0', color: '#0056b3' }}><strong>Manager Feedback:</strong> {goal.managerComment}</p>}
                  
                  {!isTrackingLocked && (role === 'Employee' || role === 'Manager') && (
                     <button onClick={() => { setEditingId(goal.id); setEditForm(goal); }} style={{ background: '#ffc107', color: '#000', marginTop: '10px', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                       {role === 'Employee' ? 'Update Progress' : 'Add Manager Comment'}
                     </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Governance: Audit Trail */}
      {auditLogs.length > 0 && (
        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h3>System Audit Trail (Governance)</h3>
          <ul style={{ fontSize: '14px', color: '#555', paddingLeft: '20px' }}>
            {auditLogs.map(log => (
              <li key={log.id} style={{ marginBottom: '5px' }}>
                <strong>{log.timestamp}:</strong> {log.action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}