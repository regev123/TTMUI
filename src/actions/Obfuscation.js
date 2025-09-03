import api from '../utils/api';
import {
  ENVIRONMENT_IS_OBFUSCATED,
  ENVIRONMENT_IS_NOT_OBFUSCATED,
} from './types';

export const checkIsEnvironmentObfuscated = () => async (dispatch) => {
  try {
    const { data } = await api.get('/validation/isEnvironmentObfuscated');
    if (data.isEnvObfs === 'true')
      dispatch({
        type: ENVIRONMENT_IS_OBFUSCATED,
      });
    else
      dispatch({
        type: ENVIRONMENT_IS_NOT_OBFUSCATED,
      });
  } catch (err) {
    console.error('Error in fetching environment obfuscation value : ' + err);
  }
};
