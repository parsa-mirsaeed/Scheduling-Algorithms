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
  // Format number to 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };

  return (
    <div className="results-display">
      <div className="metrics">
        <div className="metric">
          <h3>Average Turnaround Time</h3>
          <p className="metric-value">{formatNumber(averageTurnaroundTime)}</p>
          <p className="metric-description">
            Time from process arrival to completion
          </p>
        </div>

        <div className="metric">
          <h3>Average Waiting Time</h3>
          <p className="metric-value">{formatNumber(averageWaitingTime)}</p>
          <p className="metric-description">
            Time spent waiting in the ready queue
          </p>
        </div>

        <div className="metric">
          <h3>Average Response Time</h3>
          <p className="metric-value">{formatNumber(averageResponseTime)}</p>
          <p className="metric-description">
            Time from arrival until first execution
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 