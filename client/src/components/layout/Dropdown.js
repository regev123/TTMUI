import { useState } from 'react';
import './Dropdown.css';

const Dropdown = ({ selected, setSelected, options }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className='dropdown-container'>
      <div className='dropdown-btn' onClick={(e) => setIsActive(!isActive)}>
        {selected === '' ? 'Choose One' : selected}
        <div class={isActive ? 'caret open' : 'caret'}> </div>
      </div>
      {isActive && (
        <div className='dropdown-content'>
          {options.map((option) => (
            <div
              onClick={(e) => {
                setSelected(option.fileName);
                setIsActive(false);
              }}
              className='dropdown-item'
            >
              {option.fileName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
