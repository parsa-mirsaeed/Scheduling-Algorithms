export interface ProcessTemplate {
  arrivalTime: number;
  burstTime: number;
}

export interface ProcessPreset {
  name: string;
  processes: ProcessTemplate[];
}

export const processPresets: ProcessPreset[] = [
  {
    name: 'Select a Preset...',
    processes: []
  },
  {
    name: 'Basic Sequential (Low Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 5 },
      { arrivalTime: 2, burstTime: 3 },
      { arrivalTime: 4, burstTime: 6 },
      { arrivalTime: 6, burstTime: 2 },
    ],
  },
  {
    name: 'Simultaneous Arrivals (Medium Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 8 },
      { arrivalTime: 0, burstTime: 4 },
      { arrivalTime: 0, burstTime: 2 },
      { arrivalTime: 0, burstTime: 5 },
    ],
  },
  {
    name: 'Increasing Bursts (Low Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 2 },
      { arrivalTime: 1, burstTime: 4 },
      { arrivalTime: 3, burstTime: 6 },
      { arrivalTime: 5, burstTime: 8 },
    ],
  },
  {
    name: 'Decreasing Bursts (High Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 8 },
      { arrivalTime: 2, burstTime: 6 },
      { arrivalTime: 4, burstTime: 4 },
      { arrivalTime: 6, burstTime: 2 }, // Short job arrives late
    ],
  },
  {
    name: 'Mixed Bursts (High Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 7 },
      { arrivalTime: 1, burstTime: 3 }, // Short
      { arrivalTime: 2, burstTime: 8 },
      { arrivalTime: 3, burstTime: 2 }, // Short
    ],
  },
  {
    name: 'SRT Challenge - Preemption (High Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 10 }, // Long job starts
      { arrivalTime: 1, burstTime: 1 },  // Very short job arrives
      { arrivalTime: 3, burstTime: 4 },
      { arrivalTime: 5, burstTime: 3 },
    ],
  },
  {
    name: 'Round Robin Focus (Medium Complexity)',
    processes: [
      { arrivalTime: 0, burstTime: 5 },
      { arrivalTime: 1, burstTime: 6 },
      { arrivalTime: 2, burstTime: 5 },
      { arrivalTime: 3, burstTime: 7 }, // Similar lengths, staggered
    ],
  },
]; 