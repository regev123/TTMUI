import { useState } from 'react';
import './Dropdown.css';

/**
 * @function Dropdown
 * @desc    Renders a dropdown menu where the user can select an option from a list.
 *          The dropdown can be toggled open or closed and displays a selected value.
 * @access  Public
 *
 * @param {string} selected - The currently selected option from the dropdown.
 * @param {function} setSelected - Callback function to update the selected value.
 * @param {Array<string>} options - A list of options to display in the dropdown.
 * @param {string} [title='Choose One'] - The default title to show when no option is selected.
 *
 * @returns {JSX.Element} - The rendered dropdown component.
 */
const Dropdown = ({ selected, setSelected, options, title = 'Choose One' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleOptionSelect = (option) => {
    setSelected(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className='dropdown-container'>
      <div className='dropdown-btn' onClick={toggleDropdown}>
        {selected === '' ? title : selected}
        <div className={isDropdownOpen ? 'caret open' : 'caret'}></div>
      </div>

      {isDropdownOpen && (
        <div className='dropdown-content'>
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionSelect(option)}
              className='dropdown-item'
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
