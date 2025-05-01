import React, { useState } from 'react';
import { Process } from '../logic/scheduler';

interface ProcessInputProps {
  addProcess: (process: Process) => void;
}

const ProcessInput: React.FC<ProcessInputProps> = ({ addProcess }) => {
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [burstTime, setBurstTime] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (arrivalTime < 0) {
      setError('Arrival time cannot be negative');
      return;
    }
    
    if (burstTime <= 0) {
      setError('Burst time must be positive');
      return;
    }
    
    // Create new process object (id will be assigned in the parent component)
    const newProcess: Process = {
      id: 0, // This will be set by the parent component
      arrivalTime,
      burstTime,
      remainingTime: burstTime // Initialize remaining time to burst time
    };
    
    // Add process to the list
    addProcess(newProcess);
    
    // Reset form
    setArrivalTime(0);
    setBurstTime(1);
    setError('');
  };

  return (
    <div className="process-input">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time:</label>
          <input
            type="number"
            id="arrivalTime"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(Number(e.target.value))}
            min="0"
            step="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="burstTime">Burst Time:</label>
          <input
            type="number"
            id="burstTime"
            value={burstTime}
            onChange={(e) => setBurstTime(Number(e.target.value))}
            min="1"
            step="1"
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit">Add Process</button>
      </form>
    </div>
  );
};

export default ProcessInput; 