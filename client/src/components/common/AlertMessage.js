/**
 * @function AlertMessage
 * @desc    Renders an alert message with a specific style based on success or failure status.
 * @access  Public
 *
 * @param {string} message - The alert message text to be displayed.
 * @param {boolean} isSuccess - Determines the styling of the alert message; if true, displays a success style, otherwise displays a failure style.
 *
 * @returns {JSX.Element} - The rendered alert message element.
 */
const AlertMessage = ({ message, isSuccess }) => (
  <p
    className={
      isSuccess ? 'global-page-alert success' : 'global-page-alert failed'
    }
  >
    {message}
  </p>
);

export default AlertMessage;
