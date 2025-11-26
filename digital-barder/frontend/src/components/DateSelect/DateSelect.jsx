import React, { useState, useRef, useEffect } from 'react';
import './DateSelect.css';

const DateSelect = ({ 
  options, 
  placeholder, 
  value, 
  onChange, 
  className = "",
  type = "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel = value 
    ? options.find(opt => opt.value === value)?.label 
    : placeholder;

  return (
    <div className={`date-select-container ${className} ${type}`} ref={selectRef}>
      <button
        type="button"
        className="date-select-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <span className={`date-select-arrow ${isOpen ? 'open' : ''}`}>‹</span>
      </button>
      
      {isOpen && (
        <div className="date-select-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`date-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateSelect;