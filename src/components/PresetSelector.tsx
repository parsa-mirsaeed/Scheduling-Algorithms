import React from "react";
import { processPresets } from "../data/presets";
import { Process } from "../logic/scheduler"; // Assuming Process type is exported from scheduler

interface PresetSelectorProps {
  setProcesses: (processes: Process[]) => void;
  resetSimulation: () => void; // Add resetSimulation prop
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  setProcesses,
  resetSimulation,
}) => {
  const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPresetName = event.target.value;
    const preset = processPresets.find((p) => p.name === selectedPresetName);

    if (preset && preset.processes.length > 0) {
      // Map templates to Process objects, adding IDs and remainingTime
      const newProcesses: Process[] = preset.processes.map(
        (template, index) => ({
          ...template,
          id: index + 1,
          remainingTime: template.burstTime,
          // Initialize other fields if necessary (completionTime, turnaroundTime etc.)
          completionTime: undefined,
          turnaroundTime: undefined,
          waitingTime: undefined,
          responseTime: undefined,
          startTime: undefined,
          history: [],
        }),
      );

      resetSimulation(); // Reset simulation state before loading new processes
      setProcesses(newProcesses);
    } else if (preset) {
      // Handle the "Select a Preset..." case or empty presets if necessary
      resetSimulation();
      setProcesses([]); // Clear processes if a non-valid preset is chosen
    }

    // Reset dropdown to default after selection (optional)
    // event.target.value = processPresets[0].name;
  };

  return (
    <div className="preset-selector">
      <label htmlFor="preset-select">Load Preset:</label>
      <select
        id="preset-select"
        onChange={handlePresetChange}
        defaultValue={processPresets[0].name}
      >
        {processPresets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PresetSelector;
