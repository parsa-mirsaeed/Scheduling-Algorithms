import React, { useState } from "react";
import { Process } from "../logic/scheduler";

interface DetailedProcessInfoProps {
  processes: Process[];
}

const DetailedProcessInfo: React.FC<DetailedProcessInfoProps> = ({
  processes,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (processes.length === 0) {
    return <div className="no-processes">No processes data available.</div>;
  }

  // Helper function to format a number to 2 decimal places if needed
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  return (
    <div className="detailed-process-info">
      <div
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Detailed Process Metrics {isExpanded ? "▼" : "▶"}</h3>
        <p className="collapsible-description">
          View detailed metrics for each process including turnaround time,
          waiting time, and response time
        </p>
      </div>

      {isExpanded && (
        <>
          <table className="detailed-table">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Completion Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
                <th>Response Time</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id}>
                  <td>
                    <span className="process-id">P{process.id}</span>
                  </td>
                  <td>{process.arrivalTime}</td>
                  <td>{process.burstTime}</td>
                  <td>{formatNumber(process.completionTime)}</td>
                  <td>{formatNumber(process.turnaroundTime)}</td>
                  <td>{formatNumber(process.waitingTime)}</td>
                  <td>{formatNumber(process.responseTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="metrics-explanation">
            <div className="metric-explanation">
              <h4>Turnaround Time</h4>
              <p>Completion Time − Arrival Time</p>
            </div>
            <div className="metric-explanation">
              <h4>Waiting Time</h4>
              <p>Turnaround Time − Burst Time</p>
            </div>
            <div className="metric-explanation">
              <h4>Response Time</h4>
              <p>First CPU Time − Arrival Time</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetailedProcessInfo;
