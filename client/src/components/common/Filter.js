import React, { useState } from 'react';
import './Filter.css';
import Button from './Button';

/**
 * @function Filter
 * @desc    Renders a filter form that allows the user to filter by date and status.
 *          The user can reset the filters with a button.
 * @access  Public
 *
 * @param {string} date - The currently selected date for filtering.
 * @param {function} setDate - Callback function to update the selected date.
 * @param {string} status - The currently selected status for filtering.
 * @param {function} setStatus - Callback function to update the selected status.
 *
 * @returns {JSX.Element} - The rendered filter form component with a reset button.
 */
const Filter = ({ date, setDate, status, setStatus }) => {
  const HandleResetFilters = () => {
    setDate('');
    setStatus('All');
  };

  return (
    <div className='filter-container'>
      <div className='filter-item'>
        <label htmlFor='filter-date'>Filter by Date:</label>
        <input
          type='date'
          id='filter-date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className='filter-item'>
        <label htmlFor='filter-status'>Filter by Status:</label>
        <select
          id='filter-status'
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value='All'>All</option>
          <option value='Success'>Success</option>
          <option value='Failure'>Failure</option>
        </select>
      </div>

      <div className='filter-item'>
        <Button onClick={HandleResetFilters} title='Reset Filters' />
      </div>
    </div>
  );
};

export default Filter;
