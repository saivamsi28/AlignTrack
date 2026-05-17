import React, { useState } from 'react';
import type { Goal, UoMType } from '../types/index';

interface GoalFormProps {
  onAddGoal: (goal: Goal) => void;
  currentTotalWeightage: number;
  currentGoalCount: number;
}

export default function GoalForm({ onAddGoal, currentTotalWeightage, currentGoalCount }: GoalFormProps) {
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uom: 'Min (Numeric / %)' as UoMType,
    target: '',
    weightage: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentGoalCount >= 8) return setError('Maximum limit of 8 goals reached.');
    if (formData.weightage < 10) return setError('Minimum weightage per goal is 10%.');
    if (currentTotalWeightage + formData.weightage > 100) {
      return setError(`Adding this exceeds 100% weightage. You only have ${100 - currentTotalWeightage}% left.`);
    }
    if (!formData.title || !formData.target || !formData.thrustArea) {
      return setError('Please fill all required fields.');
    }

    onAddGoal({ ...formData, id: crypto.randomUUID() });
    setFormData({ ...formData, title: '', description: '', target: '', weightage: 10 });
  };

  return (
    <div className="card">
      <h2>Create New Goal</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Thrust Area *</label>
          <input value={formData.thrustArea} onChange={e => setFormData({...formData, thrustArea: e.target.value})} placeholder="e.g., Revenue, Innovation..." />
        </div>
        
        <div className="form-group">
          <label>Goal Title *</label>
          <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Increase Q1 Sales" />
        </div>

        <div className="form-group">
          <label>Unit of Measurement (UoM)</label>
          <select value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value as UoMType})}>
            <option value="Min (Numeric / %)">Min (Higher is better)</option>
            <option value="Max (Numeric / %)">Max (Lower is better)</option>
            <option value="Timeline">Timeline</option>
            <option value="Zero">Zero-based</option>
          </select>
        </div>

        <div className="form-group">
          <label>Target *</label>
          <input value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} placeholder="e.g., 500k or 2024-12-31" />
        </div>

        <div className="form-group">
          <label>Weightage (%) *</label>
          <input type="number" min="10" max="100" value={formData.weightage} onChange={e => setFormData({...formData, weightage: Number(e.target.value)})} />
        </div>

        <button type="submit" disabled={currentTotalWeightage >= 100 || currentGoalCount >= 8}>
          Add Goal
        </button>
      </form>
    </div>
  );
}