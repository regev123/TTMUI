import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import validate from '../../hooks/submitHandlers/handleSubmitEnvironmentValidation';
import Dropdown from '../../components/common/Dropdown';
import Spinner from '../../components/layout/Spinner';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import fetchExistsClientsInit from '../../hooks/fetchData/useFetchEnvironmentValidationClientData';

/**
 * @component EnvironmentValidation
 * @desc    Handles the validation of environment configurations by allowing users to select a client,
 *          perform checks for various environment configurations, and display validation results.
 *          It manages the state of validation statuses, form data, and client selection.
 * @access  Public
 *
 * @returns {JSX.Element} - The JSX structure for the Environment Validation UI, including client selection,
 *                          validation statuses, and verification button.
 *
 * Internal Function Descriptions:
 *
 * handleSubmit - Handles the form submission, triggering the environment validation process.
 * resetValidations - Resets the validation states before initiating a new validation process.
 * getDropdownOptions - Generates the list of available client options based on the fetched client data.
 */
const EnvironmentValidation = ({ isEnvObfuscated, existingClientsArray }) => {
  const [validations, setValidations] = useState(initialValidations);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(true);
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    fetchExistsClientsInit(
      setClients,
      setLoading,
      setAlert,
      existingClientsArray
    );
  }, []);

  const handleSubmit = async (e) => {
    resetValidations();
    await validate(
      e,
      selectedClient,
      setDisableSubmit,
      setValidations,
      setAlert,
      isEnvObfuscated
    );
  };

  const resetValidations = () => {
    setValidations(initialValidations);
  };

  const getDropdownOptions = () => {
    if (!clients) return;
    return Object.keys(clients)
      .filter((key) => clients[key].exists)
      .flatMap((item) => [`${item} Source`, `${item} Target`]);
  };

  if (loading) return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <div className='global-page-alert failed'>{alert}</div>
        <div className='component-container'>
          <h1>Validate environement configuration</h1>

          <Dropdown
            selected={selectedClient}
            setSelected={setSelectedClient}
            options={getDropdownOptions()}
            title='Select Client'
          />
          <Button
            onClick={handleSubmit}
            title='Verify'
            disabled={alert || !selectedClient || disableSubmit}
            fullWidth={true}
          />

          {Object.keys(validations).map((validationKey) => (
            <div className='elements-in-one-line' key={validationKey}>
              <InputField
                title={getValidationTitle(validationKey)}
                name={`${validationKey}String`}
                value={validations[validationKey].message || ''}
                readOnly
              />
              <ValidationStatusIcon
                status={validations[validationKey].status}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * @function ValidationStatusIcon
 * @desc    Renders an icon based on the validation status. It displays different icons
 *          for loading, success, and failure statuses.
 * @param {string} status - The status of the validation (e.g., 'loading', 'success', 'failed').
 * @returns {JSX.Element|null} - The icon representing the current validation status.
 */
const ValidationStatusIcon = ({ status }) => {
  const icons = {
    loading: 'bx bx-loader bx-spin icon-style',
    success: 'bx bx-check icon-style-success',
    failed: 'bx bx-error icon-style-failed',
  };

  return status ? <i className={`${icons[status] || ''}`} /> : null;
};

/**
 * @function getValidationTitle
 * @desc    Maps the validation key to a human-readable title.
 * @param {string} validationKey - The key representing the validation (e.g., 'TNSPing').
 * @returns {string} - The title for the validation check.
 */
const getValidationTitle = (validationKey) => {
  const titles = {
    TNSPing: 'DB Host',
    SSHConnection: 'SSH Connection',
    DPDir: 'DP Directory on DB Server',
    DumpCreation: 'Export Validation',
  };
  return titles[validationKey] || validationKey;
};

// Initial state for the validation statuses
const initialValidationState = {
  status: '',
  message: '',
};

// Initial state for each individual validation
const initialValidations = {
  TNSPing: { ...initialValidationState },
  SSHConnection: { ...initialValidationState },
  DPDir: { ...initialValidationState },
  DumpCreation: { ...initialValidationState },
};

EnvironmentValidation.propTypes = {
  isEnvObfuscated: PropTypes.bool.isRequired,
  existingClientsArray: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  isEnvObfuscated: state.Obfuscation.isEnvObfuscated,
  existingClientsArray: state.ExistingClients.existingClientsArray,
});

export default connect(mapStateToProps, {})(EnvironmentValidation);
