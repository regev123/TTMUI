import React, { useEffect, useState } from 'react';
import './Packager.css'; // Importing the CSS for styling the component
import api from '../../utils/api'; // Importing API utility for making requests
import Spinner from '../../components/layout/Spinner'; // Importing a spinner component for loading states

const Packager = () => {
  // State variables to manage the component's state
  const [status, setStatus] = useState('Waiting for packager running...'); // Current status message
  const [loading, setLoading] = useState({
    initializeWebSocket: true, // Loading state for WebSocket initialization
    loadExistingClients: true, // Loading state for fetching existing clients
  });
  const [submitPackagerButtonText, setSubmitPackagerButtonText] =
    useState('Run packager'); // Button text state
  const [disableSubmit, setDisableSubmit] = useState(false); // State to disable the submit button
  const [alert, setAlert] = useState(''); // State for alert messages
  const [clients, setClients] = useState({
    ABP: { exists: false, checked: false },
    OMS: { exists: false, checked: false },
    OMS_SE: { exists: false, checked: false },
    MCSS_SE: { exists: false, checked: false },
    ACPE: { exists: false, checked: false },
  }); // State for client existence and checked status
  const [activeClientsString, setActiveClientsString] = useState(''); // State to store the string of active clients

  // Effect to initialize WebSocket connection when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetching the WebSocket port from the server
        const res = await api.get('/configuration/getwsPackagerPort');
        const socket = new WebSocket(
          `ws://localhost:${res.data.wsPackagerPort}`
        );

        // Handling incoming WebSocket messages
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus((prev) => `${prev}\n${data.stdout}`); // Updating status with new data
        };

        // Handling WebSocket errors
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        updateInitializeWebSocket(false); // Setting loading state for WebSocket to false

        return () => {
          socket.close(); // Cleaning up the WebSocket on component unmount
        };
      } catch (error) {
        console.log(error); // Logging any errors encountered
      }
    }
    fetchData(); // Calling the function to fetch data
  }, []);

  // Effect to fetch existing client statuses when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validating the path and getting existing clients
        await api.post('/validation/validateTTMHomeCorrectPath');
        const res = await api.post('/util/getExistingClients');

        // Constructing client statuses based on the response
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
        setClients(clientStatuses); // Updating client statuses in state
        updateActiveClientsString(clientStatuses); // Updating the active clients string
      } catch (err) {
        setAlert(err.response.data); // Setting alert message in case of an error
        setDisableSubmit(true); // Disabling the submit button
        console.error(err); // Logging the error
      } finally {
        updateLoadExistingClients(false); // Setting loading state for existing clients to false
      }
    };
    fetchData(); // Calling the function to fetch existing clients
  }, []);

  // Effect to update the active clients string whenever the clients state changes
  useEffect(() => {
    updateActiveClientsString(clients);
  }, [clients]);

  // Function to update the WebSocket loading state
  const updateInitializeWebSocket = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      initializeWebSocket: value,
    }));
  };

  // Function to update the loading state for fetching existing clients
  const updateLoadExistingClients = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadExistingClients: value,
    }));
  };

  // Function to handle changes in client checkboxes
  const handleChange = (clientKey) => {
    setClients((prevClients) => ({
      ...prevClients,
      [clientKey]: {
        ...prevClients[clientKey],
        checked: !prevClients[clientKey].checked, // Toggling the checked state
      },
    }));
  };

  // Function to update the active clients string based on checked clients
  const updateActiveClientsString = (updatedClients) => {
    const activeClients = Object.keys(updatedClients)
      .filter((key) => updatedClients[key].checked) // Filtering checked clients
      .join(' '); // Joining keys to create a string
    setActiveClientsString(activeClients); // Updating the active clients string in state
  };

  // Function to run the packager process
  const runPackager = async () => {
    setSubmitPackagerButtonText('Running...'); // Updating button text to indicate running state
    setStatus('Running packager...\n\n'); // Updating status message
    setAlert(''); // Resetting alert message
    setDisableSubmit(true); // Disabling the submit button
    let res;
    try {
      // Sending a request to run the packager with active clients
      res = await api.post('/packager/runPackager', {
        activeClientsString,
      });
      setAlert(res.data); // Setting alert message based on response
    } catch (err) {
      setAlert(err.response?.data || 'An error occurred'); // Handling error responses
      console.log(err); // Logging the error
    } finally {
      setDisableSubmit(false); // Re-enabling the submit button
      setSubmitPackagerButtonText('Run Packager'); // Resetting button text
    }
  };

  // Function to get the placeholder text for the textarea
  const getPlaceholder = () =>
    status.trim() === '' || status === 'Waiting for packager running...'
      ? 'Waiting for packager running...' // Returning default placeholder
      : '';

  // Show a loading spinner while data is being fetched
  if (loading.initializeWebSocket || loading.loadExistingClients)
    return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='packager-page-container'>
        <div className='packager-page-container-run-packager'>
          <button
            onClick={runPackager} // Run packager function on button click
            className='packager-page-button-run-packager'
            disabled={disableSubmit} // Disable button if submit is disabled
          >
            {submitPackagerButtonText} {/*Display the button text*/}
          </button>
          <span
            className={
              alert === 'Packager Succeeded'
                ? 'packager-page-alert-success' // Success alert style
                : 'packager-page-alert-failed' // Failed alert style
            }
          >
            {alert} {/*Display alert message*/}
          </span>
        </div>

        <div className='packager-page-clients-checkbox'>
          {Object.keys(clients).map(
            (key) =>
              clients[key].exists && ( // Only show checkbox for existing clients
                <label key={key}>
                  <input
                    type='checkbox'
                    checked={clients[key].checked} // Checkbox checked state
                    onChange={() => handleChange(key)} // Handle checkbox change
                    disabled={disableSubmit} // Disable checkbox if submit is disabled
                  />
                  {key} {/*Display client name*/}
                </label>
              )
          )}
        </div>

        <div className='packager-page-textarea-container'>
          <textarea
            className='packager-page-textarea'
            placeholder={getPlaceholder()} // Set placeholder text
            value={status} // Set textarea value to current status
            readOnly // Make textarea read-only
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Packager; // Exporting the Packager component for use in other parts of the application
