import React, { useEffect, useState } from 'react';
import Dropdown from '../../components/common/Dropdown';
import Checkbox from '../../components/common/Checkbox';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import fetchDeploymentConfiguration from '../../hooks/fetchData/useFetchDeploymentConfiguration';
import setDeployment from '../../hooks/submitHandlers/handleSubmitPrePostDeploymentCommand';
import AlertMessage from '../../components/common/AlertMessage';

/**
 * @component PrePostDeployment
 * @desc    Main component for handling the pre/post deployment configuration for a selected profile.
 *          It allows selecting deployment types, toggling deployment enable states, updating deployment commands,
 *          and submitting the configuration.
 * @access  Public
 *
 * @param {Object} prePostDeploymentCommand - The current pre/post deployment command configuration for the selected profile.
 * @param {function} setPrePostDeploymentCommand - Function to update the pre/post deployment command configuration.
 * @param {string} selectedProfile - The profile currently selected for deployment configuration.
 * @param {Object} isClientConfigLoaded - Indicates whether the configuration for the selected profile has been loaded.
 * @param {function} markClientConfigAsLoaded - Function to mark the client profile configuration as loaded.
 *
 * @returns {JSX.Element} - The main JSX structure for the Pre/Post Deployment configuration page.
 *
 * Internal Function Descriptions:
 *
 * handleSubmit - Handles form submission, sending the deployment configuration data to the server.
 *
 * handleInputChange - Updates the pre/post deployment command configuration when an input field value changes.
 *
 * toggleDeploymentEnabled - Toggles the enabled state of the selected deployment (Pre or Post).
 *
 * getDeploymentCommandValue - Retrieves the value for the deployment command, based on whether it's enabled and loading.
 *
 * getButtonDisabledState - Determines whether the submit button should be disabled based on loading state and deployment selection.
 */
const PrePostDeployment = ({
  prePostDeploymentCommand,
  setPrePostDeploymentCommand,
  selectedProfile,
  isClientConfigLoaded,
  markClientConfigAsLoaded,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageAlert, setPageAlert] = useState('');
  const [selectedDeployment, setSelectedDeployment] = useState('');

  useEffect(() => {
    if (selectedDeployment) {
      fetchDeploymentConfiguration(
        selectedDeployment,
        isClientConfigLoaded,
        setPrePostDeploymentCommand,
        selectedProfile,
        markClientConfigAsLoaded,
        setIsLoading,
        setPageAlert
      );
    }
  }, [selectedDeployment, selectedProfile]);

  useEffect(() => {
    setSelectedDeployment(''); // Reset deployment when profile changes
  }, [selectedProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDeployment(
      e,
      setPageAlert,
      setIsLoading,
      selectedProfile,
      selectedDeployment,
      prePostDeploymentCommand
    );
  };

  const handleInputChange = (name, value) => {
    setPrePostDeploymentCommand((prev) => ({
      ...prev,
      [selectedProfile]: {
        ...prev[selectedProfile],
        [name]: value,
      },
    }));
  };

  const toggleDeploymentEnabled = () => {
    const deploymentKey = `enabled${selectedDeployment}`;
    setPrePostDeploymentCommand((prev) => ({
      ...prev,
      [selectedProfile]: {
        ...prev[selectedProfile],
        [deploymentKey]: !prev[selectedProfile][deploymentKey],
      },
    }));
  };

  const getDeploymentCommandValue = () => {
    const deploymentKey = selectedDeployment;
    const isEnabled =
      prePostDeploymentCommand?.[selectedProfile]?.[
        `enabled${selectedDeployment}`
      ];

    return isLoading || !isEnabled
      ? ''
      : prePostDeploymentCommand?.[selectedProfile]?.[deploymentKey] || '';
  };

  const getButtonDisabledState = () => {
    return isLoading || !selectedDeployment;
  };

  return (
    <div className='component-container'>
      <h1>
        {selectedProfile.split('_').join(' ')} Profile {selectedDeployment}{' '}
        Deployment Configuration
      </h1>

      {pageAlert && (
        <AlertMessage
          message={pageAlert}
          isSuccess={pageAlert === 'Change Succeeded!'}
        />
      )}

      <Dropdown
        selected={selectedDeployment}
        setSelected={setSelectedDeployment}
        options={['Pre', 'Post']}
        title='Select Deployment'
      />

      <form onSubmit={handleSubmit}>
        <Checkbox
          label={`Enable ${selectedDeployment} Deployment`}
          checked={
            prePostDeploymentCommand?.[selectedProfile]?.[
              `enabled${selectedDeployment}`
            ] || false
          }
          onChange={toggleDeploymentEnabled}
          disabled={getButtonDisabledState()}
        />

        <InputField
          name={selectedDeployment}
          title={`${selectedDeployment} Deployment Script Command`}
          value={getDeploymentCommandValue()}
          onChange={handleInputChange}
          placeholder={isLoading ? 'Loading...' : ''}
          disabled={
            !prePostDeploymentCommand?.[selectedProfile]?.[
              `enabled${selectedDeployment}`
            ] || isLoading
          }
          fullWidth={true}
        />

        <Button
          title='Submit'
          disabled={getButtonDisabledState()}
          onClick={handleSubmit}
        />
        {isLoading && <i className='bx bx-loader bx-spin icon-style' />}
      </form>
    </div>
  );
};

export default PrePostDeployment;
