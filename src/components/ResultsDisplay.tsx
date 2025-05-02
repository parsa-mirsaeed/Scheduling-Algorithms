import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Process } from "../logic/scheduler";

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number; // Kept for potential future use or detailed view
  processes: Process[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  // averageResponseTime, // No longer displayed directly
  processes,
}) => {
  // Format number to 2 decimal places, or show integer if it's whole
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const numProcesses = processes.length > 0 ? processes.length : 1;

  // --- Waiting Time Calculations ---
  const totalWaitingTime = processes.reduce(
    (sum, p) => sum + (p.waitingTime ?? 0),
    0,
  );
  
  // Create detailed string showing the calculation for each process
  const waitingTimeCalculationsStr = processes
    .map((p) => `(${p.startTime ?? 0}-${p.arrivalTime})`)
    .join("+");
  
  // Keep the original values string for step 2
  const waitingTimeValuesStr = processes
    .map((p) => formatNumber(p.waitingTime))
    .join(" + ");
  
  const waitingFormula = `\\text{Avg WT} = \\frac{\\sum \\text{WT}}{\\text{n}}`;
  const waitingStep1 = `\\text{Avg WT} = \\frac{${waitingTimeCalculationsStr}}{${numProcesses}}`;
  const waitingStep2 = `\\text{Avg WT} = \\frac{${waitingTimeValuesStr}}{${numProcesses}}`;
  const waitingStep3 = `\\text{Avg WT} = \\frac{${formatNumber(totalWaitingTime)}}{${numProcesses}}`;
  const waitingResult = formatNumber(averageWaitingTime);

  // --- Turnaround Time Calculations ---
  const totalTurnaroundTime = processes.reduce(
    (sum, p) => sum + (p.turnaroundTime ?? 0),
    0,
  );
  
  // Create detailed string showing the calculation for each process
  const turnaroundTimeCalculationsStr = processes
    .map((p) => `(${p.completionTime ?? 0}-${p.arrivalTime})`)
    .join("+");
  
  // Keep the original values string for step 2
  const turnaroundTimeValuesStr = processes
    .map((p) => formatNumber(p.turnaroundTime))
    .join(" + ");
  
  const turnaroundFormula = `\\text{Avg TAT} = \\frac{\\sum \\text{TAT}}{\\text{n}}`;
  const turnaroundStep1 = `\\text{Avg TAT} = \\frac{${turnaroundTimeCalculationsStr}}{${numProcesses}}`;
  const turnaroundStep2 = `\\text{Avg TAT} = \\frac{${turnaroundTimeValuesStr}}{${numProcesses}}`;
  const turnaroundStep3 = `\\text{Avg TAT} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  const turnaroundResult = formatNumber(averageTurnaroundTime);

  // --- Average Burst Time ---
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const averageBurstTime = totalBurstTime / numProcesses;
  const avgBurstTimeResult = formatNumber(averageBurstTime);

  // --- Relationship Formula ---
  const relationshipFormula = `\\text{Avg TAT} = \\text{Avg WT} + \\text{Avg BT}`;
  const relationshipCheck = `${turnaroundResult} = ${waitingResult} + ${avgBurstTimeResult}`;

  return (
    <div className="results-display">
      <div className="metrics detailed-calculation">
        {/* Average Waiting Time Metric */}
        <div className="metric">
          <h3>میانگین زمان انتظار (Avg. WT)</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>Formula:</strong> <InlineMath math={waitingFormula} />
            </p>
            <p>
              <strong>Step 1:</strong> <InlineMath math={waitingStep1} />
            </p>
            <p>
              <strong>Step 2:</strong> <InlineMath math={waitingStep2} />
            </p>
            <p>
              <strong>Step 3:</strong> <InlineMath math={waitingStep3} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>Result:</strong> {waitingResult}
            </p>
          </div>
        </div>

        {/* Average Turnaround Time Metric */}
        <div className="metric">
          <h3>میانگین زمان پاسخ (Avg. TAT)</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>Formula:</strong> <InlineMath math={turnaroundFormula} />
            </p>
            <p>
              <strong>Step 1:</strong> <InlineMath math={turnaroundStep1} />
            </p>
            <p>
              <strong>Step 2:</strong> <InlineMath math={turnaroundStep2} />
            </p>
            <p>
              <strong>Step 3:</strong> <InlineMath math={turnaroundStep3} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>Result:</strong> {turnaroundResult}
            </p>
          </div>
        </div>

        {/* Average Burst Time & Relationship */}
        <div className="metric-summary">
          <p>
            <strong>میانگین زمان اجرا (Avg. Burst Time):</strong>{" "}
            {avgBurstTimeResult}
          </p>
          <div className="metric-relationship">
            <p>
              <strong>Check:</strong> <InlineMath math={relationshipFormula} />
            </p>
            <p>
              <InlineMath math={relationshipCheck} />
            </p>
            {Math.abs(
              averageTurnaroundTime - (averageWaitingTime + averageBurstTime),
            ) < 0.01 ? (
              <span className="check-ok">✓ Correct</span>
            ) : (
              <span className="check-error">✗ Discrepancy</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
