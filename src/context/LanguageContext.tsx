import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define available languages
type Language = 'fa' | 'en';

// Define translations for metrics sections
interface Translations {
  // Headers
  'average_waiting_time': string;
  'average_turnaround_time': string;
  'cpu_utilization': string;
  'cpu_efficiency': string;
  'throughput': string;
  'little_law': string;
  'avg_burst_time': string;
  
  // Common terms
  'formula': string;
  'step_1': string;
  'step_2': string;
  'step_3': string;
  'calculation': string;
  'result': string;
  'check': string;
  'correct': string;
  'discrepancy': string;
  'processes_time_unit': string;
  'processes': string;
  'where': string;
  
  // Little's Law parameters
  'avg_num_processes_ready_queue': string;
  'avg_waiting_time_param': string;
  'avg_arrival_rate_ready_queue': string;
  
  // Formula terms
  'cpu_efficiency_calc': string;
  'processing_time': string;
  'total_processing_time': string;
}

// Define all translations
const translations: Record<Language, Translations> = {
  fa: {
    'average_waiting_time': 'میانگین زمان انتظار (Avg. WT)',
    'average_turnaround_time': 'میانگین زمان پاسخ (Avg. TAT)',
    'cpu_utilization': 'بهره وری CPU (CPU Utilization)',
    'cpu_efficiency': 'راندمان CPU (CPU Efficiency)',
    'throughput': 'توان عملیاتی (Throughput)',
    'little_law': 'قانون لیتل - تعداد پردازش‌های صف آماده (Little\'s Law)',
    'avg_burst_time': 'میانگین زمان اجرا (Avg. Burst Time)',
    
    'formula': 'Formula:',
    'step_1': 'Step 1:',
    'step_2': 'Step 2:',
    'step_3': 'Step 3:',
    'calculation': 'Calculation:',
    'result': 'Result:',
    'check': 'Check:',
    'correct': '✓ Correct',
    'discrepancy': '✗ Discrepancy',
    'processes_time_unit': 'processes/time unit',
    'processes': 'processes',
    'where': 'Where:',
    
    // Little's Law parameters
    'avg_num_processes_ready_queue': 'تعداد متوسط پردازش های صف ready',
    'avg_waiting_time_param': 'میانگین زمان انتظار',
    'avg_arrival_rate_ready_queue': 'میانگین نرخ ورود به صف ready',
    
    // Formula terms
    'cpu_efficiency_calc': 'راندمان CPU',
    'processing_time': 'زمان پردازش',
    'total_processing_time': 'زمان کل پردازش',
  },
  en: {
    'average_waiting_time': 'Average Waiting Time (Avg. WT)',
    'average_turnaround_time': 'Average Turnaround Time (Avg. TAT)',
    'cpu_utilization': 'CPU Utilization',
    'cpu_efficiency': 'CPU Efficiency',
    'throughput': 'Throughput',
    'little_law': 'Little\'s Law - Number of Ready Queue Processes',
    'avg_burst_time': 'Average Burst Time',
    
    'formula': 'Formula:',
    'step_1': 'Step 1:',
    'step_2': 'Step 2:',
    'step_3': 'Step 3:',
    'calculation': 'Calculation:',
    'result': 'Result:',
    'check': 'Check:',
    'correct': '✓ Correct',
    'discrepancy': '✗ Discrepancy',
    'processes_time_unit': 'processes/time unit',
    'processes': 'processes',
    'where': 'Where:',
    
    // Little's Law parameters
    'avg_num_processes_ready_queue': 'Average number of processes in ready queue',
    'avg_waiting_time_param': 'Average waiting time',
    'avg_arrival_rate_ready_queue': 'Average arrival rate to ready queue',
    
    // Formula terms
    'cpu_efficiency_calc': 'CPU Efficiency',
    'processing_time': 'Processing time',
    'total_processing_time': 'Total processing time',
  }
};

// Define context type
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fa' ? 'en' : 'fa');
  };
  
  // Translation function
  const t = (key: keyof Translations): string => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for using the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
