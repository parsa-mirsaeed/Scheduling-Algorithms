import React from 'react';

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  averageResponseTime
}) => {
  return (
    <div>
      {/* Results display will be implemented here */}
    </div>
  );
};

export default ResultsDisplay; 