import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const MetricsExplanation: React.FC = () => {
  return (
    <div className="metrics-explanation-section">
      <div className="metric-explanation">
        <h3>Completion Time (CT)</h3>
        <p>The exact time when a process finishes execution.</p>
        <p className="formula">
          <InlineMath math={`CT = \text{End time of last execution}`} />
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Turnaround Time (TAT)</h3>
        <p>Total time from arrival to completion.</p>
        <p className="formula">
          <InlineMath math={`TAT = CT - AT`} />
        </p>
        <p className="example">
          <em>Example:</em> If arrival=2, completion=10, then TAT=8
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Waiting Time (WT)</h3>
        <p>Time spent waiting in ready queue.</p>
        <p className="formula">
          <InlineMath math={`WT = TAT - BT`} />
        </p>
        <p className="example">
          <em>Example:</em> If TAT=8, burst=5, then WT=3
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Response Time (RT)</h3>
        <p>Time until first CPU execution.</p>
        <p className="formula">
          <InlineMath math={`RT = \text{First start time} - AT`} />
        </p>
        <p className="example">
          <em>Example:</em> If arrival=2, first run=4, then RT=2
        </p>
      </div>
    </div>
  );
};

export default MetricsExplanation;
