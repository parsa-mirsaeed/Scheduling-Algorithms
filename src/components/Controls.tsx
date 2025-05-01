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
  return (
    <div>
      {/* Controls will be implemented here */}
    </div>
  );
};

export default Controls; 