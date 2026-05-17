export default function CheckInBoard({ goals, role, onUpdateGoal, currentCycle, addAuditLog }: any) {
  
  // ==========================================
  // BRD GAP 1: THE SCORING MATH ENGINE
  // ==========================================
  const calculateScore = (target: string, actual: string, uom: string) => {
    if (!actual || isNaN(Number(actual))) return 0;
    
    const t = parseFloat(target);
    const a = parseFloat(actual);
    const uomType = (uom || '').toLowerCase();

    let score = 0;

    // Type 1: Min (Higher is better - e.g., Sales)
    if (uomType.includes('min')) {
      score = (a / t) * 100;
    } 
    // Type 2: Max (Lower is better - e.g., Errors, Time)
    else if (uomType.includes('max')) {
      score = a === 0 ? 100 : (t / a) * 100;
    } 
    // Type 4: Zero (Zero equals perfect - e.g., Safety Incidents)
    else if (uomType.includes('zero')) {
      score = a === 0 ? 100 : 0;
    } 
    // Type 3: Timeline/Date (Fallback for standard exact targets)
    else {
      score = a >= t ? 100 : (a / t) * 100;
    }

    // Cap the score at 150% for overachievement, floor at 0%
    return Math.min(Math.max(score, 0), 150);
  };

  // Calculate Overall Weighted Score
  const totalWeightedScore = goals.reduce((sum: number, goal: any) => {
    const score = calculateScore(goal.target, goal.actualAchievement, goal.uom);
    return sum + (score * (goal.weightage / 100));
  }, 0);

  // ==========================================
  // BRD GAP 2: THE MANAGER LOCK
  // ==========================================
  // The manager is locked out unless the employee has filled in EVERY goal
  const employeeHasSubmitted = goals.length > 0 && goals.every((g: any) => g.actualAchievement && g.progressStatus);


  const handleEmployeeSave = (goal: any, field: string, value: string) => {
    const updatedGoal = { ...goal, [field]: value };
    onUpdateGoal(updatedGoal);
  };

  const handleManagerSubmit = (goal: any) => {
    if (!goal.managerComment) return alert("Manager comment is mandatory per BRD!");
    onUpdateGoal(goal);
    addAuditLog(`Manager completed check-in for goal: ${goal.title}`);
  };

  return (
    <div className="card">
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        {currentCycle} Tracking Board
      </h2>
      
      {/* OVERALL SCORE DASHBOARD */}
      <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Total Weighted Score</h3>
          <p style={{ margin: 0, color: '#6c757d' }}>Calculated live based on Phase 2 BRD Math Logic</p>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: totalWeightedScore >= 100 ? '#28a745' : '#0056b3' }}>
          {totalWeightedScore.toFixed(1)}%
        </div>
      </div>

      {/* MANAGER LOCK WARNING */}
      {role === 'Manager' && !employeeHasSubmitted && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          🔒 Check-in Locked: The employee has not finished submitting their actual achievements for all goals yet.
        </div>
      )}

      {/* GOALS LIST */}
      {goals.map((goal: any, index: number) => {
        const currentScore = calculateScore(goal.target, goal.actualAchievement, goal.uom);
        
        return (
          <div key={goal.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{index + 1}. {goal.title}</h3>
              <span style={{ background: '#17a2b8', color: 'white', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                Score: {currentScore.toFixed(1)}%
              </span>
            </div>
            
            <p style={{ margin: '5px 0' }}><strong>Target:</strong> {goal.target} | <strong>Type:</strong> {goal.uom || 'Standard'} | <strong>Weightage:</strong> {goal.weightage}%</p>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              
              {/* EMPLOYEE CONTROLS */}
              <div style={{ flex: 1, background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <h4>Employee Update</h4>
                <label>Actual Achievement:</label>
                <input 
                  type="text" 
                  value={goal.actualAchievement || ''} 
                  onChange={(e) => handleEmployeeSave(goal, 'actualAchievement', e.target.value)}
                  disabled={role !== 'Employee'}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                  placeholder="Enter actual number..."
                />
                
                <label>Status:</label>
                <select 
                  value={goal.progressStatus || ''} 
                  onChange={(e) => handleEmployeeSave(goal, 'progressStatus', e.target.value)}
                  disabled={role !== 'Employee'}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select Status...</option>
                  <option value="Not Started">Not Started</option>
                  <option value="On Track">On Track</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* MANAGER CONTROLS */}
              <div style={{ flex: 1, background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <h4>Manager Check-in</h4>
                <label>Check-in Comment (Mandatory):</label>
                <textarea 
                  value={goal.managerComment || ''} 
                  onChange={(e) => handleEmployeeSave(goal, 'managerComment', e.target.value)}
                  disabled={role !== 'Manager' || !employeeHasSubmitted}
                  style={{ width: '100%', height: '70px', marginBottom: '10px', padding: '8px' }}
                  placeholder={employeeHasSubmitted ? "Enter official check-in feedback..." : "Waiting for employee..."}
                />
                
                {role === 'Manager' && (
                  <button 
                    onClick={() => handleManagerSubmit(goal)}
                    disabled={!employeeHasSubmitted || !goal.managerComment}
                    style={{ background: (!employeeHasSubmitted || !goal.managerComment) ? '#ccc' : '#28a745', width: '100%' }}
                  >
                    Lock & Complete Check-in
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}