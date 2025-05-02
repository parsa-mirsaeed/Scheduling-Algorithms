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
    // Allow empty string or valid non-negative integer
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) >= 0)) {
      setArrivalTime(value);
    }
  };

  const handleBurstTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid positive integer
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) > 0)) {
      setBurstTime(value);
    }
  };

  return (
    <div className="process-input">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="burstTime">Burst Time:</label>
          <input
            type="text"
            id="burstTime"
            className="form-control"
            value={burstTime}
            onChange={handleBurstTimeChange}
            placeholder="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time:</label>
          <input
            type="text"
            id="arrivalTime"
            className="form-control"
            value={arrivalTime}
            onChange={handleArrivalTimeChange}
            placeholder="0"
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
