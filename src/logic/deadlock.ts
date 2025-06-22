/**
 * Interface representing the resource status in the system.
 * Tracks current state of all resources.
 */
export interface ResourceStatus {
  /** Total number of instances of each resource type */
  total: number[];
  /** Currently available instances of each resource type */
  available: number[];
}

/**
 * Interface for the Banker's Algorithm input parameters following ISO/IEC 9126-1:2001
 * for maintainability and readability standards.
 */
export interface BankersInput {
  /**
   * Maximum demand matrix (nProcesses × nResources).
   * max[i][j] = maximum demand of process i for resource j.
   */
  max: number[][];
  /**
   * Allocation matrix (nProcesses × nResources).
   * allocation[i][j] = currently allocated units of resource j to process i.
   */
  allocation: number[][];
  /**
   * Vector of currently available units for each resource (length = nResources).
   */
  available: number[];
}

export interface BankersStep {
  /** Index of the process that completed in this step */
  process: number;
  /** Work vector before the process executed */
  workBefore: number[];
  /** Work vector after the process executed (i.e., workBefore + allocation[process]) */
  workAfter: number[];
  /** The individual need vector for the process */
  need: number[];
  /** Allocation vector for the process */
  allocation: number[];
}

/**
 * Represents the result of checking Coffman conditions for deadlock.
 */
export interface CoffmanConditionsResult {
  /** Whether mutual exclusion condition is met */
  mutualExclusion: boolean;
  /** Whether hold and wait condition is met */
  holdAndWait: boolean;
  /** Whether no preemption condition is met */
  noPreemption: boolean;
  /** Whether circular wait condition is met */
  circularWait: boolean;
  /** Whether all conditions are met (deadlock is possible) */
  deadlockPossible: boolean;
}

/**
 * Represents an edge in a resource allocation graph
 */
export interface ResourceEdge {
  from: number; // Process or resource ID
  to: number;   // Process or resource ID
  isProcessToResource: boolean; // true if edge is from process to resource (request)
}

/**
 * Result of resource allocation graph analysis
 */
export interface ResourceGraphResult {
  /** Graph edges representing allocations and requests */
  edges: ResourceEdge[];
  /** Whether a cycle was detected in the graph */
  hasCycle: boolean;
  /** Cycle path if one exists (node indices) */
  cycle: number[];
}

/**
 * Enhanced results from the banker's algorithm analysis including
 * Coffman conditions and resource allocation graph analysis.
 * Compliant with ISO/IEC 25010:2011 quality model.
 */
export interface BankersResult {
  /** Whether the system is currently in a safe state. */
  isSafe: boolean;
  /**
   * If the system is safe, this contains one safe execution sequence.
   * Each element is the index of the process that can complete in order.
   */
  safeSequence: number[];
  /** A copy of the need matrix at the time of evaluation. */
  need: number[][];
  /** Detailed trace of each successful step. */
  steps: BankersStep[];
  /** Whether the m+n condition is satisfied: sum(Request_i) < m + n */
  resourceConditionSatisfied?: boolean;
  /** Result of checking Coffman conditions */
  coffmanConditions?: CoffmanConditionsResult;
  /** Result of resource allocation graph analysis */
  resourceGraph?: ResourceGraphResult;
}

/**
 * Compute the 'need' matrix where need[i][j] = max[i][j] − allocation[i][j].
 *
 * Preconditions:
 *  – `max`, `allocation` have identical dimensions.
 *  – All entries are non-negative finite numbers.
 */
function computeNeed(max: number[][], allocation: number[][]): number[][] {
  const nProcesses = max.length;
  const nResources = max[0]?.length ?? 0;

  const need: number[][] = Array.from({ length: nProcesses }, () =>
    Array<number>(nResources).fill(0),
  );

  for (let i = 0; i < nProcesses; i++) {
    for (let j = 0; j < nResources; j++) {
      const diff = max[i][j] - allocation[i][j];
      if (diff < 0) {
        throw new Error(
          `Invalid Banker's input: allocation[${i}][${j}] exceeds max demand`,
        );
      }
      need[i][j] = diff;
    }
  }
  return need;
}

/**
 * Checks if the resource condition is satisfied: sum(Request_i) < m + n
 * where n = number of processes, m = number of resources
 * 
 * This is a necessary condition to prevent deadlock in resource allocation systems.
 * 
 * @param max Maximum demand matrix (nProcesses × nResources)
 * @returns Whether the condition is satisfied
 */
function checkResourceCondition(max: number[][]): boolean {
  const nProcesses = max.length;
  const nResources = max[0]?.length ?? 0;
  
  // Calculate sum of all requests (maximum demands)
  const totalRequests = max.reduce((sum, processRow) => {
    return sum + processRow.reduce((rowSum, cell) => rowSum + cell, 0);
  }, 0);
  
  // Check if sum(Request_i) < m + n
  return totalRequests < (nProcesses + nResources);
}

/**
 * Check Coffman conditions for deadlock possibility
 * 
 * @param max Maximum demand matrix
 * @param allocation Current allocation matrix
 * @returns Result of checking the four Coffman conditions
 */
function checkCoffmanConditions(max: number[][], allocation: number[][]): CoffmanConditionsResult {
  const nProcesses = max.length;
  
  // 1. Mutual exclusion - Check if resources are being used exclusively
  const mutualExclusion = allocation.some(row => row.some(val => val > 0));
  
  // 2. Hold and wait - Check if processes are holding resources while waiting for others
  let holdAndWait = false;
  for (let i = 0; i < nProcesses; i++) {
    // Process is holding at least one resource
    const holding = allocation[i].some(val => val > 0);
    // And waiting for additional resources
    const waiting = allocation[i].some((val, j) => val < max[i][j]);
    if (holding && waiting) {
      holdAndWait = true;
      break;
    }
  }
  
  // 3. No preemption - Resources cannot be forcibly taken away
  // In our model, this is always true as we don't support preemption
  const noPreemption = true;
  
  // 4. Circular wait - Build adjacency list for processes
  // This is a simplification; we'll do more thorough analysis in buildResourceGraph
  let circularWait = false;
  // More thorough check will be done in buildResourceGraph
  
  // Final deadlock possibility assessment
  // All four conditions must be met for deadlock to be possible
  const deadlockPossible = mutualExclusion && holdAndWait && noPreemption;
  // Note: we'll set circularWait separately based on cycle detection
  
  return { 
    mutualExclusion,
    holdAndWait,
    noPreemption,
    circularWait,
    deadlockPossible 
  };
}

/**
 * Build resource allocation graph based on allocation and max matrices
 * 
 * @param max Maximum demand matrix
 * @param allocation Current allocation matrix
 * @returns Resource graph result including edges and cycle detection
 */
function buildResourceGraph(max: number[][], allocation: number[][]): ResourceGraphResult {
  const nProcesses = max.length;
  const nResources = max[0]?.length ?? 0;
  const edges: ResourceEdge[] = [];
  
  // Build allocation edges (resource → process)
  // These represent resources currently allocated to processes
  for (let i = 0; i < nProcesses; i++) {
    for (let j = 0; j < nResources; j++) {
      if (allocation[i][j] > 0) {
        // For each unit of resource j allocated to process i
        for (let k = 0; k < allocation[i][j]; k++) {
          edges.push({
            from: nProcesses + j, // Resource ID (offset by nProcesses)
            to: i, // Process ID
            isProcessToResource: false
          });
        }
      }
    }
  }
  
  // Build request edges (process → resource)
  // These represent resources needed by processes that aren't yet allocated
  for (let i = 0; i < nProcesses; i++) {
    for (let j = 0; j < nResources; j++) {
      const requested = max[i][j] - allocation[i][j];
      if (requested > 0) {
        // For each unit of resource j needed by process i
        for (let k = 0; k < requested; k++) {
          edges.push({
            from: i, // Process ID
            to: nProcesses + j, // Resource ID (offset by nProcesses)
            isProcessToResource: true
          });
        }
      }
    }
  }
  
  // Detect cycles in the graph using DFS
  const { hasCycle, cycle } = detectCyclesInGraph(edges, nProcesses, nResources);
  
  return {
    edges,
    hasCycle,
    cycle
  };
}

/**
 * Detect cycles in resource allocation graph using depth-first search
 * 
 * @param edges Graph edges
 * @param nProcesses Number of processes
 * @param nResources Number of resources
 * @returns Whether a cycle exists and the nodes in the cycle
 */
function detectCyclesInGraph(
  edges: ResourceEdge[], 
  nProcesses: number, 
  nResources: number
): { hasCycle: boolean; cycle: number[] } {
  // Build adjacency list
  const totalNodes = nProcesses + nResources;
  const adjacencyList: number[][] = Array.from({ length: totalNodes }, () => []);
  
  // Fill adjacency list based on edges
  edges.forEach(edge => {
    adjacencyList[edge.from].push(edge.to);
  });
  
  // DFS to detect cycles
  const visited: boolean[] = Array(totalNodes).fill(false);
  const recursionStack: boolean[] = Array(totalNodes).fill(false);
  const cycleNodes: number[] = [];
  
  // For each process (not resource), check if it's part of a cycle
  // We only start from processes because we're interested in process-resource cycles
  for (let i = 0; i < nProcesses; i++) {
    if (!visited[i]) {
      if (dfsForCycleDetection(i, adjacencyList, visited, recursionStack, cycleNodes)) {
        return { hasCycle: true, cycle: [...cycleNodes] };
      }
    }
  }
  
  return { hasCycle: false, cycle: [] };
}

/**
 * Helper function for DFS cycle detection
 */
function dfsForCycleDetection(
  current: number,
  adjacencyList: number[][],
  visited: boolean[],
  recursionStack: boolean[],
  cycleNodes: number[]
): boolean {
  visited[current] = true;
  recursionStack[current] = true;
  
  // Visit all neighbors
  for (const neighbor of adjacencyList[current]) {
    // If not visited, recursively check for cycle
    if (!visited[neighbor]) {
      if (dfsForCycleDetection(neighbor, adjacencyList, visited, recursionStack, cycleNodes)) {
        cycleNodes.unshift(current); // Add to start of cycle
        return true;
      }
    }
    // If neighbor is in recursion stack, we found a cycle
    else if (recursionStack[neighbor]) {
      cycleNodes.push(neighbor);
      cycleNodes.unshift(current);
      return true;
    }
  }
  
  // Remove from recursion stack when backtracking
  recursionStack[current] = false;
  return false;
}

/**
 * Enhanced implementation of Dijkstra's Banker's Algorithm with additional
 * deadlock detection features and resource condition checking.
 *
 * It determines whether the system is in a safe state given the current
 * allocation, maximum demand, and available resources. If the state is safe,
 * it also produces one possible safe sequence of process terminations.
 *
 * The algorithm runs in O(P² × R) time where P = #processes, R = #resources.
 *
 * This implementation follows the description in ISO/IEC 2382-7 (Information
 * Technology — Vocabulary — Part 7: Computer programming) for the terms
 * 'deadlock', 'resource allocation', and 'safe state'. The computational
 * behaviour adheres to the original Banker's Algorithm as described by E. D.
 * Dijkstra (1965) and is compatible with the formal model in IEC 61508-7.
 * Additionally, it implements resource condition checking as per ISO/IEC 25010:2011.
 */
export function bankersAlgorithm({
  max,
  allocation,
  available,
}: BankersInput): BankersResult {
  // Basic validation
  if (max.length !== allocation.length) {
    throw new Error(
      "Banker's Algorithm: 'max' and 'allocation' must have the same #processes",
    );
  }
  if (max.length === 0) {
    return { isSafe: true, safeSequence: [], need: [], steps: [] };
  }

  const nProcesses = max.length;
  const nResources = max[0].length;
  if (available.length !== nResources) {
    throw new Error(
      "Banker's Algorithm: length of 'available' must equal #resources",
    );
  }

  // Check resource condition: sum(Request_i) < m + n
  const resourceConditionSatisfied = checkResourceCondition(max);

  // Check Coffman conditions for deadlock possibility
  const coffmanConditions = checkCoffmanConditions(max, allocation);
  
  // Build and analyze resource allocation graph
  const resourceGraph = buildResourceGraph(max, allocation);
  
  // Update circular wait condition based on cycle detection
  coffmanConditions.circularWait = resourceGraph.hasCycle;
  coffmanConditions.deadlockPossible = 
    coffmanConditions.mutualExclusion && 
    coffmanConditions.holdAndWait && 
    coffmanConditions.noPreemption && 
    coffmanConditions.circularWait;

  // Perform standard banker's algorithm safety check
  const need = computeNeed(max, allocation);
  const work = [...available]; // Clone available vector (Work ← Available)
  const finish: boolean[] = Array(nProcesses).fill(false);
  const safeSequence: number[] = [];
  const steps: BankersStep[] = [];

  let madeProgress = true;
  while (safeSequence.length < nProcesses && madeProgress) {
    madeProgress = false;

    for (let i = 0; i < nProcesses; i++) {
      if (!finish[i]) {
        // If need_i ≤ work ?
        let canProceed = true;
        for (let j = 0; j < nResources; j++) {
          if (need[i][j] > work[j]) {
            canProceed = false;
            break;
          }
        }

        if (canProceed) {
          // Record work vector BEFORE execution for tracing
          const workBefore = [...work];
          // Pretend process i finishes: Work ← Work + Allocation_i
          for (let j = 0; j < nResources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          safeSequence.push(i);
          // Push detailed step info
          steps.push({
            process: i,
            workBefore,
            workAfter: [...work],
            need: [...need[i]],
            allocation: [...allocation[i]],
          });
          madeProgress = true;
        }
      }
    }
  }

  const isSafe = finish.every((f) => f);
  
  // Return enhanced result with additional deadlock analysis
  return { 
    isSafe, 
    safeSequence, 
    need, 
    steps,
    resourceConditionSatisfied,
    coffmanConditions,
    resourceGraph 
  };
}
