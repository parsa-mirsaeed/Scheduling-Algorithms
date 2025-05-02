import React, { useState } from "react";
import { Process, GanttItem } from "../logic/scheduler";

interface ExecutionHistoryProps {
  processes: Process[];
  ganttChart: GanttItem[];
  algorithm: "FIFO" | "SJF" | "SRT" | "RR";
  timeQuantum?: number;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  processes,
  ganttChart,
  algorithm,
  timeQuantum,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (processes.length === 0 || ganttChart.length === 0) {
    return <div className="no-data">No execution history available.</div>;
  }

  // Create a timeline of process executions
  const processTimeline = processes.map((process) => {
    // Get all gantt chart entries for this process
    const executions = ganttChart.filter(
      (item) => item.processId === process.id,
    );

    // Sort by start time
    executions.sort((a, b) => a.startTime - b.startTime);

    // Initial remaining time is the burst time
    let remainingAfterExecution = process.burstTime;

    // Calculate execution steps
    const executionSteps = executions.map((execution, index) => {
      const executionTime = execution.endTime - execution.startTime;
      const startingRemaining = remainingAfterExecution;
      remainingAfterExecution -= executionTime;

      return {
        stepNumber: index + 1,
        startTime: execution.startTime,
        endTime: execution.endTime,
        executionTime,
        remainingBefore: startingRemaining,
        remainingAfter: remainingAfterExecution,
      };
    });

    return {
      processId: process.id,
      burstTime: process.burstTime,
      executionSteps,
    };
  });

  return (
    <div className="execution-history">
      <div
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Execution History {isExpanded ? "▼" : "▶"}</h3>
        <p className="collapsible-description">
          See how each process was executed over time, including remaining time
          after each execution
          {algorithm === "RR" &&
            timeQuantum &&
            ` (Time Quantum: ${timeQuantum})`}
        </p>
      </div>

      {isExpanded && (
        <div className="execution-details">
          {processTimeline.map((process) => (
            <div key={process.processId} className="process-execution">
              <h4>
                Process P{process.processId} (Total Burst Time:{" "}
                {process.burstTime})
              </h4>

              {process.executionSteps.length > 0 ? (
                <table className="execution-table">
                  <thead>
                    <tr>
                      <th>Execution #</th>
                      <th>Time Interval</th>
                      <th>CPU Time</th>
                      <th>Remaining Before</th>
                      <th>Remaining After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.executionSteps.map((step) => (
                      <tr key={step.stepNumber}>
                        <td>{step.stepNumber}</td>
                        <td>
                          {step.startTime} → {step.endTime}
                        </td>
                        <td>{step.executionTime}</td>
                        <td>{step.remainingBefore}</td>
                        <td>
                          <span
                            className={
                              step.remainingAfter === 0 ? "completed" : ""
                            }
                          >
                            {step.remainingAfter}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-executions">
                  No executions recorded for this process.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionHistory;
