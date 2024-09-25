import { useState } from 'react'; // Importing useState hook for managing local state
import './Dropdown.css'; // Importing the CSS styles for the dropdown component

const Dropdown = ({ selected, setSelected, options }) => {
  // State to manage whether the dropdown is active (open)
  const [isActive, setIsActive] = useState(false);

  return (
    <div className='dropdown-container'>
      {' '}
      {/* Main container for the dropdown */}
      <div
        className='dropdown-btn' // Button to toggle dropdown visibility
        onClick={() => setIsActive(!isActive)} // Toggle the active state on click
      >
        {selected === '' ? 'Choose One' : selected}{' '}
        {/* Display selected option or default text */}
        <div className={isActive ? 'caret open' : 'caret'}></div>{' '}
        {/* Caret icon indicating dropdown state */}
      </div>
      {/* Conditional rendering of dropdown content when isActive is true */}
      {isActive && (
        <div className='dropdown-content'>
          {' '}
          {/* Container for dropdown items */}
          {options.map(
            (
              option // Iterate over each option passed as props
            ) => (
              <div
                key={option.fileName} // Unique key for each dropdown item, ensures optimal rendering
                onClick={() => {
                  // Handle option selection
                  setSelected(option.fileName); // Set the selected option
                  setIsActive(false); // Close the dropdown
                }}
                className='dropdown-item' // Styling for dropdown items
              >
                {option.fileName} {/* Display the fileName for each option */}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown; // Exporting the Dropdown component for use in other files
