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
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    // Collect all unique time points (process transitions)
    const timePoints = new Set<number>();
    timePoints.add(firstStartTime);
    timePoints.add(lastEndTime);
    data.forEach(item => {
      timePoints.add(item.startTime);
      timePoints.add(item.endTime);
    });
    const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);

    // Draw time markers
    ctx.textAlign = 'center';
    
    // Draw all integer time points with minor styling
    for (let t = firstStartTime; t <= lastEndTime; t++) {
      const x = 40 + (t - firstStartTime) * timeUnitWidth;
      ctx.beginPath();
      
      // Use shorter lines for regular time points
      ctx.moveTo(x, yStart + barHeight + 15);
      ctx.lineTo(x, yStart + barHeight + 25);
      ctx.strokeStyle = '#aaaaaa';
      ctx.stroke();
      
      // Smaller font for regular time points
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(t.toString(), x, yStart + barHeight + 40);
    }
    
    // Draw transition points with enhanced styling
    sortedTimePoints.forEach(t => {
      const x = 40 + (t - firstStartTime) * timeUnitWidth;
      
      // Draw taller line for transition points
      ctx.beginPath();
      ctx.moveTo(x, yStart + barHeight + 10);
      ctx.lineTo(x, yStart + barHeight + 30);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      
      // Larger, bold font for transition points
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#000000';
      // Draw with a slight offset to make it stand out
      ctx.fillText(t.toString(), x, yStart + barHeight + 45);
      
      // Add decorative marker for better visibility
      ctx.beginPath();
      ctx.arc(x, yStart + barHeight + 20, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#166088';
      ctx.fill();
    });

    // Draw the Gantt bars
    data.forEach((item) => {
      const x = 40 + (item.startTime - firstStartTime) * timeUnitWidth;
      const width = (item.endTime - item.startTime) * timeUnitWidth;
      
      // Use color based on process ID (cycle through colors array)
      const colorIndex = (item.processId - 1) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      
      // Draw the bar
      ctx.fillRect(x, yStart, width, barHeight);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
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
          height={180} 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
    </div>
  );
};

export default GanttChart; 