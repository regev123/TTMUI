import api from '../utils/api';
import {
  ENVIRONMENT_CONNECTION_SUCCESS,
  ENVIRONMENT_CONNECTION_FAILED,
  ENVIRONMENT_HOME_PATH_VALID,
  ENVIRONMENT_HOME_PATH_INVALID,
} from './types';

export const checkTTMEnvironmentConfiguration = () => async (dispatch) => {
  try {
    await api.get('/validation/checkEnvironmentConnection');
    dispatch({
      type: ENVIRONMENT_CONNECTION_SUCCESS,
    });
  } catch (err) {
    dispatch({
      type: ENVIRONMENT_CONNECTION_FAILED,
    });
  }
  try {
    await api.post('/validation/validateTTMHomeCorrectPath');
    dispatch({
      type: ENVIRONMENT_HOME_PATH_VALID,
    });
  } catch (err) {
    dispatch({
      type: ENVIRONMENT_HOME_PATH_INVALID,
    });
  }
};
