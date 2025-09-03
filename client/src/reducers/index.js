import { combineReducers } from 'redux';
import TTMEnvironment from './TTMEnvDetails';
import Obfuscation from './Obfuscation';
import ExistingClients from './ExistingClients';

export default combineReducers({
  TTMEnvironment,
  Obfuscation,
  ExistingClients,
});
