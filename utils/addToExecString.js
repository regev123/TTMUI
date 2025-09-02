/**
 * @desc    Adds a replacement command to an existing execution string by searching
 *          for a specific target string within a full string and replacing it with
 *          a new value. The replacement is done using a regular expression to locate
 *          the target string.
 * @access  Public
 *
 * @param   {string} execString - The original string of commands to which the new
 *                                 command will be added.
 * @param   {string} fullString - The full string where the replacement needs to be made.
 * @param   {string} targetString - The specific part of the string to be replaced.
 * @param   {string} replacmentString - The new value that will replace targetString.
 * @param   {string} regExpString - A regular expression pattern used to locate the
 *                                   targetString.
 *
 * @returns {string} - The updated execString with the replacement command appended.
 */
function addToExecString(
  execString,
  fullString,
  targetString,
  replacmentString,
  regExpString
) {
  return (execString +=
    ' && ' +
    fullString.replace(
      new RegExp(`${regExpString}${targetString}`, 'g'),
      `$1${replacmentString}`
    ));
}

/**
 * @desc    Appends a disabling command to an existing execution string. This is done
 *          by adding the specified command (fullString) to the execString, ensuring
 *          that it is executed in sequence.
 * @access  Public
 *
 * @param   {string} execString - The original string of commands to which the new
 *                                 command will be appended.
 * @param   {string} fullString - The command to be appended to the execString.
 *
 * @returns {string} - The updated execString with the disabling command appended.
 */
function addDisableToExecString(execString, fullString) {
  return (execString += ' && ' + fullString);
}

module.exports = {
  addToExecString,
  addDisableToExecString,
};
