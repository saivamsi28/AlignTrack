import React from 'react';
import type { Goal } from '../types/index';

interface GoalListProps {
  goals: Goal[];
  onRemoveGoal: (id: string) => void;
}

export default function GoalList({ goals, onRemoveGoal }: GoalListProps) {
  if (goals.length === 0) return <div className="card"><p>No goals added yet. Start by creating one above.</p></div>;

  return (
    <div className="card">
      <h2>Your Goal Sheet</h2>
      {goals.map((goal) => (
        <div key={goal.id} className="goal-item">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>{goal.title} ({goal.weightage}%)</h3>
            <button style={{ background: '#d9534f' }} onClick={() => onRemoveGoal(goal.id)}>Remove</button>
          </div>
          <p><strong>Thrust Area:</strong> {goal.thrustArea}</p>
          <p><strong>Target:</strong> {goal.target} [{goal.uom}]</p>
        </div>
      ))}
    </div>
  );
}