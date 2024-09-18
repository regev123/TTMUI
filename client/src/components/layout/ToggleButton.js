import React, { useState } from 'react';
import './ToggleButton.css';

const ToggleButton = ({
  isDefault,
  setisDefault,
  defaultOption,
  secondOption,
  setSelected,
}) => {
  const handleToggle = () => {
    setisDefault(!isDefault);
    setSelected('');
  };

  return (
    <div className='toggle-button'>
      <button
        className={`toggle-btn ${isDefault ? 'active' : ''}`}
        onClick={handleToggle}
      >
        {defaultOption}
      </button>
      <button
        className={`toggle-btn ${!isDefault ? 'active' : ''}`}
        onClick={handleToggle}
      >
        {secondOption}
      </button>
    </div>
  );
};

export default ToggleButton;
