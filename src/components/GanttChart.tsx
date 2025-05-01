import React, { useEffect, useRef } from 'react';

interface GanttItem {
  processId: number;
  startTime: number;
  endTime: number;
}

interface GanttChartProps {
  data: GanttItem[];
}

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define colors for processes (up to 10 different colors)
  const colors = [
    '#4fc3f7', // Light Blue
    '#66bb6a', // Light Green
    '#ff8a65', // Light Red
    '#ba68c8', // Light Purple
    '#ffd54f', // Light Yellow
    '#4db6ac', // Light Teal
    '#7986cb', // Light Indigo
    '#fff176', // Light Yellow (slightly different)
    '#ffb74d', // Light Orange
    '#e57373', // Light Red (slightly different)
  ];

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the total time span
    const lastEndTime = Math.max(...data.map(item => item.endTime));
    const firstStartTime = Math.min(...data.map(item => item.startTime));
    const timeSpan = lastEndTime - firstStartTime;

    // Calculate the width of each time unit
    const timeUnitWidth = (canvas.width - 80) / Math.max(timeSpan, 1);
    const barHeight = 60;
    const yStart = 40;

    // Draw the time axis
    ctx.beginPath();
    ctx.moveTo(40, yStart + barHeight + 20);
    ctx.lineTo(canvas.width - 40, yStart + barHeight + 20);
    ctx.stroke();

    // Draw time markers
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    for (let t = firstStartTime; t <= lastEndTime; t++) {
      const x = 40 + (t - firstStartTime) * timeUnitWidth;
      ctx.beginPath();
      ctx.moveTo(x, yStart + barHeight + 15);
      ctx.lineTo(x, yStart + barHeight + 25);
      ctx.stroke();
      ctx.fillText(t.toString(), x, yStart + barHeight + 40);
    }

    // Draw the Gantt bars
    data.forEach((item) => {
      const x = 40 + (item.startTime - firstStartTime) * timeUnitWidth;
      const width = (item.endTime - item.startTime) * timeUnitWidth;
      
      // Use color based on process ID (cycle through colors array)
      const colorIndex = (item.processId - 1) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      
      // Draw the bar
      ctx.fillRect(x, yStart, width, barHeight);
      ctx.strokeRect(x, yStart, width, barHeight);
      
      // Draw the process ID
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`P${item.processId}`, x + width / 2, yStart + barHeight / 2);
    });

  }, [data, colors]);

  return (
    <div className="gantt-chart">
      {data.length === 0 ? (
        <div className="no-data">No simulation data available.</div>
      ) : (
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={150} 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
    </div>
  );
};

export default GanttChart; 