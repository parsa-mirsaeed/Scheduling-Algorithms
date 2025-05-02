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

    // Get design tokens from CSS
    const style = getComputedStyle(document.documentElement);
    const primaryColor =
      style.getPropertyValue("--primary-color").trim() || "#3f51b5";
    const secondaryColor =
      style.getPropertyValue("--secondary-color").trim() || "#00bcd4";
    const textPrimary =
      style.getPropertyValue("--text-primary").trim() || "#212121";
    const textSecondary =
      style.getPropertyValue("--text-secondary").trim() || "#757575";
    const surfaceColor =
      style.getPropertyValue("--surface").trim() || "#ffffff";

    // Get colors for processes
    const colors = getProcessColors();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = surfaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the total time span
    const lastEndTime = Math.max(...data.map((item) => item.endTime));
    const firstStartTime = Math.min(...data.map((item) => item.startTime));
    const timeSpan = lastEndTime - firstStartTime;

    // Calculate the width of each time unit
    const timeUnitWidth = (rect.width - 80) / Math.max(timeSpan, 1);
    const barHeight = 60;
    const yStart = 40;

    // Draw background grid for better readability
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
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
    ctx.strokeStyle = textPrimary;
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
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;

        // Larger, bold font for transition points
        ctx.font = "bold 12px Inter, Roboto, sans-serif";
        ctx.fillStyle = primaryColor;
        ctx.fillText(t.toString(), x, yStart + barHeight + 45);

        // Add decorative marker for better visibility
        ctx.beginPath();
        ctx.arc(x, yStart + barHeight + 20, 3, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.fill();
      } else {
        // Use shorter lines for regular time points
        ctx.moveTo(x, yStart + barHeight + 15);
        ctx.lineTo(x, yStart + barHeight + 25);
        ctx.strokeStyle = textSecondary;
        ctx.stroke();

        // Smaller font for regular time points
        ctx.font = "10px Inter, Roboto, sans-serif";
        ctx.fillStyle = textSecondary;
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
      ctx.fillStyle = textPrimary;
      ctx.fillText(`P${id}`, 35, yStart + barHeight / 2);
    });

    // Draw the Gantt bars with rounded corners
    data.forEach((item) => {
      const x = 40 + (item.startTime - firstStartTime) * timeUnitWidth;
      const width = (item.endTime - item.startTime) * timeUnitWidth;

      // Use color based on process ID (cycle through colors array)
      const colorIndex = (item.processId - 1) % colors.length;
      ctx.fillStyle = colors[colorIndex];

      // Draw rounded rectangle for the bar
      const radius = Math.min(8, width / 2); // Avoid too large radius for small bars
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
      ctx.quadraticCurveTo(
        x,
        yStart + barHeight,
        x,
        yStart + barHeight - radius,
      );
      ctx.lineTo(x, yStart + radius);
      ctx.quadraticCurveTo(x, yStart, x + radius, yStart);
      ctx.closePath();
      ctx.fill();

      // Draw subtle border
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw the process ID
      ctx.fillStyle = getContrastColor(colors[colorIndex]);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 14px Inter, Roboto, sans-serif";

      // Add time duration if wide enough
      if (width > 50) {
        ctx.fillText(
          `P${item.processId}`,
          x + width / 2,
          yStart + barHeight / 2 - 8,
        );
        ctx.font = "12px Inter, Roboto, sans-serif";
        ctx.fillText(
          `${item.endTime - item.startTime}`,
          x + width / 2,
          yStart + barHeight / 2 + 12,
        );
      } else {
        ctx.fillText(
          `P${item.processId}`,
          x + width / 2,
          yStart + barHeight / 2,
        );
      }
    });
  }, [data]);

  // Helper function to determine text color based on background for contrast
  const getContrastColor = (hexColor: string): string => {
    // Extract RGB components
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance - standard formula for perceived brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

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
