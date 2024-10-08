import React, { useState } from 'react';
import './installation.css';
import api from '../../utils/api'; // Utility to handle API calls
import ABP from './clients/ABP'; // Client-specific forms
import OMS from './clients/OMS';
import OMS_SE from './clients/OMS_SE';
import MCSS_SE from './clients/MCSS_SE';
import ACPE from './clients/ACPE';

const Installation = () => {
  // State to track which clients are selected (true/false)
  const [clientChecks, setClientChecks] = useState({
    ABP: false,
    OMS: false,
    OMS_SE: false,
    MCSS_SE: false,
    ACPE: false,
  });

  // State for tracking the installation process (loading state)
  const [installing, setInstalling] = useState(false);
  // State for installation status messages
  const [requestStatus, setRequestStatus] = useState('');
  // State to track if overriding data pump file should be enabled
  const [overrideDataPumpFile, setOverrideDataPumpFile] = useState(true);
  // State for the remote DB user, initialized with default value
  const [remoteDBUser, setRemoteDBUser] = useState('oradp');

  // Initial form structure shared by all clients
  const initialFormData = {
    ORACLE_DATA_PUMP_DIR: 'DP_DMP_EPCT',
    ORACLE_DATA_PUMP_DIR_PATH: '',
    SRC_DB_USER: '',
    SRC_DB_PASSWORD: '',
    SRC_DB_INSTANCE: '',
    TRG_DB_CONN_STRING: '',
  };

  // State to manage form data for each client. Each client gets its own copy of initialFormData.
  const [formData, setFormData] = useState({
    ABP: { ...initialFormData },
    OMS: { ...initialFormData },
    OMS_SE: { ...initialFormData },
    MCSS_SE: { ...initialFormData },
    ACPE: { ...initialFormData },
  });

  // Toggle the check status for a specific client
  const handleClientToggle = (client) => {
    setClientChecks((prev) => ({
      ...prev,
      [client]: !prev[client], // Flip the selected client value (true/false)
    }));
  };

  // Update the form data for a specific client dynamically
  const handleFormChange = (client, updatedData) => {
    setFormData((prev) => ({
      ...prev,
      [client]: { ...prev[client], ...updatedData }, // Merge updated data into the specific client's form
    }));
  };

  // Validate that all form fields for a specific client are filled in
  const validateClientForm = (clientData) => {
    console.log(formData); // Log current form data for debugging
    return Object.values(clientData).every((value) => value !== ''); // Ensure no form fields are empty
  };

  function validateUserPasswordInstance(input) {
    const pattern = /^[A-Za-z0-9_]+\/[A-Za-z0-9_]+@[A-Za-z0-9_]+$/;
    return pattern.test(input);
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validation: Ensure remoteDBUser is not empty
    if (!remoteDBUser) {
      alert('Remote DB User is required.');
      return; // Exit early if validation fails
    }

    const clients = []; // Array to collect selected clients

    // Loop through all clients, validate forms for selected ones
    for (const client of Object.keys(clientChecks)) {
      //Remove all Whitespace from the variables
      if (clientChecks[client]) {
        Object.entries(formData[client]).forEach(([key, value]) => {
          formData[client][key] = value.replace(/\s+/g, '');
        });
        // If the client is selected
        if (!validateClientForm(formData[client])) {
          // Validate the form
          alert(`All ${client} fields are required.`); // Show error if validation fails
          return; // Exit early if form validation fails
        }

        if (
          !validateUserPasswordInstance(formData[client].TRG_DB_CONN_STRING)
        ) {
          alert(
            `${client} Target DB Connection String must be in this structure({DB_USER}/{DB_PASSWORD}@{DB_INSTANCE})`
          );
          return;
        }
        clients.push(client); // Add validated client to the list
      }
    }

    // Prepare request payload with all necessary data
    const body = {
      overrideDataPumpFile,
      remoteDBUser,
      clients,
      formData,
    };

    setInstalling(true); // Set installing state to true while the request is in progress
    try {
      const res = await api.post('/installation/install', body); // Send POST request to server
      // Update status based on the response
      setRequestStatus(
        res.status === 200
          ? 'Installation finished successfully'
          : 'Installation failed'
      );
    } catch (error) {
      setRequestStatus('Installation failed'); // Handle error response
    } finally {
      setInstalling(false); // Reset installing state after request is complete
    }
  };

  // Map client names to their corresponding components
  const clientComponents = {
    ABP: ABP,
    OMS: OMS,
    OMS_SE: OMS_SE,
    MCSS_SE: MCSS_SE,
    ACPE: ACPE,
  };

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='installation-page-container'>
        <div className='installation-page-clients-container'>
          <div className='installation-page-clients-title'>
            <h1>Environment Configuration</h1>
            <div className='installation-page-clients-checkbox'>
              <label>
                <input
                  type='checkbox'
                  checked={overrideDataPumpFile}
                  onChange={() =>
                    setOverrideDataPumpFile(!overrideDataPumpFile)
                  } // Toggle override data pump file setting
                />
                Override data pump file
              </label>
            </div>
            <div className='installation-page-remote-db-user-input'>
              <span className='installation-page-remote-db-user-input-title'>
                Remote DB User *
              </span>
              <input
                value={remoteDBUser}
                name='remoteDBUser'
                onChange={(e) => setRemoteDBUser(e.target.value)} // Update remote DB user state
                type='text'
                required
              />
            </div>
          </div>
        </div>

        <div className='installation-page-clients-container'>
          <div className='installation-page-clients-title'>
            <h1>Choose clients</h1>
            <h1>{requestStatus}</h1> {/* Show installation status */}
            <div className='installation-page-clients-checkbox'>
              {Object.keys(clientChecks).map((client) => (
                <label key={client}>
                  <input
                    type='checkbox'
                    checked={clientChecks[client]} // Check if the client is selected
                    onChange={() => handleClientToggle(client)} // Toggle client selection
                  />
                  {client}
                </label>
              ))}
            </div>
          </div>
        </div>

        {Object.keys(clientChecks).map((client) =>
          clientChecks[client]
            ? React.createElement(clientComponents[client], {
                key: client,
                [`${client}formData`]: formData[client], // Pass form data to child component
                [`set${client}FormData`]: (updatedData) =>
                  handleFormChange(client, updatedData), // Pass state update handler to child
              })
            : null
        )}

        {/* Show submit button only if at least one client is selected */}
        {Object.values(clientChecks).some((checked) => checked) && (
          <div className='configuration-page-box-submit'>
            <button
              onClick={handleSubmit} // Handle form submission
              className={
                installing
                  ? 'configuration-page-box-input-button-disabled'
                  : 'configuration-page-box-input-button'
              }
              disabled={installing} // Disable button during installation process
            >
              {installing ? 'Installing...' : 'Install'}{' '}
              {/* Show loading state */}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Installation;
