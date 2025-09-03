import './Checkbox.css';

/**
 * @function Checkbox
 * @desc    Renders a checkbox input with a label. Allows the user to toggle the checkbox state and pass the new state via the onChange callback.
 * @access  Public
 *
 * @param {string} label - The text label associated with the checkbox.
 * @param {boolean} checked - Indicates whether the checkbox is checked or not.
 * @param {function} onChange - Callback function to handle the change event when the checkbox is toggled.
 * @param {boolean} [disabled=false] - Indicates if the checkbox is disabled (optional, defaults to false).
 *
 * @returns {JSX.Element} - The rendered checkbox element with the associated label.
 */
const Checkbox = ({ label, checked = false, onChange, disabled = false }) => (
  <div className='checkbox'>
    <label>
      <input
        type='checkbox'
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label}
    </label>
  </div>
);

export default Checkbox;
