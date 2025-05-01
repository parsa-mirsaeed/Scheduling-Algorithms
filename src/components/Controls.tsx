import React from 'react';

type Algorithm = 'FIFO' | 'SJF' | 'SRT' | 'RR';

interface ControlsProps {
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algorithm: Algorithm) => void;
  timeQuantum: number;
  setTimeQuantum: (quantum: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedAlgorithm,
  setSelectedAlgorithm,
  timeQuantum,
  setTimeQuantum,
  startSimulation,
  resetSimulation
}) => {
  // Handler for algorithm selection
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgorithm(e.target.value as Algorithm);
  };

  // Handler for time quantum input
  const handleQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 0) {
      setTimeQuantum(value);
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
      {selectedAlgorithm === 'RR' && (
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