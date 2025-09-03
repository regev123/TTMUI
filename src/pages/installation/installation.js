import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/common/Dropdown';
import Spinner from '../../components/layout/Spinner';
import ClientConfig from './ClientsConfig';
import getInstallationsVersions from '../../hooks/fetchData/useFetchInstallationConfiguration';
import Checkbox from '../../components/common/Checkbox';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import SpinIcon from '../../components/common/SpinIcon';
import AlertMessage from '../../components/common/AlertMessage';
import install from '../../hooks/submitHandlers/handleSubmitInstallation';
import FileUploader from '../../components/common/FileUploader';
import FileUpload from '../../hooks/submitHandlers/handleSubmitFileUpload';
/**
 * @component Installation
 * @desc    Manages the installation process by providing UI for selecting the installation version,
 *          choosing client configurations, and initiating the installation. It handles form submission,
 *          loading state management, and displays alerts based on the installation result.
 * @access  Public
 *
 * @returns {JSX.Element} - The JSX structure for the Installation Manager UI, including client selection,
 *                          configuration fields, and installation button.
 *
 * Internal Function Descriptions:
 *
 * handleClientToggle - Toggles the checked state of a client, enabling or disabling its inclusion in the installation.
 * handleFormChange - Updates the configuration data for a selected client.
 * toggleOverrideDataPumpFile - Toggles the override option for the data pump file.
 * handleFormDataChange - Updates generic form data, such as the remote DB user.
 * handleSubmit - Initiates the installation process by calling the `install` function.
 */
const Installation = () => {
  const [pageAlert, setPageAlert] = useState('');
  const [installationVersions, setInstallationVersions] = useState([]);
  const [selectedInstallationVersion, setSelectedInstallationVersion] =
    useState('');
  const [loading, setLoading] = useState(initialLoadingState);
  const [loadingUploadFile, setLoadingUploadFile] = useState(false);
  const [clientChecks, setClientChecks] = useState(initialClientChecks);
  const [formData, setFormData] = useState(initialFormData);
  const [tarOnEnvironment, setTarOnEnvironment] = useState(false);

  useEffect(() => {
    getInstallationsVersions(setLoading, setInstallationVersions, setPageAlert);
  }, []);

  const handleClientToggle = (client) => {
    setClientChecks((prev) => ({
      ...prev,
      [client]: !prev[client],
    }));
  };

  const handleFormChange = (client, updatedData) => {
    setFormData((prev) => ({
      ...prev,
      [client]: { ...prev[client], ...updatedData },
    }));
  };

  const toggleOverrideDataPumpFile = () => {
    setFormData((prevState) => ({
      ...prevState,
      overrideDataPumpFile: !prevState.overrideDataPumpFile,
    }));
  };

  const toggleTarOnEnvironment = () => {
    setTarOnEnvironment((prevState) => !prevState);
  };

  const handleFormDataChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    install(
      e,
      setPageAlert,
      setLoading,
      formData,
      installationVersions,
      selectedInstallationVersion,
      clientChecks,
      tarOnEnvironment
    );
  };

  const handleFileUpload = async (file) => {
    FileUpload(file, setLoadingUploadFile);
  };

  if (loading.loadinginstallationVersions) {
    return <Spinner />;
  }

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <AlertMessage
          message={pageAlert}
          isSuccess={pageAlert === 'Installation finished successfully'}
        />

        <Section title='Environment Configuration'>
          <Dropdown
            selected={selectedInstallationVersion}
            setSelected={setSelectedInstallationVersion}
            options={installationVersions.map((item) => item.version)}
            title='Select version to install'
          />
          <Checkbox
            label='Tar on Environment'
            checked={tarOnEnvironment}
            onChange={toggleTarOnEnvironment}
          />
          <div className='elements-in-one-line'>
            {tarOnEnvironment && <FileUploader onUpload={handleFileUpload} />}
            {loadingUploadFile && <SpinIcon />}
          </div>
          <Checkbox
            label='Override data pump file'
            checked={formData.overrideDataPumpFile}
            onChange={toggleOverrideDataPumpFile}
          />
          <InputField
            name='remoteDBUser'
            title='Remote DB User *'
            value={formData.remoteDBUser}
            onChange={handleFormDataChange}
          />
        </Section>

        <Section title='Choose clients'>
          <div className='elements-in-one-line'>
            {Object.keys(clientChecks).map((client) => (
              <Checkbox
                key={client}
                label={client}
                checked={clientChecks[client]}
                onChange={() => handleClientToggle(client)}
              />
            ))}
          </div>
        </Section>

        {renderClientConfigs(clientChecks, formData, handleFormChange)}

        {renderInstallButton(
          loading,
          handleSubmit,
          clientChecks,
          loadingUploadFile
        )}
      </div>
    </div>
  );
};

/**
 * @function Section
 * @desc Renders a section with a title and children elements. Used to group UI components for clarity.
 * @param {string} title - The title for the section.
 * @param {JSX.Element} children - The content to be displayed inside the section.
 * @returns {JSX.Element} The section containing the title and children elements.
 */
const Section = ({ title, children }) => (
  <div className='component-container'>
    <h1>{title}</h1>
    {children}
  </div>
);

/**
 * @function renderClientConfigs
 * @desc Conditionally renders the ClientConfig component for each selected client. It ensures that only clients
 *       with a checked state are rendered for configuration.
 * @param {Object} clientChecks - The selected clients (which clients are checked).
 * @param {Object} formData - The form data for each client.
 * @param {function} handleFormChange - Function to handle changes in client-specific form data.
 * @returns {JSX.Element[]} An array of ClientConfig components for each selected client.
 */
const renderClientConfigs = (clientChecks, formData, handleFormChange) => {
  return Object.keys(clientChecks).map(
    (client) =>
      clientChecks[client] && (
        <ClientConfig
          key={client}
          clientType={client}
          clientFormData={formData[client]}
          setClientFormData={(updatedData) =>
            handleFormChange(client, updatedData)
          }
        />
      )
  );
};

/**
 * @function renderInstallButton
 * @desc Conditionally renders the install button based on client selection and loading state.
 *       If no clients are selected or if installation is in progress, the button is disabled.
 * @param {Object} loading - The current loading state (e.g., installation in progress).
 * @param {function} handleSubmit - Function to handle form submission when the install button is clicked.
 * @param {Object} clientChecks - The selected clients (whether each client is checked).
 * @returns {JSX.Element|null} The install button, or null if no clients are selected.
 */
const renderInstallButton = (
  loading,
  handleSubmit,
  clientChecks,
  loadingUploadFile
) => {
  const isAnyClientSelected = Object.values(clientChecks).some(
    (checked) => checked
  );

  return isAnyClientSelected ? (
    <Button
      onClick={handleSubmit}
      title={loading.installing ? 'Installing...' : 'Install'}
      disabled={
        loading.installing || loading.disableSubmit || loadingUploadFile
      }
      fullWidth={true}
    />
  ) : null;
};

// Initial states for the installation process
const initialLoadingState = {
  loadinginstallationVersions: true,
  loadingCheckEnvironmentConnection: true,
  installing: false,
  disableSubmit: false,
};

// Initial state for client selection checkboxes (whether each client is selected)
const initialClientChecks = {
  ABP: false,
  OMS: false,
  OMS_SE: false,
  MCSS_SE: false,
  ACPE: false,
};

// Initial state for client configuration form data
const initialClientsFormData = {
  ORACLE_DATA_PUMP_DIR: 'DP_DMP_EPCT',
  ORACLE_DATA_PUMP_DIR_PATH: '',
  SRC_DB_CONN_STRING: '',
  TRG_DB_CONN_STRING: '',
};

// Initial form data, including override settings and default client configurations
const initialFormData = {
  overrideDataPumpFile: true,
  remoteDBUser: 'oradp',
  ABP: { ...initialClientsFormData },
  OMS: { ...initialClientsFormData },
  OMS_SE: { ...initialClientsFormData },
  MCSS_SE: { ...initialClientsFormData },
  ACPE: { ...initialClientsFormData },
};

export default Installation;
