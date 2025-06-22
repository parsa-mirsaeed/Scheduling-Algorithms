import React, { useState } from "react";
import { Process } from "../logic/scheduler";

interface ProcessInputProps {
  addProcess: (process: Process) => void;
}

const ProcessInput: React.FC<ProcessInputProps> = ({ addProcess }) => {
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [burstTime, setBurstTime] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse values to numbers
    const arrivalTimeNum = arrivalTime === "" ? 0 : parseInt(arrivalTime, 10);
    const burstTimeNum = burstTime === "" ? 0 : parseInt(burstTime, 10);

    // Validate inputs
    if (arrivalTimeNum < 0 || isNaN(arrivalTimeNum)) {
      setError("Arrival time must be a non-negative integer");
      return;
    }

    if (burstTimeNum <= 0 || isNaN(burstTimeNum)) {
      setError("Burst time must be a positive integer");
      return;
    }

    // Create new process object (id will be assigned in the parent component)
    const newProcess: Process = {
      id: 0, // This will be set by the parent component
      arrivalTime: arrivalTimeNum,
      burstTime: burstTimeNum,
      remainingTime: burstTimeNum, // Initialize remaining time to burst time
    };

    // Add process to the list
    addProcess(newProcess);

    // Reset form
    setArrivalTime("");
    setBurstTime("");
    setError("");
  };

  // Handle input change with validation
  const handleArrivalTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setArrivalTime(value);
    }
  };

  const handleBurstTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setBurstTime(value);
    }
  };

  return (
    <div className="process-input-redesigned">
      <h2>Add Processes</h2>
      <form onSubmit={handleSubmit} className="process-form-redesigned">
        <div className="input-group-redesigned">
          <div className="form-field-redesigned">
            <label htmlFor="arrivalTime">Arrival Time</label>
            <input
              type="number"
              id="arrivalTime"
              className="form-control-redesigned"
              value={arrivalTime}
              onChange={handleArrivalTimeChange}
              placeholder="e.g., 0"
              min="0"
              step="1"
            />
          </div>
          <div className="form-field-redesigned">
            <label htmlFor="burstTime">Burst Time</label>
            <input
              type="number"
              id="burstTime"
              className="form-control-redesigned"
              value={burstTime}
              onChange={handleBurstTimeChange}
              placeholder="e.g., 10"
              min="1"
              step="1"
            />
          </div>
        </div>
        <button type="submit" className="add-process-btn-redesigned">
          Add Process
        </button>
        {error && <p className="error-message-redesigned">{error}</p>}
      </form>
    </div>
  );
};

export default ProcessInput;
