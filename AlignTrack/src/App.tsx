import React, { useState } from 'react';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import CheckInBoard from './components/CheckInBoard';
import type { Goal, Role, SheetStatus, Cycle, AuditLog } from './types/index';
import './index.css';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [role, setRole] = useState<Role>('Employee');
  const [sheetStatus, setSheetStatus] = useState<SheetStatus>('Draft');
  const [currentCycle, setCurrentCycle] = useState<Cycle>('Phase 1 (Setup)');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  const addAuditLog = (action: string) => {
    setAuditLogs(prev => [{ id: crypto.randomUUID(), timestamp: new Date().toLocaleString(), action }, ...prev]);
  };

  const handleAddGoal = (newGoal: Goal) => setGoals([...goals, newGoal]);
  const handleRemoveGoal = (id: string) => setGoals(goals.filter(goal => goal.id !== id));
  
  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const pushSharedGoal = () => {
    if (goals.length >= 8) return alert("Maximum limit of 8 goals reached.");
    handleAddGoal({
      id: crypto.randomUUID(), thrustArea: 'Corporate Operations', title: 'Reduce Operational Costs (Dept KPI)',
      description: 'Departmental KPI mandated by leadership.', uom: '%', target: '15', weightage: 10, isShared: true
    });
  };

  // CSV Generation Script
  const downloadCSV = () => {
    const headers = "Goal Title,Thrust Area,Target,Weightage,Actual Achievement,Status,Manager Comment\n";
    const rows = goals.map(g => `"${g.title}","${g.thrustArea}","${g.target}","${g.weightage}%","${g.actualAchievement || 'N/A'}","${g.progressStatus || 'Not Started'}","${g.managerComment || ''}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AtomQuest_Achievement_Report.csv`;
    a.click();
    addAuditLog(`Admin exported Achievement Report CSV`);
  };

  return (
    <div className="container">
      {/* Universal Top Bar (Time Machine & Role Switcher) */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', background: '#343a40', color: 'white', alignItems: 'center' }}>
        <div>
          <strong>Demo Role:</strong>
          <button onClick={() => setRole('Employee')} style={{ marginLeft: 10, background: role === 'Employee' ? '#0056b3' : '#6c757d' }}>Employee</button>
          <button onClick={() => setRole('Manager')} style={{ marginLeft: 5, background: role === 'Manager' ? '#0056b3' : '#6c757d' }}>Manager (L1)</button>
          <button onClick={() => setRole('Admin')} style={{ marginLeft: 5, background: role === 'Admin' ? '#dc3545' : '#6c757d' }}>Admin / HR</button>
        </div>
        <div>
          <strong>System Clock: </strong>
          <select value={currentCycle} onChange={(e) => setCurrentCycle(e.target.value as Cycle)} style={{ padding: '5px', borderRadius: '4px', background: 'white', color: 'black', fontWeight: 'bold' }}>
            <option value="Phase 1 (Setup)">Phase 1 (Setup - May)</option>
            <option value="Q1 (July)">Q1 Check-in (July)</option>
            <option value="Q2 (Oct)">Q2 Check-in (Oct)</option>
            <option value="Q3 (Jan)">Q3 Check-in (Jan)</option>
            <option value="Q4 (March)">Q4 Final (March)</option>
          </select>
        </div>
      </div>

      <header className="card" style={{ textAlign: 'center' }}>
        <h1>AtomQuest: Goal Setting Portal</h1>
        <p>Status: <strong style={{ color: sheetStatus === 'Approved' ? '#28a745' : (sheetStatus === 'Rework' ? '#dc3545' : '#ffc107') }}>{sheetStatus.toUpperCase()}</strong></p>
        
        {/* Admin Dashboard */}
        {role === 'Admin' && (
           <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
             <h3>Admin & HR Governance Dashboard</h3>
             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
               <button onClick={downloadCSV} style={{ background: '#28a745' }}>Download Org Achievement Report (CSV)</button>
               {sheetStatus === 'Approved' && (
                 <button onClick={() => { setSheetStatus('Rework'); addAuditLog('Admin forced sheet unlock (Exception Handling)'); }} style={{ background: '#dc3545' }}>
                   Force Unlock Sheet (Exception)
                 </button>
               )}
             </div>
           </div>
        )}

        {/* Phase 1 Progress Bar (Only show if not approved) */}
        {sheetStatus !== 'Approved' && (
          <>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${totalWeightage}%`, background: totalWeightage === 100 ? '#28a745' : '#ffc107' }}></div>
            </div>
            <p>Total Weightage: <strong>{totalWeightage}%</strong> / 100% (Goals: {goals.length}/8)</p>
          </>
        )}
        
        {/* Employee Controls */}
        {role === 'Employee' && (sheetStatus === 'Draft' || sheetStatus === 'Rework') && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button style={{ background: '#17a2b8', flex: 1 }} onClick={pushSharedGoal}>Simulate Receiving Shared KPI</button>
            <button 
              style={{ background: totalWeightage === 100 ? '#28a745' : '#ccc', flex: 1 }} disabled={totalWeightage !== 100}
              onClick={() => { setSheetStatus('Submitted'); addAuditLog('Employee submitted goals for approval'); }}
            >
              {totalWeightage === 100 ? 'Submit for Approval' : `Reach 100% to Submit`}
            </button>
          </div>
        )}

        {/* Manager Controls */}
        {role === 'Manager' && sheetStatus === 'Submitted' && totalWeightage === 100 && (
           <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
             <button style={{ background: '#28a745', flex: 1 }} onClick={() => { setSheetStatus('Approved'); addAuditLog('Manager approved and locked goals'); }}>Approve & Lock Goals</button>
             <button style={{ background: '#dc3545', flex: 1 }} onClick={() => { setSheetStatus('Rework'); addAuditLog('Manager returned goals for rework'); }}>Return for Rework</button>
           </div>
        )}
      </header>

      {/* Phase Routing */}
      {sheetStatus === 'Approved' ? (
        <CheckInBoard goals={goals} role={role} onUpdateGoal={handleUpdateGoal} currentCycle={currentCycle} addAuditLog={addAuditLog} auditLogs={auditLogs} />
      ) : (
        <>
          {role === 'Employee' && (sheetStatus === 'Draft' || sheetStatus === 'Rework') && (
            <GoalForm onAddGoal={handleAddGoal} currentTotalWeightage={totalWeightage} currentGoalCount={goals.length} />
          )}
          <GoalList goals={goals} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} role={role} sheetStatus={sheetStatus} />
        </>
      )}
    </div>
  );
}