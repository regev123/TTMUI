import React from 'react';
import './Spinner.css';

const Spinner = () => (
  <div class='wrapper-spinner'>
    <div class='center-spiner'>
      <div class='ring-spinner'></div>
      <span class='text-spinner'>loading...</span>
    </div>
  </div>
);

export default Spinner;
