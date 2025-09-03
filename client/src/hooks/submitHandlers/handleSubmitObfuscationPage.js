import api from '../../utils/api';
import { checkIsEnvironmentObfuscated } from '../../actions/Obfuscation';
import store from '../../store';

const FileUpload = async (
  isEnvObfuscated,
  encryptionKey,
  clients,
  setLoading,
  setAlert
) => {
  setLoading(true);
  setAlert('');
  console.log(clients);
  try {
    if (!isEnvObfuscated) {
      await api.post('/obfuscation/createObfuscationInputFile', {
        encryptionKey,
        clients,
      });
      await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
      await api.post('/obfuscation/obfuscateEnvironment');
      await api.post('/obfuscation/removeObfuscationInputFileFromEnvironment');
      await store.dispatch(checkIsEnvironmentObfuscated());
    } else {
      await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
      await api.post('/obfuscation/deobfuscateEnvironment');
      await api.post('/obfuscation/removeObfuscationInputFileFromEnvironment');
      await store.dispatch(checkIsEnvironmentObfuscated());
    }
    const alertMessage = isEnvObfuscated
      ? 'Deobfuscation Succeeded!'
      : 'Obfuscation Succeeded!';
    setAlert(alertMessage);
  } catch (error) {
    console.error('Error in Obfuscation tab: ', error);
    const alertMessage = isEnvObfuscated
      ? 'Deobfuscation Failed!'
      : 'Obfuscation Failed!';
    setAlert(alertMessage);
  } finally {
    setLoading(false);
  }
};

export default FileUpload;
