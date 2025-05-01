// Define Process interface
export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  startTime?: number;
  completionTime?: number;
  remainingTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
}

// Define GanttItem interface for visualization
export interface GanttItem {
  processId: number;
  startTime: number;
  endTime: number;
}

// Define SimulationResult interface
export interface SimulationResult {
  ganttChart: GanttItem[];
  processes: Process[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
}

// Placeholder for the FIFO (First-In, First-Out) algorithm
export function fifoScheduling(processes: Process[]): SimulationResult {
  // Implementation will be added later
  return {
    ganttChart: [],
    processes: [],
    averageTurnaroundTime: 0,
    averageWaitingTime: 0,
    averageResponseTime: 0
  };
}

// Placeholder for the SJF (Shortest Job First) algorithm
export function sjfScheduling(processes: Process[]): SimulationResult {
  // Implementation will be added later
  return {
    ganttChart: [],
    processes: [],
    averageTurnaroundTime: 0,
    averageWaitingTime: 0,
    averageResponseTime: 0
  };
}

// Placeholder for the SRT (Shortest Remaining Time) algorithm
export function srtScheduling(processes: Process[]): SimulationResult {
  // Implementation will be added later
  return {
    ganttChart: [],
    processes: [],
    averageTurnaroundTime: 0,
    averageWaitingTime: 0,
    averageResponseTime: 0
  };
}

// Placeholder for the RR (Round Robin) algorithm
export function rrScheduling(processes: Process[], timeQuantum: number): SimulationResult {
  // Implementation will be added later
  return {
    ganttChart: [],
    processes: [],
    averageTurnaroundTime: 0,
    averageWaitingTime: 0,
    averageResponseTime: 0
  };
}

// Helper function to calculate metrics from completed processes
export function calculateMetrics(processes: Process[]): {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
} {
  // Implementation will be added later
  return {
    averageTurnaroundTime: 0,
    averageWaitingTime: 0,
    averageResponseTime: 0
  };
} 