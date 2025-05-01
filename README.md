# CPU Scheduling Algorithms Visualizer

A React-based web application for visualizing and understanding common CPU scheduling algorithms used in operating systems.

## Overview

This application helps students and professionals visualize how different CPU scheduling algorithms work. It provides an interactive interface to input processes with their arrival times and burst times, simulate different scheduling algorithms, and view the resulting Gantt chart and performance metrics.

## Algorithms Implemented

1. **First-In, First-Out (FIFO)**: Also known as First-Come, First-Served (FCFS)
   - Processes are executed in the order they arrive in the ready queue
   - Non-preemptive scheduling algorithm

2. **Shortest Job First (SJF)**
   - Selects the process with the smallest burst time
   - Non-preemptive scheduling algorithm

3. **Shortest Remaining Time (SRT)**
   - Preemptive version of SJF
   - If a new process arrives with a burst time less than the remaining time of the current process, the CPU is preempted

4. **Round Robin (RR)**
   - Each process is assigned a fixed time slice called a quantum
   - Preemptive scheduling algorithm
   - If a process requires more than one quantum, it's placed at the back of the ready queue

## Metrics Displayed

- **Average Turnaround Time**: Average time from process arrival to completion
- **Average Waiting Time**: Average time spent waiting in the ready queue
- **Average Response Time**: Average time from arrival until first execution

## Technologies Used

- **React 18**: Frontend library for building user interfaces
- **TypeScript**: Adds static type checking to JavaScript
- **Vite**: Modern build tool for fast development
- **HTML5 Canvas API**: For rendering the Gantt chart visualization

## Standards Followed

- **ECMAScript 2020+**: Modern JavaScript features for code clarity and efficiency
- **W3C Standards**: HTML5 and CSS3 for markup and styling
- **ISO/IEC 25010**: Quality standards for software products (maintainability, usability)
- **React Best Practices**: Component-based architecture, hooks for state management

## Setup and Running

### Prerequisites

- Node.js (v14.0.0 or later)
- Yarn or npm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd scheduling-visualizer
   ```

2. Install dependencies:

   ```bash
   yarn
   # or
   npm install
   ```

3. Start the development server:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Add Processes**: Enter arrival time and burst time for each process and click "Add Process"
2. **Select Algorithm**: Choose one of the available scheduling algorithms (FIFO, SJF, SRT, RR)
3. **Set Time Quantum**: For Round Robin algorithm, specify the time quantum
4. **Start Simulation**: Click the "Start Simulation" button to run the algorithm
5. **View Results**: See the Gantt chart visualization and performance metrics
6. **Reset**: Click "Reset" to clear the results and try another algorithm

## Future Enhancements

- Additional algorithms (Priority Scheduling, Multilevel Queue)
- Process priority as an input parameter
- Animation of the scheduling process
- Comparison view for multiple algorithms
- Exportable results

## License

This project is released under the MIT License.

## Contributors

- [Your Name](https://github.com/yourusername)

---

Created in 2025 as an educational tool for understanding Operating System scheduling algorithms.
