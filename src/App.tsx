import { useState } from 'react'
import './App.css'
import ProcessInput from './components/ProcessInput'
import ProcessListDisplay from './components/ProcessListDisplay'
import Controls from './components/Controls'
import GanttChart from './components/GanttChart'
import ResultsDisplay from './components/ResultsDisplay'
import DetailedProcessInfo from './components/DetailedProcessInfo'
import { Process, SimulationResult, fifoScheduling, sjfScheduling, srtScheduling, rrScheduling } from './logic/scheduler'

type Algorithm = 'FIFO' | 'SJF' | 'SRT' | 'RR'

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
  }

  // Function to reset simulation
  const resetSimulation = () => {
    setStatus('idle')
    setSimulationResults(null)
  }

  return (
    <div className="app-container">
      <h1>CPU Scheduling Algorithm Visualizer</h1>
      
      <div className="input-section">
        <h2>Add Processes</h2>
        <ProcessInput addProcess={addProcess} />
      </div>
      
      {processes.length > 0 && (
        <div className="process-list-section">
          <h2>Process List</h2>
          <ProcessListDisplay processes={processes} />
        </div>
      )}
      
      <div className="controls-section">
        <h2>Controls</h2>
        <Controls
          selectedAlgorithm={selectedAlgorithm}
          setSelectedAlgorithm={setSelectedAlgorithm}
          timeQuantum={timeQuantum}
          setTimeQuantum={setTimeQuantum}
          startSimulation={startSimulation}
          resetSimulation={resetSimulation}
        />
      </div>
      
      {status === 'finished' && simulationResults && (
        <>
          <div className="gantt-chart-section">
            <h2>Gantt Chart</h2>
            <GanttChart data={simulationResults.ganttChart} />
          </div>
          
          <div className="detailed-results-section">
            <h2>Detailed Process Information</h2>
            <DetailedProcessInfo processes={simulationResults.processes} />
          </div>
          
          <div className="results-section">
            <h2>Average Metrics</h2>
            <ResultsDisplay
              averageTurnaroundTime={simulationResults.averageTurnaroundTime}
              averageWaitingTime={simulationResults.averageWaitingTime}
              averageResponseTime={simulationResults.averageResponseTime}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default App
