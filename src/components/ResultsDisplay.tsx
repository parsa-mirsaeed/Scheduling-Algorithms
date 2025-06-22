import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Process } from "../logic/scheduler";

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number;
  processes: Process[];
  algorithmType: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  // averageResponseTime, // Not displayed directly
  cpuUtilization,
  processes,
  algorithmType,
}) => {
  // Format number to 2 decimal places, or show integer if it's whole
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  // Check if the algorithm is preemptive
  const isPreemptive = algorithmType === "RR" || algorithmType === "SRT";

  const numProcesses = processes.length > 0 ? processes.length : 1;

  // --- Waiting Time Calculations ---
  const totalWaitingTime = processes.reduce(
    (sum, p) => sum + (p.waitingTime ?? 0),
    0,
  );

  // Create detailed string showing the calculation for each process
  const waitingTimeTerms = processes.map((p) => {
    const term = isPreemptive
      ? `((${p.completionTime ?? 0}-${p.arrivalTime})-${p.burstTime})`
      : `(${p.startTime ?? 0}-${p.arrivalTime})`;
    return { id: `P${p.id}`, term, value: p.waitingTime ?? 0 };
  });

  const waitingFormula = isPreemptive
    ? `\\text{Avg WT} = \\frac{\\sum (\\text{TAT} - \\text{BT})}{\\text{n}}`
    : `\\text{Avg WT} = \\frac{\\sum (\\text{Start Time} - \\text{AT})}{\\text{n}}`;

  const waitingStep3 = `\\text{Avg WT} = \\frac{${formatNumber(totalWaitingTime)}}{${numProcesses}}`;
  const waitingResult = formatNumber(averageWaitingTime);

  // --- Turnaround Time Calculations ---
  const totalTurnaroundTime = processes.reduce(
    (sum, p) => sum + (p.turnaroundTime ?? 0),
    0,
  );

  // Create detailed string showing the calculation for each process with process IDs
  const tatTerms = processes.map((p) => {
    const term = `(${p.completionTime ?? 0}-${p.arrivalTime})`;
    return { id: `P${p.id}`, term, value: p.turnaroundTime ?? 0 };
  });

  const turnaroundFormula = `\\text{Avg TAT} = \\frac{\\sum (\\text{CT} - \\text{AT})}{\\text{n}}`;
  const turnaroundStep3 = `\\text{Avg TAT} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  const turnaroundResult = formatNumber(averageTurnaroundTime);

  // --- CPU Utilization Calculations ---
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const lastCompletionTime = Math.max(
    ...processes.map((p) => p.completionTime || 0),
  );

  const cpuUtilizationFormula = `\\text{CPU Utilization} = \\frac{\\sum \\text{BT}}{\\text{Total Time}} \\times 100`;
  const cpuUtilizationStep = `\\text{CPU Utilization} = \\frac{${formatNumber(totalBurstTime)}}{${formatNumber(lastCompletionTime)}} \\times 100`;
  const cpuUtilizationResult = formatNumber(cpuUtilization);

  // --- Average Burst Time ---
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
            <div className="formula-breakdown">
              <strong>Step 1:</strong>
              <div className="formula-terms">
                {waitingTimeTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <InlineMath math={item.term} />
                  </div>
                ))}
              </div>
            </div>
            <div className="formula-breakdown">
              <strong>Step 2:</strong>
              <div className="formula-terms">
                {waitingTimeTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <span>{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="formula-breakdown">
              <strong>Step 1:</strong>
              <div className="formula-terms">
                {tatTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <InlineMath math={item.term} />
                  </div>
                ))}
              </div>
            </div>
            <div className="formula-breakdown">
              <strong>Step 2:</strong>
              <div className="formula-terms">
                {tatTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <span>{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
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

        {/* CPU Utilization Metric */}
        <div className="metric">
          <h3>بهره وری CPU (CPU Utilization)</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>Formula:</strong>{" "}
              <InlineMath math={cpuUtilizationFormula} />
            </p>
            <p>
              <strong>Calculation:</strong>{" "}
              <InlineMath math={cpuUtilizationStep} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>Result:</strong> {cpuUtilizationResult}%
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
