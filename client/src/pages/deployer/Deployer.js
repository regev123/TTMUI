import React, { useEffect, useState } from 'react';
import './Deployer.css';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';

const Deployer = () => {
  const [status, setStatus] = useState('Waiting for deployer running...');
  const [loading, setLoading] = useState({
    initalizeWebSocket: true,
    loadExistingClients: true,
  });
  const [submitDeployerButtonText, setSubmitDeployerButtonText] =
    useState('Run Deployer');
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [alert, setAlert] = useState('');
  const [clients, setClients] = useState({
    ABP: { exists: false, checked: false },
    OMS: { exists: false, checked: false },
    OMS_SE: { exists: false, checked: false },
    MCSS_SE: { exists: false, checked: false },
    ACPE: { exists: false, checked: false },
  });
  const [activeClientsString, setActiveClientsString] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        //To change for deployer port
        const res = await api.get('/configuration/getwsDeployerPort');
        const socket = new WebSocket(
          `ws://localhost:${res.data.wsDeployerPort}`
        );

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus((prev) => `${prev}\n${data.stdout}`);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        updateInitializeWebSocket(false);

        return () => {
          socket.close();
        };
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await api.post('/validation/validateTTMHomeCorrectPath');
        res = await api.post('/util/getExistingClients');
        const updatedClients = {
          ABP: {
            exists: res.data.includes('ABP'),
            checked: res.data.includes('ABP'),
          },
          OMS: {
            exists: res.data.includes('OMS'),
            checked: res.data.includes('OMS'),
          },
          OMS_SE: {
            exists: res.data.includes('OMS_SE'),
            checked: res.data.includes('OMS_SE'),
          },
          MCSS_SE: {
            exists: res.data.includes('MCSS_SE'),
            checked: res.data.includes('MCSS_SE'),
          },
          ACPE: {
            exists: res.data.includes('ACPE'),
            checked: res.data.includes('ACPE'),
          },
        };

        setClients(updatedClients);
        updateActiveClientsString(updatedClients);
      } catch (err) {
        setAlert(err.response.data);
        setDisableSubmit(true);
        console.error(err);
      } finally {
        updateLoadExistingClients(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    updateActiveClientsString(clients);
  }, [clients]);

  const updateInitializeWebSocket = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      initalizeWebSocket: value,
    }));
  };

  const updateLoadExistingClients = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadExistingClients: value,
    }));
  };

  const handleChange = (clientKey) => {
    setClients((prevClients) => ({
      ...prevClients,
      [clientKey]: {
        ...prevClients[clientKey],
        checked: !prevClients[clientKey].checked,
      },
    }));
  };

  const updateActiveClientsString = (updatedClients) => {
    const activeClients = Object.keys(updatedClients)
      .filter((client) => updatedClients[client].checked)
      .join(' ');
    setActiveClientsString(activeClients);
  };

  const runDeployer = async () => {
    setSubmitDeployerButtonText('Running...');
    setStatus('Running deployer...\n\n');
    setAlert('');
    setDisableSubmit(true);
    let res;
    try {
      res = await api.post('/deployer/runDeployer', { activeClientsString });
      setAlert(res.data);
    } catch (err) {
      setAlert(err.response?.data || 'Error occurred');
      console.log(err);
    } finally {
      setDisableSubmit(false);
      setSubmitDeployerButtonText('Run Deployer');
    }
  };

  const getPlaceholder = () =>
    status.trim() === '' || status === 'Waiting for deployer running...'
      ? 'Waiting for deployer running...'
      : '';

  if (loading.initalizeWebSocket || loading.loadExistingClients)
    return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='deployer-page-container'>
        <div className='deployer-page-container-run-deployer'>
          <button
            onClick={runDeployer}
            className='deployer-page-button-run-deployer'
            disabled={disableSubmit}
          >
            {submitDeployerButtonText}
          </button>
          <span
            className={
              alert === 'Deployer Succeeded'
                ? 'deployer-page-alert-success'
                : 'deployer-page-alert-failed'
            }
          >
            {alert}
          </span>
        </div>

        <div className='deployer-page-clients-checkbox'>
          {Object.keys(clients).map(
            (client) =>
              clients[client].exists && (
                <label key={client}>
                  <input
                    type='checkbox'
                    checked={clients[client].checked}
                    onChange={() => handleChange(client)}
                    disabled={disableSubmit}
                  />
                  {client}
                </label>
              )
          )}
        </div>

        <div className='deployer-page-textarea-container'>
          <textarea
            className='deployer-page-textarea'
            placeholder={getPlaceholder()}
            value={status}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Deployer;
