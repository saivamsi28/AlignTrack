export default function CheckInBoard({ goals, role, onUpdateGoal, currentCycle, addAuditLog }: any) {
  
  const calculateScore = (target: string, actual: string, uom: string) => {
    if (!actual || isNaN(Number(actual))) return 0;
    const t = parseFloat(target), a = parseFloat(actual), uomType = (uom || '').toLowerCase();
    let score = 0;
    if (uomType.includes('min')) score = (a / t) * 100;
    else if (uomType.includes('max')) score = a === 0 ? 100 : (t / a) * 100;
    else if (uomType.includes('zero')) score = a === 0 ? 100 : 0;
    else score = a >= t ? 100 : (a / t) * 100;
    return Math.min(Math.max(score, 0), 150);
  };

  const totalWeightedScore = goals.reduce((sum: number, goal: any) => sum + (calculateScore(goal.target, goal.actualAchievement, goal.uom) * (goal.weightage / 100)), 0);
  const employeeHasSubmitted = goals.length > 0 && goals.every((g: any) => g.actualAchievement && g.progressStatus);

  const handleEmployeeSave = (goal: any, field: string, value: string) => onUpdateGoal({ ...goal, [field]: value });
  const handleManagerSubmit = (goal: any) => {
    if (!goal.managerComment) return alert("Manager comment is mandatory!");
    onUpdateGoal(goal);
    addAuditLog(`Manager completed check-in: ${goal.title}`);
  };

  if (goals.length === 0) return <div className="empty-state">No active goals to track.</div>;

  return (
    <div>
      {/* TOTAL SCORE DASHBOARD */}
      <div className="card" style={{ background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc' }}>{currentCycle} Tracking</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>Overall Weighted Achievement</p>
        </div>
        <div style={{ fontSize: '3rem', fontWeight: '900', color: totalWeightedScore >= 100 ? '#34d399' : '#60a5fa' }}>
          {totalWeightedScore.toFixed(1)}%
        </div>
      </div>

      {role === 'Manager' && !employeeHasSubmitted && (
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
          🔒 Locked: Employee has not finished submitting achievements.
        </div>
      )}

      {goals.map((goal: any, index: number) => {
        const currentScore = calculateScore(goal.target, goal.actualAchievement, goal.uom);
        return (
          <div className="card" key={goal.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{index + 1}. {goal.title}</h3>
              <span className="role-badge" style={{ background: '#e2e8f0', color: '#475569' }}>W: {goal.weightage}%</span>
            </div>
            
            {/* SCORE VISUAL PROGRESS BAR */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: '700' }}>
                <span>Goal Achievement Score</span>
                <span style={{ color: currentScore >= 80 ? '#10b981' : currentScore >= 50 ? '#f59e0b' : '#ef4444' }}>{currentScore.toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(currentScore, 100)}%`, background: currentScore >= 80 ? '#10b981' : currentScore >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Actual ({goal.uom || 'Standard'} | Target: {goal.target}):</label>
                <input type="text" value={goal.actualAchievement || ''} onChange={(e) => handleEmployeeSave(goal, 'actualAchievement', e.target.value)} disabled={role !== 'Employee'} style={{ marginBottom: '12px', marginTop: '4px' }} placeholder="Enter number..." />
                
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Status:</label>
                <select value={goal.progressStatus || ''} onChange={(e) => handleEmployeeSave(goal, 'progressStatus', e.target.value)} disabled={role !== 'Employee'} style={{ marginTop: '4px' }}>
                  <option value="">Select...</option>
                  <option value="Not Started">Not Started</option><option value="On Track">On Track</option><option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Manager Comment:</label>
                <textarea value={goal.managerComment || ''} onChange={(e) => handleEmployeeSave(goal, 'managerComment', e.target.value)} disabled={role !== 'Manager' || !employeeHasSubmitted} style={{ height: '80px', marginTop: '4px', marginBottom: '12px' }} placeholder={employeeHasSubmitted ? "Enter check-in feedback..." : "Awaiting employee..."} />
                {role === 'Manager' && <button className="success" onClick={() => handleManagerSubmit(goal)} disabled={!employeeHasSubmitted || !goal.managerComment} style={{ width: '100%' }}>Lock Check-in</button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}