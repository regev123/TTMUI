import React from 'react'; // Import React to create the component
import './Spinner.css'; // Import the associated CSS for styling the spinner

// Spinner component definition
const Spinner = () => (
  // Wrapper for the entire spinner component
  <div className='wrapper-spinner'>
    {/* Center the spinner elements within the viewport */}
    <div className='center-spiner'>
      {/* The ring element that creates the spinning effect */}
      <div className='ring-spinner'></div>
      {/* Text to indicate loading status */}
      <span className='text-spinner'>loading...</span>
    </div>
  </div>
);

// Export the Spinner component for use in other parts of the application
export default Spinner;
