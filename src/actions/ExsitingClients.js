import api from '../utils/api';
import {
  GET_EXISTING_CLIENTS_ARRAY,
  FAILED_TO_GET_EXISTING_CLIENTS_ARRAY,
} from './types';

export const getExistingClientsArray = () => async (dispatch) => {
  try {
    const existingClients = await fetchExistingClientsFromApi();
    const filteredClients = filterClientsFromData(existingClients);
    dispatch({
      type: GET_EXISTING_CLIENTS_ARRAY,
      payload: filteredClients,
    });
  } catch (err) {
    dispatch({
      type: FAILED_TO_GET_EXISTING_CLIENTS_ARRAY,
    });
    console.error('Error in fetching existing clients array : ' + err);
  }
};

/**
 * @function fetchExistingClientsFromApi
 * @desc    Makes an API request to fetch the list of existing clients.
 * @returns {Promise<Array>} - The response data containing the list of clients.
 */
const fetchExistingClientsFromApi = async () => {
  const response = await api.post('/util/getExistingClients');
  return response.data;
};

/**
 * @function filterClientsFromData
 * @desc    Filters the clients fetched from the API based on a predefined list of client options.
 * @param {Array} existingClientsFetchedData - The array of fetched clients data.
 * @returns {Array} - A filtered array of clients that match specific criteria.
 */
const filterClientsFromData = (existingClientsFetchedData) => {
  const clientOptions = ['OMS_SE', 'OMS', 'ABP', 'ACPE', 'MCSS_SE'];
  return clientOptions.filter((option) => {
    const regex = new RegExp(`MEC\\.profile\\.${option}\\.ksh`);
    return regex.test(existingClientsFetchedData);
  });
};
