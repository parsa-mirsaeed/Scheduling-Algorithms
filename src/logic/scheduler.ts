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

// Deep clone a process array to avoid mutation
function cloneProcesses(processes: Process[]): Process[] {
  return processes.map(p => ({...p}));
}

// FIFO (First-In, First-Out) algorithm implementation
export function fifoScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);
  
  // Sort processes by arrival time
  processesClone.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  const ganttChart: GanttItem[] = [];
  let currentTime = processesClone[0].arrivalTime;
  
  // Process each job in order of arrival
  for (const process of processesClone) {
    // If there's a gap between current time and next process arrival
    if (process.arrivalTime > currentTime) {
      currentTime = process.arrivalTime;
    }
    
    // Record start time when process first begins execution
    process.startTime = currentTime;
    
    // Execute the process for its burst time
    currentTime += process.burstTime;
    
    // Record completion time
    process.completionTime = currentTime;
    
    // Calculate turnaround time, waiting time, and response time
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
    process.responseTime = process.startTime - process.arrivalTime;
    
    // Add entry to Gantt chart
    ganttChart.push({
      processId: process.id,
      startTime: process.startTime,
      endTime: process.completionTime
    });
  }
  
  // Calculate averages using the helper function
  const metrics = calculateMetrics(processesClone);
  
  return {
    ganttChart,
    processes: processesClone,
    ...metrics
  };
}

// SJF (Shortest Job First) algorithm implementation
export function sjfScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);
  
  // Initialize remaining times
  processesClone.forEach(p => {
    p.remainingTime = p.burstTime;
  });
  
  const ganttChart: GanttItem[] = [];
  const completed: Process[] = [];
  let currentTime = Math.min(...processesClone.map(p => p.arrivalTime));
  
  // Continue until all processes are completed
  while (completed.length < processesClone.length) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processesClone.filter(
      p => p.arrivalTime <= currentTime && p.remainingTime && p.remainingTime > 0
    );
    
    if (arrivedProcesses.length === 0) {
      // No process available at current time, jump to next arrival
      const nextArrival = processesClone
        .filter(p => p.arrivalTime > currentTime && p.remainingTime && p.remainingTime > 0)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      
      if (nextArrival) {
        currentTime = nextArrival.arrivalTime;
        continue;
      } else {
        // Should never reach here if implementation is correct
        break;
      }
    }
    
    // Find the shortest job among arrived processes
    const shortestJob = arrivedProcesses.sort((a, b) => {
      return (a.burstTime - b.burstTime);
    })[0];
    
    // Record start time if first execution
    if (shortestJob.startTime === undefined) {
      shortestJob.startTime = currentTime;
    }
    
    // Execute the entire job
    currentTime += shortestJob.burstTime;
    
    // Mark as completed
    shortestJob.completionTime = currentTime;
    shortestJob.remainingTime = 0;
    
    // Calculate metrics
    shortestJob.turnaroundTime = shortestJob.completionTime - shortestJob.arrivalTime;
    shortestJob.waitingTime = shortestJob.turnaroundTime - shortestJob.burstTime;
    shortestJob.responseTime = shortestJob.startTime - shortestJob.arrivalTime;
    
    // Add to Gantt chart
    ganttChart.push({
      processId: shortestJob.id,
      startTime: shortestJob.startTime,
      endTime: shortestJob.completionTime
    });
    
    // Mark as completed
    completed.push(shortestJob);
  }
  
  // Calculate averages
  const metrics = calculateMetrics(processesClone);
  
  return {
    ganttChart,
    processes: processesClone,
    ...metrics
  };
}

// SRT (Shortest Remaining Time) algorithm implementation
export function srtScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);
  
  // Initialize remaining times
  processesClone.forEach(p => {
    p.remainingTime = p.burstTime;
  });
  
  const ganttChart: GanttItem[] = [];
  let currentTime = Math.min(...processesClone.map(p => p.arrivalTime));
  let completedCount = 0;
  let currentProcess: Process | null = null;
  let lastProcessId = -1;
  
  // Continue until all processes are completed
  while (completedCount < processesClone.length) {
    // Find processes that have arrived by current time
    const availableProcesses = processesClone.filter(
      p => p.arrivalTime <= currentTime && p.remainingTime && p.remainingTime > 0
    );
    
    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival
      const nextArrival = processesClone
        .filter(p => p.arrivalTime > currentTime && p.remainingTime && p.remainingTime > 0)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      
      if (nextArrival) {
        currentTime = nextArrival.arrivalTime;
        continue;
      } else {
        // Should never reach here if implementation is correct
        break;
      }
    }
    
    // Find process with shortest remaining time
    currentProcess = availableProcesses.sort((a, b) => {
      return (a.remainingTime! - b.remainingTime!);
    })[0];
    
    // Record start time if first execution
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }
    
    // Determine how long to run current process
    // Either until it completes or until next process arrives
    let nextArrivalTime = Infinity;
    const notArrivedProcesses = processesClone.filter(
      p => p.arrivalTime > currentTime && p.remainingTime && p.remainingTime > 0
    );
    
    if (notArrivedProcesses.length > 0) {
      nextArrivalTime = Math.min(...notArrivedProcesses.map(p => p.arrivalTime));
    }
    
    const executeTime = Math.min(
      currentProcess.remainingTime!,
      nextArrivalTime - currentTime
    );
    
    // Only add to Gantt chart if there's a process switch
    if (lastProcessId !== currentProcess.id) {
      if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].processId === currentProcess.id) {
        // Extend the last Gantt item if it's the same process
        ganttChart[ganttChart.length - 1].endTime = currentTime + executeTime;
      } else {
        // Add new Gantt item
        ganttChart.push({
          processId: currentProcess.id,
          startTime: currentTime,
          endTime: currentTime + executeTime
        });
      }
      lastProcessId = currentProcess.id;
    } else if (ganttChart.length > 0) {
      // Extend the last Gantt item
      ganttChart[ganttChart.length - 1].endTime = currentTime + executeTime;
    }
    
    // Execute process for the determined time
    currentTime += executeTime;
    currentProcess.remainingTime! -= executeTime;
    
    // Check if process is completed
    if (currentProcess.remainingTime === 0) {
      completedCount++;
      currentProcess.completionTime = currentTime;
      
      // Calculate metrics
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = currentProcess.startTime - currentProcess.arrivalTime;
    }
  }
  
  // Consolidate consecutive Gantt chart entries for the same process
  const consolidatedGantt: GanttItem[] = [];
  for (const item of ganttChart) {
    if (consolidatedGantt.length === 0 || 
        consolidatedGantt[consolidatedGantt.length - 1].processId !== item.processId) {
      consolidatedGantt.push({...item});
    } else {
      consolidatedGantt[consolidatedGantt.length - 1].endTime = item.endTime;
    }
  }
  
  // Calculate averages
  const metrics = calculateMetrics(processesClone);
  
  return {
    ganttChart: consolidatedGantt,
    processes: processesClone,
    ...metrics
  };
}

// RR (Round Robin) algorithm implementation
export function rrScheduling(processes: Process[], timeQuantum: number): SimulationResult {
  if (processes.length === 0 || timeQuantum <= 0) {
    return {
      ganttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);
  
  // Initialize remaining times
  processesClone.forEach(p => {
    p.remainingTime = p.burstTime;
  });
  
  const ganttChart: GanttItem[] = [];
  let currentTime = Math.min(...processesClone.map(p => p.arrivalTime));
  let completedCount = 0;
  
  // Ready queue for processes
  const readyQueue: Process[] = [];
  let lastProcessId = -1;
  
  // Continue until all processes are completed
  while (completedCount < processesClone.length) {
    // Add newly arrived processes to ready queue
    for (const process of processesClone) {
      if (process.arrivalTime <= currentTime && process.remainingTime && process.remainingTime > 0 &&
          !readyQueue.includes(process)) {
        readyQueue.push(process);
      }
    }
    
    if (readyQueue.length === 0) {
      // No process in ready queue, jump to next arrival
      const notArrivedProcesses = processesClone.filter(
        p => p.arrivalTime > currentTime && p.remainingTime && p.remainingTime > 0
      );
      
      if (notArrivedProcesses.length > 0) {
        currentTime = Math.min(...notArrivedProcesses.map(p => p.arrivalTime));
        continue;
      } else {
        // Should never reach here if implementation is correct
        break;
      }
    }
    
    // Get next process from the queue
    const currentProcess = readyQueue.shift()!;
    
    // Record start time if first execution
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }
    
    // Determine execution time (minimum of time quantum and remaining time)
    const executeTime = Math.min(timeQuantum, currentProcess.remainingTime!);
    
    // Only add to Gantt chart if there's a process switch
    if (lastProcessId !== currentProcess.id) {
      ganttChart.push({
        processId: currentProcess.id,
        startTime: currentTime,
        endTime: currentTime + executeTime
      });
      lastProcessId = currentProcess.id;
    } else if (ganttChart.length > 0) {
      // Extend the last Gantt item
      ganttChart[ganttChart.length - 1].endTime = currentTime + executeTime;
    }
    
    // Execute process for the determined time
    currentTime += executeTime;
    currentProcess.remainingTime! -= executeTime;
    
    // Check if process is completed
    if (currentProcess.remainingTime === 0) {
      completedCount++;
      currentProcess.completionTime = currentTime;
      
      // Calculate metrics
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = currentProcess.startTime - currentProcess.arrivalTime;
    } else {
      // Add back to ready queue if not completed
      // Check for new arrivals before re-adding current process
      for (const process of processesClone) {
        if (process.arrivalTime <= currentTime && process.remainingTime && process.remainingTime > 0 &&
            !readyQueue.includes(process) && process !== currentProcess) {
          readyQueue.push(process);
        }
      }
      readyQueue.push(currentProcess);
    }
  }
  
  // Consolidate consecutive Gantt chart entries for the same process
  const consolidatedGantt: GanttItem[] = [];
  for (const item of ganttChart) {
    if (consolidatedGantt.length === 0 || 
        consolidatedGantt[consolidatedGantt.length - 1].processId !== item.processId) {
      consolidatedGantt.push({...item});
    } else {
      consolidatedGantt[consolidatedGantt.length - 1].endTime = item.endTime;
    }
  }
  
  // Calculate averages
  const metrics = calculateMetrics(processesClone);
  
  return {
    ganttChart: consolidatedGantt,
    processes: processesClone,
    ...metrics
  };
}

// Helper function to calculate metrics from completed processes
export function calculateMetrics(processes: Process[]): {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
} {
  if (processes.length === 0) {
    return {
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0
    };
  }
  
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  
  for (const process of processes) {
    if (process.turnaroundTime !== undefined) {
      totalTurnaroundTime += process.turnaroundTime;
    }
    
    if (process.waitingTime !== undefined) {
      totalWaitingTime += process.waitingTime;
    }
    
    if (process.responseTime !== undefined) {
      totalResponseTime += process.responseTime;
    }
  }
  
  return {
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageResponseTime: totalResponseTime / processes.length
  };
} 