// Function to add a replacement command to an execString
// - execString: the original string of commands
// - fullString: the full string where the replacement needs to be made
// - targetString: the specific part of the string to be replaced
// - replacmentString: the new value that will replace targetString
// - regExpString: a regular expression pattern used to locate the targetString
function addToExecString(
  execString,
  fullString,
  targetString,
  replacmentString,
  regExpString
) {
  // Perform the replacement on fullString using a regular expression and add it to execString
  return (execString +=
    ' && ' + // Append '&&' to chain the next command
    fullString.replace(
      new RegExp(`${regExpString}${targetString}`, 'g'), // Create a regex with the pattern and target string
      `$1${replacmentString}` // Replace the matched pattern with the replacement string
    ));
}

// Function to append a disabling command to execString
// - execString: the original string of commands
// - fullString: the string/command to be appended
function addDisableToExecString(execString, fullString) {
  // Append the fullString to execString with '&&' to chain the next command
  return (execString += ' && ' + fullString);
}

// Export the functions to be used in other modules
module.exports = {
  addToExecString,
  addDisableToExecString,
};
