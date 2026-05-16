import React, { useState } from 'react';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import type { Goal } from './types/index';
import './index.css';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  const handleAddGoal = (newGoal: Goal) => {
    setGoals([...goals, newGoal]);
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  return (
    <div className="container">
      <header className="card" style={{ textAlign: 'center' }}>
        <h1>AtomQuest: Goal Setting Portal</h1>
        <p>Phase 1: Employee Goal Creation</p>
        
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${totalWeightage}%`, background: totalWeightage === 100 ? '#28a745' : '#ffc107' }}></div>
        </div>
        <p>Total Weightage: <strong>{totalWeightage}%</strong> / 100% (Goals: {goals.length}/8)</p>
        
        {totalWeightage === 100 && (
          <button style={{ marginTop: '10px', background: '#28a745', width: '100%' }}>
            Submit Goal Sheet for Manager Approval
          </button>
        )}
      </header>

      <GoalForm 
        onAddGoal={handleAddGoal} 
        currentTotalWeightage={totalWeightage} 
        currentGoalCount={goals.length} 
      />
      
      <GoalList 
        goals={goals} 
        onRemoveGoal={handleRemoveGoal} 
      />
    </div>
  );
}