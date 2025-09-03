import React, { useState } from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SpinIcon from '../../components/common/SpinIcon';
import handleSubmitObfuscation from '../../hooks/submitHandlers/handleSubmitObfuscationPage';
import AlertMessage from '../../components/common/AlertMessage';

const Obfuscation = ({ isEnvObfuscated, existingClientsArray }) => {
  const [encryptionKey, setEncryptionKey] = useState('');
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const onChangeEncryptionKey = (name, value) => {
    setEncryptionKey(value);
  };

  const onSubmit = () => {
    handleSubmitObfuscation(
      isEnvObfuscated,
      encryptionKey,
      existingClientsArray,
      setLoading,
      setAlert
    );
  };

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <div className='component-container'>
          <AlertMessage
            message={alert}
            isSuccess={alert.includes('Succeeded')}
          />
          {!isEnvObfuscated && (
            <InputField
              title='Encryption Key'
              name='encryptionKey'
              value={encryptionKey}
              onChange={onChangeEncryptionKey}
            />
          )}
          <div className='elements-in-one-line'>
            <Button
              title={isEnvObfuscated ? 'Deobfuscate' : 'Obfuscate'}
              onClick={onSubmit}
            />
            {loading && <SpinIcon />}
          </div>
        </div>
      </div>
    </div>
  );
};

Obfuscation.propTypes = {
  isEnvObfuscated: PropTypes.bool.isRequired,
  existingClientsArray: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  isEnvObfuscated: state.Obfuscation.isEnvObfuscated,
  existingClientsArray: state.ExistingClients.existingClientsArray,
});

export default connect(mapStateToProps, {})(Obfuscation);
