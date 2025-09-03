import { useState } from 'react';
import './InputField.css';

/**
 * @function InputField
 * @desc    Renders an input field with customizable properties such as type, value, and event handling.
 *          It also handles the visibility toggle for password inputs.
 * @access  Public
 *
 * @param {string} title - The title or label for the input field.
 * @param {string} type - The type of the input (e.g., 'text', 'password'). Defaults to 'text'.
 * @param {string} name - The name of the input field, used for identification.
 * @param {string} value - The current value of the input field.
 * @param {function} onChange - Callback function to handle changes to the input value.
 * @param {boolean} [disabled=false] - Determines whether the input field is disabled.
 * @param {string} [placeholder=''] - Placeholder text to show when the input is empty.
 * @param {boolean} [fullWidth=false] - Whether the input field should occupy full width.
 * @param {boolean} [readOnly=false] - Whether the input field is in read-only mode.
 *
 * @returns {JSX.Element} - The rendered input field with the given properties.
 */
const InputField = ({
  title,
  type = 'text',
  name,
  value,
  onChange,
  disabled = false,
  placeholder = '',
  fullWidth = false,
  readOnly = false,
}) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  const isPasswordField = name.toLowerCase().includes('password');

  return (
    <div className={`input-field ${fullWidth ? 'full-width' : ''}`}>
      <span className='info-title'>
        {title}{' '}
        {isPasswordField && (
          <i className='bx bx-show-alt' onClick={togglePasswordVisibility} />
        )}
      </span>

      <input
        type={inputType}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.name, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
};

export default InputField;
