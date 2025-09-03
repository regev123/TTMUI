import './Textarea.css';

/**
 * @function Textarea
 * @desc    Renders a read-only textarea input element with a specified value and placeholder.
 * @access  Public
 *
 * @param {string} value - The value to be displayed in the textarea.
 * @param {string} [placeholder=''] - The placeholder text to display when the textarea is empty (optional, default is an empty string).
 *
 * @returns {JSX.Element} - The rendered textarea element with the provided value and placeholder.
 */
const Textarea = ({ value, placeholder = '' }) => (
  <textarea placeholder={placeholder} value={value} readOnly />
);

export default Textarea;
