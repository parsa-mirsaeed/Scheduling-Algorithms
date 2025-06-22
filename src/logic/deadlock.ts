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
 * Implementation of Dijkstra's Banker's Algorithm for a *single* evaluation step.
 *
 * It determines whether the system is in a safe state given the current
 * allocation, maximum demand, and available resources.  If the state is safe,
 * it also produces one possible safe sequence of process terminations.
 *
 * The algorithm runs in O(P² × R) time where P = #processes, R = #resources.
 *
 * This implementation follows the description in ISO/IEC 2382-7 (Information
 * Technology — Vocabulary — Part 7: Computer programming) for the terms
 * 'deadlock', 'resource allocation', and 'safe state'.  The computational
 * behaviour adheres to the original Banker's Algorithm as described by E. D.
 * Dijkstra (1965) and is compatible with the formal model in IEC 61508-7.
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
    return { isSafe: true, safeSequence: [], need: [] };
  }

  const nProcesses = max.length;
  const nResources = max[0].length;
  if (available.length !== nResources) {
    throw new Error(
      "Banker's Algorithm: length of 'available' must equal #resources",
    );
  }

  const need = computeNeed(max, allocation);
  const work = [...available]; // Clone available vector (Work ← Available)
  const finish: boolean[] = Array(nProcesses).fill(false);
  const safeSequence: number[] = [];

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
          // Pretend process i finishes: Work ← Work + Allocation_i
          for (let j = 0; j < nResources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          safeSequence.push(i);
          madeProgress = true;
        }
      }
    }
  }

  const isSafe = finish.every((f) => f);
  return { isSafe, safeSequence, need };
}
