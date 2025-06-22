import React, { useEffect, useRef } from "react";

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

  // Define process colors from CSS variables
  // We'll extract these at runtime from the :root CSS variables
  const getProcessColors = (): string[] => {
    const style = getComputedStyle(document.documentElement);
    const defaultColors = [
      "#3f51b5", // Indigo
      "#00bcd4", // Cyan
      "#ff9800", // Orange
      "#f44336", // Red
      "#4caf50", // Green
      "#9c27b0", // Purple
      "#e91e63", // Pink
      "#ffeb3b", // Yellow
      "#03a9f4", // Light Blue
      "#673ab7", // Deep Purple
    ];

    try {
      // Try to get colors from CSS variables
      const cssColors = style.getPropertyValue("--process-colors").split(",");
      return cssColors.length > 0 ? cssColors : defaultColors;
    } catch {
      return defaultColors;
    }
  };

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with higher DPI for better quality on retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Get design tokens from Gemini-inspired palette
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue("--g-text").trim() || "#e4e7ef";
    const textMutedColor = style.getPropertyValue("--g-text-muted").trim() || "#a1a5b7";
    const surfaceColor = style.getPropertyValue("--g-bg").trim() || "#0f111a";
    const gridColor = style.getPropertyValue("--g-surface").trim() || "#161925";

    // Get colors for processes
    const colors = getProcessColors();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = surfaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the total time span
    const lastEndTime = Math.max(...data.map((item) => item.endTime), 0);
    const firstStartTime = Math.min(...data.map((item) => item.startTime), 0);
    const timeSpan = lastEndTime - firstStartTime;

    // Calculate the width of each time unit
    const timeUnitWidth = (rect.width - 80) / Math.max(timeSpan, 1);
    const barHeight = 60;
    const yStart = 40;

    // Draw background grid for better readability
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Draw vertical grid lines
    for (let t = firstStartTime; t <= lastEndTime; t++) {
      const x = 40 + (t - firstStartTime) * timeUnitWidth;
      ctx.beginPath();
      ctx.moveTo(x, yStart - 10);
      ctx.lineTo(x, yStart + barHeight + 30);
      ctx.stroke();
    }

    // Draw the time axis
    ctx.beginPath();
    ctx.moveTo(40, yStart + barHeight + 20);
    ctx.lineTo(rect.width - 40, yStart + barHeight + 20);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    // Collect all unique time points (process transitions)
    const timePoints = new Set<number>();
    timePoints.add(firstStartTime);
    timePoints.add(lastEndTime);
    data.forEach((item) => {
      timePoints.add(item.startTime);
      timePoints.add(item.endTime);
    });
    const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);

    // Draw time markers
    ctx.textAlign = "center";

    // Draw all integer time points with minor styling
    for (let t = firstStartTime; t <= lastEndTime; t++) {
      // Check if this is a transition point
      const isTransition = sortedTimePoints.includes(t);

      const x = 40 + (t - firstStartTime) * timeUnitWidth;
      ctx.beginPath();

      if (isTransition) {
        // Enhanced styling for transition points
        ctx.moveTo(x, yStart + barHeight + 10);
        ctx.lineTo(x, yStart + barHeight + 30);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;

        // Larger, bold font for transition points
        ctx.font = "bold 12px Inter, Roboto, sans-serif";
        ctx.fillStyle = textColor;
        ctx.fillText(t.toString(), x, yStart + barHeight + 45);

        // Add decorative marker for better visibility
        ctx.beginPath();
        ctx.arc(x, yStart + barHeight + 20, 3, 0, Math.PI * 2);
        ctx.fillStyle = textMutedColor;
        ctx.fill();
      } else {
        // Use shorter lines for regular time points
        ctx.moveTo(x, yStart + barHeight + 15);
        ctx.lineTo(x, yStart + barHeight + 25);
        ctx.strokeStyle = textMutedColor;
        ctx.stroke();

        // Smaller font for regular time points
        ctx.font = "10px Inter, Roboto, sans-serif";
        ctx.fillStyle = textMutedColor;
        ctx.fillText(t.toString(), x, yStart + barHeight + 40);
      }
    }

    // Draw process labels on the left side
    const uniqueProcessIds = [
      ...new Set(data.map((item) => item.processId)),
    ].sort((a, b) => a - b);

    ctx.textAlign = "right";
    ctx.font = "bold 12px Inter, Roboto, sans-serif";
    uniqueProcessIds.forEach((id) => {
      ctx.fillStyle = textColor;
      ctx.fillText(`P${id}`, 35, yStart + barHeight / 2);
    });

    // Draw the Gantt bars with rounded corners
    data.forEach((item) => {
      const x = 40 + (item.startTime - firstStartTime) * timeUnitWidth;
      const width = (item.endTime - item.startTime) * timeUnitWidth;

      let barColor: string;
      let label: string;
      let showDuration = true;

      // Handle context switch blocks
      if (item.processId === -1) {
        barColor = "#4a4a4a"; // A neutral grey color for context switch
        label = "CS";
        showDuration = false; // Don't show duration for CS
      } else {
        // Use color based on process ID (cycle through colors array)
        // Ensure processId is positive and 1-based for indexing
        const colorIndex = Math.max(0, item.processId - 1) % colors.length;
        barColor = colors[colorIndex];
        label = `P${item.processId}`;
      }

      // Set fill style
      ctx.fillStyle = barColor;

      // Draw rounded rectangle for the bar
      const radius = Math.min(8, Math.max(0, width) / 2); // Ensure radius isn't negative
      ctx.beginPath();
      ctx.moveTo(x + radius, yStart);
      ctx.lineTo(x + width - radius, yStart);
      ctx.quadraticCurveTo(x + width, yStart, x + width, yStart + radius);
      ctx.lineTo(x + width, yStart + barHeight - radius);
      ctx.quadraticCurveTo(
        x + width,
        yStart + barHeight,
        x + width - radius,
        yStart + barHeight,
      );
      ctx.lineTo(x + radius, yStart + barHeight);
      ctx.quadraticCurveTo(x, yStart + barHeight, x, yStart + barHeight - radius);
      ctx.lineTo(x, yStart + radius);
      ctx.quadraticCurveTo(x, yStart, x + radius, yStart);
      ctx.closePath();
      ctx.fill();

      // Draw text inside the bar
      ctx.fillStyle = "#ffffff"; // White text for better contrast
      ctx.font = "bold 12px Inter, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const barCenter = x + width / 2;

      // Only draw text if the bar is wide enough
      if (width > 20) {
        ctx.fillText(label, barCenter, yStart + barHeight / 2 - 8);
        if (showDuration) {
          ctx.font = "10px Inter, Roboto, sans-serif";
          ctx.fillText(
            `(${(item.endTime - item.startTime).toFixed(1)})`,
            barCenter,
            yStart + barHeight / 2 + 10,
          );
        }
      }
    });
  }, [data]);

  return (
    <div className="gantt-chart">
      {data.length === 0 ? (
        <div className="no-data">No simulation data available.</div>
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={180}
          style={{ width: "100%", height: "auto" }}
        />
      )}
    </div>
  );
};

export default GanttChart;
