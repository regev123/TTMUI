const updateStateWithKey = async (setStateFunction, key, value) => {
  setStateFunction((prevState) => ({
    ...prevState,
    [key]: value,
  }));
};

export default updateStateWithKey;
