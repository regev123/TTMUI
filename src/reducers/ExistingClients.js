import {
  GET_EXISTING_CLIENTS_ARRAY,
  FAILED_TO_GET_EXISTING_CLIENTS_ARRAY,
} from '../actions/types';

const initialState = {
  existingClientsArray: [],
};

function obfuscationReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_EXISTING_CLIENTS_ARRAY:
      return {
        ...state,
        existingClientsArray: payload,
      };
    case FAILED_TO_GET_EXISTING_CLIENTS_ARRAY:
      return {
        ...state,
      };
    default:
      return state;
  }
}

export default obfuscationReducer;
