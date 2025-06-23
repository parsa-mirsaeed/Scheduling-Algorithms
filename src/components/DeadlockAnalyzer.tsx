import { useState, useMemo } from "react";
import { deadlockPresets } from "../data/deadlockPresets";
import GanttChart from "./GanttChart";
import { bankersAlgorithm, ResourceEdge } from "../logic/deadlock";
import "./DeadlockAnalyzer.css";

/**
 * Props for the ResourceAllocationGraphSVG component.
 */
interface ResourceAllocationGraphSVGProps {
  edges: ResourceEdge[];
  nProcesses: number;
  nResources: number;
  hasCycle: boolean;
  cycle: number[];
}

/**
 * Component for visualizing a resource allocation graph as an SVG.
 * Follows IEEE 1016-2009 standard for Software Design Descriptions.
 */
function ResourceAllocationGraphSVG({ 
  edges, 
  nProcesses, 
  nResources, 
  hasCycle, 
  cycle 
}: ResourceAllocationGraphSVGProps) {
  
  // Calculate node positions in a circular layout
  const nodePositions = useMemo(() => {
    const positions: Array<{x: number, y: number}> = [];
    const radius = 150;
    const centerX = 200;
    const centerY = 200;
    
    // Position processes on the left half of the circle
    for (let i = 0; i < nProcesses; i++) {
      const angle = Math.PI * (0.25 + 1.5 * (i / Math.max(nProcesses, 2)));
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    // Position resources on the right half of the circle
    for (let i = 0; i < nResources; i++) {
      const angle = Math.PI * (0.25 + 1.5 * (i / Math.max(nResources, 2)) + 1);
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    return positions;
  }, [nProcesses, nResources]);
  
  // Check if an edge is part of the cycle
  const isInCycle = (from: number, to: number) => {
    if (!hasCycle || cycle.length < 2) return false;
    
    for (let i = 0; i < cycle.length - 1; i++) {
      if (cycle[i] === from && cycle[i + 1] === to) {
        return true;
      }
    }
    
    // Check circular connection (last to first)
    if (cycle[cycle.length - 1] === from && cycle[0] === to) {
      return true;
    }
    
    return false;
  };
  
  return (
    <g>
      {/* Draw edges first so they appear behind nodes */}
      {edges.map((edge, index) => {
        const fromPos = nodePositions[edge.from];
        const toPos = nodePositions[edge.to];
        const inCycle = isInCycle(edge.from, edge.to);
        
        // Calculate control point for curved edge
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const normal = { x: -dy, y: dx };
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        const normalized = { 
          x: normal.x / len * 20, 
          y: normal.y / len * 20 
        };
        
        // Different offsets for request vs allocation edges
        const offset = edge.isProcessToResource ? normalized : { x: -normalized.x, y: -normalized.y };
        const ctrlX = midX + offset.x;
        const ctrlY = midY + offset.y;
        
        const pathClass = inCycle 
          ? "cycle-edge" 
          : edge.isProcessToResource ? "request-edge" : "allocation-edge";
        
        const markerEnd = `url(#${pathClass}-arrow)`;
        
        return (
          <path
            key={`edge-${index}`}
            d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
            fill="none"
            className={pathClass}
            markerEnd={markerEnd}
          />
        );
      })}
      
      {/* Define arrow markers for the edges */}
      <defs>
        <marker 
          id="allocation-edge-arrow" 
          viewBox="0 0 10 10" 
          refX="9" 
          refY="5"
          markerWidth="6" 
          markerHeight="6" 
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" className="allocation-arrow" />
        </marker>
        <marker 
          id="request-edge-arrow" 
          viewBox="0 0 10 10" 
          refX="9" 
          refY="5"
          markerWidth="6" 
          markerHeight="6" 
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" className="request-arrow" />
        </marker>
        <marker 
          id="cycle-edge-arrow" 
          viewBox="0 0 10 10" 
          refX="9" 
          refY="5"
          markerWidth="6" 
          markerHeight="6" 
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" className="cycle-arrow" />
        </marker>
      </defs>
      
      {/* Draw process nodes */}
      {Array.from({ length: nProcesses }).map((_, i) => {
        const pos = nodePositions[i];
        const inCycle = cycle.includes(i);
        return (
          <g key={`process-${i}`} className={inCycle ? "node-in-cycle" : ""}>
            <circle 
              cx={pos.x} 
              cy={pos.y} 
              r={20} 
              className={`process-node ${inCycle ? 'cycle-node' : ''}`} 
            />
            <text 
              x={pos.x} 
              y={pos.y} 
              textAnchor="middle" 
              dominantBaseline="central"
              className="node-label">
              P{i}
            </text>
          </g>
        );
      })}
      
      {/* Draw resource nodes */}
      {Array.from({ length: nResources }).map((_, i) => {
        const pos = nodePositions[nProcesses + i];
        const inCycle = cycle.includes(nProcesses + i);
        return (
          <g key={`resource-${i}`} className={inCycle ? "node-in-cycle" : ""}>
            <rect 
              x={pos.x - 15} 
              y={pos.y - 15} 
              width={30} 
              height={30} 
              className={`resource-node ${inCycle ? 'cycle-node' : ''}`} 
            />
            <text 
              x={pos.x} 
              y={pos.y} 
              textAnchor="middle" 
              dominantBaseline="central"
              className="node-label">
              R{i}
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface MatrixInputProps {
  label: string;
  matrix: number[][];
  onChange: (row: number, col: number, value: number) => void;
  errorCells?: Set<string>;
}

function MatrixInput({ label, matrix, onChange, errorCells }: MatrixInputProps) {
  return (
    <div className="matrix-input">
      <h3>{label}</h3>
      <table className="matrix-table">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((val, j) => (
                <td key={j}>
                  <input
                    type="number"
                    className={errorCells && errorCells.has(`${i}-${j}`) ? "error-cell" : ""}
                    min={0}
                    value={val}
                    onChange={(e) => onChange(i, j, Number(e.target.value))}
                  />
                  
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface VectorInputProps {
  label: string;
  vector: number[];
  onChange: (index: number, value: number) => void;
}

function VectorInput({ label, vector, onChange }: VectorInputProps) {
  return (
    <div className="vector-input">
      <h3>{label}</h3>
      <table className="matrix-table">
        <tbody>
          <tr>
            {vector.map((val, i) => (
              <td key={i}>
                <input
                  type="number"
                  
                  min={0}
                  value={val}
                  onChange={(e) => onChange(i, Number(e.target.value))}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function DeadlockAnalyzer() {
  const [numProcesses, setNumProcesses] = useState(4);
  const [numResources, setNumResources] = useState(4);

  // Initialise matrices with zeros
  const createMatrix = (rows: number, cols: number) =>
    Array.from({ length: rows }, () => Array(cols).fill(0));

  const [max, setMax] = useState<number[][]>(() =>
    createMatrix(numProcesses, numResources),
  );
  const [allocation, setAllocation] = useState<number[][]>(() =>
    createMatrix(numProcesses, numResources),
  );
  const [available, setAvailable] = useState<number[]>(
    Array(numResources).fill(0),
  );

  const [result, setResult] = useState<
    | {
        isSafe: boolean;
        safeSequence: number[];
        steps: import("../logic/deadlock").BankersStep[];
        resourceConditionSatisfied?: boolean;
        coffmanConditions?: import("../logic/deadlock").CoffmanConditionsResult;
        resourceGraph?: import("../logic/deadlock").ResourceGraphResult;
      }
    | undefined
  >();

  // Error handling state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [unsafeReason, setUnsafeReason] = useState<string | null>(null);
  // Step-through state
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const resetSteps = () => setStepIndex(-1);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleMatrixChange = (
    setter: React.Dispatch<React.SetStateAction<number[][]>>,
    row: number,
    col: number,
    value: number,
  ) => {
    setter((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col] = value;
      return copy;
    });
  };

  const handleVectorChange = (
    index: number,
    value: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>,
  ) => {
    setter((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const rebuildMatrices = (p: number, r: number) => {
    setMax(createMatrix(p, r));
    setAllocation(createMatrix(p, r));
    setAvailable(Array(r).fill(0));
  };

  const updateDimensions = () => {
    rebuildMatrices(numProcesses, numResources);
    setResult(undefined);
  };

  const validateInput = () => {
    const offending = new Set<string>();
    for (let i = 0; i < numProcesses; i++) {
      for (let j = 0; j < numResources; j++) {
        if (allocation[i][j] > max[i][j]) {
          offending.add(`${i}-${j}`);
        }
      }
    }
    return offending;
  };

  const analyze = () => {
    // Reset previous errors
    setErrorMessage(null);
    const offending = validateInput();
    if (offending.size > 0) {
      setErrorCells(offending);
      setErrorMessage(
        "Allocation must not exceed Maximum Demand. Fix highlighted cells."
      );
      return;
    }
    setErrorCells(new Set());

    try {
      // Get all properties from the enhanced bankersAlgorithm
      const result = bankersAlgorithm({
        max,
        allocation,
        available,
      });
      
      // Store the full result including visualization data
      setResult(result);
      console.log("Analysis result:", result); // Debug log
      setShowTimeline(result.isSafe && result.steps.length > 0);
      resetSteps();
      if (!result.isSafe) {
        const unfinished = max.map((_, idx) => idx).filter((p) => !result.safeSequence.includes(p));
        setUnsafeReason(
          `No safe sequence exists because processes ${unfinished
            .map((p) => `P${p}`)
            .join(", ")} cannot obtain their remaining need with current Available.`,
        );
      } else {
        setUnsafeReason(null);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
      
    }
  };

  return (
    <div className="deadlock-analyzer">
      <header>
        <h2>Banker&apos;s Algorithm – Deadlock Safety Check</h2>
      </header>

      <div className="dimension-controls">
        <label>
          Processes:
          <input
            type="number"
            min={1}
            value={numProcesses}
            onChange={(e) => setNumProcesses(Number(e.target.value))}
          />
        </label>
        <label>
          Resources:
          <input
            type="number"
            min={1}
            value={numResources}
            onChange={(e) => setNumResources(Number(e.target.value))}
          />
        </label>
        <button className="btn btn-ghost" onClick={updateDimensions}>
          Apply Dimensions
        </button>
      </div>

      {/* Preset Loader */}
      <div className="preset-loader">
        <label>
          Load Example:
          <select
            onChange={(e) => {
              const preset = deadlockPresets.find(
                (p) => p.name === e.target.value,
              );
              if (!preset) return;
              setNumProcesses(preset.max.length);
              setNumResources(preset.max[0].length);
              setMax(preset.max.map((row) => [...row]));
              setAllocation(preset.allocation.map((row) => [...row]));
              setAvailable([...preset.available]);
              setResult(undefined);
              setErrorMessage(null);
              setErrorCells(new Set());
            }}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select --
            </option>
            {deadlockPresets.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MatrixInput
        label="Maximum Demand (Claim) Matrix"
        matrix={max}
        onChange={(i, j, v) => handleMatrixChange(setMax, i, j, v)}
        errorCells={errorCells}
      />
      <MatrixInput
        label="Current Allocation Matrix"
        matrix={allocation}
        onChange={(i, j, v) => handleMatrixChange(setAllocation, i, j, v)}
        errorCells={errorCells}
      />
      <VectorInput
        label="Available Resources Vector"
        vector={available}
        onChange={(i, v) => handleVectorChange(i, v, setAvailable)}
      />

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={analyze}>
          Analyze System
        </button>
        {result && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (stepIndex + 1 < result.steps.length) {
                setStepIndex(stepIndex + 1);
              }
            }}
          >
            {stepIndex === -1
              ? "Start Step-Through"
              : stepIndex + 1 < (result?.steps.length ?? 0)
              ? "Next Step"
              : "Completed"}
          </button>
        )}
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {/* glossary */}
      <details className="glossary-panel">
        <summary>Key Terms</summary>
        <ul>
          <li><strong>Max (Claim)</strong>: Upper limit of each resource a process may need.</li>
          <li><strong>Allocation</strong>: Units currently allocated to each process.</li>
          <li><strong>Need</strong>: Max − Allocation (remaining requirement).</li>
          <li><strong>Available</strong>: Free units of each resource.</li>
          <li><strong>Work</strong>: Tracker vector used by the algorithm.</li>
          <li><strong>Safe Sequence</strong>: Order of processes that allows all to finish without deadlock.</li>
        </ul>
      </details>

      {result && (
        <div className="analysis-result">
          {showTimeline && result && result.steps.length > 0 && (
            <div className="dashboard-card full-width">
              <h3>Timeline Visualization</h3>
              <GanttChart
                data={result.steps.map((s, idx) => ({
                  processId: s.process,
                  startTime: idx,
                  endTime: idx + 1,
                }))}
              />
            </div>
          )}
          <div className="results">
            <h3>Banker's Algorithm Result</h3>
            <p className={result.isSafe ? "safe-state" : "unsafe-state"}>
              <strong>System State: </strong> 
              {result.isSafe ? "Safe" : "Unsafe"}
              {result.isSafe && result.coffmanConditions?.deadlockPossible && 
               " (Deadlock possible but avoidable with proper scheduling)"}
            </p>
            <p className="info-text">
              <strong>Note:</strong> A system can be in a safe state (have a valid execution sequence) 
              even when deadlock conditions are present. This means deadlock can be avoided with proper scheduling.
            </p>
            {result.isSafe && (
              <div className="safe-sequence">
                <p>
                  <strong>Safe Sequence: </strong>
                  {result.safeSequence.map((p) => `P${p}`).join(" → ")}
                </p>
              </div>
            )}

            {!result.isSafe && unsafeReason && (
              <div className="unsafe-reason">
                <p>
                  <strong>Reason: </strong>
                  {unsafeReason}
                </p>
              </div>
            )}
            
            {/* Resource Condition Check */}
            {result.resourceConditionSatisfied !== undefined && (
              <div className={`resource-condition ${result.resourceConditionSatisfied ? 'satisfied' : 'unsatisfied'}`}>
                <h3>Resource Condition Check</h3>
                <p>
                  <strong>Formula: </strong>
                  sum(Request<sub>i</sub>) &lt; m + n
                </p>
                <p>
                  <strong>Status: </strong>
                  {result.resourceConditionSatisfied 
                    ? "✅ Satisfied - Deadlock avoidance possible" 
                    : "❌ Not satisfied - System at risk of deadlock"}
                </p>
                <p>
                  <strong>Explanation: </strong>
                  {result.resourceConditionSatisfied
                    ? `The total of all process requests is less than the sum of processes (${max.length}) and resources (${max[0].length}).`
                    : `The total of all process requests exceeds the sum of processes (${max.length}) and resources (${max[0].length}), increasing deadlock risk.`}
                </p>
              </div>
            )}
            
            {/* Coffman Conditions Checklist */}
            {result.coffmanConditions && (
              <div className="coffman-conditions">
                <h3>Deadlock Possibility Check (Coffman Conditions)</h3>
                <p className="info-text">
                  All four conditions must be present for deadlock to be <em>possible</em>. 
                  With multiple instances per resource, these conditions indicate <em>possibility</em> of deadlock, not certainty.
                  Banker's Algorithm can still find a safe execution sequence even when all conditions are present.
                </p>
                <table className="conditions-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1. Mutual Exclusion</td>
                      <td className={result.coffmanConditions.mutualExclusion ? "condition-present" : "condition-absent"}>
                        {result.coffmanConditions.mutualExclusion ? "✅ Present" : "❌ Absent"}
                      </td>
                      <td>
                        {result.coffmanConditions.mutualExclusion
                          ? "Resources are being used exclusively by processes."
                          : "No resources are currently allocated exclusively."}
                      </td>
                    </tr>
                    <tr>
                      <td>2. Hold and Wait</td>
                      <td className={result.coffmanConditions.holdAndWait ? "condition-present" : "condition-absent"}>
                        {result.coffmanConditions.holdAndWait ? "✅ Present" : "❌ Absent"}
                      </td>
                      <td>
                        {result.coffmanConditions.holdAndWait
                          ? "Some processes hold resources while waiting for others."
                          : "No processes are holding resources while waiting for others."}
                      </td>
                    </tr>
                    <tr>
                      <td>3. No Preemption</td>
                      <td className={result.coffmanConditions.noPreemption ? "condition-present" : "condition-absent"}>
                        {result.coffmanConditions.noPreemption ? "✅ Present" : "❌ Absent"}
                      </td>
                      <td>
                        {"Resources cannot be forcibly taken from processes (always true in this model)."}
                      </td>
                    </tr>
                    <tr>
                      <td>4. Circular Wait</td>
                      <td className={result.coffmanConditions.circularWait ? "condition-present" : "condition-absent"}>
                        {result.coffmanConditions.circularWait ? "✅ Present" : "❌ Absent"}
                      </td>
                      <td>
                        {result.coffmanConditions.circularWait
                          ? "A circular chain of processes exists, each waiting for resources held by the next."
                          : "No circular waiting chains detected in the resource allocation graph."}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className={result.coffmanConditions.deadlockPossible ? "deadlock-possible" : "deadlock-impossible"}>
                        <strong>Conclusion: </strong>
                        {result.coffmanConditions.deadlockPossible
                          ? `All conditions for deadlock are present. Deadlock is ${result.isSafe ? "possible but avoidable with proper scheduling" : "unavoidable (no safe sequence exists)"}.${ result.isSafe ? " See Banker's safe sequence below." : "" }`
                          : "Not all conditions for deadlock are present. Deadlock cannot occur."}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {/* Resource Allocation Graph Visualization */}
            {result.resourceGraph && (
              <div className="resource-graph">
                <h3>Resource Allocation Graph</h3>
                <div className="graph-visualization">
                  <svg width="100%" height="400" className="resource-graph-svg">
                    {/* Render the graph visualization */}
                    <ResourceAllocationGraphSVG 
                      edges={result.resourceGraph.edges} 
                      nProcesses={max.length} 
                      nResources={max[0].length}
                      hasCycle={result.resourceGraph.hasCycle}
                      cycle={result.resourceGraph.cycle || []}
                    />
                  </svg>
                </div>
                <div className="graph-legend">
                  <div className="legend-item">
                    <span className="process-node">●</span> Process
                  </div>
                  <div className="legend-item">
                    <span className="resource-node">■</span> Resource
                  </div>
                  <div className="legend-item">
                    <span className="allocation-edge">→</span> Allocation (Resource → Process)
                  </div>
                  <div className="legend-item">
                    <span className="request-edge">→</span> Request (Process → Resource)
                  </div>
                  {result.resourceGraph.hasCycle && (
                    <div className="legend-item">
                      <span className="cycle-edge">→</span> Cycle (Potential Deadlock)
                    </div>
                  )}
                </div>
                <p className="info-text">
                  With multiple instances of each resource type, cycles in the graph indicate a <em>potential</em> for deadlock, 
                  not a guarantee. Banker's Algorithm determines if a safe execution sequence exists despite the presence of cycles.
                </p>
                <p className="graph-summary">
                  <strong>Graph Analysis: </strong>
                  {result.resourceGraph.hasCycle 
                    ? `Cycle detected involving ${(result.resourceGraph.cycle || []).length} nodes. ${result.isSafe ? "Potential for deadlock exists, but can be avoided with proper process scheduling." : "Deadlock is unavoidable - no safe sequence exists."}` 
                    : "No cycles detected in the resource allocation graph. Deadlock cannot occur based on circular wait condition."}
                </p>
              </div>
            )}
            
            <div className="step-details">
              {result.isSafe ? (
              <>
                <h3 className="success-text">System is in a SAFE state ✓</h3>
                <p>
                  Safe sequence:{" "}
                  {result.safeSequence.map((p) => `P${p}`).join(" ➜ ")}
                </p>
              </>
              ) : (
              <>
                <h3 className="error-text">Deadlock detected – system is UNSAFE ✗</h3>
                {unsafeReason && <p className="error-text">Reason: {unsafeReason}</p>}
              </>
              )}
            </div>
          
            {/* Step-by-step banker's execution details */}
            {result.steps.length > 0 && (
                <div className="table-container" style={{ overflowX: "auto" }}>
                  <table className="execution-table">
                    <thead>
                      <tr>
                        <th>Step #</th>
                        <th>Process (P)</th>
                        <th>Need Vector</th>
                        <th>Work Before</th>
                        <th>Allocation</th>
                        <th>Work After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.steps
                        .slice(0, stepIndex === -1 ? result.steps.length : stepIndex + 1)
                        .map((s, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>P{s.process}</td>
                          <td>{`[${s.need.join(", ")}]`}</td>
                          <td>{`[${s.workBefore.join(", ")}]`}</td>
                          <td>{`[${s.allocation.join(", ")}]`}</td>
                          <td>{`[${s.workAfter.join(", ")}]`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
