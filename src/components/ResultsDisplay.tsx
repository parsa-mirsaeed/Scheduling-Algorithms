import React, { useEffect } from 'react';
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

  // Generate individual WT calculation strings
  const individualWtStrings = processes.map(p => {
    const tat = p.turnaroundTime ?? 0;
    const bt = p.burstTime;
    const wt = p.waitingTime ?? 0;
    // Ensure values are formatted correctly for LaTeX
    const tatStr = formatNumber(tat);
    const btStr = bt; // Burst time is usually an integer
    const wtStr = formatNumber(wt);
    return `WT_{P${p.id}} = TAT_{P${p.id}} - BT_{P${p.id}} = ${tatStr} - ${btStr} = ${wtStr}`;
  });

  // Generate expanded sum strings for explanation
  const turnaroundSumStr = processes.map(p => `TAT_{P${p.id}}`).join('+');
  // Use actual calculated WT values in the sum
  const waitingSumValuesStr = processes.map(p => formatNumber(p.waitingTime ?? 0)).join('+');
  const responseSumStr = processes.map(p => `RT_{P${p.id}}`).join('+');

  // LaTeX formula strings
  const turnaroundFormula = `\\text{Avg TAT} = \\frac{\\sum_{i=1}^{n} TAT_i}{n}`;
  const waitingFormula = `\\text{Avg WT} = \\frac{\\sum_{i=1}^{n} WT_i}{n}`;
  const responseFormula = `\\text{Avg RT} = \\frac{\\sum_{i=1}^{n} RT_i}{n}`;

  // Individual WT formula explanation
  const individualWtFormula = `WT_i = TAT_i - BT_i`;

  // LaTeX calculation strings with expanded sums
  const turnaroundCalculation = `\\frac{${turnaroundSumStr}}{${numProcesses}} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  // Updated waiting calculation to show individual values sum
  const waitingCalculation = `\\frac{${waitingSumValuesStr}}{${numProcesses}} = \\frac{${formatNumber(totalWaitingTime)}}{${numProcesses}}`;
  const responseCalculation = `\\frac{${responseSumStr}}{${numProcesses}} = \\frac{${formatNumber(totalResponseTime)}}{${numProcesses}}`;

  // Add debug logging to help find the parse error
  useEffect(() => {
    console.log('DEBUG LaTeX - Formula strings:');
    console.log('turnaroundFormula:', turnaroundFormula);
    console.log('turnaroundCalculation:', turnaroundCalculation);
    console.log('turnaroundSumStr:', turnaroundSumStr);
  }, [turnaroundFormula, turnaroundCalculation, turnaroundSumStr]);

  return (
    <div className="results-display">
      <div className="metrics-definitions">
        <p><strong>TAT:</strong> Turnaround Time (Completion Time - Arrival Time)</p>
        <p><strong>WT:</strong> Waiting Time (Turnaround Time - Burst Time)</p>
        <p><strong>RT:</strong> Response Time (Start Time - Arrival Time)</p>
        <p><strong>n:</strong> Number of processes</p>
      </div>
      <div className="metrics">
        {/* Average Turnaround Time */}
        <div className="metric">
          <h3>Average Turnaround Time (Avg TAT)</h3>
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
            Average time from process arrival to completion.
          </p>
        </div>

        {/* Average Waiting Time */}
        <div className="metric">
          <h3>Average Waiting Time (Avg WT)</h3>
          {/* Display individual WT calculations */}
          <div className="metric-step-by-step">
            <h4>Individual Waiting Time Calculations:</h4>
            <p>
              <InlineMath math={individualWtFormula} />
            </p>
            {individualWtStrings.map((calc, index) => (
              <p key={index}> {/* Use BlockMath for each calculation step */}
                <BlockMath math={calc} />
              </p>
            ))}
          </div>
          {/* Display Average WT formula */}
          <div className="metric-formula">
            <h4>Average Waiting Time Formula:</h4>
            <BlockMath math={waitingFormula} />
          </div>
          {/* Display Average WT calculation */}
          <div className="metric-calculation">
            <h4>Average Waiting Time Calculation:</h4>
            <InlineMath math={waitingCalculation} />
            <span>{` = ${formatNumber(averageWaitingTime)}`}</span>
          </div>
          <p className="metric-description">
            Average time a process spends waiting in the ready queue.
          </p>
        </div>

        {/* Average Response Time */}
        <div className="metric">
          <h3>Average Response Time (Avg RT)</h3>
          <div className="metric-formula">
            <BlockMath math={responseFormula} />
          </div>
          <div className="metric-calculation">
            <InlineMath math={responseCalculation} />
            <span>{` = ${formatNumber(averageResponseTime)}`}</span>
          </div>
          <p className="metric-description">
            Average time from process arrival until it first gets CPU time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 