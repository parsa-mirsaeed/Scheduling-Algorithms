import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

type LanguageToggleProps = {
  className?: string;
};

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button 
      onClick={toggleLanguage} 
      className={`language-toggle ${className}`}
      title={language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
    >
      {language === 'fa' ? 'EN' : 'فا'}
    </button>
  );
};

export default LanguageToggle;
