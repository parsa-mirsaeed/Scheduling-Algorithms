import { useState } from "react";
import "./App.css";
import ProcessInput from "./components/ProcessInput";
import ProcessListDisplay from "./components/ProcessListDisplay";
import Controls from "./components/Controls";
import GanttChart from "./components/GanttChart";
import ResultsDisplay from "./components/ResultsDisplay";
import DetailedProcessInfo from "./components/DetailedProcessInfo";
import ExecutionHistory from "./components/ExecutionHistory";
import MetricsExplanation from "./components/MetricsExplanation";
import PresetSelector from "./components/PresetSelector";
import {
  Process,
  SimulationResult,
  fifoScheduling,
  sjfScheduling,
  srtScheduling,
  rrScheduling,
} from "./logic/scheduler";

type Algorithm = "FIFO" | "SJF" | "SRT" | "RR";

function App() {
  // State for processes
  const [processes, setProcesses] = useState<Process[]>([]);

  // State for selected algorithm
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("FIFO");

  // State for time quantum (for Round Robin)
  const [timeQuantum, setTimeQuantum] = useState<number>(1);

  // State for context switch time (for Round Robin, optional)
  const [contextSwitchTime, setContextSwitchTime] = useState<number>(0);

  // State for simulation results
  const [simulationResults, setSimulationResults] =
    useState<SimulationResult | null>(null);

  // State for simulation status
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");

  // State for expanded sections (no longer needed for metrics)
  const [expandedSections, setExpandedSections] = useState({
    detailedMetrics: false,
    executionHistory: false,
  });

  // State for Metrics Modal
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  // Toggle expanded sections (excluding metrics)
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Function to add a process to the list
  const addProcess = (process: Process) => {
    setProcesses([...processes, { ...process, id: processes.length + 1 }]);
  };

  // Function to start simulation
  const startSimulation = () => {
    if (processes.length === 0) return;

    setStatus("running");

    let result: SimulationResult;

    // Call the appropriate scheduling algorithm based on selectedAlgorithm
    switch (selectedAlgorithm) {
      case "FIFO":
        result = fifoScheduling([...processes]); // Create a copy to avoid mutating original state
        break;
      case "SJF":
        result = sjfScheduling([...processes]);
        break;
      case "SRT":
        result = srtScheduling([...processes]);
        break;
      case "RR":
        result = rrScheduling([...processes], timeQuantum, contextSwitchTime);
        break;
      default:
        result = fifoScheduling([...processes]);
    }

    setSimulationResults(result);
    setStatus("finished");
  };

  // Function to reset simulation
  const resetSimulation = () => {
    setStatus("idle");
    setSimulationResults(null);
  };

  return (
    <div className="app-container dashboard-layout">
      <header className="app-header compact">
        <h1>CPU Scheduling Algorithm Visualizer</h1>
        <p className="app-subtitle">
          Visualize and compare CPU scheduling algorithms with interactive
          simulations
        </p>
      </header>

      <div className="dashboard-grid">
        {/* Input Column */}
        <div className="dashboard-column input-column">
          <div className="dashboard-card">
            <h2>Load Preset Data</h2>
            <PresetSelector
              setProcesses={setProcesses}
              resetSimulation={resetSimulation}
            />
          </div>

          <div className="dashboard-card">
            <h2>Add Processes</h2>
            <ProcessInput addProcess={addProcess} />
          </div>

          <div className="dashboard-card">
            <h2>Configure Simulation</h2>
            <Controls
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              timeQuantum={timeQuantum}
              setTimeQuantum={setTimeQuantum}
              contextSwitchTime={contextSwitchTime}
              setContextSwitchTime={setContextSwitchTime}
              startSimulation={startSimulation}
              resetSimulation={resetSimulation}
            />
          </div>

          {processes.length > 0 && (
            <div className="dashboard-card">
              <h2>Process List</h2>
              <ProcessListDisplay 
                processes={processes} 
                onProcessesUpdate={setProcesses}
              />

              <div className="action-buttons">
                <button
                  className="action-button run-button"
                  onClick={startSimulation}
                  disabled={processes.length === 0}
                >
                  Run Simulation
                </button>
                <button
                  className="action-button reset-button"
                  onClick={() => setProcesses([])}
                  disabled={processes.length === 0}
                >
                  Clear Processes
                </button>
              </div>
            </div>
          )}

          {/* Explanation Toggle - Changed to Modal Trigger Button */}
          <div className="dashboard-card modal-trigger-card">
            <button
              className="action-button info-button full-width"
              onClick={() => setIsMetricsModalOpen(true)}
            >
              How Metrics Work
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="dashboard-column results-column">
          {status === "finished" && simulationResults ? (
            <>
              <div className="dashboard-card full-width">
                <h2>Gantt Chart</h2>
                <GanttChart data={simulationResults.ganttChart} />
              </div>

              <div className="dashboard-card">
                <h2>Average Metrics</h2>
                <ResultsDisplay
                  averageTurnaroundTime={
                    simulationResults.averageTurnaroundTime
                  }
                  averageWaitingTime={simulationResults.averageWaitingTime}
                  averageResponseTime={simulationResults.averageResponseTime}
                  cpuUtilization={simulationResults.cpuUtilization}
                  processes={simulationResults.processes}
                  algorithmType={selectedAlgorithm}
                />
              </div>

              <div className="dashboard-card toggle-card">
                <div
                  className="toggle-header"
                  onClick={() => toggleSection("detailedMetrics")}
                >
                  <h2>Process Metrics</h2>
                  <span className="toggle-icon">
                    {expandedSections.detailedMetrics ? "▼" : "▶"}
                  </span>
                </div>
                {expandedSections.detailedMetrics && (
                  <div className="toggle-content">
                    <DetailedProcessInfo
                      processes={simulationResults.processes}
                    />
                  </div>
                )}
              </div>

              <div className="dashboard-card toggle-card">
                <div
                  className="toggle-header"
                  onClick={() => toggleSection("executionHistory")}
                >
                  <h2>Execution Timeline</h2>
                  <span className="toggle-icon">
                    {expandedSections.executionHistory ? "▼" : "▶"}
                  </span>
                </div>
                {expandedSections.executionHistory && (
                  <div className="toggle-content">
                    <ExecutionHistory
                      processes={simulationResults.processes}
                      ganttChart={simulationResults.rawGanttChart}
                      algorithm={selectedAlgorithm}
                      timeQuantum={
                        selectedAlgorithm === "RR" ? timeQuantum : undefined
                      }
                    />
                  </div>
                )}
              </div>

              <div className="dashboard-actions">
                <button
                  className="action-button reset-button"
                  onClick={resetSimulation}
                >
                  Reset Simulation
                </button>
              </div>
            </>
          ) : (
            <div className="dashboard-placeholder">
              <div className="placeholder-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h3>Simulation Results Will Appear Here</h3>
                <p>Add processes and run the simulation to see the results</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Explanation Modal */}
      {isMetricsModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsMetricsModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-button"
              onClick={() => setIsMetricsModalOpen(false)}
            >
              &times;
            </button>
            <h2>How Metrics Are Calculated</h2>
            <MetricsExplanation />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
