import React from 'react';
import { Process } from '../logic/scheduler';

interface ProcessListDisplayProps {
  processes: Process[];
}

const ProcessListDisplay: React.FC<ProcessListDisplayProps> = ({ processes }) => {
  if (processes.length === 0) {
    return <div className="no-processes">No processes added yet.</div>;
  }

  return (
    <div className="process-list">
      <table>
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.id}>
              <td>P{process.id}</td>
              <td>{process.arrivalTime}</td>
              <td>{process.burstTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessListDisplay; 