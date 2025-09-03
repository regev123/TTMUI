import React, { useEffect, useState } from 'react';
import Spinner from '../../components/layout/Spinner';
import runPackagerDeployer from '../../hooks/submitHandlers/handleSubmitPackagerDeployerRunAction';
import initializeWebSocket from '../../utils/initializeWebSocket';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import Textarea from '../../components/common/Textarea';
import fetchPackagerDepolyerData from '../../hooks/fetchData/useFetchPackagerDeployerManager';
import AlertMessage from '../../components/common/AlertMessage';
import api from '../../utils/api';
import HtmlLink from '../../components/common/HtmlLink';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @component PackagerDeployerManager
 * @desc    Manages the execution of the packager or deployer job by providing UI for selecting clients and running the job.
 *          It fetches and displays the list of available clients, allows the user to select which clients to run the job on,
 *          and manages the UI states for the job's progress, including showing status, handling errors, and displaying success messages.
 * @access  Public
 *
 * @param {boolean} isPackager - Flag that indicates whether the job being run is for the packager or deployer.
 *
 * @returns {JSX.Element} - The JSX structure for the Packager/Deployer Manager UI.
 *
 * Internal Function Descriptions:
 *
 * updateActiveClientsString - Updates the string representing the selected clients based on the checked checkboxes.
 * toggleClientSelection - Toggles the checked state of a client, enabling or disabling its inclusion in the job run.
 * runAction - Initiates the packager or deployer job by calling the `runPackagerDeployer` function.
 * getPlaceholderText - Provides a dynamic placeholder for the status message text area based on the current status.
 */
const PackagerDeployerManager = ({
  isPackager,
  isEnvObfuscated,
  existingClientsArray,
}) => {
  const defaultStatusMessage = `Waiting for ${
    isPackager ? 'packager' : 'deployer'
  } running...`;

  const [status, setStatus] = useState(defaultStatusMessage);
  const [loading, setLoading] = useState({
    webSocket: true,
    existingClients: true,
  });
  const [submitButtonText, setSubmitButtonText] = useState(
    `Run ${isPackager ? 'Packager' : 'Deployer'}`
  );
  const [isSubmitDisabled, setSubmitDisabled] = useState(false);
  const [alert, setAlert] = useState('');
  const [clients, setClients] = useState({});
  const [activeClientsString, setActiveClientsString] = useState('');
  const [tarName, setTarName] = useState('');
  const [onSuccessHrefUrl, setOnSuccessHrefUrl] = useState('');
  useEffect(() => {
    initializeWebSocket(setLoading, setStatus);
  }, []);

  useEffect(() => {
    setStatus(defaultStatusMessage);
    setAlert('');
    setSubmitButtonText(`Run ${isPackager ? 'Packager' : 'Deployer'}`);
    setLoading((prevState) => ({ ...prevState, existingClients: true }));
    fetchPackagerDepolyerData(
      setClients,
      setLoading,
      setAlert,
      setSubmitDisabled,
      existingClientsArray
    );
  }, [isPackager]);

  useEffect(() => {
    updateActiveClientsString(clients);
  }, [clients]);

  useEffect(() => {
    const fetchTarName = async () => {
      const name = await getTarName();
      setTarName(name);
      openHtmlFile(name);
    };

    if (alert.includes('Succeeded')) {
      fetchTarName();
    }
  }, [alert]);

  const updateActiveClientsString = (clients) => {
    const activeClients = Object.keys(clients)
      .filter((client) => clients[client].checked)
      .join(' ');

    setActiveClientsString(activeClients);
  };

  const toggleClientSelection = (clientKey) => {
    setClients((prevClients) => ({
      ...prevClients,
      [clientKey]: {
        ...prevClients[clientKey],
        checked: !prevClients[clientKey].checked,
      },
    }));
  };

  const runAction = async () => {
    setTarName('');
    setOnSuccessHrefUrl('');
    await runPackagerDeployer(
      setSubmitButtonText,
      isPackager,
      setStatus,
      setAlert,
      setSubmitDisabled,
      activeClientsString,
      isEnvObfuscated
    );
  };

  const getPlaceholderText = () => {
    return status.trim() === '' || status === defaultStatusMessage
      ? defaultStatusMessage
      : '';
  };

  const getTarName = async () => {
    await delay(1000);
    const regex = />>> Delivery TAR file:\s([^\s]+)-tar/;
    const match = status.match(regex);

    if (match && match[1]) {
      return match[1];
    }
    return '';
  };

  const openHtmlFile = async (htmlFileName) => {
    try {
      const response = await api.post('/packagerDeployer/getHTMLText', {
        htmlFileName: `rep_${htmlFileName}.html`,
      });
      const blob = new Blob([response.data], { type: 'text/html' });
      setOnSuccessHrefUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Failed to fetch HTML file: ', error);
    }
  };

  if (loading.webSocket || loading.existingClients) return <Spinner />;

  const isSubmitDisabledByClients = Object.values(clients).every(
    (client) => !client.checked
  );

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <Button
          onClick={runAction}
          title={submitButtonText}
          disabled={isSubmitDisabled || isSubmitDisabledByClients}
        />

        <AlertMessage message={alert} isSuccess={alert.includes('Succeeded')} />
        <div className='elements-in-one-line'>
          {alert.includes('Succeeded') && (
            <p className='global-page-alert message'>
              {tarName ? `${tarName}-tar` : ''}
            </p>
          )}

          {onSuccessHrefUrl && (
            <HtmlLink href={onSuccessHrefUrl} text='HTML Report' />
          )}
        </div>
        <div className='elements-in-one-line'>
          {renderClientCheckboxes(clients, toggleClientSelection)}
        </div>
        <Textarea value={status} placeholder={getPlaceholderText()} />
      </div>
    </div>
  );
};

/**
 * @function renderClientCheckboxes
 * @desc Renders checkboxes for each client that exists.
 * @param {Object} clients - The current clients state.
 * @param {function} toggleClientSelection - The function to toggle a client's checked state.
 * @returns {JSX.Element[]}
 */
const renderClientCheckboxes = (clients, toggleClientSelection) => {
  return Object.keys(clients).map(
    (client) =>
      clients[client].exists && (
        <Checkbox
          key={client}
          label={client}
          checked={clients[client].checked}
          onChange={() => toggleClientSelection(client)}
        />
      )
  );
};

PackagerDeployerManager.propTypes = {
  isEnvObfuscated: PropTypes.bool.isRequired,
  existingClientsArray: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  isEnvObfuscated: state.Obfuscation.isEnvObfuscated,
  existingClientsArray: state.ExistingClients.existingClientsArray,
});

export default connect(mapStateToProps)(PackagerDeployerManager);
