import React from 'react';

interface GanttItem {
  processId: number;
  startTime: number;
  endTime: number;
}

interface GanttChartProps {
  data: GanttItem[];
}

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  return (
    <div>
      {/* Gantt chart will be implemented here */}
    </div>
  );
};

export default GanttChart; 