import './Button.css';

/**
 * @function Button
 * @desc    Renders a button element that can be customized with a title, click handler, and optional styles for being disabled or full width.
 * @access  Public
 *
 * @param {function} onClick - The callback function to be called when the button is clicked.
 * @param {string} title - The text displayed on the button.
 * @param {boolean} [disabled=false] - Indicates whether the button is disabled (optional, defaults to false).
 * @param {boolean} [fullWidth=false] - Indicates whether the button should take the full width of its container (optional, defaults to false).
 *
 * @returns {JSX.Element} - The rendered button element.
 */
const Button = ({ onClick, title, disabled = false, fullWidth = false }) => (
  <div className={`button ${fullWidth ? 'full-width' : ''}`}>
    <button onClick={onClick} disabled={disabled}>
      {title}
    </button>
  </div>
);

export default Button;
