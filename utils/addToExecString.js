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

function addDisableToExecString(execString, fullString) {
  return (execString += ' && ' + fullString);
}

// Export the function
module.exports = {
  addToExecString,
  addDisableToExecString,
};
