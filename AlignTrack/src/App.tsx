import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import CheckInBoard from './components/CheckInBoard';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import type { Goal, SheetStatus, Cycle, AuditLog } from './types/index';
import './index.css';

// ⚠️ CHANGE THIS BACK TO YOUR RENDER URL
const API_BASE = 'https://aligntrack-backend.onrender.com';

// --- ROUTE GUARD ---
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // 1. DATABASE CONNECTION
  useEffect(() => {
    if (!user) return; 
    fetch(`${API_BASE}/goals`)
      .then(res => res.json())
      .then(data => {
        const formattedGoals = data.map((g: any) => ({
          id: g.id, thrustArea: g.thrust_area, title: g.title, description: g.description,
          uom: g.uom, target: g.target, weightage: g.weightage, isShared: g.is_shared,
          sheetStatus: g.sheet_status, actualAchievement: g.actual_achievement,
          progressStatus: g.progress_status, managerComment: g.manager_comment, cycle: g.cycle
        }));
        setGoals(formattedGoals);
      })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/audit-logs`)
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .catch(err => console.error(err));
  }, [user]);

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  // 2. DATABASE FUNCTIONS (TypeScript Panic Button Applied -> 'any')
  const addAuditLog = async (action: string) => {
    const newLog = { id: crypto.randomUUID(), action: `${user?.username}: ${action}` };
    try {
      const res = await fetch(`${API_BASE}/audit-logs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLog)
      });
      const savedLog = await res.json();
      setAuditLogs(prev => [savedLog, ...prev]);
    } catch (err) { console.error(err); }
  };

  const handleAddGoal = async (newGoal: any) => {
    const payload = {
      id: newGoal.id, thrust_area: newGoal.thrustArea, title: newGoal.title, description: newGoal.description,
      uom: newGoal.uom, target: newGoal.target, weightage: newGoal.weightage, is_shared: newGoal.isShared,
      sheet_status: newGoal.sheetStatus, actual_achievement: newGoal.actualAchievement,
      progress_status: newGoal.progressStatus, manager_comment: newGoal.managerComment, cycle: newGoal.cycle
    };
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
    const payload = {
      id: updatedGoal.id, thrust_area: updatedGoal.thrustArea, title: updatedGoal.title, description: updatedGoal.description,
      uom: updatedGoal.uom, target: updatedGoal.target, weightage: updatedGoal.weightage, is_shared: updatedGoal.isShared,
      sheet_status: updatedGoal.sheetStatus, actual_achievement: updatedGoal.actualAchievement,
      progress_status: updatedGoal.progressStatus, manager_comment: updatedGoal.managerComment, cycle: updatedGoal.cycle
    };
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
    a.download = `AtomQuest_Achievement_Report.csv`;
    a.click();
    addAuditLog(`Exported Achievement Report CSV`);
  };

  // --- DASHBOARD WRAPPER ---
  const DashboardLayout = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="container">
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', background: '#343a40', color: 'white', alignItems: 'center' }}>
        <div>
          <strong>User:</strong> {user?.username} | <strong>Role:</strong> <span style={{ color: '#17a2b8' }}>{user?.role}</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {user?.role === 'Admin' && (
            <select value={currentCycle} onChange={(e) => setCurrentCycle(e.target.value as Cycle)} style={{ padding: '5px' }}>
              <option value="Phase 1 (Setup)">Phase 1 (Setup)</option>
              <option value="Q1 (July)">Q1 Check-in</option>
              <option value="Q2 (Oct)">Q2 Check-in</option>
            </select>
          )}
          <button onClick={logout} style={{ background: '#dc3545', padding: '5px 10px' }}>Logout</button>
        </div>
      </div>
      <header className="card" style={{ textAlign: 'center' }}>
        <h1>{title}</h1>
        <p>Sheet Status: <strong>{sheetStatus.toUpperCase()}</strong></p>
      </header>
      {children}
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* EMPLOYEE DASHBOARD */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRole="Employee">
          <DashboardLayout title="My Goal Sheet">
            {sheetStatus === 'Draft' || sheetStatus === 'Rework' ? (
              <>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${totalWeightage}%`, background: totalWeightage === 100 ? '#28a745' : '#ffc107' }}></div>
                </div>
                <p style={{ textAlign: 'center' }}>Weightage: <strong>{totalWeightage}%</strong> / 100%</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <button 
                    style={{ background: totalWeightage === 100 ? '#28a745' : '#ccc' }} 
                    disabled={totalWeightage !== 100}
                    onClick={() => { setSheetStatus('Submitted'); addAuditLog('Submitted goals for approval'); }}
                  >
                    {totalWeightage === 100 ? 'Submit for Approval' : `Reach 100% to Submit`}
                  </button>
                </div>
                <GoalForm onAddGoal={handleAddGoal} currentTotalWeightage={totalWeightage} currentGoalCount={goals.length} />
                <GoalList goals={goals} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} role={user?.role || 'Employee'} sheetStatus={sheetStatus} />
              </>
            ) : (
              <CheckInBoard goals={goals} role={user?.role || 'Employee'} onUpdateGoal={handleUpdateGoal} currentCycle={currentCycle} addAuditLog={addAuditLog} auditLogs={auditLogs} />
            )}
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* MANAGER DASHBOARD */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRole="Manager">
          <DashboardLayout title="Team Goal Approvals">
            
            {/* HACKATHON FIX: Show buttons if weightage is 100%, even if state reset */}
            {totalWeightage === 100 && sheetStatus !== 'Approved' ? (
               <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px' }}>
                 <p style={{ margin: 0, alignSelf: 'center', color: '#856404', fontWeight: 'bold' }}>⚠️ Employee Goals (100%) are ready for review!</p>
                 <button style={{ background: '#28a745', fontWeight: 'bold' }} onClick={() => { setSheetStatus('Approved'); addAuditLog('Approved and locked goals'); }}>Approve & Lock Goals</button>
                 <button style={{ background: '#dc3545', fontWeight: 'bold' }} onClick={() => { setSheetStatus('Rework'); addAuditLog('Returned goals for rework'); }}>Return for Rework</button>
               </div>
            ) : sheetStatus === 'Approved' ? (
              <div className="card" style={{ textAlign: 'center', background: '#d4edda', color: '#155724', fontWeight: 'bold' }}>
                <p>✅ Goals have been successfully Approved and Locked.</p>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', background: '#e9ecef', color: 'black' }}>
                <p>Waiting for employee to reach 100% total weightage.</p>
              </div>
            )}
            
            <GoalList goals={goals} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} role={user?.role || 'Manager'} sheetStatus={sheetStatus} />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* ADMIN DASHBOARD */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="Admin">
          <DashboardLayout title="HR Governance & Reporting">
            <div className="card" style={{ background: '#f8d7da', border: '1px solid #f5c6cb' }}>
               <h3>Admin Controls</h3>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={downloadCSV} style={{ background: '#28a745' }}>Download Org Achievement Report (CSV)</button>
                 {sheetStatus === 'Approved' && (
                   <button onClick={() => { setSheetStatus('Rework'); addAuditLog('Admin forced sheet unlock'); }} style={{ background: '#dc3545' }}>
                     Force Unlock Sheet (Exception)
                   </button>
                 )}
               </div>
            </div>
            
            <div className="card">
              <h3>Completion Status Dashboard</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ccc' }}>
                    <th>Employee Name</th>
                    <th>Goal Sheet Status</th>
                    <th>Total Weightage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 0' }}>John Doe (emp)</td>
                    <td>
                      <span style={{ padding: '5px 10px', borderRadius: '15px', background: sheetStatus === 'Approved' ? '#28a745' : '#ffc107', color: sheetStatus === 'Approved' ? 'white' : 'black' }}>
                        {sheetStatus}
                      </span>
                    </td>
                    <td>{totalWeightage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}