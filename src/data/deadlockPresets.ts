export interface DeadlockPreset {
  name: string;
  max: number[][];
  allocation: number[][];
  available: number[];
}

/*
 * A small collection of textbook-style Banker examples.
 * Dimensions are intentionally small (≤4×4) so students can do the math by hand.
 */
export const deadlockPresets: DeadlockPreset[] = [
  {
    name: "Safe State (classic)",
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3],
    ],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2],
    ],
    available: [3, 3, 2],
  },
  {
    name: "Unsafe (no safe sequence)",
    max: [
      [1, 7, 5, 0],
      [2, 3, 5, 6],
      [7, 5, 3, 4],
      [4, 6, 5, 6],
    ],
    allocation: [
      [0, 1, 0, 0],
      [2, 0, 0, 1],
      [3, 0, 2, 1],
      [2, 1, 1, 0],
    ],
    available: [1, 0, 0, 2],
  },
  {
    name: "Deadlock Present",
    max: [
      [4, 4, 2],
      [2, 2, 2],
      [3, 3, 3],
    ],
    allocation: [
      [2, 2, 2],
      [2, 0, 0],
      [0, 3, 1],
    ],
    available: [0, 0, 0],
  },
  {
    name: "Blank (all zeros)",
    max: Array.from({ length: 3 }, () => Array(3).fill(0)),
    allocation: Array.from({ length: 3 }, () => Array(3).fill(0)),
    available: [0, 0, 0],
  },
];
