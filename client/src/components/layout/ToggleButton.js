import React from 'react';
import './ToggleButton.css';

/**
 * @function ToggleButton
 * @desc    Renders a toggle button component that allows switching between two options.
 *          Updates the state of the active option when clicked.
 * @access  Public
 *
 * @param {boolean} isDefault - Determines if the default option is currently active.
 * @param {function} toggleDefaultState - Function to toggle the state of the default option.
 * @param {string} defaultLabel - The label to display for the default option.
 * @param {string} secondLabel - The label to display for the second option.
 * @param {function} setSelected - Function to reset the selected option when a toggle occurs.
 *
 * @returns {JSX.Element} - The rendered ToggleButton component containing two toggle buttons.
 */
const ToggleButton = ({
  isDefault,
  toggleDefaultState,
  defaultLabel,
  secondLabel,
  setSelected,
}) => {
  const handleButtonClick = (option) => {
    toggleDefaultState(option === 'default');
    setSelected('');
  };

  return (
    <div className='toggle-button'>
      <ToggleButtonItem
        label={defaultLabel}
        isActive={isDefault}
        onClick={() => handleButtonClick('default')}
      />
      <ToggleButtonItem
        label={secondLabel}
        isActive={!isDefault}
        onClick={() => handleButtonClick('second')}
      />
    </div>
  );
};

/**
 * @function ToggleButtonItem
 * @desc    Renders a single toggle button with a label and active state.
 * @access  Private
 *
 * @param {string} label - The label to display on the toggle button.
 * @param {boolean} isActive - Determines if the toggle button is in the active state.
 * @param {function} onClick - The function to call when the button is clicked.
 *
 * @returns {JSX.Element} - The rendered ToggleButtonItem component.
 */
const ToggleButtonItem = ({ label, isActive, onClick }) => (
  <button
    className={`toggle-btn ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default ToggleButton;
