import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Process } from "../logic/scheduler";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

interface ResultsDisplayProps {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number;
  processes: Process[];
  algorithmType: string;
  cpuEfficiency?: number;
  throughput?: number;
  avgReadyQueueLength?: number;
  arrivalRate?: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  averageTurnaroundTime,
  averageWaitingTime,
  // averageResponseTime, // Not displayed directly
  cpuUtilization,
  processes,
  algorithmType,
  cpuEfficiency,
  throughput,
  avgReadyQueueLength,
  arrivalRate
}) => {
  // Get translations from language context
  const { t } = useLanguage();
  
  // Format number to 2 decimal places, or show integer if it's whole
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  // Check if the algorithm is preemptive
  const isPreemptive = algorithmType === "RR" || algorithmType === "SRT";

  const numProcesses = processes.length > 0 ? processes.length : 1;

  // --- Waiting Time Calculations ---
  const totalWaitingTime = processes.reduce(
    (sum, p) => sum + (p.waitingTime ?? 0),
    0,
  );

  // Create detailed string showing the calculation for each process
  const waitingTimeTerms = processes.map((p) => {
    const term = isPreemptive
      ? `((${p.completionTime ?? 0}-${p.arrivalTime})-${p.burstTime})`
      : `(${p.startTime ?? 0}-${p.arrivalTime})`;
    return { id: `P${p.id}`, term, value: p.waitingTime ?? 0 };
  });

  const waitingFormula = isPreemptive
    ? `\\text{Avg WT} = \\frac{\\sum (\\text{TAT} - \\text{BT})}{\\text{n}}`
    : `\\text{Avg WT} = \\frac{\\sum (\\text{Start Time} - \\text{AT})}{\\text{n}}`;

  const waitingStep3 = `\\text{Avg WT} = \\frac{${formatNumber(totalWaitingTime)}}{${numProcesses}}`;
  const waitingResult = formatNumber(averageWaitingTime);

  // --- Turnaround Time Calculations ---
  const totalTurnaroundTime = processes.reduce(
    (sum, p) => sum + (p.turnaroundTime ?? 0),
    0,
  );

  // Create detailed string showing the calculation for each process with process IDs
  const tatTerms = processes.map((p) => {
    const term = `(${p.completionTime ?? 0}-${p.arrivalTime})`;
    return { id: `P${p.id}`, term, value: p.turnaroundTime ?? 0 };
  });

  const turnaroundFormula = `\\text{Avg TAT} = \\frac{\\sum (\\text{CT} - \\text{AT})}{\\text{n}}`;
  const turnaroundStep3 = `\\text{Avg TAT} = \\frac{${formatNumber(totalTurnaroundTime)}}{${numProcesses}}`;
  const turnaroundResult = formatNumber(averageTurnaroundTime);

  // --- CPU Utilization Calculations ---
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const lastCompletionTime = Math.max(
    ...processes.map((p) => p.completionTime || 0),
  );

  const cpuUtilizationFormula = `\\text{CPU Utilization} = \\frac{\\sum \\text{BT}}{\\text{Total Time}} \\times 100`;
  const cpuUtilizationStep = `\\text{CPU Utilization} = \\frac{${formatNumber(totalBurstTime)}}{${formatNumber(lastCompletionTime)}} \\times 100`;
  const cpuUtilizationResult = formatNumber(cpuUtilization);

  // --- Average Burst Time ---
  const averageBurstTime = totalBurstTime / numProcesses;
  const avgBurstTimeResult = formatNumber(averageBurstTime);

  // --- Relationship Formula ---
  const relationshipFormula = `\\text{Avg TAT} = \\text{Avg WT} + \\text{Avg BT}`;
  const relationshipCheck = `${turnaroundResult} = ${waitingResult} + ${avgBurstTimeResult}`;
  
  // --- CPU Efficiency Calculations ---
  const cpuEfficiencyFormula = `\\text{راندمان CPU} = \\frac{\\text{زمان پردازش}}{\\text{زمان کل پردازش}}`;
  const cpuEfficiencyResult = formatNumber(cpuEfficiency || 0);
  
  // --- Throughput Calculations ---
  const throughputFormula = `\\text{توان عملیاتی} = \\frac{\\text{تعداد پردازش ها}}{\\text{زمان کل}}`;
  const throughputStep = `\\text{توان عملیاتی} = \\frac{${numProcesses}}{${formatNumber(lastCompletionTime)}}`;
  const throughputResult = formatNumber(throughput || 0);
  
  // --- Little's Law Calculations ---
  const littleLawFormula = `n = \\lambda \\times \\omega`;
  const littleLawStep = `n = ${formatNumber(averageWaitingTime)} \\times ${formatNumber(arrivalRate || 0)}`;
  const littleLawResult = formatNumber(avgReadyQueueLength || 0);

  return (
    <div className="results-display">
      <LanguageToggle className="language-toggle-results" />
      <div className="metrics detailed-calculation">
        {/* Average Waiting Time Metric */}
        <div className="metric">
          <h3>{t('average_waiting_time')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong> <InlineMath math={waitingFormula} />
            </p>
            <div className="formula-breakdown">
              <strong>Step 1:</strong>
              <div className="formula-terms">
                {waitingTimeTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <InlineMath math={item.term} />
                  </div>
                ))}
              </div>
            </div>
            <div className="formula-breakdown">
              <strong>Step 2:</strong>
              <div className="formula-terms">
                {waitingTimeTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <span>{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p>
              <strong>{t('step_3')}</strong> <InlineMath math={waitingStep3} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {waitingResult}
            </p>
          </div>
        </div>

        {/* Average Turnaround Time Metric */}
        <div className="metric">
          <h3>{t('average_turnaround_time')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong> <InlineMath math={turnaroundFormula} />
            </p>
            <div className="formula-breakdown">
              <strong>Step 1:</strong>
              <div className="formula-terms">
                {tatTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <InlineMath math={item.term} />
                  </div>
                ))}
              </div>
            </div>
            <div className="formula-breakdown">
              <strong>Step 2:</strong>
              <div className="formula-terms">
                {tatTerms.map((item, idx) => (
                  <div key={idx} className="formula-term">
                    <span className="process-id">{item.id}:</span>
                    <span>{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p>
              <strong>{t('step_3')}</strong> <InlineMath math={turnaroundStep3} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {turnaroundResult}
            </p>
          </div>
        </div>

        {/* CPU Utilization Metric */}
        <div className="metric">
          <h3>{t('cpu_utilization')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong>{" "}
              <InlineMath math={cpuUtilizationFormula} />
            </p>
            <p>
              <strong>{t('calculation')}</strong>{" "}
              <InlineMath math={cpuUtilizationStep} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {cpuUtilizationResult}%
            </p>
          </div>
        </div>

        {/* CPU Efficiency (Gemini-inspired) */}
        <div className="metric">
          <h3>{t('cpu_efficiency')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong>{" "}
              <InlineMath math={cpuEfficiencyFormula} />
            </p>
            <p>
              <strong>Calculation:</strong>{" "}
              <InlineMath math={`\\text{راندمان CPU} = ${cpuEfficiencyResult}`} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {cpuEfficiencyResult}
            </p>
          </div>
        </div>

        {/* Throughput (Gemini-inspired) */}
        <div className="metric">
          <h3>{t('throughput')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong>{" "}
              <InlineMath math={throughputFormula} />
            </p>
            <p>
              <strong>{t('calculation')}</strong>{" "}
              <InlineMath math={throughputStep} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {throughputResult} {t('processes_time_unit')}
            </p>
          </div>
        </div>
        
        {/* Little's Law / Aging */}
        <div className="metric">
          <h3>{t('little_law')}</h3>
          <div className="metric-step-by-step">
            <p>
              <strong>{t('formula')}</strong>{" "}
              <InlineMath math={littleLawFormula} />
            </p>
            <p>{t('where')}</p>
            <ul>
              <li><InlineMath math={"n"} /> = تعداد متوسط پردازش های صف ready</li>
              <li><InlineMath math={"\\lambda"} /> = میانگین زمان انتظار = {formatNumber(averageWaitingTime)}</li>
              <li><InlineMath math={"\\omega"} /> = میانگین نرخ ورود به صف ready = {formatNumber(arrivalRate || 0)}</li>
            </ul>
            <p>
              <strong>{t('calculation')}</strong>{" "}
              <InlineMath math={littleLawStep} />
            </p>
          </div>
          <div className="metric-result">
            <p>
              <strong>{t('result')}</strong> {littleLawResult} {t('processes')}
            </p>
          </div>
        </div>

        {/* Average Burst Time & Relationship */}
        <div className="metric-summary">
          <p>
            <strong>{t('avg_burst_time')}:</strong>{" "}
            {avgBurstTimeResult}
          </p>
          <div className="metric-relationship">
            <p>
              <strong>{t('check')}</strong> <InlineMath math={relationshipFormula} />
            </p>
            <p>
              <InlineMath math={relationshipCheck} />
            </p>
            {Math.abs(
              averageTurnaroundTime - (averageWaitingTime + averageBurstTime),
            ) < 0.01 ? (
              <span className="check-ok">{t('correct')}</span>
            ) : (
              <span className="check-error">{t('discrepancy')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
