import { useState } from "react";
import { deadlockPresets } from "../data/deadlockPresets";
import GanttChart from "./GanttChart";
import { bankersAlgorithm } from "../logic/deadlock";

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
      const { isSafe, safeSequence, steps } = bankersAlgorithm({
        max,
        allocation,
        available,
      });
      setResult({ isSafe, safeSequence, steps });
      setShowTimeline(isSafe && steps.length > 0);
      resetSteps();
      if (!isSafe) {
        const unfinished = max.map((_, idx) => idx).filter((p) => !safeSequence.includes(p));
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
        <button className="action-button" onClick={updateDimensions}>
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
        <button className="action-button run-button" onClick={analyze}>
          Analyze System
        </button>
        {result && (
          <button
            className="action-button step-button"
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

          {result.isSafe ? (
            <>
              <h3 className="success-text">System is in a SAFE state ✓</h3>
              <p>
                Safe sequence:{" "}
                {result.safeSequence.map((p) => `P${p}`).join(" ➜ ")}
              </p>
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
            </>
          ) : (
            <>
              <h3 className="error-text">Deadlock detected – system is UNSAFE ✗</h3>
              {unsafeReason && <p className="error-text">Reason: {unsafeReason}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
