import React from 'react';

interface ProcessInputProps {
  addProcess: (process: { id: number; arrivalTime: number; burstTime: number }) => void;
}

const ProcessInput: React.FC<ProcessInputProps> = ({ addProcess }) => {
  return (
    <div>
      {/* Process input form will be implemented here */}
    </div>
  );
};

export default ProcessInput; 