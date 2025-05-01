import React from 'react';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
}

interface ProcessListDisplayProps {
  processes: Process[];
}

const ProcessListDisplay: React.FC<ProcessListDisplayProps> = ({ processes }) => {
  return (
    <div>
      {/* Process list display will be implemented here */}
    </div>
  );
};

export default ProcessListDisplay; 