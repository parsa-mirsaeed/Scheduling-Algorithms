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
  ganttChart: GanttItem[]; // Consolidated for visual chart
  rawGanttChart: GanttItem[]; // Unconsolidated for execution history
  processes: Process[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number; // Added CPU utilization metric
}

// Deep clone a process array to avoid mutation
function cloneProcesses(processes: Process[]): Process[] {
  return processes.map((p) => ({ ...p }));
}

// FIFO (First-In, First-Out) algorithm implementation
export function fifoScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      rawGanttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
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
    process.waitingTime = process.startTime - process.arrivalTime;
    process.responseTime = process.startTime - process.arrivalTime;

    // Add entry to Gantt chart
    ganttChart.push({
      processId: process.id,
      startTime: process.startTime,
      endTime: process.completionTime,
    });
  }

  // For non-preemptive, raw is same as consolidated
  const metrics = calculateMetrics(processesClone);

  return {
    ganttChart, // Same as rawGanttChart for FIFO
    rawGanttChart: ganttChart,
    processes: processesClone,
    ...metrics,
  };
}

// SJF (Shortest Job First) algorithm implementation
export function sjfScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      rawGanttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);

  // Initialize remaining times
  processesClone.forEach((p) => {
    p.remainingTime = p.burstTime;
  });

  const ganttChart: GanttItem[] = [];
  const completed: Process[] = [];
  let currentTime = Math.min(...processesClone.map((p) => p.arrivalTime));

  // Continue until all processes are completed
  while (completed.length < processesClone.length) {
    // Find processes that have arrived by the current time
    const arrivedProcesses = processesClone.filter(
      (p) =>
        p.arrivalTime <= currentTime && p.remainingTime && p.remainingTime > 0,
    );

    if (arrivedProcesses.length === 0) {
      // No process available at current time, jump to next arrival
      const nextArrival = processesClone
        .filter(
          (p) =>
            p.arrivalTime > currentTime &&
            p.remainingTime &&
            p.remainingTime > 0,
        )
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
      return a.burstTime - b.burstTime;
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
    shortestJob.turnaroundTime =
      shortestJob.completionTime - shortestJob.arrivalTime;
    shortestJob.waitingTime = shortestJob.startTime - shortestJob.arrivalTime;
    shortestJob.responseTime = shortestJob.startTime - shortestJob.arrivalTime;

    // Add to Gantt chart
    ganttChart.push({
      processId: shortestJob.id,
      startTime: shortestJob.startTime,
      endTime: shortestJob.completionTime,
    });

    // Mark as completed
    completed.push(shortestJob);
  }

  // For non-preemptive, raw is same as consolidated
  const metrics = calculateMetrics(processesClone);

  return {
    ganttChart, // Same as rawGanttChart for SJF
    rawGanttChart: ganttChart,
    processes: processesClone,
    ...metrics,
  };
}

// SRT (Shortest Remaining Time) algorithm implementation
export function srtScheduling(processes: Process[]): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      rawGanttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
    };
  }

  // Clone processes to avoid mutating the original array
  const processesClone = cloneProcesses(processes);

  // Initialize remaining times
  processesClone.forEach((p) => {
    p.remainingTime = p.burstTime;
  });

  const ganttChart: GanttItem[] = [];
  const rawGanttChart: GanttItem[] = []; // Store raw steps here
  let currentTime = Math.min(...processesClone.map((p) => p.arrivalTime));
  let completedCount = 0;
  let currentProcess: Process | null = null;
  let lastProcessId = -1;

  // Continue until all processes are completed
  while (completedCount < processesClone.length) {
    // Find processes that have arrived by current time
    const availableProcesses = processesClone.filter(
      (p) =>
        p.arrivalTime <= currentTime && p.remainingTime && p.remainingTime > 0,
    );

    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival
      const nextArrival = processesClone
        .filter(
          (p) =>
            p.arrivalTime > currentTime &&
            p.remainingTime &&
            p.remainingTime > 0,
        )
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
      return a.remainingTime! - b.remainingTime!;
    })[0];

    // Record start time if first execution
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }

    // Determine how long to run current process
    // Either until it completes or until next process arrives
    let nextArrivalTime = Infinity;
    const notArrivedProcesses = processesClone.filter(
      (p) =>
        p.arrivalTime > currentTime && p.remainingTime && p.remainingTime > 0,
    );

    if (notArrivedProcesses.length > 0) {
      nextArrivalTime = Math.min(
        ...notArrivedProcesses.map((p) => p.arrivalTime),
      );
    }

    const executeTime = Math.min(
      currentProcess.remainingTime!,
      nextArrivalTime - currentTime,
    );

    // Add raw step to rawGanttChart
    rawGanttChart.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
    });

    // Only add to Gantt chart if there's a process switch
    if (lastProcessId !== currentProcess.id) {
      if (
        ganttChart.length > 0 &&
        ganttChart[ganttChart.length - 1].processId === currentProcess.id
      ) {
        // Extend the last Gantt item if it's the same process
        ganttChart[ganttChart.length - 1].endTime = currentTime + executeTime;
      } else {
        // Add new Gantt item
        ganttChart.push({
          processId: currentProcess.id,
          startTime: currentTime,
          endTime: currentTime + executeTime,
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
      currentProcess.turnaroundTime =
        currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime =
        currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime =
        currentProcess.startTime - currentProcess.arrivalTime;
    }
  }

  // Consolidate consecutive Gantt chart entries for the visual chart
  const consolidatedGantt: GanttItem[] = [];
  for (const item of rawGanttChart) {
    // Consolidate from raw chart
    if (
      consolidatedGantt.length === 0 ||
      consolidatedGantt[consolidatedGantt.length - 1].processId !==
        item.processId ||
      consolidatedGantt[consolidatedGantt.length - 1].endTime !== item.startTime
    ) {
      // Also check for time gap
      consolidatedGantt.push({ ...item });
    } else {
      consolidatedGantt[consolidatedGantt.length - 1].endTime = item.endTime;
    }
  }

  // Calculate averages
  const metrics = calculateMetrics(processesClone);

  return {
    ganttChart: consolidatedGantt, // Use consolidated for visual chart
    rawGanttChart: rawGanttChart, // Use raw for execution history
    processes: processesClone,
    ...metrics,
  };
}

// Round Robin (RR) algorithm implementation
export function rrScheduling(
  processes: Process[],
  timeQuantum: number,
  contextSwitchTime: number, // Added context switch time parameter
): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      rawGanttChart: [],
      processes: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
    };
  }

  const processesClone = cloneProcesses(processes);
  processesClone.forEach((p) => {
    p.remainingTime = p.burstTime;
    p.startTime = undefined; // Ensure startTime is reset
    p.completionTime = undefined; // Ensure completionTime is reset
  });

  const readyQueue: Process[] = [];
  const rawGanttChart: GanttItem[] = [];
  let currentTime = 0;
  let completedCount = 0;
  let lastProcessId: number | null = null; // Track the last run process ID
  // const processMap = new Map(processesClone.map((p) => [p.id, p])); // Unused variable
  let timePointer = 0; // Keeps track of next process index to check for arrival

  processesClone.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by arrival initially

  while (completedCount < processesClone.length) {
    // Add newly arrived processes to the ready queue
    while (
      timePointer < processesClone.length &&
      processesClone[timePointer].arrivalTime <= currentTime
    ) {
      readyQueue.push(processesClone[timePointer]);
      timePointer++;
    }

    if (readyQueue.length === 0) {
      // If no process is ready, advance time to the next arrival
      if (timePointer < processesClone.length) {
        currentTime = processesClone[timePointer].arrivalTime;
        // Add newly arrived process(es) after advancing time
        while (
          timePointer < processesClone.length &&
          processesClone[timePointer].arrivalTime <= currentTime
        ) {
          readyQueue.push(processesClone[timePointer]);
          timePointer++;
        }
      } else {
        // No more processes to arrive and queue is empty, should be done
        break;
      }
    }

    if (readyQueue.length > 0) {
      const currentProcess = readyQueue.shift()!; // Get the next process

      // --- Context Switch Handling ---
      // Apply context switch time only if switching *between different* processes
      if (lastProcessId !== null && lastProcessId !== currentProcess.id) {
        const switchStartTime = currentTime;
        currentTime += contextSwitchTime;
        rawGanttChart.push({
          processId: -1, // Use -1 or a specific ID for context switch
          startTime: switchStartTime,
          endTime: currentTime,
        });
        // Re-check for arrivals during the context switch
        while (
          timePointer < processesClone.length &&
          processesClone[timePointer].arrivalTime <= currentTime
        ) {
          readyQueue.push(processesClone[timePointer]);
          timePointer++;
        }
      }
      // ------------------------------

      const burstStartTime = currentTime;

      // Record start time (first time CPU is allocated)
      if (currentProcess.startTime === undefined) {
        currentProcess.startTime = burstStartTime;
        currentProcess.responseTime =
          currentProcess.startTime - currentProcess.arrivalTime;
      }

      // Determine time slice for execution
      const timeSlice = Math.min(timeQuantum, currentProcess.remainingTime!);

      // Execute process
      currentProcess.remainingTime! -= timeSlice;
      currentTime += timeSlice;
      lastProcessId = currentProcess.id; // Update last run process ID

      // Add execution block to raw Gantt chart
      rawGanttChart.push({
        processId: currentProcess.id,
        startTime: burstStartTime,
        endTime: currentTime,
      });

      // Add processes that arrived *during* this execution slice
      while (
        timePointer < processesClone.length &&
        processesClone[timePointer].arrivalTime <= currentTime
      ) {
        readyQueue.push(processesClone[timePointer]);
        timePointer++;
      }

      // Handle process completion or requeue
      if (currentProcess.remainingTime! <= 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime =
          currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime =
          currentProcess.turnaroundTime - currentProcess.burstTime;
        completedCount++;
        // Process finished, don't add back to queue
      } else {
        // Process not finished, add back to the end of the queue
        readyQueue.push(currentProcess);
      }
    } else if (timePointer >= processesClone.length) {
      // No processes in ready queue and no more arrivals means we are done
      break;
    } else {
      // Should not happen if logic is correct, advance time minimally?
      // Or handled by the initial check in the loop for empty queue
      currentTime++; // Minimal advance if stuck? Needs review.
    }
  }

  const consolidatedGantt = consolidateGanttChart(rawGanttChart);
  const metrics = calculateMetrics(processesClone);

  return {
    ganttChart: consolidatedGantt,
    rawGanttChart: rawGanttChart,
    processes: processesClone,
    ...metrics,
  };
}

// Helper function to consolidate Gantt chart entries
// Merges consecutive blocks of the same process or context switch
function consolidateGanttChart(rawGantt: GanttItem[]): GanttItem[] {
  if (!rawGantt || rawGantt.length === 0) {
    return [];
  }

  const consolidated: GanttItem[] = [];
  let currentBlock = { ...rawGantt[0] };

  for (let i = 1; i < rawGantt.length; i++) {
    const nextBlock = rawGantt[i];
    // Merge if the next block starts exactly where the current one ends
    // AND they belong to the same process (or both are context switches)
    if (
      nextBlock.startTime === currentBlock.endTime &&
      nextBlock.processId === currentBlock.processId
    ) {
      currentBlock.endTime = nextBlock.endTime; // Extend the current block
    } else {
      consolidated.push(currentBlock); // Push the completed block
      currentBlock = { ...nextBlock }; // Start a new block
    }
  }
  consolidated.push(currentBlock); // Push the last block

  return consolidated;
}

// Helper function to calculate metrics from completed processes
export function calculateMetrics(processes: Process[]): {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number;
} {
  if (processes.length === 0) {
    return {
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
    };
  }

  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  let totalBurstTime = 0; // Total processing time
  let maxCompletionTime = 0; // Latest completion time (total elapsed time)

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

    // Calculate total burst time
    totalBurstTime += process.burstTime;

    // Track the latest completion time
    if (
      process.completionTime !== undefined &&
      process.completionTime > maxCompletionTime
    ) {
      maxCompletionTime = process.completionTime;
    }
  }

  // Calculate CPU utilization: (Total Burst Time / Total Elapsed Time) * 100
  const cpuUtilization =
    maxCompletionTime > 0 ? (totalBurstTime / maxCompletionTime) * 100 : 0;

  return {
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageResponseTime: totalResponseTime / processes.length,
    cpuUtilization: cpuUtilization,
  };
}
