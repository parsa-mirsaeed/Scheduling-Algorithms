import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Process } from '../logic/scheduler';

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  processes: Process[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  averageResponseTime,
  processes
}) => {
  // Format number to 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };

  // Calculate total metrics for formula display
  const totalTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime ?? 0), 0);
  const totalResponseTime = processes.reduce((sum, p) => sum + (p.responseTime ?? 0), 0);
  const numProcesses = processes.length > 0 ? processes.length : 1;

  // Use actual calculated WT values in the sum
  const waitingSumValuesStr = processes.map(p => formatNumber(p.waitingTime ?? 0)).join('+');

  // Simplified LaTeX formula strings
  const waitingFormula = `\\text{Avg WT} = \\frac{${waitingSumValuesStr}}{${numProcesses}}`;
  const turnaroundFormula = `\\text{Avg TAT} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  const responseFormula = `\\text{Avg RT} = \\frac{${formatNumber(totalResponseTime)}}{${numProcesses}}`;

  return (
    <div className="results-display">
      <div className="metrics">
        <div className="metric">
          <h3>Avg. Turnaround Time</h3>
          <div className="metric-value">
            {formatNumber(averageTurnaroundTime)}
          </div>
          <div className="metric-formula">
            <InlineMath math={turnaroundFormula} />
          </div>
          <p className="metric-description">Time from arrival to completion</p>
        </div>

        <div className="metric">
          <h3>Avg. Waiting Time</h3>
          <div className="metric-value">
            {formatNumber(averageWaitingTime)}
          </div>
          <div className="metric-formula">
            <InlineMath math={waitingFormula} />
          </div>
          <p className="metric-description">Time spent in ready queue</p>
        </div>

        <div className="metric">
          <h3>Avg. Response Time</h3>
          <div className="metric-value">
            {formatNumber(averageResponseTime)}
          </div>
          <div className="metric-formula">
            <InlineMath math={responseFormula} />
          </div>
          <p className="metric-description">Time to first CPU time</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 