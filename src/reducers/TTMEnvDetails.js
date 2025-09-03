import {
  ENVIRONMENT_CONNECTION_SUCCESS,
  ENVIRONMENT_CONNECTION_FAILED,
  ENVIRONMENT_HOME_PATH_VALID,
  ENVIRONMENT_HOME_PATH_INVALID,
} from '../actions/types';

// Initial state for the TTM environment connection status
const initialState = {
  EnvironmentConncetionSuccess: null, // Tracks if the environment connection is successful (null, true, or false)
  EnvironmentHomePathValid: null, // Tracks if the environment home path is valid (null, true, or false)
};

/**
 * @function TTMEnvironmentReducer
 * @desc    Reducer function that handles updates to the TTM environment state based on dispatched actions.
 *          It manages the environment connection and home path validity statuses.
 * @param {Object} state - The current state of the TTM environment configuration.
 * @param {Object} action - The action dispatched to the reducer.
 * @returns {Object} - The updated state based on the action type.
 */
function TTMEnvironmentReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case ENVIRONMENT_CONNECTION_SUCCESS:
      return {
        ...state,
        EnvironmentConncetionSuccess: true,
      };
    case ENVIRONMENT_CONNECTION_FAILED:
      return {
        ...state,
        EnvironmentConncetionSuccess: false,
      };
    case ENVIRONMENT_HOME_PATH_VALID:
      return {
        ...state,
        EnvironmentHomePathValid: true,
      };
    case ENVIRONMENT_HOME_PATH_INVALID:
      return {
        ...state,
        EnvironmentHomePathValid: false,
      };
    default:
      return state;
  }
}

export default TTMEnvironmentReducer;
