import api from '../../utils/api';

const setPingSolr = async (
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
    const { data } = await api.post('/configuration/pingSolr', body);
    if (data.includes('UP')) {
      setPageAlert('UP');
    } else {
      setPageAlert('DOWN');
      setButtonTitle('Start solr server');
    }
  } catch (error) {
    setPageAlert(error.response.data.error);
  } finally {
    setIsLoading(false);
  }
};

export default setPingSolr;
