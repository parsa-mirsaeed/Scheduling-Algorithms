import React from "react";

type Algorithm = "FIFO" | "SJF" | "SRT" | "RR";

interface ControlsProps {
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algorithm: Algorithm) => void;
  timeQuantum: number;
  setTimeQuantum: (quantum: number) => void;
  contextSwitchTime: number;
  setContextSwitchTime: (time: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedAlgorithm,
  setSelectedAlgorithm,
  timeQuantum,
  setTimeQuantum,
  contextSwitchTime,
  setContextSwitchTime,
  startSimulation,
  resetSimulation,
}) => {
  // Handler for algorithm selection
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgorithm(e.target.value as Algorithm);
  };

  // Handler for time quantum input
  const handleQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueAsString = e.target.value;
    // Allow empty string temporarily during typing
    if (valueAsString === "") {
      // Optionally set to a default or handle as needed, here we just return
      // If you want to allow clearing the field, you might need to handle this differently
      // setTimeQuantum(1); // Example: reset to 1 if cleared
      return;
    }

    const valueAsNumber = Number(valueAsString);

    // Check if it's a valid positive number
    if (!isNaN(valueAsNumber) && valueAsNumber > 0) {
      setTimeQuantum(valueAsNumber);
    }
  };

  // Handler for context switch time input
  const handleContextSwitchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const valueAsString = e.target.value;
    if (valueAsString === "") {
      setContextSwitchTime(0); // Default to 0 if field is cleared
      return;
    }
    const valueAsNumber = Number(valueAsString);
    // Allow 0 or positive integers
    if (
      !isNaN(valueAsNumber) &&
      valueAsNumber >= 0 &&
      Number.isInteger(valueAsNumber)
    ) {
      setContextSwitchTime(valueAsNumber);
    }
  };

  return (
    <div className="controls">
      <div className="form-group">
        <label htmlFor="algorithm">Select Algorithm:</label>
        <select
          id="algorithm"
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
        >
          <option value="FIFO">First-In, First-Out (FIFO)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRT">Shortest Remaining Time (SRT)</option>
          <option value="RR">Round Robin (RR)</option>
        </select>
      </div>

      {/* Show time quantum input only for Round Robin */}
      {selectedAlgorithm === "RR" && (
        <>
          <div className="form-group">
            <label htmlFor="timeQuantum">Time Quantum:</label>
            <input
              type="number"
              id="timeQuantum"
              value={timeQuantum}
              onChange={handleQuantumChange}
              min="1"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contextSwitchTime">
              Context Switch Time (Optional):
            </label>
            <input
              type="number"
              id="contextSwitchTime"
              value={contextSwitchTime}
              onChange={handleContextSwitchChange}
              min="0" // Allow 0
              step="1"
            />
          </div>
        </>
      )}

      <div className="button-group">
        <button
          type="button"
          className="start-button"
          onClick={startSimulation}
        >
          Start Simulation
        </button>
        <button
          type="button"
          className="reset-button"
          onClick={resetSimulation}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Controls;
