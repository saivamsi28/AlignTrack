import React, { useState } from 'react';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import type { Goal, Role, SheetStatus } from './types/index';
import './index.css';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [role, setRole] = useState<Role>('Employee');
  const [sheetStatus, setSheetStatus] = useState<SheetStatus>('Draft');

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  const handleAddGoal = (newGoal: Goal) => setGoals([...goals, newGoal]);
  const handleRemoveGoal = (id: string) => setGoals(goals.filter(goal => goal.id !== id));
  
  // New function for inline edits
  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  // Simulate pushing a Shared KPI (Admin/Manager action)
  const pushSharedGoal = () => {
    if (goals.length >= 8) return alert("Maximum limit of 8 goals reached.");
    const sharedGoal: Goal = {
      id: crypto.randomUUID(),
      thrustArea: 'Corporate Operations',
      title: 'Reduce Operational Costs (Dept KPI)',
      description: 'Departmental KPI mandated by leadership.',
      uom: '%',
      target: '15',
      weightage: 10,
      isShared: true
    };
    handleAddGoal(sharedGoal);
  };

  return (
    <div className="container">
      {/* Role Switcher Demo Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', background: '#343a40', color: 'white' }}>
        <div><strong>Demo View:</strong> {role}</div>
        <div>
          <button onClick={() => setRole('Employee')} style={{ marginRight: 5, background: role === 'Employee' ? '#0056b3' : '#6c757d' }}>Employee</button>
          <button onClick={() => setRole('Manager')} style={{ background: role === 'Manager' ? '#0056b3' : '#6c757d' }}>Manager (L1)</button>
        </div>
      </div>

      <header className="card" style={{ textAlign: 'center' }}>
        <h1>AtomQuest: Goal Setting Portal</h1>
        <p>Status: <strong style={{ color: sheetStatus === 'Approved' ? '#28a745' : (sheetStatus === 'Rework' ? '#dc3545' : '#ffc107') }}>{sheetStatus.toUpperCase()}</strong></p>
        
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${totalWeightage}%`, background: totalWeightage === 100 ? '#28a745' : '#ffc107' }}></div>
        </div>
        <p>Total Weightage: <strong>{totalWeightage}%</strong> / 100% (Goals: {goals.length}/8)</p>
        
        {/* Employee Controls */}
{role === 'Employee' && (sheetStatus === 'Draft' || sheetStatus === 'Rework') && (
  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
    <button style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', flex: 1, cursor: 'pointer' }} onClick={pushSharedGoal}>
      Simulate Receiving Shared KPI
    </button>
    <button 
      style={{ 
        background: totalWeightage === 100 ? '#28a745' : '#e9ecef', 
        color: totalWeightage === 100 ? 'white' : '#6c757d',
        border: totalWeightage === 100 ? 'none' : '1px solid #ced4da',
        padding: '10px', 
        borderRadius: '4px', 
        flex: 1, 
        cursor: totalWeightage === 100 ? 'pointer' : 'not-allowed',
        fontWeight: 'bold'
      }} 
      disabled={totalWeightage !== 100}
      onClick={() => setSheetStatus('Submitted')}
    >
      {totalWeightage === 100 ? 'Submit for Approval' : `Reach 100% to Submit (Currently: ${totalWeightage}%)`}
    </button>
  </div>
)}

        {/* Manager Controls */}
        {role === 'Manager' && sheetStatus === 'Submitted' && totalWeightage === 100 && (
           <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
             <button style={{ background: '#28a745', flex: 1 }} onClick={() => setSheetStatus('Approved')}>Approve & Lock Goals</button>
             <button style={{ background: '#dc3545', flex: 1 }} onClick={() => setSheetStatus('Rework')}>Return for Rework</button>
           </div>
        )}
      </header>

      {/* Hide form if not in Draft/Rework state or if Manager is viewing */}
      {role === 'Employee' && (sheetStatus === 'Draft' || sheetStatus === 'Rework') && (
        <GoalForm onAddGoal={handleAddGoal} currentTotalWeightage={totalWeightage} currentGoalCount={goals.length} />
      )}
      
      <GoalList 
        goals={goals} 
        onRemoveGoal={handleRemoveGoal} 
        onUpdateGoal={handleUpdateGoal}
        role={role}
        sheetStatus={sheetStatus}
      />
    </div>
  );
}