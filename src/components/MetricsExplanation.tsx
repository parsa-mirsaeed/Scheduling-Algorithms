import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MetricsExplanation: React.FC = () => {
  return (
    <div className="metrics-explanation-section card">
      <h2>How Metrics Are Calculated</h2>
      
      <div className="metric-explanation">
        <h3>Completion Time (CT)</h3>
        <p>
          This is the exact time when a process finishes its total execution.
          It's determined by the simulation based on the chosen scheduling algorithm 
          and the process's arrival and burst times.
          It's not calculated by a simple static formula beforehand, but rather observed from the simulation's timeline (like the end time of the process's last block in the Gantt chart).
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Turnaround Time (TAT)</h3>
        <p>
          The total time a process spends in the system, from arrival to completion.
        </p>
        <p><strong>Formula:</strong> <InlineMath math={`TAT = \text{Completion Time} - \text{Arrival Time}`} /></p>
        <p>
          <em>Example:</em> If a process arrives at time 2 and completes at time 10, its TAT is <InlineMath math={`10 - 2 = 8`} />.
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Waiting Time (WT)</h3>
        <p>
          The total time a process spends waiting in the ready queue, not running on the CPU.
        </p>
        <p><strong>Formula:</strong> <InlineMath math={`WT = \text{Turnaround Time} - \text{Burst Time}`} /></p>
        <p>
          <em>Example:</em> If a process has a TAT of 8 and a Burst Time (total CPU time needed) of 5, its WT is <InlineMath math={`8 - 5 = 3`} />.
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Response Time (RT)</h3>
        <p>
          The time from when a process arrives until it gets the CPU for the *first* time.
        </p>
        <p><strong>Formula:</strong> <InlineMath math={`RT = \text{First Execution Start Time} - \text{Arrival Time}`} /></p>
        <p>
          <em>Example:</em> If a process arrives at time 2 and first starts running on the CPU at time 4, its RT is <InlineMath math={`4 - 2 = 2`} />.
        </p>
      </div>
    </div>
  );
};

export default MetricsExplanation; 