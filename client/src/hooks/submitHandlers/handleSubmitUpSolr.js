import api from '../../utils/api';

const setUpSolr = async (
  Username,
  Password,
  Host,
  setIsLoading,
  setButtonTitle,
  setPageAlert
) => {
  setPageAlert('');
  setIsLoading(true);
  try {
    const body = { Username, Password, Host };
    await api.post('/configuration/startSolr', body);
    setButtonTitle('Ping');
    setPageAlert('UP');
  } catch (error) {
    setPageAlert(error.response.data.error);
  } finally {
    setIsLoading(false);
  }
};

export default setUpSolr;
