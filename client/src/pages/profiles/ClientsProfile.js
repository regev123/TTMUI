import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import SpinIcon from '../../components/common/SpinIcon';
import AlertMessage from '../../components/common/AlertMessage';
import fetchClientsProfileConfiguration from '../../hooks/fetchData/useFetchClientsProfileConfiguration';
import setClientDBDetails from '../../hooks/submitHandlers/handleSubmitClientDBDetailsConfiguration';
import setClientDPDir from '../../hooks/submitHandlers/handleSubmitClientDPDirConfiguration';
import Dropdown from '../../components/common/Dropdown';

/**
 * @component ClientsProfile
 * @desc    Component for managing and configuring a client's profile.
 *          It allows users to update database connection strings, data pump paths, and directory names.
 *          The component fetches the profile data, handles form input changes, and submits the data to the server.
 * @access  Public
 *
 * @param {Object} clients - The current clients' profile data.
 * @param {function} setClients - Function to update the clients' profile data.
 * @param {string} selectedProfile - The currently selected profile.
 * @param {Object} isClientConfigLoaded - Object indicating if the configuration for the selected profile has been loaded.
 * @param {function} markClientConfigAsLoaded - Function to mark specific configuration as loaded.
 *
 * @returns {JSX.Element} - The JSX structure for the client's profile configuration form.
 *
 * Internal Function Descriptions:
 *
 * handleSubmit - Handles the form submission to save client profile configuration data.
 * handleChange - Handles changes to input fields in the form.
 * isFormDisabled - Determines if the form should be disabled based on the loading state.
 * formatProfileTitle - Formats the profile title by converting underscores to spaces.
 * renderInputField - Renders an individual input field for the form, handling the disabled state and placeholder.
 */
const ClientsProfile = ({
  clients,
  setClients,
  selectedProfile,
  isClientConfigLoaded,
  markClientConfigAsLoaded,
  isEnvObfuscated,
}) => {
  const [isClientConfigLoading, setIsClientConfigLoading] = useState(false);
  const [pageAlert, setPageAlert] = useState('');
  const [selectedData, setSelectedData] = useState('');

  useEffect(() => {
    if (
      (isClientConfigLoaded[selectedProfile]?.DBLoaded &&
        isClientConfigLoaded[selectedProfile]?.DPDirLoaded) ||
      !selectedData
    )
      return;
    fetchClientsProfileConfiguration(
      setIsClientConfigLoading,
      selectedProfile,
      setClients,
      clients,
      markClientConfigAsLoaded,
      selectedData,
      isEnvObfuscated
    );
  }, [selectedData]);

  useEffect(() => {
    setSelectedData('');
    setPageAlert('');
  }, [selectedProfile]);

  useEffect(() => {
    setPageAlert('');
  }, [selectedData]);

  const handleSubmit = async (e) => {
    if (selectedData === 'DB Details') {
      setClientDBDetails(
        e,
        setPageAlert,
        setIsClientConfigLoading,
        selectedProfile,
        clients[selectedProfile]['SRC_DB_CONN_STRING'],
        clients[selectedProfile]['TRG_DB_CONN_STRING'],
        isEnvObfuscated
      );
    } else {
      setClientDPDir(
        e,
        setPageAlert,
        setIsClientConfigLoading,
        selectedProfile,
        clients[selectedProfile]['EPCT_DP_PATH'],
        clients[selectedProfile]['EPCT_DP_DIR']
      );
    }
  };

  const handleChange = (name, value) => {
    setClients((prevClients) => ({
      ...prevClients,
      [selectedProfile]: {
        ...prevClients[selectedProfile],
        [name]: value,
      },
    }));
  };

  const isFormDisabled = isClientConfigLoading;

  return (
    <div className='component-container'>
      <h1>{formatProfileTitle(selectedProfile)}</h1>
      {pageAlert && (
        <AlertMessage
          message={pageAlert}
          isSuccess={pageAlert === 'Change Succeeded!'}
        />
      )}

      <Dropdown
        selected={selectedData}
        setSelected={setSelectedData}
        options={['DB Details', 'Data Pump Directory']}
        title='Select Data Fetching'
      />

      <form className='form-style'>
        {selectedData === 'DB Details' &&
          renderInputField('Source DB Connection String', 'SRC_DB_CONN_STRING')}
        {selectedData === 'DB Details' &&
          renderInputField('Target DB Connection String', 'TRG_DB_CONN_STRING')}
        {selectedData === 'Data Pump Directory' &&
          renderInputField('Data Pump Directory Path', 'EPCT_DP_PATH')}
        {selectedData === 'Data Pump Directory' &&
          renderInputField('Data Pump Directory Name', 'EPCT_DP_DIR')}
      </form>

      {selectedData && (
        <Button
          title='Submit'
          disabled={isClientConfigLoading}
          onClick={handleSubmit}
        />
      )}
      {isClientConfigLoading && <SpinIcon />}
    </div>
  );

  function formatProfileTitle(profile) {
    return profile.split('_').join(' ') + ' Profile Configuration';
  }

  function renderInputField(title, fieldName) {
    const value = clients[selectedProfile]?.[fieldName] || '';
    return (
      <InputField
        title={`${title} *`}
        value={value}
        name={fieldName}
        onChange={handleChange}
        placeholder={isClientConfigLoading ? 'Loading...' : ''}
        disabled={isFormDisabled}
      />
    );
  }
};

ClientsProfile.propTypes = {
  isEnvObfuscated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isEnvObfuscated: state.Obfuscation.isEnvObfuscated,
});

export default connect(mapStateToProps)(ClientsProfile);
