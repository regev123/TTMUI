import React from 'react';
import './Spinner.css';

/**
 * @function Spinner
 * @desc    Renders a loading spinner component with a ring animation and loading text.
 * @access  Public
 *
 * @returns {JSX.Element} - The rendered Spinner component containing an animated ring and a "loading..." text.
 */
const Spinner = () => (
  <div className='wrapper-spinner'>
    <div className='center-spiner'>
      <div className='ring-spinner'></div>
      <span className='text-spinner'>loading...</span>
    </div>
  </div>
);

export default Spinner;
