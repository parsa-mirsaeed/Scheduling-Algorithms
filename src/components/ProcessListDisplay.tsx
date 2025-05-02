import React from "react";
import { Process } from "../logic/scheduler";

interface ProcessListDisplayProps {
  processes: Process[];
}

const ProcessListDisplay: React.FC<ProcessListDisplayProps> = ({
  processes,
}) => {
  if (processes.length === 0) {
    return <div className="no-processes">No processes added yet.</div>;
  }

  return (
    <div className="process-list">
      <table className="process-table">
        <thead>
          <tr>
            <th className="attribute-header">Attribute</th>
            {processes.map((process) => (
              <th key={process.id}>
                <span className="process-id">P{process.id}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="attribute-name">Burst Time</td>
            {processes.map((process) => (
              <td key={process.id}>{process.burstTime}</td>
            ))}
          </tr>
          <tr>
            <td className="attribute-name">Arrival Time</td>
            {processes.map((process) => (
              <td key={process.id}>{process.arrivalTime}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProcessListDisplay;
