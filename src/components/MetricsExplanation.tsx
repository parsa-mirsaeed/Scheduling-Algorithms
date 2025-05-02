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
          <InlineMath math={"CT = \\text{End time of last execution}"} />
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Turnaround Time (TAT)</h3>
        <p>Total time from arrival to completion.</p>
        <p className="formula">
          <InlineMath math={"TAT = CT - AT"} />
        </p>
        <p className="example">
          <em>Example:</em> If arrival=2, completion=10, then TAT=8
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Waiting Time (WT)</h3>
        <p>Time spent waiting in ready queue before first execution.</p>
        <p className="formula">
          <InlineMath math={"WT = \\text{Start Time} - AT"} />
        </p>
        <p className="example">
          <em>Example:</em> If arrival=2, start=5, then WT=3
        </p>
        <p className="alternative-formula">
          <em>Alternative definition:</em> <InlineMath math={"WT = TAT - BT"} />
          <br/>
          <small>(Standard in preemptive algorithms to account for all waiting periods)</small>
        </p>
      </div>

      <div className="metric-explanation">
        <h3>Response Time (RT)</h3>
        <p>Time until first CPU execution.</p>
        <p className="formula">
          <InlineMath math={"RT = \\text{First start time} - AT"} />
        </p>
        <p className="example">
          <em>Example:</em> If arrival=2, first run=4, then RT=2
        </p>
      </div>

      <div className="metric-explanation">
        <h3>CPU Utilization</h3>
        <p>Percentage of time the CPU spends doing useful work vs. idle or context switching.</p>
        <p className="formula">
          <InlineMath math={"\\text{CPU Utilization} = \\frac{\\sum \\text{BT}}{\\text{Total Time}} \\times 100"} />
        </p>
        <p className="explanation">
          Sum BT = Total time the CPU spent executing all processes<br/>
          Total Time = Time at which the last process completed
        </p>
        <p className="example">
          <em>Example:</em> If total burst time=22, last completion time=30, then CPU Utilization=73.33%
        </p>
        <p className="note">
          <small>Note: Context switch time reduces CPU utilization by increasing the total time without adding to useful work.</small>
        </p>
      </div>
    </div>
  );
};

export default MetricsExplanation;
