import { useState } from 'react'
import './App.css'
import ProcessInput from './components/ProcessInput'
import ProcessListDisplay from './components/ProcessListDisplay'
import Controls from './components/Controls'
import GanttChart from './components/GanttChart'
import ResultsDisplay from './components/ResultsDisplay'
import DetailedProcessInfo from './components/DetailedProcessInfo'
import ExecutionHistory from './components/ExecutionHistory'
import MetricsExplanation from './components/MetricsExplanation'
import { Process, SimulationResult, fifoScheduling, sjfScheduling, srtScheduling, rrScheduling } from './logic/scheduler'

type Algorithm = 'FIFO' | 'SJF' | 'SRT' | 'RR'
type AppView = 'setup' | 'simulation' | 'explanation'

function App() {
  // State for processes
  const [processes, setProcesses] = useState<Process[]>([])
  
  // State for selected algorithm
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('FIFO')
  
  // State for time quantum (for Round Robin)
  const [timeQuantum, setTimeQuantum] = useState<number>(1)
  
  // State for simulation results
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null)
  
  // State for simulation status
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle')

  // State for the current view
  const [currentView, setCurrentView] = useState<AppView>('setup')

  // Function to add a process to the list
  const addProcess = (process: Process) => {
    setProcesses([...processes, { ...process, id: processes.length + 1 }])
  }

  // Function to start simulation
  const startSimulation = () => {
    if (processes.length === 0) return

    setStatus('running')
    
    let result: SimulationResult
    
    // Call the appropriate scheduling algorithm based on selectedAlgorithm
    switch (selectedAlgorithm) {
      case 'FIFO':
        result = fifoScheduling([...processes]) // Create a copy to avoid mutating original state
        break
      case 'SJF':
        result = sjfScheduling([...processes])
        break
      case 'SRT':
        result = srtScheduling([...processes])
        break
      case 'RR':
        result = rrScheduling([...processes], timeQuantum)
        break
      default:
        result = fifoScheduling([...processes])
    }
    
    setSimulationResults(result)
    setStatus('finished')
    setCurrentView('simulation')
  }

  // Function to reset simulation
  const resetSimulation = () => {
    setStatus('idle')
    setSimulationResults(null)
    setCurrentView('setup')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CPU Scheduling Algorithm Visualizer</h1>
        
        {/* Navigation Tabs */}
        <nav className="app-nav">
          <button 
            className={`nav-tab ${currentView === 'setup' ? 'active' : ''}`} 
            onClick={() => setCurrentView('setup')}
          >
            Setup
          </button>
          <button 
            className={`nav-tab ${currentView === 'simulation' ? 'active' : ''}`} 
            onClick={() => setCurrentView('simulation')}
            disabled={status !== 'finished'}
          >
            Simulation Results
          </button>
          <button 
            className={`nav-tab ${currentView === 'explanation' ? 'active' : ''}`} 
            onClick={() => setCurrentView('explanation')}
          >
            Learn Metrics
          </button>
        </nav>
      </header>
      
      {/* Setup View */}
      {currentView === 'setup' && (
        <div className="setup-view">
          <div className="setup-grid">
            <div className="setup-card input-section">
              <h2>Add Processes</h2>
              <ProcessInput addProcess={addProcess} />
            </div>

            <div className="setup-card controls-section">
              <h2>Configure Simulation</h2>
              <Controls
                selectedAlgorithm={selectedAlgorithm}
                setSelectedAlgorithm={setSelectedAlgorithm}
                timeQuantum={timeQuantum}
                setTimeQuantum={setTimeQuantum}
                startSimulation={startSimulation}
                resetSimulation={resetSimulation}
              />
            </div>
          </div>
          
          {processes.length > 0 && (
            <div className="setup-card process-list-section">
              <h2>Process List</h2>
              <ProcessListDisplay processes={processes} />
              
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
        </div>
      )}
      
      {/* Simulation Results View */}
      {currentView === 'simulation' && simulationResults && (
        <div className="results-view">
          <div className="results-grid">
            <div className="results-card gantt-section">
              <h2>Gantt Chart</h2>
              <GanttChart data={simulationResults.ganttChart} />
            </div>
            
            <div className="results-card metrics-section">
              <h2>Average Metrics</h2>
              <ResultsDisplay
                averageTurnaroundTime={simulationResults.averageTurnaroundTime}
                averageWaitingTime={simulationResults.averageWaitingTime}
                averageResponseTime={simulationResults.averageResponseTime}
                processes={simulationResults.processes}
              />
            </div>
            
            <div className="results-card details-section">
              <h2>Process Details</h2>
              <DetailedProcessInfo processes={simulationResults.processes} />
            </div>
            
            <div className="results-card execution-section">
              <h2>Execution Timeline</h2>
              <ExecutionHistory 
                processes={simulationResults.processes} 
                ganttChart={simulationResults.rawGanttChart}
                algorithm={selectedAlgorithm}
                timeQuantum={selectedAlgorithm === 'RR' ? timeQuantum : undefined}
              />
            </div>
          </div>

          <div className="action-buttons centered">
            <button 
              className="action-button setup-button"
              onClick={() => setCurrentView('setup')}
            >
              Back to Setup
            </button>
            <button 
              className="action-button reset-button"
              onClick={resetSimulation}
            >
              Reset Simulation
            </button>
          </div>
        </div>
      )}
      
      {/* Metrics Explanation View */}
      {currentView === 'explanation' && (
        <div className="explanation-view">
          <MetricsExplanation />
          
          <div className="action-buttons centered">
            <button 
              className="action-button back-button"
              onClick={() => setCurrentView(status === 'finished' ? 'simulation' : 'setup')}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
