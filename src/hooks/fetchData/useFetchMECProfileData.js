import api from '../../utils/api';

const fetchMECProfileData = async (setAlert, setMECProfileData) => {
  try {
    const { data } = await api.get('/configuration/getMECProfileData');
    setMECProfileData(data);
  } catch (error) {
    setAlert('Failed to load MEC Profile data');
  }
};

export default fetchMECProfileData;
