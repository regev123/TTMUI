import React, { useEffect, useState } from 'react';
import './Packager.css';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';

const Packager = () => {
  const [status, setStatus] = useState('Waiting for packager running...');
  const [loading, setLoading] = useState({
    initalizeWebSocket: true,
    loadExistingClients: true,
  });
  const [submitPackagerButtonText, setSubmitPackagerButtonText] =
    useState('Run packager');
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
        const res = await api.get('/configuration/getwsPackagerPort');
        const socket = new WebSocket(
          `ws://localhost:${res.data.wsPackagerPort}`
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
        const clientStatuses = {
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
        setClients(clientStatuses);
        updateActiveClientsString(clientStatuses);
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
      .filter((key) => updatedClients[key].checked)
      .join(' ');
    setActiveClientsString(activeClients);
  };

  const runPackager = async () => {
    setSubmitPackagerButtonText('Running...');
    setStatus('Running packager...\n\n');
    setAlert('');
    setDisableSubmit(true);
    let res;
    try {
      res = await api.post('/packager/runPackager', {
        activeClientsString,
      });
      setAlert(res.data);
    } catch (err) {
      setAlert(err.response?.data || 'An error occurred');
      console.log(err);
    } finally {
      setDisableSubmit(false);
      setSubmitPackagerButtonText('Run Packager');
    }
  };

  const getPlaceholder = () =>
    status.trim() === '' || status === 'Waiting for packager running...'
      ? 'Waiting for packager running...'
      : '';

  if (loading.initalizeWebSocket || loading.loadExistingClients)
    return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='packager-page-container'>
        <div className='packager-page-container-run-packager'>
          <button
            onClick={runPackager}
            className='packager-page-button-run-packager'
            disabled={disableSubmit}
          >
            {submitPackagerButtonText}
          </button>
          <span
            className={
              alert === 'Packager Succeeded'
                ? 'packager-page-alert-success'
                : 'packager-page-alert-failed'
            }
          >
            {alert}
          </span>
        </div>

        <div className='packager-page-clients-checkbox'>
          {Object.keys(clients).map(
            (key) =>
              clients[key].exists && (
                <label key={key}>
                  <input
                    type='checkbox'
                    checked={clients[key].checked}
                    onChange={() => handleChange(key)}
                    disabled={disableSubmit}
                  />
                  {key}
                </label>
              )
          )}
        </div>

        <div className='packager-page-textarea-container'>
          <textarea
            className='packager-page-textarea'
            placeholder={getPlaceholder()}
            value={status}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Packager;
