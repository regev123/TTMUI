import {
  ENVIRONMENT_IS_OBFUSCATED,
  ENVIRONMENT_IS_NOT_OBFUSCATED,
} from '../actions/types';

const initialState = {
  isEnvObfuscated: null,
};

function obfuscationReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case ENVIRONMENT_IS_OBFUSCATED:
      return {
        ...state,
        isEnvObfuscated: true,
      };
    case ENVIRONMENT_IS_NOT_OBFUSCATED:
      return {
        ...state,
        isEnvObfuscated: false,
      };
    default:
      return state;
  }
}

export default obfuscationReducer;
