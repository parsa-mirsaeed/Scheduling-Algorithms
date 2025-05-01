import React from 'react';
import { InlineMath, BlockMath } from 'react-katex'; // Use react-katex
import 'katex/dist/katex.min.css'; // Keep KaTeX CSS
import { Process } from '../logic/scheduler'; // Import Process type

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  processes: Process[]; // Add processes prop
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  averageResponseTime,
  processes // Destructure processes
}) => {
  // Format number to 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };

  // Calculate total metrics for formula display
  const totalTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime ?? 0), 0);
  const totalWaitingTime = processes.reduce((sum, p) => sum + (p.waitingTime ?? 0), 0);
  const totalResponseTime = processes.reduce((sum, p) => sum + (p.responseTime ?? 0), 0);
  const numProcesses = processes.length > 0 ? processes.length : 1; // Avoid division by zero

  // LaTeX formula strings (without $ delimiters for react-katex)
  const turnaroundFormula = `\\frac{1}{n} \\sum_{i=1}^{n} TAT_i`;
  const waitingFormula = `\\frac{1}{n} \\sum_{i=1}^{n} WT_i`;
  const responseFormula = `\\frac{1}{n} \\sum_{i=1}^{n} RT_i`;

  const turnaroundCalculation = `\\frac{\\sum TAT_i}{n} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  const waitingCalculation = `\\frac{\\sum WT_i}{n} = \\frac{${formatNumber(totalWaitingTime)}}{${numProcesses}}`;
  const responseCalculation = `\\frac{\\sum RT_i}{n} = \\frac{${formatNumber(totalResponseTime)}}{${numProcesses}}`;

  return (
    <div className="results-display">
      <div className="metrics">
        {/* Average Turnaround Time */}
        <div className="metric">
          <h3>Average Turnaround Time</h3>
          <div className="metric-formula">
            {/* Use BlockMath for display formulas */}
            <BlockMath math={turnaroundFormula} />
          </div>
          <div className="metric-calculation">
            {/* Use InlineMath for inline parts */}
            <InlineMath math={turnaroundCalculation} />
            <span>{` = ${formatNumber(averageTurnaroundTime)}`}</span>
          </div>
          <p className="metric-description">
            Time from process arrival to completion
          </p>
        </div>

        {/* Average Waiting Time */}
        <div className="metric">
          <h3>Average Waiting Time</h3>
          <div className="metric-formula">
            <BlockMath math={waitingFormula} />
          </div>
          <div className="metric-calculation">
            <InlineMath math={waitingCalculation} />
            <span>{` = ${formatNumber(averageWaitingTime)}`}</span>
          </div>
          <p className="metric-description">
            Time spent waiting in the ready queue
          </p>
        </div>

        {/* Average Response Time */}
        <div className="metric">
          <h3>Average Response Time</h3>
          <div className="metric-formula">
            <BlockMath math={responseFormula} />
          </div>
          <div className="metric-calculation">
            <InlineMath math={responseCalculation} />
            <span>{` = ${formatNumber(averageResponseTime)}`}</span>
          </div>
          <p className="metric-description">
            Time from arrival until first execution
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 