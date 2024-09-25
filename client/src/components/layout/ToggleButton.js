import React from 'react'; // Importing React and useState for managing state
import './ToggleButton.css'; // Importing CSS styles for the toggle button component

// ToggleButton component definition
const ToggleButton = ({
  isDefault, // Boolean indicating which button is active
  setisDefault, // Function to update the active state
  defaultOption, // Text for the default option button
  secondOption, // Text for the second option button
  setSelected, // Function to reset the selected value
}) => {
  // Function to handle toggle button clicks
  const handleToggle = () => {
    setisDefault(!isDefault); // Toggle the active state
    setSelected(''); // Reset the selected value
  };

  return (
    <div className='toggle-button'>
      {' '}
      {/* Container for the toggle button */}
      {/* Button for the default option */}
      <button
        className={`toggle-btn ${isDefault ? 'active' : ''}`} // Apply active class based on isDefault
        onClick={handleToggle} // Handle click event
      >
        {defaultOption} {/* Display the default option text */}
      </button>
      {/* Button for the second option */}
      <button
        className={`toggle-btn ${!isDefault ? 'active' : ''}`} // Apply active class if not isDefault
        onClick={handleToggle} // Handle click event
      >
        {secondOption} {/* Display the second option text */}
      </button>
    </div>
  );
};

export default ToggleButton; // Exporting the ToggleButton component for use in other parts of the application
