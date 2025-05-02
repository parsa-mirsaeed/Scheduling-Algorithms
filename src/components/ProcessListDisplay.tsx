import React, { useState } from "react";
import { Process } from "../logic/scheduler";

interface ProcessListDisplayProps {
  processes: Process[];
  onProcessesUpdate?: (updatedProcesses: Process[]) => void;
}

const ProcessListDisplay: React.FC<ProcessListDisplayProps> = ({
  processes,
  onProcessesUpdate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProcesses, setEditedProcesses] = useState<Process[]>(processes);

  const handleChange = (
    processId: number, 
    field: "burstTime" | "arrivalTime", 
    value: string
  ) => {
    const numericValue = parseInt(value, 10);
    
    if (isNaN(numericValue) || numericValue < 0) return;
    
    const newProcesses = editedProcesses.map(process => {
      if (process.id === processId) {
        return { ...process, [field]: numericValue };
      }
      return process;
    });
    
    setEditedProcesses(newProcesses);
  };

  const handleSave = () => {
    if (onProcessesUpdate) {
      onProcessesUpdate(editedProcesses);
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedProcesses(processes);
    setIsEditMode(false);
  };

  React.useEffect(() => {
    setEditedProcesses(processes);
  }, [processes]);

  if (processes.length === 0) {
    return <div className="no-processes">No processes added yet.</div>;
  }

  return (
    <div className="process-list">
      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th className="attribute-header">Attribute</th>
              {processes.map((process) => (
                <th key={process.id}>
                  <span className="process-id">P{process.id}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="attribute-name">Burst Time</td>
              {editedProcesses.map((process) => (
                <td key={process.id}>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => 
                        handleChange(process.id, "burstTime", e.target.value)
                      }
                      className="process-input"
                    />
                  ) : (
                    process.burstTime
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="attribute-name">Arrival Time</td>
              {editedProcesses.map((process) => (
                <td key={process.id}>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => 
                        handleChange(process.id, "arrivalTime", e.target.value)
                      }
                      className="process-input"
                    />
                  ) : (
                    process.arrivalTime
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="process-edit-controls">
        {isEditMode ? (
          <>
            <button className="edit-button save-button" onClick={handleSave}>
              Save Changes
            </button>
            <button className="edit-button cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button 
            className="edit-button" 
            onClick={() => setIsEditMode(true)}
            disabled={!onProcessesUpdate}
          >
            Edit Values
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessListDisplay;
