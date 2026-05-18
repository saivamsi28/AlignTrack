import { useState } from 'react';

export default function GoalForm({ onAddGoal, currentTotalWeightage, currentGoalCount }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thrustArea, setThrustArea] = useState('');
  const [target, setTarget] = useState('');
  const [uom, setUom] = useState('Standard');
  const [weightage, setWeightage] = useState<number | ''>(10); // Defaults to 10 to help them follow the rules

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightValue = Number(weightage);

    // 1. Enforce Minimum 10% Rule
    if (weightValue < 10) {
      return alert("BRD Rule: Each goal must have a minimum weightage of 10%.");
    }

    // 2. Enforce Maximum 8 Goals Rule
    if (currentGoalCount >= 8) {
      return alert("BRD Rule: You cannot exceed a maximum of 8 goals per year.");
    }

    // 3. Prevent going over 100% total
    if (currentTotalWeightage + weightValue > 100) {
      return alert(`Cannot exceed 100%. You only have ${100 - currentTotalWeightage}% remaining.`);
    }

    const newGoal = {
      id: crypto.randomUUID(),
      title,
      description,
      thrustArea,
      target,
      uom,
      weightage: weightValue,
      isShared: false,
      sheetStatus: 'Draft',
      actualAchievement: '',
      progressStatus: 'Not Started',
      managerComment: '',
      cycle: 'Phase 1 (Setup)'
    };

    onAddGoal(newGoal);

    // Reset form after successful submission
    setTitle('');
    setDescription('');
    setThrustArea('');
    setTarget('');
    setUom('Standard');
    setWeightage(10); 
  };

  // PREVENTATIVE UI: Hide the form completely if they maxed out the rules!
  if (currentTotalWeightage >= 100 || currentGoalCount >= 8) {
    return (
      <div style={{ padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '12px', textAlign: 'center', marginTop: '24px', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
        {currentTotalWeightage >= 100 
          ? "🎉 100% Weightage Reached! Your goals are ready to be submitted for approval." 
          : "⚠️ Maximum limit of 8 goals reached!"}
      </div>
    );
  }

  return (
    <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '24px' }}>
      <h3 style={{ marginTop: 0, color: '#1e40af' }}>+ Add New Goal</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Goal Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Increase Quarterly Sales" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Thrust Area</label>
            <input type="text" value={thrustArea} onChange={(e) => setThrustArea(e.target.value)} required placeholder="e.g., Financial, Customer Success..." />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Briefly describe the objective..." style={{ height: '60px' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Target Value</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} required placeholder="e.g., 50000 or 100" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Unit of Measure (UoM)</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)} required>
              <option value="Standard">Standard (Higher is Better)</option>
              <option value="Max (Lower is Better)">Max (Lower is Better)</option>
              <option value="Zero Error">Zero Error (Must be 0)</option>
              <option value="Min (Threshold)">Min (Threshold)</option>
            </select>
          </div>
          <div style={{ width: '120px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Weightage (%)</label>
            <input 
              type="number" 
              value={weightage} 
              onChange={(e) => setWeightage(e.target.value === '' ? '' : Number(e.target.value))} 
              required 
              min="10" 
              max={100 - currentTotalWeightage} 
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: '8px' }}>Add Goal to Sheet</button>
      </form>
    </div>
  );
}