import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import CheckInBoard from './components/CheckInBoard';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import type { Goal, SheetStatus, Cycle, } from './types/index';
import './index.css';


const API_BASE = 'https://aligntrack-backend.onrender.com';

const ProtectedRoute = ({ children, allowedRole }: { children: any, allowedRole: any }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user, logout } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sheetStatus, setSheetStatus] = useState<SheetStatus>('Draft');
  const [currentCycle, setCurrentCycle] = useState<Cycle>('Phase 1 (Setup)');
  const [, setAuditLogs] = useState<any[]>([]); 

  useEffect(() => {
    if (!user) return; 
    fetch(`${API_BASE}/goals`).then(res => res.json()).then(data => {
      setGoals(data.map((g: any) => ({
        id: g.id, thrustArea: g.thrust_area, title: g.title, description: g.description,
        uom: g.uom, target: g.target, weightage: g.weightage, isShared: g.is_shared,
        sheetStatus: g.sheet_status, actualAchievement: g.actual_achievement,
        progressStatus: g.progress_status, managerComment: g.manager_comment, cycle: g.cycle
      })));
    }).catch(err => console.error(err));

    fetch(`${API_BASE}/audit-logs`).then(res => res.json()).then(data => setAuditLogs(data)).catch(err => console.error(err));
  }, [user]);

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  const addAuditLog = async (action: string) => {
    const newLog = { id: crypto.randomUUID(), action: `${user?.username}: ${action}` };
    try {
      const res = await fetch(`${API_BASE}/audit-logs`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newLog) 
      });
      
      // FIX: Wait for the data FIRST, then update the state
      const savedLog = await res.json();
      setAuditLogs(prev => [savedLog, ...prev]);
      
    } catch (err) { console.error(err); }
  };;

  const handleAddGoal = async (newGoal: any) => {
    const payload = { ...newGoal, thrust_area: newGoal.thrustArea, is_shared: newGoal.isShared, sheet_status: newGoal.sheetStatus, actual_achievement: newGoal.actualAchievement, progress_status: newGoal.progressStatus, manager_comment: newGoal.managerComment };
    try {
      await fetch(`${API_BASE}/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setGoals([...goals, newGoal]);
    } catch (err) { console.error(err); }
  };

  const handleRemoveGoal = async (id: string) => {
    try {
      await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) { console.error(err); }
  };
  
  const handleUpdateGoal = async (updatedGoal: any) => {
    const payload = { ...updatedGoal, thrust_area: updatedGoal.thrustArea, is_shared: updatedGoal.isShared, sheet_status: updatedGoal.sheetStatus, actual_achievement: updatedGoal.actualAchievement, progress_status: updatedGoal.progressStatus, manager_comment: updatedGoal.managerComment };
    try {
      await fetch(`${API_BASE}/goals/${updatedGoal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } catch (err) { console.error(err); }
  };

  const downloadCSV = () => {
    const headers = "Goal Title,Thrust Area,Target,Weightage,Actual Achievement,Status\n";
    const rows = goals.map(g => `"${g.title}","${g.thrustArea}","${g.target}","${g.weightage}%","${g.actualAchievement || 'N/A'}","${g.progressStatus || 'Not Started'}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AtomQuest_Report.csv`;
    a.click();
    addAuditLog(`Exported Report CSV`);
  };

  // --- NEW ENTERPRISE LAYOUT WRAPPER ---
  const DashboardLayout = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="app-layout">
      {/* 1. SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">⚛️ AtomQuest</div>
        <div className="sidebar-menu">
          <div className="sidebar-item active">📊 Dashboard</div>
          <div className="sidebar-item">🎯 My Goals</div>
          {user?.role === 'Manager' && <div className="sidebar-item">👥 Team Check-ins</div>}
          {user?.role === 'Admin' && <div className="sidebar-item">⚙️ Settings & Reports</div>}
        </div>
      </div>

      {/* 2. MAIN CONTENT & HEADER */}
      <div className="main-content">
        <div className="top-header">
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>{title}</h2>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Workflow Status: <strong style={{ color: '#1e40af' }}>{sheetStatus.toUpperCase()}</strong></span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* ROLE BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.username}</span>
              <span className={`role-badge badge-${user?.role}`}>{user?.role}</span>
            </div>

            {user?.role === 'Admin' && (
              <select value={currentCycle} onChange={(e) => setCurrentCycle(e.target.value as Cycle)} style={{ width: 'auto', background: '#f1f5f9' }}>
                <option value="Phase 1 (Setup)">Phase 1 (Setup)</option>
                <option value="Q1 Check-in">Q1 Check-in</option>
                <option value="Q2 Check-in">Q2 Check-in</option>
              </select>
            )}
            <button className="danger" onClick={logout}>Logout</button>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* EMPLOYEE DASHBOARD */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRole="Employee">
          <DashboardLayout title="Employee Portal">
            {currentCycle === 'Phase 1 (Setup)' ? (
              <div className="card">
                <h3>Draft Goal Sheet</h3>
                <div style={{ background: '#e2e8f0', borderRadius: '20px', height: '12px', marginBottom: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${totalWeightage}%`, background: totalWeightage === 100 ? '#10b981' : '#f59e0b', height: '100%', transition: 'width 0.5s' }}></div>
                </div>
                <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Weightage: {totalWeightage}% / 100%</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <button className={totalWeightage === 100 ? 'success' : ''} disabled={totalWeightage !== 100} onClick={() => { setSheetStatus('Submitted'); addAuditLog('Submitted goals'); }}>
                    {totalWeightage === 100 ? 'Submit for Approval' : `Reach 100% to Submit`}
                  </button>
                </div>
                <GoalForm onAddGoal={handleAddGoal} currentTotalWeightage={totalWeightage} currentGoalCount={goals.length} />
                {goals.length === 0 ? <div className="empty-state">No goals added yet. Start planning above!</div> : <GoalList goals={goals} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} role={user?.role || 'Employee'} sheetStatus={sheetStatus} />}
              </div>
            ) : (
              <CheckInBoard goals={goals} role={user?.role || 'Employee'} onUpdateGoal={handleUpdateGoal} currentCycle={currentCycle} addAuditLog={addAuditLog} />
            )}
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* MANAGER DASHBOARD */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRole="Manager">
          <DashboardLayout title="Team Operations">
            {currentCycle === 'Phase 1 (Setup)' ? (
              <>
                {totalWeightage === 100 && sheetStatus !== 'Approved' ? (
                   <div className="card" style={{ background: '#fef3c7', borderColor: '#fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <p style={{ margin: 0, color: '#92400e', fontWeight: 'bold' }}>⚠️ Employee goals are ready for review!</p>
                     <div style={{ display: 'flex', gap: '10px' }}>
                       <button className="success" onClick={() => { setSheetStatus('Approved'); addAuditLog('Approved goals'); }}>Approve & Lock</button>
                       <button className="danger" onClick={() => { setSheetStatus('Rework'); addAuditLog('Returned for rework'); }}>Return</button>
                     </div>
                   </div>
                ) : sheetStatus === 'Approved' ? (
                  <div className="card" style={{ background: '#dcfce7', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>✅ Goals Locked for the year.</div>
                ) : (
                  <div className="empty-state">Waiting for employee to finalize 100% weightage.</div>
                )}
                {goals.length > 0 && <GoalList goals={goals} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} role={user?.role || 'Manager'} sheetStatus={sheetStatus} />}
              </>
            ) : (
              <CheckInBoard goals={goals} role={user?.role || 'Manager'} onUpdateGoal={handleUpdateGoal} currentCycle={currentCycle} addAuditLog={addAuditLog} />
            )}
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* ADMIN DASHBOARD */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="Admin">
          <DashboardLayout title="Governance & Compliance">
            
            {/* ADMIN BIG STAT CARDS */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Org Completion Rate</h3>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#1e40af' }}>18 <span style={{fontSize: '24px', color: '#94a3b8'}}>/ 24</span></div>
              </div>
              <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Pending Check-ins</h3>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#ef4444' }}>6</div>
              </div>
            </div>

            <div className="card">
               <h3>Administrative Actions</h3>
               <div style={{ display: 'flex', gap: '16px' }}>
                 <button className="success" onClick={downloadCSV}>⬇️ Download Achievement Report (CSV)</button>
                 {sheetStatus === 'Approved' && (
                   <button className="danger" onClick={() => { setSheetStatus('Rework'); addAuditLog('Admin forced unlock'); }}>⚠️ Force Unlock Sheet</button>
                 )}
               </div>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() { return <AuthProvider><Router><AppRoutes /></Router></AuthProvider>; }